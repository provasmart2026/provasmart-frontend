import {fireEvent, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom'
import {ForgotPasswordPage} from './ForgotPasswordPage'
import {ResetPasswordPage} from './ResetPasswordPage'
import {LoginPage} from './LoginPage'
import {ApiError} from '../../api/client'

const auth = vi.hoisted(() => ({
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
}))

vi.mock('../../api/auth', () => ({authApi: auth}))

function LocationInfo() {
    const {pathname, search, state} = useLocation()
    return <div data-testid="location">{JSON.stringify({pathname, search, state})}</div>
}

function renderRecovery(pathname = '/esqueci-minha-senha', state: unknown = null) {
    return render(<MemoryRouter initialEntries={[{pathname, state}]}>
        <LocationInfo/>
        <Routes>
            <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage/>}/>
            <Route path="/redefinir-senha" element={<ResetPasswordPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
        </Routes>
    </MemoryRouter>)
}

function fillReset(code = '012345', password = 'NovaSenha@123', confirmation = password) {
    fireEvent.change(screen.getByLabelText('Código de redefinição'), {target: {value: code}})
    fireEvent.change(screen.getByLabelText('Nova senha'), {target: {value: password}})
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {target: {value: confirmation}})
    fireEvent.submit(screen.getByRole('button', {name: 'Redefinir senha'}).closest('form')!)
}

describe('recuperação de senha', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        auth.forgotPassword.mockReset()
        auth.resetPassword.mockReset()
        localStorage.clear()
        sessionStorage.clear()
    })

    it('conclui a recuperação sem persistir dados ou iniciar sessão', async () => {
        auth.forgotPassword.mockResolvedValue({message: 'Enviado'})
        auth.resetPassword.mockResolvedValue({message: 'Alterada'})
        renderRecovery('/login')
        fireEvent.click(screen.getByRole('link', {name: 'Esqueci minha senha'}))
        fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
        fireEvent.click(screen.getByRole('button', {name: 'Enviar código'}))
        const code = await screen.findByLabelText('Código de redefinição')
        expect(code).toHaveAttribute('inputmode', 'numeric')
        expect(code).toHaveAttribute('maxlength', '6')
        expect(code).toHaveAttribute('pattern', '[0-9]{6}')
        expect(auth.forgotPassword).toHaveBeenCalledWith({email: 'aline@exemplo.com'})
        expect(JSON.parse(screen.getByTestId('location').textContent!)).toEqual({
            pathname: '/redefinir-senha', search: '', state: {email: 'aline@exemplo.com'},
        })
        fillReset()
        expect(await screen.findByRole('status')).toHaveTextContent('Senha alterada com sucesso. Faça login com sua nova senha.')
        expect(auth.resetPassword).toHaveBeenCalledWith({
            email: 'aline@exemplo.com',
            code: '012345',
            newPassword: 'NovaSenha@123'
        })
        expect(JSON.parse(screen.getByTestId('location').textContent!)).toEqual({
            pathname: '/login', search: '?senha=alterada', state: null,
        })
        expect(localStorage.length).toBe(0)
        expect(sessionStorage.length).toBe(0)
    })

    it.each([null, {}, {email: ''}, {email: 12}, {email: 'invalido'}, {email: 'a b@exemplo.com'}])('redireciona state inválido %j', (state) => {
        renderRecovery('/redefinir-senha', state)
        expect(screen.getByRole('button', {name: 'Enviar código'})).toBeInTheDocument()
        expect(auth.resetPassword).not.toHaveBeenCalled()
    })

    it.each([
        ['12345', 'NovaSenha@123', 'NovaSenha@123', 'exatamente 6 números'],
        ['1234567', 'NovaSenha@123', 'NovaSenha@123', 'exatamente 6 números'],
        ['123a56', 'NovaSenha@123', 'NovaSenha@123', 'exatamente 6 números'],
        ['123456', 'Ab@1', 'Ab@1', 'requisitos'],
        ['123456', 'novasenha@123', 'novasenha@123', 'requisitos'],
        ['123456', 'NOVASENHA@123', 'NOVASENHA@123', 'requisitos'],
        ['123456', 'NovaSenha@abc', 'NovaSenha@abc', 'requisitos'],
        ['123456', 'NovaSenha123', 'NovaSenha123', 'requisitos'],
        ['123456', 'NovaSenha@123', 'Diferente@123', 'não coincidem'],
    ])('valida código e senhas antes da API (%s, %s)', (code, password, confirmation, error) => {
        renderRecovery('/redefinir-senha', {email: 'aline@exemplo.com'})
        fillReset(code, password, confirmation)
        expect(screen.getByRole('alert')).toHaveTextContent(error)
        expect(auth.resetPassword).not.toHaveBeenCalled()
    })

    it.each([400, 401, 403, 422, 500, 0])('trata erro %s na redefinição sem detalhes internos', async (status) => {
        auth.resetPassword.mockRejectedValue(new ApiError(status, 'detalhe interno'))
        renderRecovery('/redefinir-senha', {email: 'aline@exemplo.com'})
        fillReset()
        expect(await screen.findByRole('alert')).toHaveTextContent([400, 401, 403, 422].includes(status)
            ? 'Código inválido ou expirado. Solicite um novo código e tente novamente.'
            : 'Não foi possível concluir agora. Tente novamente em instantes.')
        expect(screen.getByRole('button', {name: 'Redefinir senha'})).toBeEnabled()
        expect(screen.getByRole('link', {name: 'Solicitar novo código'})).toHaveAttribute('href', '/esqueci-minha-senha')
    })

    it('mostra erro genérico quando o envio falha e permite tentar novamente', async () => {
        auth.forgotPassword.mockRejectedValue(new ApiError(500, 'detalhe interno'))
        renderRecovery()
        fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
        fireEvent.click(screen.getByRole('button', {name: 'Enviar código'}))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível concluir agora. Tente novamente em instantes.')
        expect(screen.getByRole('button', {name: 'Enviar código'})).toBeEnabled()
    })

    it.each([false, true])('bloqueia submissões duplicadas, redefinição=%s', (reset) => {
        const pending = new Promise<never>(() => {
        })
        auth.forgotPassword.mockReturnValue(pending)
        auth.resetPassword.mockReturnValue(pending)
        renderRecovery(reset ? '/redefinir-senha' : '/esqueci-minha-senha', {email: 'aline@exemplo.com'})
        if (reset) fillReset()
        else {
            fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
            fireEvent.click(screen.getByRole('button', {name: 'Enviar código'}))
        }
        const button = screen.getByRole('button', {name: reset ? 'Redefinindo...' : 'Enviando...'})
        expect(button).toBeDisabled()
        fireEvent.submit(button.closest('form')!)
        expect(reset ? auth.resetPassword : auth.forgotPassword).toHaveBeenCalledTimes(1)
    })
})
