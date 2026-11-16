import {useEffect, useState} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import {simulationService} from '../../services/simulationService'
import {directedPracticeService} from '../../services/directedPracticeService'
import {studyPlanService} from '../../services/studyPlanService'
import type {Page} from '../../types/api'
import type {SimulationSummary} from '../../types/simulation'
import type {DirectedPracticeSummary} from '../../types/directedPractice'
import type {StudyPlanSummary} from '../../types/studyPlan'
import {formatDate} from '../../utils/date'
import {areaLabel} from './DirectedPracticeStartPage'
import './SimulationsPage.css'
import './StudentHistoryPage.css'

const tabs = [
    {id: 'simulados', label: 'Simulados', destination: '/simulados'},
    {id: 'praticas', label: 'Práticas direcionadas', destination: '/praticas'},
    {id: 'planos', label: 'Planos arquivados', destination: '/plano-de-estudos'},
] as const
type HistoryTab = typeof tabs[number]
type HistoryEntry = SimulationSummary | DirectedPracticeSummary | StudyPlanSummary
const percentage = (value: number) => `${value.toLocaleString('pt-BR', {maximumFractionDigits: 1})}%`

export function StudentHistoryPage() {
    const [params] = useSearchParams()
    const tab = tabs.find(item => item.id === params.get('aba')) ?? tabs[0]

    return (
        <section className="student-simulations student-history" aria-labelledby="history-title">
            <div className="hero-copy">
                <h1 id="history-title">Histórico</h1>
                <p className="lead">Consulte seus simulados, práticas e planos de estudos arquivados.</p>
            </div>
            <nav className="history-tabs" aria-label="Tipo de histórico">
                {tabs.map(item => (
                    <Link key={item.id} to={`/historico?aba=${item.id}`}
                          aria-current={item.id === tab.id ? 'page' : undefined}>{item.label}</Link>
                ))}
            </nav>
            <HistoryList key={tab.id} tab={tab}/>
        </section>
    )
}

function HistoryList({tab}: { tab: HistoryTab }) {
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)
    const [data, setData] = useState<Page<HistoryEntry> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(false)

        async function load() {
            try {
                const result = tab.id === 'simulados'
                    ? await simulationService.history(page, size)
                    : tab.id === 'praticas'
                        ? await directedPracticeService.history(page, size)
                        : await studyPlanService.list(page, size, 'ARQUIVADO')
                if (!active) return
                if (page > 0 && page >= result.totalPages) {
                    setPage(Math.max(0, result.totalPages - 1))
                    return
                }
                setData(result)
            } catch {
                if (active) setError(true)
            } finally {
                if (active) setLoading(false)
            }
        }

        void load()
        return () => {
            active = false
        }
    }, [tab.id, page, size, attempt])

    return (
        <div className="simulation-panel history-panel" aria-label={tab.label}>
            <div className="history-toolbar">
                <p>Os registros mais recentes aparecem primeiro.</p>
                <label>Registros por página
                    <select value={size} onChange={event => {
                        setSize(Number(event.target.value))
                        setPage(0)
                    }}>
                        {[10, 20, 30].map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                </label>
            </div>
            {loading ? <p role="status">Carregando histórico...</p> : error ? (
                <div>
                    <p role="alert">Não foi possível carregar o histórico. Tente novamente.</p>
                    <button className="primary-button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente
                    </button>
                </div>
            ) : data && (data.content.length === 0 ? (
                <div className="history-empty">
                    <h2>Nenhum registro por aqui ainda</h2>
                    <p>{tab.id === 'planos'
                        ? 'Seus planos aparecerão aqui quando forem arquivados.'
                        : 'As atividades finalizadas ou canceladas aparecerão aqui.'}</p>
                    <Link className="primary-button" to={tab.destination}>
                        {tab.id === 'planos' ? 'Ir para plano de estudos' : tab.id === 'praticas' ? 'Ir para práticas direcionadas' : 'Ir para simulados'}
                    </Link>
                </div>
            ) : (
                <>
                    <p>{data.totalElements} {data.totalElements === 1 ? 'registro encontrado' : 'registros encontrados'}</p>
                    <ul className="history-list">
                        {data.content.map(entry => <HistoryCard key={entry.id} entry={entry}/>)}
                    </ul>
                    <nav className="history-pagination" aria-label="Paginação do histórico">
                        <button type="button" disabled={data.first}
                                onClick={() => setPage(value => Math.max(0, value - 1))}>Anterior
                        </button>
                        <span>Página {data.number + 1} de {data.totalPages}</span>
                        <button type="button" disabled={data.last} onClick={() => setPage(value => value + 1)}>Próxima
                        </button>
                    </nav>
                </>
            ))}
        </div>
    )
}

function HistoryCard({entry}: { entry: HistoryEntry }) {
    if ('progressPercentage' in entry) {
        return (
            <li className="history-card">
                <div className="history-heading">
                    <h2>Plano de {entry.startDate.split('-').reverse().join('/')}</h2>
                    <span className="history-status">Arquivado</span>
                </div>
                <p>Gerado
                    em {formatDate(entry.createdAt)}{entry.archivedAt && ` · Arquivado em ${formatDate(entry.archivedAt)}`}</p>
                <p>{entry.dailyHours} {entry.dailyHours === 1 ? 'hora por dia' : 'horas por dia'}</p>
                <p>{entry.completedActivities} de {entry.totalActivities} atividades concluídas
                    · {percentage(entry.progressPercentage)}</p>
                <progress max={100} value={entry.progressPercentage} aria-label="Progresso do plano"/>
                <Link to={`/plano-de-estudos/historico/${encodeURIComponent(entry.id)}`}>Ver detalhes do plano</Link>
            </li>
        )
    }
    const practice = 'area' in entry
    const cancelled = entry.status === 'CANCELADO' || entry.status === 'CANCELADA'
    return (
        <li className="history-card">
            <div className="history-heading">
                <h2>{practice ? `Prática de ${areaLabel(entry.area)}` : 'Simulado geral'}</h2>
                <span
                    className={`history-status${cancelled ? ' history-cancelled' : ''}`}>{practice ? (cancelled ? 'Cancelada' : 'Finalizada') : (cancelled ? 'Cancelado' : 'Finalizado')}</span>
            </div>
            <p>Iniciado
                em {formatDate(entry.startedAt)}{entry.finishedAt && ` · ${cancelled ? 'Encerrado' : 'Finalizado'} em ${formatDate(entry.finishedAt)}`}</p>
            <p>{entry.answeredQuestions} de {entry.totalQuestions} questões respondidas</p>
            {cancelled ? <p>Atividade cancelada, sem resultado de desempenho.</p> : (
                <>
                    <p>{entry.correctAnswers} acertos · {entry.incorrectAnswers} erros
                        · {percentage(entry.accuracyPercentage ?? 0)} de aproveitamento</p>
                    <Link
                        to={practice ? `/praticas/${encodeURIComponent(entry.id)}/analise` : `/simulados/${encodeURIComponent(entry.id)}/desempenho`}>Ver
                        análise de desempenho</Link>
                </>
            )}
        </li>
    )
}
