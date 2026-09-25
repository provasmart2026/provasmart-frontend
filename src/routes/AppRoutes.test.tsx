import {act, render, screen, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {authChangedEvent, clearSession, type UserRole} from '../auth/session'
import {AppRoutes} from './AppRoutes'

vi.mock('../pages/Home', () => ({Home: () => <div>Página inicial</div>}))
vi.mock('../pages/admin/users/UsersPage', () => ({UsersPage: () => <div>Lista de usuários</div>}))
vi.mock('../pages/profile/ProfilePage', () => ({ProfilePage: () => <div>Dados do perfil</div>}))
vi.mock('../pages/admin/questions/QuestionsPage', () => ({QuestionsPage: () => <div>Lista de questões</div>}))
vi.mock('../pages/admin/questions/QuestionFormPage', () => ({QuestionFormPage: () => <div>Formulário de questão</div>}))
vi.mock('../pages/student/simulations/SimulationStartPage', () => ({SimulationStartPage: () => <div>Iniciar simulado</div>}))
vi.mock('../pages/student/simulations/SimulationPage', () => ({SimulationPage: () => <div>Executar simulado</div>}))
vi.mock('../pages/access/LoginPage', () => ({LoginPage: () => <div>Página de login</div>}))
vi.mock('../pages/access/RegisterPage', () => ({RegisterPage: () => <div>Página de cadastro</div>}))
vi.mock('../pages/access/VerifyTwoFactorPage', () => ({VerifyTwoFactorPage: () => <div>Verificar código</div>}))
vi.mock('../pages/access/ForgotPasswordPage', () => ({ForgotPasswordPage: () => <div>Recuperar senha</div>}))
vi.mock('../pages/access/ResetPasswordPage', () => ({ResetPasswordPage: () => <div>Redefinir senha</div>}))
vi.mock('../pages/access/LegalPages', () => ({
    TermsPage: () => <div>Termos de uso</div>,
    PrivacyPage: () => <div>Política de privacidade</div>,
}))

const privateRoutes: [string, UserRole, string][] = [
    ['/admin/users', 'ADMIN', 'Lista de usuários'],
    ['/simulados', 'ESTUDANTE', 'Iniciar simulado'],
    ['/simulados/123', 'ESTUDANTE', 'Executar simulado'],
    ['/admin/questions', 'ADMIN', 'Lista de questões'],
    ['/admin/questions/new', 'ADMIN', 'Formulário de questão'],
    ['/admin/questions/123/edit', 'ADMIN', 'Formulário de questão'],
]

const publicRoutes = [
    ['/', 'Página inicial'],
    ['/login', 'Página de login'],
    ['/cadastro', 'Página de cadastro'],
    ['/verificar-codigo', 'Verificar código'],
    ['/esqueci-minha-senha', 'Recuperar senha'],
    ['/redefinir-senha', 'Redefinir senha'],
    ['/termos-de-uso', 'Termos de uso'],
    ['/politica-de-privacidade', 'Política de privacidade'],
]

function setSession(role: UserRole | null, storage = localStorage) {
    storage.setItem('provasmart.token', 'token-de-teste')
    if (role) storage.setItem('provasmart.role', role)
}

function openRoute(path: string) {
    window.history.replaceState(null, '', path)
    render(<AppRoutes/>)
}

function expectPage(text: string, path: string) {
    expect(within(screen.getByRole('main')).getByText(text)).toBeInTheDocument()
    expect(window.location.pathname).toBe(path)
}

describe('proteção das rotas', () => {
    it('envia visitante de /profile para login', () => {
        openRoute('/profile')
        expectPage('Página de login', '/login')
        expect(screen.queryByText('Dados do perfil')).not.toBeInTheDocument()
    })

    it.each(['ADMIN', 'ESTUDANTE'] as const)('permite /profile para %s', (role) => {
        setSession(role)
        openRoute('/profile')
        expectPage('Dados do perfil', '/profile')
    })
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        window.history.replaceState(null, '', '/')
        vi.restoreAllMocks()
    })

    it.each(privateRoutes)('envia visitante de %s para login sem montar página privada', (path, _role, page) => {
        const replace = vi.spyOn(window.history, 'replaceState')
        openRoute(path)
        expectPage('Página de login', '/login')
        expect(screen.queryByText(page)).not.toBeInTheDocument()
        expect(replace).toHaveBeenLastCalledWith(expect.anything(), '', '/login')
        expect(window.history.state.usr.from.pathname).toBe(path)
    })

    it.each(privateRoutes)('permite %s com o perfil exigido %s', (path, role, page) => {
        setSession(role)
        openRoute(path)
        expectPage(page, path)
    })

    it.each(privateRoutes)('bloqueia %s para o outro perfil', (path, role, page) => {
        setSession(role === 'ADMIN' ? 'ESTUDANTE' : 'ADMIN')
        const replace = vi.spyOn(window.history, 'replaceState')
        openRoute(path)
        expectPage('Página inicial', '/')
        expect(screen.queryByText(page)).not.toBeInTheDocument()
        expect(replace).toHaveBeenLastCalledWith(expect.anything(), '', '/')
    })

    it.each(privateRoutes)('bloqueia %s quando a sessão não tem perfil', (path) => {
        setSession(null)
        openRoute(path)
        expectPage('Página inicial', '/')
    })

    describe.each([null, 'ADMIN', 'ESTUDANTE'] as const)('rotas públicas com perfil %s', (role) => {
        it.each(publicRoutes)('mantém %s acessível', (path, page) => {
            if (role) setSession(role)
            openRoute(path)
            expectPage(page, path)
        })
    })

    it('aceita sessão armazenada em sessionStorage', () => {
        setSession('ESTUDANTE', sessionStorage)
        openRoute('/simulados')
        expectPage('Iniciar simulado', '/simulados')
    })

    it('redireciona após logout enquanto a rota está montada', () => {
        setSession('ESTUDANTE')
        openRoute('/simulados')
        act(() => clearSession())
        expectPage('Página de login', '/login')
        expect(screen.queryByText('Iniciar simulado')).not.toBeInTheDocument()
    })

    it.each([authChangedEvent, 'storage'])('revalida o perfil ao receber %s', (event) => {
        setSession('ADMIN')
        openRoute('/admin/questions')
        act(() => {
            localStorage.setItem('provasmart.role', 'ESTUDANTE')
            window.dispatchEvent(new Event(event))
        })
        expectPage('Página inicial', '/')
        expect(screen.queryByText('Lista de questões')).not.toBeInTheDocument()
    })

    it('redireciona quando outra aba remove a sessão', () => {
        setSession('ADMIN')
        openRoute('/admin/questions')
        act(() => {
            localStorage.clear()
            window.dispatchEvent(new Event('storage'))
        })
        expectPage('Página de login', '/login')
    })
})
