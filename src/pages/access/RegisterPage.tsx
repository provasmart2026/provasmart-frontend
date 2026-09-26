import { LegalLink } from '../../components/LegalLink'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { AccessLayout } from './components/AccessLayout'
import { Field, PasswordField } from './components/AccessFields'
import { isValidPassword } from './validation'
import { getAccountAccessError } from './errors'

export function RegisterPage() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        const form = new FormData(event.currentTarget)
        const password = String(form.get('password'))

        if (!isValidPassword(password)) {
            setError('A senha precisa atender a todos os requisitos informados.')
            return
        }
        if (password !== form.get('confirmPassword')) {
            setError('As senhas digitadas não coincidem.')
            return
        }

        setLoading(true)
        try {
            await authService.register({
                name: String(form.get('name')),
                email: String(form.get('email')),
                password,
                acceptTerms: Boolean(form.get('terms')),
                acceptPrivacyPolicy: Boolean(form.get('terms')),
            })
            navigate('/login?cadastro=sucesso')
        } catch (requestError) {
            setError(getAccountAccessError(requestError))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AccessLayout
            title="Uma conta para organizar seus próximos passos."
            description="Crie seu acesso para reunir simulados, resultados e plano de estudos em um só lugar."
        >
            <form className="access-card register-card" onSubmit={handleSubmit}>
                <span className="eyebrow">Crie sua conta</span>
                <h2>Comece sua preparação</h2>
                <p>Preencha seus dados. Leva menos de dois minutos.</p>
                <Field id="name" label="Nome completo" placeholder="Como você quer ser chamado" autoComplete="name" />
                <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email" />
                <PasswordField
                    id="password"
                    label="Senha"
                    placeholder="Crie uma senha segura"
                    autoComplete="new-password"
                    helper="Use 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial."
                />
                <PasswordField
                    id="confirmPassword"
                    label="Confirmar senha"
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                />
                <label className="checkbox legal-check">
                    <input name="terms" type="checkbox" required />
                    <span>
                        Li e aceito os <LegalLink to="/termos-de-uso">Termos de Uso</LegalLink> e a{' '}
                        <LegalLink to="/politica-de-privacidade">Política de Privacidade</LegalLink>.
                    </span>
                </label>
                <label className="checkbox legal-check">
                    <input name="age" type="checkbox" required />
                    <span>
                        Declaro que tenho 13 anos ou mais. Se eu tiver menos de 18 anos, utilizarei a plataforma com a
                        ciência do meu responsável legal.
                    </span>
                </label>
                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <button className="primary-button submit-button" type="submit" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar minha conta'}
                </button>
                <p className="form-switch">
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </p>
            </form>
        </AccessLayout>
    )
}
