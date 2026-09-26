import { type FormEvent, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { AccessLayout } from './components/AccessLayout'
import { Field } from './components/AccessFields'
import type { RecoveryState } from './navigationState'
import { isValidEmail } from './validation'
import { accessRequestError } from './errors'

export function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const submitting = useRef(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current) return
        const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
        if (!isValidEmail(email)) {
            setError('Informe um e-mail válido.')
            return
        }
        submitting.current = true
        setLoading(true)
        setError('')
        try {
            await authService.forgotPassword({ email })
            navigate('/redefinir-senha', { state: { email } satisfies RecoveryState })
        } catch {
            setError(accessRequestError)
        } finally {
            submitting.current = false
            setLoading(false)
        }
    }

    return (
        <AccessLayout title="Recupere seu acesso." description="Receba por e-mail um código para redefinir sua senha.">
            <form className="access-card" onSubmit={handleSubmit}>
                <span className="eyebrow">Recuperação de senha</span>
                <h2>Esqueceu sua senha?</h2>
                <p>Informe o e-mail cadastrado para receber o código.</p>
                <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email" />
                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <button className="primary-button submit-button" type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar código'}
                </button>
                <p className="form-switch">
                    <Link to="/login">Voltar ao login</Link>
                </p>
            </form>
        </AccessLayout>
    )
}
