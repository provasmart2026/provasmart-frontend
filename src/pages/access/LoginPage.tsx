import {type FormEvent, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {authApi} from '../../api/auth'
import {AccessLayout} from './components/AccessLayout'
import {Field, PasswordField} from './components/AccessFields'
import type {TwoFactorState} from './navigationState'
import {getAccountAccessError} from './errors'

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
            await authApi.login({
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
            setError(getAccountAccessError(requestError))
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
                <p className="form-success" role="status">Senha alterada com sucesso. Faça login com sua nova
                    senha.</p>}
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
