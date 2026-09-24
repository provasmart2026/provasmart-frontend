import {type FormEvent, type ReactNode, useRef, useState} from 'react'
import {Link, Navigate, useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import {forgotPassword, login, register, resetPassword, saveSession, verifyTwoFactor} from '../../api/auth'
import {ApiError} from '../../api/client'
import {StudyJourney} from '../../components/StudyJourney'
import './access.css'

const passwordRule = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

type FieldProps = {
    id: string
    label: string
    placeholder: string
    type?: string
    autoComplete: string
    inputMode?: 'numeric'
    pattern?: string
    maxLength?: number
}

function Field({id, label, placeholder, type = 'text', autoComplete, inputMode, pattern, maxLength}: FieldProps) {
    return <label className="form-field" htmlFor={id}>
        <span>{label}</span>
        <input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete}
               inputMode={inputMode} pattern={pattern} maxLength={maxLength} required/>
    </label>
}

function PasswordField({id, label, placeholder, autoComplete, helper}: FieldProps & { helper?: string }) {
    const [visible, setVisible] = useState(false)

    return <label className="form-field" htmlFor={id}>
        <span>{label}</span>
        <span className="password-input">
            <input
                id={id}
                name={id}
                aria-label={label}
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
            />
            <button type="button" onClick={() => setVisible(current => !current)}>
                {visible ? 'Ocultar' : 'Mostrar'}
            </button>
        </span>
        {helper && <small>{helper}</small>}
    </label>
}

function AccessLayout({title, description, children}: {
    title: string
    description: string
    children: ReactNode
}) {
    return <section className="access-page">
        <div className="access-intro">
            <span className="badge">ENEM • NO SEU RITMO</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <StudyJourney/>
        </div>
        {children}
    </section>
}

function message(error: unknown) {
    if (error instanceof ApiError && error.status === 409) return 'Já existe uma conta com este e-mail.'
    return 'Não foi possível concluir agora. Tente novamente em instantes.'
}

export function LoginPage() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)
        const form = new FormData(event.currentTarget)

        try {
            await login({
                email: String(form.get('email')),
                password: String(form.get('password')),
            })
            navigate('/verificar-codigo', {
                state: {
                    email: String(form.get('email')),
                    remember: Boolean(form.get('remember')),
                } satisfies TwoFactorState,
            })
        } catch (requestError) {
            setError(message(requestError))
        } finally {
            setLoading(false)
        }
    }

    return <AccessLayout
        title="Seu estudo continua daqui."
        description="Entre para retomar seus simulados, acompanhar sua evolução e revisar o que merece mais atenção."
    >
        <form className="access-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Acesso</span>
            <h2>Entre no Provasmart</h2>
            <p>Use o e-mail cadastrado para acessar sua conta.</p>
            {params.get('senha') === 'alterada' &&
                <p className="form-success" role="status">Senha alterada com sucesso. Faça login com sua nova senha.</p>}
            {params.get('cadastro') === 'sucesso' &&
                <p className="form-success" role="status">Conta criada. Agora é só entrar.</p>}
            <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email"/>
            <PasswordField id="password" label="Senha" placeholder="Digite sua senha" autoComplete="current-password"/>
            <div className="form-options">
                <label className="checkbox"><input name="remember" type="checkbox"/> Manter conectado</label>
                <Link to="/esqueci-minha-senha">Esqueci minha senha</Link>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="form-switch">Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
        </form>
    </AccessLayout>
}

type TwoFactorState = {
    email: string
    remember: boolean
}

function isTwoFactorState(state: unknown): state is TwoFactorState {
    return typeof state === 'object' && state !== null
        && 'email' in state && typeof state.email === 'string' && Boolean(state.email.trim())
        && 'remember' in state && typeof state.remember === 'boolean'
}

export function VerifyTwoFactorPage() {
    const navigate = useNavigate()
    const {state}: {state: unknown} = useLocation()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isTwoFactorState(state)) return <Navigate to="/login" replace/>
    const {email, remember} = state

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const code = String(form.get('code') ?? '').trim()
        if (loading) return
        if (!/^[0-9]{6}$/.test(code)) {
            setError('Informe um código com exatamente 6 números.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const response = await verifyTwoFactor({email, code})
            if (!saveSession(response, remember)) throw new Error('token ausente')
            navigate('/', {replace: true})
        } catch (requestError) {
            setError(requestError instanceof ApiError && [400, 401, 403, 422].includes(requestError.status)
                ? 'Código inválido ou expirado. Confira o código ou faça login novamente.'
                : 'Não foi possível verificar o código. Tente novamente em instantes.')
        } finally {
            setLoading(false)
        }
    }

    return <AccessLayout title="Confirme seu acesso." description="Informe o código de autenticação recebido por e-mail.">
        <form className="access-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Verificação em duas etapas</span>
            <h2>Verifique seu e-mail</h2>
            <p>Enviamos um código para {email}.</p>
            <Field id="code" label="Código de autenticação" placeholder="Digite os 6 números" autoComplete="one-time-code"
                   inputMode="numeric" pattern="[0-9]{6}" maxLength={6}/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <p className="form-switch"><Link to="/login" replace>Voltar ao login</Link></p>
        </form>
    </AccessLayout>
}

const recoveryError = 'Não foi possível concluir agora. Tente novamente em instantes.'
const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type RecoveryState = {email: string}

