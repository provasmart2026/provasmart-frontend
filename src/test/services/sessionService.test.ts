import { afterEach, describe, expect, it, vi } from 'vitest'
import { authChangedEvent, getSession, getStoredToken, roleKey, saveSession, tokenKey } from '../../services/sessionService'

describe('sessão', () => {
    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.restoreAllMocks()
    })

    it.each([
        [{ role: 'ADMIN' }, 'ADMIN'],
        [{ role: 'ROLE_ESTUDANTE' }, 'ESTUDANTE'],
        [{ roles: ['ROLE_ADMIN'] }, 'ADMIN'],
        [{ authorities: ['ROLE_ESTUDANTE'] }, 'ESTUDANTE'],
        [{ role: 'DESCONHECIDO' }, null],
    ])('lê o perfil do JWT %j sem conceder perfis desconhecidos', (payload, role) => {
        const token = `header.${btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')}.signature`
        sessionStorage.setItem(tokenKey, token)
        expect(getSession()).toEqual({ authenticated: true, role })
    })

    it.each([false, true])('substitui a sessão anterior e publica o estado final, lembrar=%s', (remember) => {
        localStorage.setItem(tokenKey, 'token-antigo')
        localStorage.setItem(roleKey, 'ADMIN')
        sessionStorage.setItem(tokenKey, 'outro-token-antigo')
        sessionStorage.setItem(roleKey, 'ADMIN')
        const sessions: ReturnType<typeof getSession>[] = []
        const onChange = () => sessions.push(getSession())
        window.addEventListener(authChangedEvent, onChange)
        try {
            expect(saveSession({ token: 'token-sem-perfil' }, remember)).toBe(true)
            expect((remember ? localStorage : sessionStorage).getItem(tokenKey)).toBe('token-sem-perfil')
            expect((remember ? sessionStorage : localStorage).getItem(tokenKey)).toBeNull()
            expect(localStorage.getItem(roleKey)).toBeNull()
            expect(sessionStorage.getItem(roleKey)).toBeNull()
            expect(sessions).toEqual([{ authenticated: true, role: null }])
        } finally {
            window.removeEventListener(authChangedEvent, onChange)
        }
    })

    it.each(['', '   '])('não substitui a sessão por um token vazio %j', (token) => {
        localStorage.setItem(tokenKey, 'token-atual')
        localStorage.setItem(roleKey, 'ESTUDANTE')
        expect(saveSession({ token }, false)).toBe(false)
        expect(getStoredToken()).toBe('token-atual')
        expect(getSession()).toEqual({ authenticated: true, role: 'ESTUDANTE' })
    })
})
