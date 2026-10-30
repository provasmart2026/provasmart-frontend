import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../services/api'
import { studyPlanService } from '../../services/studyPlanService'
import type { StudyPlan } from '../../types/studyPlan'
import { formatDate } from '../../utils/date'
import { StudyPlanSchedule } from './StudyPlanSchedule'
import './StudyPlanPage.css'

export function StudyPlanDetailsPage() {
    const { planId } = useParams()
    return <StudyPlanDetails key={planId} planId={planId} />
}

function StudyPlanDetails({ planId }: { planId: string | undefined }) {
    const [plan, setPlan] = useState<StudyPlan | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true

        async function loadDetails() {
            setLoading(true)
            setError(null)
            try {
                if (!planId) throw new Error('Identificador do plano ausente.')
                const result = await studyPlanService.get(planId)
                if (active) setPlan(result)
            } catch (error) {
                if (active) {
                    setError(error instanceof ApiError && error.backendMessage
                        ? error.backendMessage
                        : 'Não foi possível consultar os detalhes do plano. Tente novamente.')
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadDetails()
        return () => { active = false }
    }, [planId, attempt])

    return (
        <section className="student-study-plan" aria-labelledby="study-plan-details-title">
            <div className="hero-copy">
                <span className="badge">SUA JORNADA DE ESTUDOS</span>
                <h1 id="study-plan-details-title">Detalhes do plano</h1>
                <p className="lead">Consulte o cronograma e o progresso registrado neste plano.</p>
                <Link className="study-plan-reference" to="/plano-de-estudos/historico">Voltar ao histórico</Link>
            </div>

            {loading ? <p className="study-plan-panel" role="status">Consultando detalhes do plano...</p> : error ? (
                <div className="study-plan-panel">
                    <p role="alert">{error}</p>
                    <button className="primary-button" type="button" onClick={() => setAttempt(value => value + 1)}>
                        Tentar novamente
                    </button>
                </div>
            ) : plan && (
                <>
                    <div className="study-plan-panel">
                        <h2>Plano {plan.status === 'ATIVO' ? 'ativo' : 'arquivado'}</h2>
                        <p>
                            {plan.dailyHours} {plan.dailyHours === 1 ? 'hora por dia' : 'horas por dia'}
                            {' · '}7 dias · Início em {plan.startDate.split('-').reverse().join('/')}
                        </p>
                        <p>Gerado em <time dateTime={plan.createdAt}>{formatDate(plan.createdAt)}</time></p>
                        {plan.archivedAt && (
                            <p>Arquivado em <time dateTime={plan.archivedAt}>{formatDate(plan.archivedAt)}</time></p>
                        )}
                        <Link className="study-plan-reference" to={`/simulados/${encodeURIComponent(plan.simulationId)}/desempenho`}>
                            Ver análise do simulado de referência
                        </Link>
                        <div className="study-plan-progress">
                            <label htmlFor="study-plan-details-progress">
                                {plan.completedActivities} de {plan.totalActivities} atividades concluídas
                                {' · '}{plan.progressPercentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                            </label>
                            <progress id="study-plan-details-progress" max={100} value={plan.progressPercentage} />
                        </div>
                        <p>Esta tela está disponível somente para consulta.</p>
                        {plan.status === 'ATIVO' && (
                            <Link className="study-plan-reference" to="/plano-de-estudos">Acompanhar meu plano ativo</Link>
                        )}
                    </div>
                    <StudyPlanSchedule plan={plan} />
                </>
            )}
        </section>
    )
}
