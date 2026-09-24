import {type FormEvent, type ReactNode, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {login, register, saveSession} from '../../api/auth'
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
}

function Field({id, label, placeholder, type = 'text', autoComplete}: FieldProps) {
    return <label className="form-field" htmlFor={id}>
        <span>{label}</span>
        <input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} required/>
    </label>
}

function PasswordField({id, label, placeholder, autoComplete, helper}: FieldProps & {helper?: string}) {
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
            const response = await login({
                email: String(form.get('email')),
                password: String(form.get('password')),
            })
            if (!saveSession(response, Boolean(form.get('remember')))) throw new Error('token ausente')
            navigate('/')
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
            {params.get('cadastro') === 'sucesso' && <p className="form-success" role="status">Conta criada. Agora é só entrar.</p>}
            <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email"/>
            <PasswordField id="password" label="Senha" placeholder="Digite sua senha" autoComplete="current-password"/>
            <div className="form-options">
                <label className="checkbox"><input name="remember" type="checkbox"/> Manter conectado</label>
                <a href="mailto:provasmrt@gmail.com?subject=Recuperação de senha">Esqueci minha senha</a>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <p className="form-switch">Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
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
            <PasswordField id="confirmPassword" label="Confirmar senha" placeholder="Digite a senha novamente" autoComplete="new-password"/>
            <label className="checkbox legal-check">
                <input name="terms" type="checkbox" required/>
                <span>Li e aceito os <Link to="/termos-de-uso">Termos de Uso</Link> e a <Link to="/politica-de-privacidade">Política de Privacidade</Link>.</span>
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
