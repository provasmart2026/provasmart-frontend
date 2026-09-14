import {useEffect, useRef, useState} from 'react'
import {useParams} from 'react-router-dom'
import {simulationsApi} from '../../../api/simulations'
import type {Simulation} from '../../../types/simulation'
import './SimulationsPage.css'

export function SimulationPage() {
    const {simulationId} = useParams()
    return <SimulationSession key={simulationId} simulationId={simulationId}/>
}

function SimulationSession({simulationId}: {simulationId: string | undefined}) {
    const [simulation, setSimulation] = useState<Simulation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [saving, setSaving] = useState(false)
    const [pendingAlternativeId, setPendingAlternativeId] = useState<string | null>(null)
    const [finishing, setFinishing] = useState(false)
    const desiredAlternative = useRef<string | null>(null)
    const pending = useRef(false)
    const mounted = useRef(false)

    useEffect(() => {
        let active = true
        mounted.current = true
        async function load() {
            try {
                if (!simulationId) throw new Error('Identificador ausente')
                const result = await simulationsApi.get(simulationId)
                if (active) setSimulation(result)
            } catch {
                if (active) setError('Não foi possível carregar o simulado. Tente novamente mais tarde.')
            } finally {
                if (active) setLoading(false)
            }
        }
        void load()
        return () => { active = false; mounted.current = false }
    }, [simulationId])

    const questions = [...(simulation?.questions ?? [])].sort((a, b) => a.position - b.position)
    const question = questions[currentIndex]
    const selectedAlternativeId = pendingAlternativeId ?? question?.selectedAlternativeId
    const busy = saving || finishing

    async function answer(alternativeId: string) {
        if (!simulationId || !question || finishing || selectedAlternativeId === alternativeId) return
        desiredAlternative.current = alternativeId
        setPendingAlternativeId(alternativeId)
        setError(null)
        if (pending.current) return
        pending.current = true
        setSaving(true)
        try {
            // Keep requests sequential, coalescing rapid clicks into the latest choice.
            while (mounted.current && desiredAlternative.current !== null) {
                const savingAlternative: string = desiredAlternative.current
                let result = await simulationsApi.answer(simulationId, question.id, savingAlternative)
                // Some responses still contain the selection from before the save.
                // Keep the clicked option visible until a fresh read confirms persistence.
                if (result.questions.find(item => item.id === question.id)?.selectedAlternativeId !== savingAlternative) {
                    result = await simulationsApi.get(simulationId)
                    if (result.questions.find(item => item.id === question.id)?.selectedAlternativeId !== savingAlternative) {
                        throw new Error('Resposta não confirmada pelo servidor')
                    }
                }
                if (!mounted.current) return
                setSimulation(result)
                if (desiredAlternative.current === savingAlternative) desiredAlternative.current = null
            }
        } catch {
            if (mounted.current) setError('Não foi possível salvar a resposta. Selecione a alternativa novamente para tentar.')
        } finally {
            desiredAlternative.current = null
            pending.current = false
            if (mounted.current) {
                setPendingAlternativeId(null)
                setSaving(false)
            }
        }
    }
    async function finish() {
        if (!simulationId || pending.current) return
        const unanswered = questions.filter(item => !item.selectedAlternativeId).length
        if (unanswered > 0) {
            setError(`Ainda há ${unanswered} ${unanswered === 1 ? 'questão não respondida' : 'questões não respondidas'}. Responda todas antes de finalizar.`)
            return
        }
        if (questions.length !== 40) {
            setError('O simulado deve conter 40 questões para ser finalizado. Recarregue a página e tente novamente.')
            return
        }
        pending.current = true
        setFinishing(true)
        setError(null)
        try {
            const result = await simulationsApi.finish(simulationId)
            if (mounted.current) setSimulation(result)
        } catch {
            if (mounted.current) setError('Não foi possível finalizar o simulado. Tente novamente.')
        } finally {
            pending.current = false
            if (mounted.current) setFinishing(false)
        }
    }

    function navigate(index: number) {
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
                {loading ? <p role="status">Carregando simulado...</p> :
                    simulation?.status === 'FINALIZADO' ? <p role="status">Simulado finalizado com sucesso.</p> :
                    question && <>
                        <div className="simulation-progress">
                            <p className="lead" aria-live="polite">Questão {currentIndex + 1} de {questions.length}</p>
                            <p className="supporting-copy">{questions.filter(item => item.selectedAlternativeId).length} respondidas</p>
                        </div>
                        <fieldset className="simulation-question" disabled={finishing}>
                            <legend className="simulation-statement">{question.statement}</legend>
                            <div className="simulation-alternatives">
                                {[...question.alternatives].sort((a, b) => a.letter.localeCompare(b.letter)).map(alternative => (
                                    <label key={alternative.id} className={`simulation-alternative${selectedAlternativeId === alternative.id ? ' is-selected' : ''}`}>
                                        <input type="radio" name={question.id} value={alternative.id}
                                               checked={selectedAlternativeId === alternative.id}
                                               onChange={() => void answer(alternative.id)}/>
                                        <span className="simulation-letter">{alternative.letter}</span>{' '}
                                        <span>{alternative.text}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <p className="supporting-copy simulation-save-status" role="status">{saving ? 'Salvando resposta...' : ''}</p>
                        <div className="simulation-navigation">
                            <button className="simulation-secondary-button" type="button" disabled={busy || currentIndex === 0}
                                    onClick={() => navigate(currentIndex - 1)}>Anterior</button>
                            {currentIndex < questions.length - 1 ?
                                <button className="primary-button" type="button" disabled={busy}
                                        onClick={() => navigate(currentIndex + 1)}>Próxima</button> :
                                <button className="primary-button" type="button" disabled={busy} onClick={() => void finish()}>
                                    {finishing ? 'Finalizando...' : 'Finalizar simulado'}
                                </button>}
                        </div>
                    </>}
                {!loading && simulation?.status === 'EM_ANDAMENTO' && !question &&
                    <p role="alert">Nenhuma questão disponível neste simulado.</p>}
                {error && <p role="alert">{error}</p>}
            </div>
        </section>
    )
}
