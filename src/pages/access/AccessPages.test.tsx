import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter, Route, Routes, useLocation} from 'react-router-dom'
import {ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage, VerifyTwoFactorPage} from './AccessPages'
import {ApiError} from '../../api/client'
import {PrivacyPage, TermsPage} from './LegalPages'

const auth = vi.hoisted(() => ({
    login: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyTwoFactor: vi.fn(),
    register: vi.fn(),
    saveSession: vi.fn((response: {token?: string}, remember: boolean) => {
        if (!response.token) return false
        const storage = remember ? localStorage : sessionStorage
        storage.setItem('provasmart.token', response.token)
        return true
    }),
}))

vi.mock('../../api/auth', () => auth)

function renderPage(page: React.ReactNode) {
    return render(<MemoryRouter>{page}</MemoryRouter>)
}

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
        expect(auth.resetPassword).toHaveBeenCalledWith({email: 'aline@exemplo.com', code: '012345', newPassword: 'NovaSenha@123'})
        expect(JSON.parse(screen.getByTestId('location').textContent!)).toEqual({
            pathname: '/login', search: '?senha=alterada', state: null,
        })
        expect(auth.saveSession).not.toHaveBeenCalled()
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
        const pending = new Promise<never>(() => {})
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

    it('preserva a mensagem de cadastro concluído', () => {
        render(<MemoryRouter initialEntries={['/login?cadastro=sucesso']}><LoginPage/></MemoryRouter>)
        expect(screen.getByRole('status')).toHaveTextContent('Conta criada. Agora é só entrar.')
    })
})

describe('páginas de acesso', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        sessionStorage.clear()
    })

    it('exibe os aceites obrigatórios no cadastro', () => {
        renderPage(<RegisterPage/>)

        expect(screen.getByRole('checkbox', {name: /li e aceito/i})).toBeRequired()
        expect(screen.getByRole('checkbox', {name: /declaro que tenho 13 anos/i})).toBeRequired()
        expect(screen.getByRole('link', {name: 'Termos de Uso'})).toHaveAttribute('href', '/termos-de-uso')
        expect(screen.getByRole('link', {name: 'Política de Privacidade'})).toHaveAttribute('href', '/politica-de-privacidade')
    })

    it('valida a confirmação da senha antes de cadastrar', () => {
        renderPage(<RegisterPage/>)
        fireEvent.change(screen.getByLabelText('Nome completo'), {target: {value: 'Aline Souza'}})
        fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
        fireEvent.change(screen.getByLabelText('Senha'), {target: {value: 'Senha@123'}})
        fireEvent.change(screen.getByLabelText('Confirmar senha'), {target: {value: 'Senha@456'}})
        fireEvent.submit(screen.getByRole('button', {name: 'Criar minha conta'}).closest('form')!)

        expect(screen.getByRole('alert')).toHaveTextContent('As senhas digitadas não coincidem.')
        expect(auth.register).not.toHaveBeenCalled()
    })

    it.each([false, true])('salva o token somente após o 2FA, lembrar=%s', async (remember) => {
        auth.login.mockResolvedValue({message: 'Código enviado.'})
        auth.verifyTwoFactor.mockResolvedValue({token: 'token-de-teste'})
        render(<MemoryRouter initialEntries={['/login']}><Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/verificar-codigo" element={<VerifyTwoFactorPage/>}/>
            <Route path="/" element={<p>Sessão iniciada</p>}/>
        </Routes></MemoryRouter>)
        fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
        fireEvent.change(screen.getByLabelText('Senha'), {target: {value: 'Senha@123'}})
        if (remember) fireEvent.click(screen.getByRole('checkbox', {name: /manter conectado/i}))
        fireEvent.submit(screen.getByRole('button', {name: 'Entrar'}).closest('form')!)

        await waitFor(() => expect(auth.login).toHaveBeenCalledWith({
            email: 'aline@exemplo.com',
            password: 'Senha@123',
        }))
        const codeField = await screen.findByLabelText('Código de autenticação')
        expect(auth.saveSession).not.toHaveBeenCalled()
        expect(sessionStorage.getItem('provasmart.token')).toBeNull()
        expect(localStorage.getItem('provasmart.token')).toBeNull()
        fireEvent.change(codeField, {target: {value: '012345'}})
        fireEvent.submit(screen.getByRole('button', {name: 'Verificar código'}).closest('form')!)
        await screen.findByText('Sessão iniciada')
        expect(auth.verifyTwoFactor).toHaveBeenCalledWith({email: 'aline@exemplo.com', code: '012345'})
        expect(auth.saveSession).toHaveBeenCalledWith({token: 'token-de-teste'}, remember)
        expect((remember ? localStorage : sessionStorage).getItem('provasmart.token')).toBe('token-de-teste')
    })

    it('permite tentar novamente quando o código é rejeitado', async () => {
        auth.verifyTwoFactor.mockRejectedValue(new ApiError(401, 'Inválido'))
        render(<MemoryRouter initialEntries={[{pathname: '/verificar-codigo', state: {
            email: 'aline@exemplo.com', remember: false,
        }}]}><VerifyTwoFactorPage/></MemoryRouter>)
        fireEvent.change(screen.getByLabelText('Código de autenticação'), {target: {value: '123456'}})
        fireEvent.submit(screen.getByRole('button', {name: 'Verificar código'}).closest('form')!)
        expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido ou expirado')
        expect(auth.saveSession).not.toHaveBeenCalled()
        expect(screen.getByRole('button', {name: 'Verificar código'})).toBeEnabled()
    })

    it.each(['', '12345', '1234567', 'abcdef', '123a56'])('rejeita código inválido %s antes da API', (code) => {
        render(<MemoryRouter initialEntries={[{pathname: '/verificar-codigo', state: {
            email: 'aline@exemplo.com', remember: false,
        }}]}><VerifyTwoFactorPage/></MemoryRouter>)
        fireEvent.change(screen.getByLabelText('Código de autenticação'), {target: {value: code}})
        fireEvent.submit(screen.getByRole('button', {name: 'Verificar código'}).closest('form')!)
        expect(screen.getByRole('alert')).toHaveTextContent('exatamente 6 números')
        expect(auth.verifyTwoFactor).not.toHaveBeenCalled()
        expect(auth.saveSession).not.toHaveBeenCalled()
    })

    it('retorna ao login quando falta o contexto do 2FA', async () => {
        render(<MemoryRouter initialEntries={['/verificar-codigo']}><Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/verificar-codigo" element={<VerifyTwoFactorPage/>}/>
        </Routes></MemoryRouter>)
        expect(await screen.findByRole('button', {name: 'Entrar'})).toBeInTheDocument()
        expect(auth.verifyTwoFactor).not.toHaveBeenCalled()
    })

    it('mantém os documentos legais disponíveis em rotas próprias', () => {
        const {unmount} = renderPage(<TermsPage/>)
        expect(screen.getByRole('heading', {name: 'Termos de Uso do ProvaSmart'})).toBeInTheDocument()
        expect(screen.getByRole('heading', {name: '6. VLibras e acessibilidade'})).toBeInTheDocument()
        unmount()

        renderPage(<PrivacyPage/>)
        expect(screen.getByRole('heading', {name: 'Política de Privacidade do ProvaSmart'})).toBeInTheDocument()
        expect(screen.getByRole('heading', {name: '12. Direitos do titular'})).toBeInTheDocument()
    })
})
