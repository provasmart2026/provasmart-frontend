import {type FormEvent, useState} from 'react'
import {Link, Navigate, useLocation, useNavigate} from 'react-router-dom'
import {authApi} from '../../api/auth'
import {AccessLayout} from './components/AccessLayout'
import {Field} from './components/AccessFields'
import {saveSession} from '../../auth/session'
import {isTwoFactorState} from './navigationState'
import {isValidVerificationCode, verificationCodePattern} from './validation'
import {isRejectedVerificationCode} from './errors'

export function VerifyTwoFactorPage() {
    const navigate = useNavigate()
    const {state}: { state: unknown } = useLocation()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isTwoFactorState(state)) return <Navigate to="/login" replace/>
    const {email, remember} = state

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const code = String(form.get('code') ?? '').trim()
        if (loading) return
        if (!isValidVerificationCode(code)) {
            setError('Informe um código com exatamente 6 números.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const response = await authApi.verifyTwoFactor({email, code})
            if (!saveSession(response, remember)) throw new Error('token ausente')
            navigate('/', {replace: true})
        } catch (requestError) {
            setError(isRejectedVerificationCode(requestError)
                ? 'Código inválido ou expirado. Confira o código ou faça login novamente.'
                : 'Não foi possível verificar o código. Tente novamente em instantes.')
        } finally {
            setLoading(false)
        }
    }

    return <AccessLayout title="Confirme seu acesso."
                         description="Informe o código de autenticação recebido por e-mail.">
        <form className="access-card" onSubmit={handleSubmit}>
            <span className="eyebrow">Verificação em duas etapas</span>
            <h2>Verifique seu e-mail</h2>
            <p>Enviamos um código para {email}.</p>
            <Field id="code" label="Código de autenticação" placeholder="Digite os 6 números"
                   autoComplete="one-time-code"
                   inputMode="numeric" pattern={verificationCodePattern} maxLength={6}/>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <p className="form-switch"><Link to="/login" replace>Voltar ao login</Link></p>
        </form>
    </AccessLayout>
}
