import { useState } from 'react'

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

export function Field({
    id,
    label,
    placeholder,
    type = 'text',
    autoComplete,
    inputMode,
    pattern,
    maxLength,
}: FieldProps) {
    return (
        <label className="form-field" htmlFor={id}>
            <span>{label}</span>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                pattern={pattern}
                maxLength={maxLength}
                required
            />
        </label>
    )
}

export function PasswordField({ id, label, placeholder, autoComplete, helper }: FieldProps & { helper?: string }) {
    const [visible, setVisible] = useState(false)

    return (
        <label className="form-field" htmlFor={id}>
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
                <button type="button" onClick={() => setVisible((current) => !current)}>
                    {visible ? 'Ocultar' : 'Mostrar'}
                </button>
            </span>
            {helper && <small>{helper}</small>}
        </label>
    )
}
