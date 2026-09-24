import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {LoginPage, RegisterPage} from './AccessPages'
import {PrivacyPage, TermsPage} from './LegalPages'

const auth = vi.hoisted(() => ({
    login: vi.fn(),
    register: vi.fn(),
    getToken: vi.fn((response: {token?: string}) => response.token),
}))

vi.mock('../../api/auth', () => auth)

function renderPage(page: React.ReactNode) {
    return render(<MemoryRouter>{page}</MemoryRouter>)
}

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

    it('guarda o token da sessão após o login', async () => {
        auth.login.mockResolvedValue({token: 'token-de-teste'})
        renderPage(<LoginPage/>)
        fireEvent.change(screen.getByLabelText('E-mail'), {target: {value: 'aline@exemplo.com'}})
        fireEvent.change(screen.getByLabelText('Senha'), {target: {value: 'Senha@123'}})
        fireEvent.submit(screen.getByRole('button', {name: 'Entrar'}).closest('form')!)

        await waitFor(() => expect(auth.login).toHaveBeenCalledWith({
            email: 'aline@exemplo.com',
            password: 'Senha@123',
        }))
        expect(sessionStorage.getItem('provasmart.token')).toBe('token-de-teste')
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
