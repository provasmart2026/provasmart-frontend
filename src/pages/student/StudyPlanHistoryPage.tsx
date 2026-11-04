import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../services/api'
import { studyPlanService } from '../../services/studyPlanService'
import type { Page } from '../../types/api'
import type { StudyPlanStatus, StudyPlanSummary } from '../../types/studyPlan'
import { formatDate } from '../../utils/date'
import './StudyPlanPage.css'
import './StudyPlanHistoryPage.css'

export function StudyPlanHistoryPage() {
    const [page, setPage] = useState(0)
    const [status, setStatus] = useState<StudyPlanStatus | ''>('')
    const [data, setData] = useState<Page<StudyPlanSummary> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true

        async function loadHistory() {
            setLoading(true)
            setError(null)
            try {
                const result = await studyPlanService.list(page, 10, status === '' ? undefined : status)
                if (!active) return
                if (page > 0 && page >= result.totalPages) {
                    setPage(Math.max(0, result.totalPages - 1))
                    return
                }
                setData(result)
            } catch (error) {
                if (active) {
                    setError(error instanceof ApiError && error.backendMessage
                        ? error.backendMessage
                        : 'Não foi possível consultar o histórico de planos. Tente novamente.')
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadHistory()
        return () => { active = false }
    }, [page, status, attempt])

    return (
        <section className="student-study-plan" aria-labelledby="study-plan-history-title">
            <div className="hero-copy">
                <span className="badge">SUA JORNADA DE ESTUDOS</span>
                <h1 id="study-plan-history-title">Histórico de planos</h1>
                <p className="lead">Consulte seus planos e o progresso registrado em cada um.</p>
            </div>
            <div className="study-plan-panel">
                <Link className="study-plan-reference" to="/plano-de-estudos">Voltar ao meu plano</Link>
                <label className="study-plan-hours" htmlFor="study-plan-history-status">
                    Estado do plano
                    <select id="study-plan-history-status" value={status} onChange={event => {
                        const value = event.target.value
                        if (value === '' || value === 'ATIVO' || value === 'ARQUIVADO') {
                            setStatus(value)
                            setPage(0)
                        }
                    }}>
                        <option value="">Todos</option>
                        <option value="ATIVO">Ativos</option>
                        <option value="ARQUIVADO">Arquivados</option>
                    </select>
                </label>
                <p>Os planos mais recentes aparecem primeiro.</p>

                {loading ? <p role="status">Consultando histórico de planos...</p> : error ? (
                    <>
                        <p role="alert">{error}</p>
                        <button className="primary-button" type="button" onClick={() => setAttempt(value => value + 1)}>
                            Tentar novamente
                        </button>
                    </>
                ) : data && (data.content.length === 0 ? (
                    <p>Nenhum plano encontrado para o filtro selecionado.</p>
                ) : (
                    <>
                        <p>{data.totalElements} {data.totalElements === 1 ? 'plano encontrado' : 'planos encontrados'}</p>
                        <ul className="study-plan-history-list">
                            {data.content.map(plan => (
                                <li className="study-plan-history-item" key={plan.id}>
                                    <div className="study-plan-history-heading">
                                        <h2>Plano de {plan.startDate.split('-').reverse().join('/')}</h2>
                                        <span className="study-plan-history-status">
                                            {plan.status === 'ATIVO' ? 'Ativo' : 'Arquivado'}
                                        </span>
                                    </div>
                                    <p>Gerado em <time dateTime={plan.createdAt}>{formatDate(plan.createdAt)}</time></p>
                                    <p>{plan.dailyHours} {plan.dailyHours === 1 ? 'hora por dia' : 'horas por dia'} · 7 dias</p>
                                    <p>
                                        {plan.completedActivities} de {plan.totalActivities} atividades concluídas
                                        {' · '}{plan.progressPercentage.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                                    </p>
                                    <progress max={100} value={plan.progressPercentage}
                                        aria-label={`Progresso do plano de ${plan.startDate.split('-').reverse().join('/')}`} />
                                    <Link className="study-plan-reference" to={`/plano-de-estudos/historico/${encodeURIComponent(plan.id)}`}>
                                        Ver detalhes
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <nav className="study-plan-history-pagination" aria-label="Paginação do histórico de planos">
                            <button className="primary-button" type="button" disabled={data.first}
                                onClick={() => setPage(value => Math.max(0, value - 1))}>
                                Anterior
                            </button>
                            <span>Página {data.number + 1} de {data.totalPages}</span>
                            <button className="primary-button" type="button" disabled={data.last}
                                onClick={() => setPage(value => value + 1)}>
                                Próxima
                            </button>
                        </nav>
                    </>
                ))}
            </div>
        </section>
    )
}
