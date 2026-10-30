import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../services/api'
import { studyPlanService } from '../../services/studyPlanService'
import { simulationService } from '../../services/simulationService'
import { StudyPlanSchedule } from './StudyPlanSchedule'
import type { StudyPlan, StudyPlanActivity } from '../../types/studyPlan'
import type { SimulationPerformance } from '../../types/simulationPerformance'
import './StudyPlanPage.css'

export function StudyPlanPage() {
    const [plan, setPlan] = useState<StudyPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)
    const [savingActivityId, setSavingActivityId] = useState<string | null>(null)
    const [completionError, setCompletionError] = useState<string | null>(null)
    const [generationPerformance, setGenerationPerformance] = useState<SimulationPerformance | null>(null)
    const [preparingGeneration, setPreparingGeneration] = useState(false)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [dailyHours, setDailyHours] = useState<1 | 2 | 3>(1)
    const [replaceCurrentPlan, setReplaceCurrentPlan] = useState(false)
    const [creating, setCreating] = useState(false)
    const [generationSuccess, setGenerationSuccess] = useState(false)
    const mounted = useRef(false)
    const pending = useRef(false)
    const generationPending = useRef(false)
    const creationPending = useRef(false)

    useEffect(() => {
        mounted.current = true
        let active = true

        async function loadPlan() {
            setLoading(true)
            setError(null)
            try {
                const currentPlan = await studyPlanService.current()
                if (active) setPlan(currentPlan)
            } catch (error) {
                if (active) {
                    setError(error instanceof ApiError && error.backendMessage
                        ? error.backendMessage
                        : 'Não foi possível consultar seu plano de estudos. Tente novamente.')
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadPlan()
        return () => {
            active = false
            mounted.current = false
        }
    }, [attempt])

    async function toggleActivity(activity: StudyPlanActivity) {
        if (!plan || plan.status !== 'ATIVO' || pending.current || creationPending.current) return
        pending.current = true
        setSavingActivityId(activity.id)
        setCompletionError(null)

        try {
            const updatedPlan = await studyPlanService.updateCompletion(
                plan.id, activity.id, !activity.completed
            )
            if (mounted.current) setPlan(updatedPlan)
        } catch (error) {
            if (mounted.current) {
                setCompletionError(error instanceof ApiError && error.backendMessage
                    ? error.backendMessage
                    : 'Não foi possível atualizar a atividade. Tente novamente.')
            }
        } finally {
            pending.current = false
            if (mounted.current) setSavingActivityId(null)
        }
    }

    async function prepareGeneration() {
        if (generationPending.current || creationPending.current) return
        generationPending.current = true
        setPreparingGeneration(true)
        setGenerationError(null)
        setGenerationPerformance(null)
        setDailyHours(1)
        setReplaceCurrentPlan(false)
        setGenerationSuccess(false)

        try {
            const simulation = await simulationService.latestFinished().catch(error => {
                if (error instanceof ApiError && error.status === 404) {
                    throw new Error('Finalize um Simulado Geral para gerar seu plano de estudos.')
                }
                throw error
            })
            if (!mounted.current) return

            const performance = await simulationService.performance(simulation.id)
            if (!mounted.current) return

            if (performance.summary.incorrectAnswers === 0) {
                setGenerationError('Não identificamos assuntos com dificuldade para revisão neste simulado. Realize um novo Simulado Geral para verificar se há assuntos que precisam de reforço.')
            } else {
                setGenerationPerformance(performance)
            }
        } catch (error) {
            if (mounted.current) {
                setGenerationError(error instanceof ApiError
                    ? error.backendMessage || 'Não foi possível preparar seu plano de estudos. Tente novamente.'
                    : error instanceof Error ? error.message
                    : 'Não foi possível preparar seu plano de estudos. Tente novamente.')
            }
        } finally {
            generationPending.current = false
            if (mounted.current) setPreparingGeneration(false)
        }
    }

    async function createPlan() {
        if (!generationPerformance || generationPending.current || creationPending.current || pending.current) return
        if (plan && !replaceCurrentPlan) return

        creationPending.current = true
        setCreating(true)
        setGenerationError(null)
        setGenerationSuccess(false)

        try {
            const newPlan = await studyPlanService.create({
                simulationId: generationPerformance.simulationId,
                dailyHours,
                replaceCurrentPlan,
            })
            if (mounted.current) {
                setPlan(newPlan)
                setGenerationPerformance(null)
                setReplaceCurrentPlan(false)
                setCompletionError(null)
                setGenerationSuccess(true)
            }
        } catch (error) {
            if (mounted.current) {
                setGenerationError(error instanceof ApiError && error.backendMessage
                    ? error.backendMessage
                    : 'Não foi possível gerar seu plano de estudos. Tente novamente.')
            }
        } finally {
            creationPending.current = false
            if (mounted.current) setCreating(false)
        }
    }

    const eligibleSubjectCount = generationPerformance?.areas.reduce((total, area) =>
        total + area.disciplines.reduce((count, discipline) =>
            count + discipline.subjects.filter(subject => subject.incorrectAnswers > 0).length, 0), 0) ?? 0
    const showFewSubjectsWarning =
        (dailyHours === 3 && eligibleSubjectCount <= 3) ||
        (dailyHours === 2 && eligibleSubjectCount <= 2)

    return (
        <section className="student-study-plan" aria-labelledby="study-plan-title">
            <div className="hero-copy">
                <span className="badge">UM PASSO DE CADA VEZ</span>
                <h1 id="study-plan-title">Meu Plano de Estudos</h1>
                <p className="lead">Organize sua semana e acompanhe os assuntos que precisam de atenção.</p>
                <Link className="study-plan-reference" to="/plano-de-estudos/historico">Ver histórico de planos</Link>
            </div>

            {!loading && !error && (
                <section className="study-plan-panel" aria-labelledby="study-plan-generation-title">
                    <h2 id="study-plan-generation-title">{plan ? 'Gerar novo plano' : 'Gerar plano'}</h2>
                    <p>Prepare um cronograma de sete dias com base no seu último Simulado Geral finalizado.</p>
                    <button className="primary-button" type="button" disabled={preparingGeneration || creating}
                        onClick={() => void prepareGeneration()}>
                        {preparingGeneration ? 'Consultando simulado...' : plan ? 'Gerar novo plano' : 'Gerar plano'}
                    </button>
                    {preparingGeneration && <p role="status">Consultando o último simulado e sua análise...</p>}
                    {generationError && <p role="alert">{generationError}</p>}
                    {generationSuccess && <p role="status">Plano de estudos gerado com sucesso.</p>}
                    {generationPerformance && (
                        <>
                            <p>{eligibleSubjectCount} assuntos com erros identificados para organizar seu plano.</p>
                            <label className="study-plan-hours" htmlFor="study-plan-daily-hours">
                                Horas de estudo por dia
                                <select id="study-plan-daily-hours" value={dailyHours} disabled={creating} onChange={event => {
                                    const value = Number(event.target.value)
                                    if (value === 1 || value === 2 || value === 3) setDailyHours(value)
                                }}>
                                    <option value={1}>1 hora por dia</option>
                                    <option value={2}>2 horas por dia</option>
                                    <option value={3}>3 horas por dia</option>
                                </select>
                            </label>
                            {showFewSubjectsWarning && (
                                <p className="study-plan-warning" role="status">
                                    Foram identificados poucos assuntos com dificuldade para a carga escolhida.
                                    {' '}Eles serão retomados como revisão e poderão se repetir no mesmo dia.
                                </p>
                            )}
                            {plan && (
                                <label className="study-plan-replacement">
                                    <input
                                        type="checkbox"
                                        checked={replaceCurrentPlan}
                                        disabled={creating}
                                        onChange={event => setReplaceCurrentPlan(event.target.checked)}
                                    />
                                    Confirmo que o plano atual será arquivado e continuará disponível no histórico.
                                </label>
                            )}
                            <button className="primary-button" type="button"
                                disabled={creating || savingActivityId !== null || (!!plan && !replaceCurrentPlan)}
                                onClick={() => void createPlan()}>
                                {creating ? 'Gerando plano…' : 'Confirmar e gerar plano'}
                            </button>
                            {creating && <p role="status">Gerando seu plano de estudos...</p>}
                        </>
                    )}
                </section>
            )}

            {loading ? <p className="study-plan-panel" role="status">Consultando seu plano de estudos...</p>
                : error ? (
                    <div className="study-plan-panel">
                        <p role="alert">{error}</p>
                        <button className="primary-button" type="button" onClick={() => setAttempt(value => value + 1)}>
                            Tentar novamente
                        </button>
                    </div>
                ) : !plan ? (
                    <div className="study-plan-panel">
                        <h2>Você ainda não possui um plano de estudos.</h2>
                        <p>Seu plano será organizado a partir da análise do último Simulado Geral finalizado.</p>
                    </div>
                ) : (
                    <>
                        <div className="study-plan-panel">
                            <h2>Seu plano ativo</h2>
                            <p>
                                {plan.dailyHours} {plan.dailyHours === 1 ? 'hora por dia' : 'horas por dia'}
                                {' · '}7 dias · Início em {plan.startDate.split('-').reverse().join('/')}
                            </p>
                            <Link className="study-plan-reference" to={`/simulados/${encodeURIComponent(plan.simulationId)}/desempenho`}>
                                Ver análise do simulado de referência
                            </Link>
                            <div className="study-plan-progress">
                                <label htmlFor="study-plan-progress">
                                    {plan.completedActivities} de {plan.totalActivities} atividades concluídas
                                    {' · '}{plan.progressPercentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                                </label>
                                <progress id="study-plan-progress" max={100} value={plan.progressPercentage} />
                            </div>
                            <p>Você pode estudar em qualquer ordem e concluir atividades depois do dia previsto.</p>
                            {completionError && <p role="alert">{completionError}</p>}
                        </div>

                        <StudyPlanSchedule plan={plan} onToggleActivity={toggleActivity}
                            savingActivityId={savingActivityId} disabled={creating} />
                    </>
                )}
        </section>
    )
}
