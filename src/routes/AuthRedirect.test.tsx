import {act, render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig} from 'axios'
import {MemoryRouter, Route, Routes, useLocation, useNavigationType} from 'react-router-dom'
import {apiRequest, ApiError} from '../api/client'
import {logout, saveSession} from '../api/auth'
import {authChangedEvent, authRedirectEvent, roleKey, tokenKey} from '../auth/session'
import {Header} from '../components/layout/Header'
import {RequireAuth} from './RequireAuth'
import {AuthRedirect} from './AuthRedirect'

function LocationInfo() {
    return <div data-testid="location">{useLocation().pathname} {useNavigationType()}</div>
}

function renderApp(path = '/profile') {
    return render(<MemoryRouter initialEntries={[path]}>
        <AuthRedirect/>
        <Header/>
        <LocationInfo/>
        <Routes>
            <Route path="/" element={<p>Página inicial</p>}/>
            <Route path="/login" element={<p>Página de login</p>}/>
            <Route element={<RequireAuth/>}>
                <Route path="/profile" element={<p>Dados privados</p>}/>
            </Route>
        </Routes>
    </MemoryRouter>)
}

function rejectResponse(status: number, config: InternalAxiosRequestConfig) {
    return new AxiosError('Detalhe interno', undefined, config, undefined, {
        status, statusText: 'Error', config, headers: {}, data: {},
    })
}

function errorAdapter(status: number) {
    return vi.fn<AxiosAdapter>(async config => { throw rejectResponse(status, config) })
}

describe('tratamento global de autenticação HTTP', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.restoreAllMocks()
    })

    it.each(['local', 'session', 'ambos'])('401 limpa sessão em %s, atualiza Header e redireciona', async source => {
        const storage = source === 'session' ? sessionStorage : localStorage
        storage.setItem(tokenKey, 'token-atual')
        storage.setItem(roleKey, 'ESTUDANTE')
        if (source === 'ambos') {
            sessionStorage.setItem(tokenKey, 'token-secundario')
            sessionStorage.setItem(roleKey, 'ADMIN')
        }
        renderApp()
        const dispatch = vi.spyOn(window, 'dispatchEvent')
        const adapter = errorAdapter(401)
        await act(async () => {
            await expect(apiRequest('/users/me', {adapter})).rejects.toBeInstanceOf(ApiError)
        })
        expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer token-atual')
        for (const target of [localStorage, sessionStorage]) {
            expect(target.getItem(tokenKey)).toBeNull()
            expect(target.getItem(roleKey)).toBeNull()
        }
        expect(dispatch.mock.calls.filter(([event]) => event.type === authChangedEvent)).toHaveLength(1)
        expect(screen.getByTestId('location')).toHaveTextContent('/login REPLACE')
        expect(screen.queryByText('Dados privados')).not.toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Entrar'})).toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'Sair'})).not.toBeInTheDocument()
    })

    it.each(['local', 'session'])('403 preserva sessão em %s e redireciona à Home', async source => {
        const storage = source === 'session' ? sessionStorage : localStorage
        storage.setItem(tokenKey, 'token-atual')
        storage.setItem(roleKey, 'ESTUDANTE')
        renderApp()
        const dispatch = vi.spyOn(window, 'dispatchEvent')
        await act(async () => {
            await expect(apiRequest('/users', {adapter: errorAdapter(403)})).rejects.toMatchObject({status: 403})
        })
        expect(storage.getItem(tokenKey)).toBe('token-atual')
        expect(storage.getItem(roleKey)).toBe('ESTUDANTE')
        expect(screen.getByTestId('location')).toHaveTextContent('/ REPLACE')
        expect(screen.getByRole('button', {name: 'Sair'})).toBeInTheDocument()
        expect(dispatch.mock.calls.filter(([event]) => event.type === authChangedEvent)).toHaveLength(0)
    })

    describe.each([401, 403])('sem token, HTTP %s', status => {
        it.each(['/auth/login', '/auth/verify-2fa', '/auth/forgot-password', '/auth/reset-password', '/users'])('%s apenas lança ApiError', async path => {
            renderApp('/login')
            const dispatch = vi.spyOn(window, 'dispatchEvent')
            const adapter = errorAdapter(status)
            await act(async () => {
                await expect(apiRequest(path, {method: 'POST', adapter})).rejects.toMatchObject({name: 'ApiError', status})
            })
            expect(adapter.mock.calls[0][0].headers.has('Authorization')).toBe(false)
            expect(dispatch.mock.calls.filter(([event]) => [authChangedEvent, authRedirectEvent].includes(event.type))).toHaveLength(0)
            expect(screen.getByTestId('location')).toHaveTextContent('/login POP')
        })
    })

    it('401 concorrentes limpam e notificam somente uma vez', async () => {
        localStorage.setItem(tokenKey, 'token-atual')
        localStorage.setItem(roleKey, 'ESTUDANTE')
        renderApp()
        const dispatch = vi.spyOn(window, 'dispatchEvent')
        await act(async () => {
            await Promise.allSettled([
                apiRequest('/users/me', {adapter: errorAdapter(401)}),
                apiRequest('/simulations/1', {adapter: errorAdapter(401)}),
            ])
        })
        expect(dispatch.mock.calls.filter(([event]) => event.type === authChangedEvent)).toHaveLength(1)
        expect(dispatch.mock.calls.filter(([event]) => event.type === authRedirectEvent)).toHaveLength(1)
        expect(screen.getByTestId('location')).toHaveTextContent('/login REPLACE')
    })

    it('403 na Home não repete navegação', async () => {
        localStorage.setItem(tokenKey, 'token-atual')
        renderApp('/')
        await act(async () => {
            await Promise.allSettled([apiRequest('/users', {adapter: errorAdapter(403)})])
        })
        expect(screen.getByTestId('location')).toHaveTextContent('/ POP')
    })

    it.each([401, 403])('resposta %s de sessão antiga não afeta novo token', async status => {
        localStorage.setItem(tokenKey, 'token-antigo')
        const adapter: AxiosAdapter = async config => {
            localStorage.setItem(tokenKey, 'token-novo')
            throw rejectResponse(status, config)
        }
        const dispatch = vi.spyOn(window, 'dispatchEvent')
        await expect(apiRequest('/users/me', {adapter})).rejects.toMatchObject({status})
        expect(localStorage.getItem(tokenKey)).toBe('token-novo')
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('outros erros não alteram sessão ou rota', async () => {
        localStorage.setItem(tokenKey, 'token-atual')
        localStorage.setItem(roleKey, 'ESTUDANTE')
        renderApp()
        await act(async () => {
            await expect(apiRequest('/users/me', {adapter: errorAdapter(500)})).rejects.toMatchObject({status: 500})
        })
        expect(localStorage.getItem(tokenKey)).toBe('token-atual')
        expect(screen.getByTestId('location')).toHaveTextContent('/profile POP')
    })

    it('saveSession publica apenas a sessão final e logout manual continua limpando', () => {
        const observed: boolean[] = []
        const listener = () => observed.push(Boolean(localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey)))
        window.addEventListener(authChangedEvent, listener)
        try {
            saveSession({token: `header.${btoa(JSON.stringify({role: 'ESTUDANTE'}))}.signature`}, false)
            expect(sessionStorage.getItem(roleKey)).toBe('ESTUDANTE')
            logout()
            expect(observed).toEqual([true, false])
            expect(sessionStorage.getItem(tokenKey)).toBeNull()
        } finally {
            window.removeEventListener(authChangedEvent, listener)
        }
    })
})
