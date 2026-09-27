import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { simulationService } from '../../services/simulationService'
import type { Simulation } from '../../types/simulation'
import './SimulationsPage.css'

async function saveAndConfirmAnswer(simulationId: string, questionId: string, alternativeId: string) {
    const hasPersistedAnswer = (simulation: Simulation) =>
        simulation.questions.find((question) => question.id === questionId)?.selectedAlternativeId === alternativeId

    const response = await simulationService.answer(simulationId, questionId, alternativeId)
    const confirmedSimulation = hasPersistedAnswer(response) ? response : await simulationService.get(simulationId)
    if (!hasPersistedAnswer(confirmedSimulation)) throw new Error('Resposta não confirmada pelo servidor')
    return confirmedSimulation
}

export function SimulationPage() {
    const { simulationId } = useParams()
    return <SimulationSession key={simulationId} simulationId={simulationId} />
}

function SimulationSession({ simulationId }: { simulationId: string | undefined }) {
    const [simulation, setSimulation] = useState<Simulation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [saving, setSaving] = useState(false)
    const [pendingAlternativeId, setPendingAlternativeId] = useState<string | null>(null)
    const [finishing, setFinishing] = useState(false)
    const latestSelectedAlternativeId = useRef<string | null>(null)
    const mutationPending = useRef(false)
    const mounted = useRef(false)

    useEffect(() => {
        let active = true
        mounted.current = true
        async function load() {
            try {
                if (!simulationId) throw new Error('Identificador ausente')
                const result = await simulationService.get(simulationId)
                if (active) setSimulation(result)
            } catch {
                if (active) setError('Não foi possível carregar o simulado. Tente novamente mais tarde.')
            } finally {
                if (active) setLoading(false)
            }
        }
        void load()
        return () => {
            active = false
            mounted.current = false
        }
    }, [simulationId])

    const questions = [...(simulation?.questions ?? [])].sort((a, b) => a.position - b.position)
    const question = questions[currentIndex]
    const selectedAlternativeId = pendingAlternativeId ?? question?.selectedAlternativeId
    const busy = saving || finishing
    const answeredCount = questions.filter((question) => question.selectedAlternativeId).length

    async function saveLatestSelectedAlternative(alternativeId: string) {
        if (!simulationId || !question || finishing || selectedAlternativeId === alternativeId) return
        latestSelectedAlternativeId.current = alternativeId
        setPendingAlternativeId(alternativeId)
        setError(null)
        if (mutationPending.current) return
        mutationPending.current = true
        setSaving(true)
        try {
            while (mounted.current && latestSelectedAlternativeId.current !== null) {
                const alternativeIdToSave: string = latestSelectedAlternativeId.current
                const result = await saveAndConfirmAnswer(simulationId, question.id, alternativeIdToSave)
                if (!mounted.current) return
                setSimulation(result)
                if (latestSelectedAlternativeId.current === alternativeIdToSave)
                    latestSelectedAlternativeId.current = null
            }
        } catch {
            if (mounted.current)
                setError('Não foi possível salvar a resposta. Selecione a alternativa novamente para tentar.')
        } finally {
            latestSelectedAlternativeId.current = null
            mutationPending.current = false
            if (mounted.current) {
                setPendingAlternativeId(null)
                setSaving(false)
            }
        }
    }
    async function finish() {
        if (!simulationId || mutationPending.current) return
        const unanswered = questions.length - answeredCount
        if (unanswered > 0) {
            setError(
                `Ainda há ${unanswered} ${unanswered === 1 ? 'questão não respondida' : 'questões não respondidas'}. Responda todas antes de finalizar.`
            )
            return
        }
        if (questions.length !== 40) {
            setError('O simulado deve conter 40 questões para ser finalizado. Recarregue a página e tente novamente.')
            return
        }
        mutationPending.current = true
        setFinishing(true)
        setError(null)
        try {
            const result = await simulationService.finish(simulationId)
            if (mounted.current) setSimulation(result)
        } catch {
            if (mounted.current) setError('Não foi possível finalizar o simulado. Tente novamente.')
        } finally {
            mutationPending.current = false
            if (mounted.current) setFinishing(false)
        }
    }

    function goToQuestion(index: number) {
        setCurrentIndex(index)
        setError(null)
    }

    return (
        <section className="student-simulations simulation-execution" aria-labelledby="simulation-title">
            <div className="hero-copy">
                <span className="badge">ENEM • UM PASSO DE CADA VEZ</span>
                <h1 id="simulation-title">Simulado</h1>
            </div>
            <div className="simulation-panel">
                {loading ? (
                    <p role="status">Carregando simulado...</p>
                ) : simulation?.status === 'FINALIZADO' ? (
                    <p role="status">Simulado finalizado com sucesso.</p>
                ) : (
                    question && (
                        <>
                            <div className="simulation-progress">
                                <p className="lead" aria-live="polite">
                                    Questão {currentIndex + 1} de {questions.length}
                                </p>
                                <p className="supporting-copy">{answeredCount} respondidas</p>
                            </div>
                            <fieldset className="simulation-question" disabled={finishing}>
                                <legend className="simulation-statement">{question.statement}</legend>
                                <div className="simulation-alternatives">
                                    {[...question.alternatives]
                                        .sort((a, b) => a.letter.localeCompare(b.letter))
                                        .map((alternative) => (
                                            <label
                                                key={alternative.id}
                                                className={`simulation-alternative${selectedAlternativeId === alternative.id ? ' is-selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={question.id}
                                                    value={alternative.id}
                                                    checked={selectedAlternativeId === alternative.id}
                                                    onChange={() => void saveLatestSelectedAlternative(alternative.id)}
                                                />
                                                <span className="simulation-letter">{alternative.letter}</span>{' '}
                                                <span>{alternative.text}</span>
                                            </label>
                                        ))}
                                </div>
                            </fieldset>
                            <p className="supporting-copy simulation-save-status" role="status">
                                {saving ? 'Salvando resposta...' : ''}
                            </p>
                            <div className="simulation-navigation">
                                <button
                                    className="simulation-secondary-button"
                                    type="button"
                                    disabled={busy || currentIndex === 0}
                                    onClick={() => goToQuestion(currentIndex - 1)}
                                >
                                    Anterior
                                </button>
                                {currentIndex < questions.length - 1 ? (
                                    <button
                                        className="primary-button"
                                        type="button"
                                        disabled={busy}
                                        onClick={() => goToQuestion(currentIndex + 1)}
                                    >
                                        Próxima
                                    </button>
                                ) : (
                                    <button
                                        className="primary-button"
                                        type="button"
                                        disabled={busy}
                                        onClick={() => void finish()}
                                    >
                                        {finishing ? 'Finalizando...' : 'Finalizar simulado'}
                                    </button>
                                )}
                            </div>
                        </>
                    )
                )}
                {!loading && simulation?.status === 'EM_ANDAMENTO' && !question && (
                    <p role="alert">Nenhuma questão disponível neste simulado.</p>
                )}
                {error && <p role="alert">{error}</p>}
            </div>
        </section>
    )
}
