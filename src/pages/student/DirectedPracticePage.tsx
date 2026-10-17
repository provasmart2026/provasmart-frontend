import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { directedPracticeService } from '../../services/directedPracticeService'
import type { DirectedPractice } from '../../types/directedPractice'
import { areaLabel } from './DirectedPracticeStartPage'
import './SimulationsPage.css'
import './DirectedPractice.css'

export function DirectedPracticePage() {
    const { practiceId } = useParams()
    return <DirectedPracticeSession key={practiceId} practiceId={practiceId} />
}

function DirectedPracticeSession({ practiceId }: { practiceId?: string }) {
    const navigate = useNavigate()
    const [practice, setPractice] = useState<DirectedPractice | null>(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [index, setIndex] = useState(0)

    useEffect(() => {
        let active = true
        if (!practiceId) {
            setError('Identificador da prática ausente.')
            setLoading(false)
            return
        }
        directedPracticeService.get(practiceId)
            .then((result) => { if (active) setPractice(result) })
            .catch(() => { if (active) setError('Não foi possível carregar a prática.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [practiceId])

    const questions = [...(practice?.questions ?? [])].sort((a, b) => a.position - b.position)
    const question = questions[index]
    const answered = questions.filter((item) => item.selectedAlternativeId).length

    async function answer(alternativeId: string) {
        if (!practiceId || !question || busy || question.selectedAlternativeId === alternativeId) return
        setBusy(true)
        setError(null)
        try {
            const result = await directedPracticeService.answer(practiceId, question.id, alternativeId)
            const confirmed = result.questions.find((item) => item.id === question.id)?.selectedAlternativeId === alternativeId
                ? result : await directedPracticeService.get(practiceId)
            if (confirmed.questions.find((item) => item.id === question.id)?.selectedAlternativeId !== alternativeId) {
                throw new Error('Resposta não confirmada')
            }
            setPractice(confirmed)
        } catch {
            setError('Não foi possível salvar a resposta. Tente novamente.')
        } finally {
            setBusy(false)
        }
    }

    async function finish() {
        if (!practiceId || busy) return
        if (questions.length !== 20 || answered !== 20) {
            setError(`Ainda faltam ${20 - answered} questões. Responda todas antes de finalizar.`)
            return
        }
        if (!window.confirm('Finalizar a prática e liberar a correção das 20 questões?')) return
        setBusy(true)
        setError(null)
        try {
            const result = await directedPracticeService.finish(practiceId)
            setPractice(result)
        } catch {
            setError('Não foi possível finalizar a prática. Confira as respostas e tente novamente.')
        } finally {
            setBusy(false)
        }
    }

    async function cancel() {
        if (!practiceId || busy || !window.confirm('Cancelar esta prática? As respostas serão preservadas, mas você não poderá retomá-la nem ver uma análise.')) return
        setBusy(true)
        setError(null)
        try {
            await directedPracticeService.cancel(practiceId)
            navigate('/praticas')
        } catch {
            setError('Não foi possível cancelar a prática. Tente novamente.')
            setBusy(false)
        }
    }

    function goTo(next: number) {
        if (busy) return
        setIndex(next)
        setError(null)
    }

    return (
        <section className="student-simulations simulation-execution practice" aria-labelledby="practice-session-title">
            <div className="hero-copy">
                <span className="badge">PRÁTICA DIRECIONADA</span>
                <h1 id="practice-session-title">{practice ? areaLabel(practice.area) : 'Prática direcionada'}</h1>
            </div>
            <div className="simulation-panel">
                {loading ? <p role="status">Carregando prática...</p> : practice?.status === 'FINALIZADA' ? (
                    <p>Prática finalizada. <Link to={`/praticas/${encodeURIComponent(practice.id)}/analise`}>Ver correção e análise</Link></p>
                ) : practice?.status === 'CANCELADA' ? (
                    <p>Esta prática foi cancelada. <Link to="/praticas">Voltar às práticas</Link></p>
                ) : question ? (
                    <>
                        <div className="simulation-progress">
                            <p className="lead" aria-live="polite">Questão {index + 1} de {questions.length}</p>
                            <p className="supporting-copy">{answered} de 20 respondidas</p>
                        </div>
                        <p className="supporting-copy">{question.discipline} · {question.subject}</p>
                        <fieldset className="simulation-question" disabled={busy}>
                            <legend className="simulation-statement">{question.statement}</legend>
                            <div className="simulation-alternatives">
                                {[...question.alternatives].sort((a, b) => a.letter.localeCompare(b.letter)).map((alternative) => (
                                    <label key={alternative.id} className={`simulation-alternative${question.selectedAlternativeId === alternative.id ? ' is-selected' : ''}`}>
                                        <input type="radio" name={question.id} checked={question.selectedAlternativeId === alternative.id}
                                            value={alternative.id} onChange={() => void answer(alternative.id)} />
                                        <span className="simulation-letter">{alternative.letter}</span>
                                        <span>{alternative.text}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <p role="status" className="simulation-save-status">{busy ? 'Processando...' : ''}</p>
                        <div className="practice-question-index" aria-label="Ir para uma questão">
                            {questions.map((item, position) => (
                                <button key={item.id} type="button" disabled={busy} aria-label={`Questão ${position + 1}${item.selectedAlternativeId ? ', respondida' : ', pendente'}`}
                                    aria-current={position === index ? 'step' : undefined}
                                    className={item.selectedAlternativeId ? 'is-answered' : ''} onClick={() => goTo(position)}>{position + 1}</button>
                            ))}
                        </div>
                        <div className="simulation-navigation">
                            <button className="simulation-secondary-button" type="button" disabled={busy || index === 0} onClick={() => goTo(index - 1)}>Anterior</button>
                            {index < questions.length - 1 ? (
                                <button className="primary-button" type="button" disabled={busy} onClick={() => goTo(index + 1)}>Próxima</button>
                            ) : (
                                <button className="primary-button" type="button" disabled={busy || answered !== 20} onClick={() => void finish()}>Finalizar prática</button>
                            )}
                        </div>
                        <button className="practice-cancel" type="button" disabled={busy} onClick={() => void cancel()}>Cancelar prática</button>
                    </>
                ) : !error ? <p role="alert">Nenhuma questão disponível.</p> : null}
                {error && <p role="alert">{error}</p>}
            </div>
        </section>
    )
}
