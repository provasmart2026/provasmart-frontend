import { type FormEvent, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { AccessLayout } from './components/AccessLayout'
import { Field, PasswordField } from './components/AccessFields'
import { isRecoveryState } from './navigationState'
import { isValidPassword, isValidVerificationCode, verificationCodePattern } from './validation'
import { accessRequestError, isRejectedVerificationCode } from './errors'

export function ResetPasswordPage() {
    const navigate = useNavigate()
    const { state }: { state: unknown } = useLocation()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const submitting = useRef(false)

    if (!isRecoveryState(state)) return <Navigate to="/esqueci-minha-senha" replace />
    const { email } = state

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (submitting.current) return
        const form = new FormData(event.currentTarget)
        const code = String(form.get('code') ?? '')
        const newPassword = String(form.get('newPassword') ?? '')
        if (!isValidVerificationCode(code)) {
            setError('Informe um código com exatamente 6 números.')
            return
        }
        if (!isValidPassword(newPassword)) {
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
            await authService.resetPassword({ email, code, newPassword })
            navigate('/login?senha=alterada', { replace: true })
        } catch (requestError) {
            setError(
                isRejectedVerificationCode(requestError)
                    ? 'Código inválido ou expirado. Solicite um novo código e tente novamente.'
                    : accessRequestError
            )
        } finally {
            submitting.current = false
            setLoading(false)
        }
    }

    return (
        <AccessLayout
            title="Defina sua nova senha."
            description="Use o código recebido por e-mail para recuperar seu acesso."
        >
            <form className="access-card" onSubmit={handleSubmit}>
                <span className="eyebrow">Recuperação de senha</span>
                <h2>Redefinir senha</h2>
                <p>Enviamos um código para {email}.</p>
                <Field
                    id="code"
                    label="Código de redefinição"
                    placeholder="Digite os 6 números"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern={verificationCodePattern}
                    maxLength={6}
                />
                <PasswordField
                    id="newPassword"
                    label="Nova senha"
                    placeholder="Crie uma senha segura"
                    autoComplete="new-password"
                    helper="Use 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial."
                />
                <PasswordField
                    id="confirmPassword"
                    label="Confirmar nova senha"
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                />
                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <button className="primary-button submit-button" type="submit" disabled={loading}>
                    {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
                <p className="form-switch">
                    <Link to="/esqueci-minha-senha" replace>
                        Solicitar novo código
                    </Link>
                </p>
            </form>
        </AccessLayout>
    )
}
