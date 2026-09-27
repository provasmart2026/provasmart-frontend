import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../../pages/access/LoginPage'
import { VerifyTwoFactorPage } from '../../../pages/access/VerifyTwoFactorPage'
import { ApiError } from '../../../services/api'

const auth = vi.hoisted(() => ({
    login: vi.fn(),
    verifyTwoFactor: vi.fn(),
}))

vi.mock('../../../services/authService', () => ({ authService: auth }))

describe('login e verificação em duas etapas', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        sessionStorage.clear()
    })

    it('preserva a mensagem de cadastro concluído', () => {
        render(
            <MemoryRouter initialEntries={['/login?cadastro=sucesso']}>
                <LoginPage />
            </MemoryRouter>
        )
        expect(screen.getByRole('status')).toHaveTextContent('Conta criada. Agora é só entrar.')
    })

    it.each([false, true])('salva o token somente após o 2FA, lembrar=%s', async (remember) => {
        auth.login.mockResolvedValue({ message: 'Código enviado.' })
        auth.verifyTwoFactor.mockResolvedValue({ token: 'token-de-teste' })
        render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verificar-codigo" element={<VerifyTwoFactorPage />} />
                    <Route path="/" element={<p>Sessão iniciada</p>} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'aline@exemplo.com' } })
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@123' } })
        if (remember) fireEvent.click(screen.getByRole('checkbox', { name: /manter conectado/i }))
        fireEvent.submit(screen.getByRole('button', { name: 'Entrar' }).closest('form')!)

        await waitFor(() =>
            expect(auth.login).toHaveBeenCalledWith({
                email: 'aline@exemplo.com',
                password: 'Senha@123',
            })
        )
        const codeField = await screen.findByLabelText('Código de autenticação')
        expect(sessionStorage.getItem('provasmart.token')).toBeNull()
        expect(localStorage.getItem('provasmart.token')).toBeNull()
        fireEvent.change(codeField, { target: { value: '012345' } })
        fireEvent.submit(screen.getByRole('button', { name: 'Verificar código' }).closest('form')!)
        await screen.findByText('Sessão iniciada')
        expect(auth.verifyTwoFactor).toHaveBeenCalledWith({ email: 'aline@exemplo.com', code: '012345' })
        expect((remember ? localStorage : sessionStorage).getItem('provasmart.token')).toBe('token-de-teste')
        expect((remember ? sessionStorage : localStorage).getItem('provasmart.token')).toBeNull()
    })

    it('permite tentar novamente quando o código é rejeitado', async () => {
        auth.verifyTwoFactor.mockRejectedValue(new ApiError(401, 'Inválido'))
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/verificar-codigo',
                        state: {
                            email: 'aline@exemplo.com',
                            remember: false,
                        },
                    },
                ]}
            >
                <VerifyTwoFactorPage />
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('Código de autenticação'), { target: { value: '123456' } })
        fireEvent.submit(screen.getByRole('button', { name: 'Verificar código' }).closest('form')!)
        expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido ou expirado')
        expect(localStorage.length).toBe(0)
        expect(sessionStorage.length).toBe(0)
        expect(screen.getByRole('button', { name: 'Verificar código' })).toBeEnabled()
    })

    it.each(['', '12345', '1234567', 'abcdef', '123a56'])('rejeita código inválido %s antes da API', (code) => {
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/verificar-codigo',
                        state: {
                            email: 'aline@exemplo.com',
                            remember: false,
                        },
                    },
                ]}
            >
                <VerifyTwoFactorPage />
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('Código de autenticação'), { target: { value: code } })
        fireEvent.submit(screen.getByRole('button', { name: 'Verificar código' }).closest('form')!)
        expect(screen.getByRole('alert')).toHaveTextContent('exatamente 6 números')
        expect(auth.verifyTwoFactor).not.toHaveBeenCalled()
        expect(localStorage.length).toBe(0)
        expect(sessionStorage.length).toBe(0)
    })

    it('retorna ao login quando falta o contexto do 2FA', async () => {
        render(
            <MemoryRouter initialEntries={['/verificar-codigo']}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/verificar-codigo" element={<VerifyTwoFactorPage />} />
                </Routes>
            </MemoryRouter>
        )
        expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
        expect(auth.verifyTwoFactor).not.toHaveBeenCalled()
    })
})
