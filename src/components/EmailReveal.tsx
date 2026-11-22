import type { EmailAccess } from '../hooks/useEmailReveal'
import './EmailReveal.css'

type Props = {
    access: EmailAccess | null
    disabled: boolean
    onReveal: () => void
    onHide: () => void
}

export function EmailReveal({ access, disabled, onReveal, onHide }: Props) {
    const visible = access?.status === 'visible'
    const loading = access?.status === 'loading'

    return (
        <div className="email-reveal">
            {visible && <span role="status">{access.email}</span>}
            <button
                type="button"
                disabled={loading || (disabled && !visible)}
                onClick={visible ? onHide : onReveal}
            >
                {visible ? 'Ocultar e-mail' : loading ? 'Consultando…' : 'Mostrar e-mail'}
            </button>
            {access?.status === 'error' && <span role="alert">Não foi possível consultar o e-mail.</span>}
        </div>
    )
}
