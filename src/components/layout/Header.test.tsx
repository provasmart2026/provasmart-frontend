import {act, fireEvent, render, screen, within} from '@testing-library/react'
import {afterEach, describe, expect, it} from 'vitest'
import {MemoryRouter, useLocation} from 'react-router-dom'
import {saveSession} from '../../api/auth'
import {Header} from './Header'

function LocationInfo() {
    return <div data-testid="location">{useLocation().pathname}</div>
}

function renderHeader(role?: 'ADMIN' | 'ESTUDANTE', storage = localStorage) {
    if (role) {
        storage.setItem('provasmart.token', 'token-de-teste')
        storage.setItem('provasmart.role', role)
    }
    render(<MemoryRouter><Header/><LocationInfo/></MemoryRouter>)
}

function expectVisitor() {
    expect(screen.queryByRole('link', {name: 'Usuários'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'Meu perfil'})).not.toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Entrar'})).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', {name: 'Criar conta'})).toHaveAttribute('href', '/cadastro')
    expect(screen.getByRole('link', {name: 'Como funciona'})).toHaveAttribute('href', '/#como-funciona')
    expect(screen.getByRole('link', {name: 'Recursos'})).toHaveAttribute('href', '/#recursos')
    expect(screen.getByRole('link', {name: 'Início'})).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', {name: 'Sair'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'Questões'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'Simulados'})).not.toBeInTheDocument()
}

describe('Header', () => {
    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('oculta questões e simulados sem login', () => {
        renderHeader()
        expectVisitor()
    })

    it('exibe somente simulados para estudante', () => {
        renderHeader('ESTUDANTE')
        expect(screen.queryByRole('link', {name: 'Usuários'})).not.toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'Questões'})).not.toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Simulados'})).toBeInTheDocument()
    })

    it('exibe somente questões para administrador', () => {
        renderHeader('ADMIN')
        expect(screen.getByRole('link', {name: 'Usuários'})).toHaveAttribute('href', '/admin/users')
        expect(screen.getByRole('link', {name: 'Questões'})).toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'Simulados'})).not.toBeInTheDocument()
    })

    it.each(['ADMIN', 'ESTUDANTE'] as const)('exibe ações e menu autenticados para %s', (role) => {
        renderHeader(role)
        expect(screen.queryByRole('link', {name: 'Entrar'})).not.toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'Criar conta'})).not.toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Meu perfil'})).toHaveAttribute('href', '/profile')
        expect(screen.getByRole('button', {name: 'Sair'})).toBeInTheDocument()
        expect(within(screen.getByRole('navigation')).getAllByRole('link').map(link => link.textContent))
            .toEqual(role === 'ADMIN' ? ['Início', 'Questões', 'Usuários', 'Meu perfil'] : ['Início', 'Simulados', 'Meu perfil'])
    })

    it.each(['local', 'session', 'ambos'])('encerra sessão em %s e volta ao menu visitante', (source) => {
        renderHeader('ESTUDANTE', source === 'session' ? sessionStorage : localStorage)
        if (source === 'ambos') {
            sessionStorage.setItem('provasmart.token', 'outro-token')
            sessionStorage.setItem('provasmart.role', 'ADMIN')
        }

        fireEvent.click(screen.getByRole('button', {name: 'Sair'}))

        for (const storage of [localStorage, sessionStorage]) {
            expect(storage.getItem('provasmart.token')).toBeNull()
            expect(storage.getItem('provasmart.role')).toBeNull()
        }
        expectVisitor()
        expect(screen.getByTestId('location')).toHaveTextContent('/login')
    })

    it('atualiza o menu ao receber o evento de sessão', () => {
        renderHeader()
        const token = `header.${btoa(JSON.stringify({role: 'ESTUDANTE'}))}.signature`
        act(() => { saveSession({token}, false) })
        expect(screen.getByRole('link', {name: 'Simulados'})).toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'Entrar'})).not.toBeInTheDocument()
    })
})