function isRecoveryState(state: unknown): state is RecoveryState {
    return typeof state === 'object' && state !== null
        && 'email' in state && typeof state.email === 'string' && emailRule.test(state.email)
}

export function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const submitting = useRef(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current) return
        const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
        if (!emailRule.test(email)) {
            setError('Informe um e-mail válido.')
            return
        }
        submitting.current = true
        setLoading(true)
        setError('')
        try {
            await forgotPassword({email})
            navigate('/redefinir-senha', {state: {email} satisfies RecoveryState})
        } catch {
            setError(recoveryError)
        } finally {
            submitting.current = false
            setLoading(false)
        }
    }

    return <AccessLayout title="Recupere seu acesso." description="Receba por e-mail um código para redefinir sua senha.">
        <form className="access-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Recuperação de senha</span>
            <h2>Esqueceu sua senha?</h2>
            <p>Informe o e-mail cadastrado para receber o código.</p>
            <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email"/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar código'}
            </button>
            <p className="form-switch"><Link to="/login">Voltar ao login</Link></p>
        </form>
    </AccessLayout>
}

export function ResetPasswordPage() {
    const navigate = useNavigate()
    const {state}: {state: unknown} = useLocation()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const submitting = useRef(false)

    if (!isRecoveryState(state)) return <Navigate to="/esqueci-minha-senha" replace/>
    const {email} = state

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current) return
        const form = new FormData(event.currentTarget)
        const code = String(form.get('code') ?? '')
        const newPassword = String(form.get('newPassword') ?? '')
        if (!/^[0-9]{6}$/.test(code)) {
            setError('Informe um código com exatamente 6 números.')
            return
        }
        if (!passwordRule.test(newPassword)) {
            setError('A senha precisa atender a todos os requisitos informados.')
            return
        }
        if (newPassword !== form.get('confirmPassword')) {
            setError('As senhas digitadas não coincidem.')
            return
        }
        submitting.current = true
        setLoading(true)
        setError('')
        try {
            await resetPassword({email, code, newPassword})
            navigate('/login?senha=alterada', {replace: true})
        } catch (requestError) {
            setError(requestError instanceof ApiError && [400, 401, 403, 422].includes(requestError.status)
                ? 'Código inválido ou expirado. Solicite um novo código e tente novamente.'
                : recoveryError)
        } finally {
            submitting.current = false
            setLoading(false)
        }
    }

    return <AccessLayout title="Defina sua nova senha." description="Use o código recebido por e-mail para recuperar seu acesso.">
        <form className="access-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Recuperação de senha</span>
            <h2>Redefinir senha</h2>
            <p>Enviamos um código para {email}.</p>
            <Field id="code" label="Código de redefinição" placeholder="Digite os 6 números" autoComplete="one-time-code"
                   inputMode="numeric" pattern="[0-9]{6}" maxLength={6}/>
            <PasswordField id="newPassword" label="Nova senha" placeholder="Crie uma senha segura" autoComplete="new-password"
                           helper="Use 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial."/>
            <PasswordField id="confirmPassword" label="Confirmar nova senha" placeholder="Digite a senha novamente" autoComplete="new-password"/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
            <p className="form-switch"><Link to="/esqueci-minha-senha" replace>Solicitar novo código</Link></p>
        </form>
    </AccessLayout>
}

export function RegisterPage() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        const form = new FormData(event.currentTarget)
        const password = String(form.get('password'))

        if (!passwordRule.test(password)) {
            setError('A senha precisa atender a todos os requisitos informados.')
            return
        }
        if (password !== form.get('confirmPassword')) {
            setError('As senhas digitadas não coincidem.')
            return
        }

        setLoading(true)
        try {
            await register({
                name: String(form.get('name')),
                email: String(form.get('email')),
                password,
                acceptTerms: Boolean(form.get('terms')),
                acceptPrivacyPolicy: Boolean(form.get('terms')),
            })
            navigate('/login?cadastro=sucesso')
        } catch (requestError) {
            setError(message(requestError))
        } finally {
            setLoading(false)
        }
    }

    return <AccessLayout
        title="Uma conta para organizar seus próximos passos."
        description="Crie seu acesso para reunir simulados, resultados e plano de estudos em um só lugar."
    >
        <form className="access-card register-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Crie sua conta</span>
            <h2>Comece sua preparação</h2>
            <p>Preencha seus dados. Leva menos de dois minutos.</p>
            <Field id="name" label="Nome completo" placeholder="Como você quer ser chamado" autoComplete="name"/>
            <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email"/>
            <PasswordField
                id="password"
                label="Senha"
                placeholder="Crie uma senha segura"
                autoComplete="new-password"
                helper="Use 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial."
            />
            <PasswordField id="confirmPassword" label="Confirmar senha" placeholder="Digite a senha novamente"
                           autoComplete="new-password"/>
            <label className="checkbox legal-check">
                <input name="terms" type="checkbox" required/>
                <span>Li e aceito os <Link to="/termos-de-uso">Termos de Uso</Link> e a <Link
                    to="/politica-de-privacidade">Política de Privacidade</Link>.</span>
            </label>
            <label className="checkbox legal-check">
                <input name="age" type="checkbox" required/>
                <span>Declaro que tenho 13 anos ou mais. Se eu tiver menos de 18 anos, utilizarei a plataforma com a ciência do meu responsável legal.</span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar minha conta'}
            </button>
            <p className="form-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
        </form>
    </AccessLayout>
}
