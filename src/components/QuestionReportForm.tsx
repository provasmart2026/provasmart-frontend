import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { ApiError } from '../services/api'
import { questionReportService } from '../services/questionReportService'
import type { QuestionReportOrigin, QuestionReportReason } from '../types/questionReport'
import './QuestionReportForm.css'

type Props = {
    origin: QuestionReportOrigin
    activityId: string
    questionId: string
    disabled?: boolean
    triggerLabel?: string
}

const reasons: { value: QuestionReportReason; label: string }[] = [
    { value: 'ENUNCIADO_INCORRETO', label: 'Enunciado incorreto' },
    { value: 'ALTERNATIVAS_COM_PROBLEMA', label: 'Problema nas alternativas' },
    { value: 'GABARITO_INCORRETO', label: 'Gabarito incorreto' },
    { value: 'EXPLICACAO_INCORRETA', label: 'Explicação incorreta' },
    { value: 'OUTRO', label: 'Outro' },
]

export function QuestionReportForm({
    origin,
    activityId,
    questionId,
    disabled = false,
    triggerLabel = 'Reportar problema',
}: Props) {
    const id = useId()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState<QuestionReportReason | ''>('')
    const [description, setDescription] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')
    const pending = useRef(false)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (disabled || pending.current || sent) return
        if (!reason || !description.trim() || description.length > 1000) {
            setError('Selecione o motivo e descreva o problema em até 1.000 caracteres.')
            return
        }
        pending.current = true
        setSending(true)
        setError('')
        try {
            await questionReportService.create(origin, activityId, questionId, {
                reason,
                description: description.trim(),
            })
            if (mounted.current) {
                setSent(true)
                setOpen(false)
            }
        } catch (requestError) {
            if (mounted.current)
                setError(
                    requestError instanceof ApiError && requestError.backendMessage
                        ? requestError.backendMessage
                        : 'Não foi possível enviar o reporte. Tente novamente.'
                )
        } finally {
            pending.current = false
            if (mounted.current) setSending(false)
        }
    }

    return (
        <div className="question-report">
            {sent ? (
                <p role="status" className="question-report-success">
                    Reporte enviado. Obrigado por avisar!
                </p>
            ) : (
                <>
                    <button
                        type="button"
                        className="question-report-trigger"
                        disabled={disabled || sending}
                        aria-expanded={open}
                        aria-controls={`${id}-form`}
                        onClick={() => setOpen((value) => !value)}
                    >
                        {triggerLabel}
                    </button>
                    {open && (
                        <form
                            id={`${id}-form`}
                            className="question-report-form"
                            aria-label="Reportar problema na questão"
                            onSubmit={submit}
                        >
                            <p>
                                Encontrou um problema? Seu reporte será analisado pela administração e não altera sua
                                resposta ou nota automaticamente.
                            </p>
                            <label htmlFor={`${id}-reason`}>Motivo</label>
                            <select
                                id={`${id}-reason`}
                                required
                                value={reason}
                                disabled={disabled || sending}
                                onChange={(event) => setReason(event.target.value as QuestionReportReason | '')}
                            >
                                <option value="">Selecione o motivo</option>
                                {reasons.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor={`${id}-description`}>Descrição do problema</label>
                            <textarea
                                id={`${id}-description`}
                                required
                                maxLength={1000}
                                rows={4}
                                value={description}
                                disabled={disabled || sending}
                                aria-describedby={`${id}-count`}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                            <span id={`${id}-count`} className="question-report-count">
                                {description.length}/1000 caracteres
                            </span>
                            {error && <p role="alert">{error}</p>}
                            <div className="question-report-actions">
                                <button
                                    type="button"
                                    className="simulation-secondary-button"
                                    disabled={sending}
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar reporte
                                </button>
                                <button type="submit" className="primary-button" disabled={disabled || sending}>
                                    {sending ? 'Enviando reporte...' : 'Enviar reporte'}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    )
}
