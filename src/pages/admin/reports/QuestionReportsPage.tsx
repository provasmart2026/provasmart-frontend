import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { questionReportService } from '../../../services/questionReportService'
import type { Page } from '../../../types/api'
import type { QuestionReportStatus, QuestionReportSummary } from '../../../types/questionReport'
import { formatDate } from '../../../utils/date'
import { originLabels, reasonLabels, statusLabels } from './reportLabels'
import './QuestionReports.css'

export function QuestionReportsPage() {
    const [params, setParams] = useSearchParams()
    const rawPage = Number(params.get('page') ?? 0)
    const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0
    const rawSize = Number(params.get('size') ?? 10)
    const size = [10, 20, 30].includes(rawSize) ? rawSize : 10
    const rawStatus = params.get('status')
    const status: QuestionReportStatus | undefined =
        rawStatus === 'TODOS'
            ? undefined
            : rawStatus === 'RESOLVIDO' || rawStatus === 'DESCARTADO'
              ? rawStatus
              : 'PENDENTE'
    const [data, setData] = useState<Page<QuestionReportSummary> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(false)
        questionReportService
            .list(page, size, status)
            .then((result) => {
                if (active) setData(result)
            })
            .catch(() => {
                if (active) setError(true)
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [page, size, status, attempt])

    function change(nextPage: number, nextStatus: string = status ?? 'TODOS', nextSize = size) {
        setParams({ page: String(nextPage), size: String(nextSize), status: nextStatus })
    }

    return (
        <section className="admin-reports" aria-labelledby="reports-title">
            <p className="eyebrow">Administração</p>
            <h1 id="reports-title">Reportes de questões</h1>
            <p className="lead">Analise os problemas informados pelos estudantes.</p>
            <div className="reports-panel">
                <div className="reports-filters">
                    <label>
                        Status
                        <select value={status ?? 'TODOS'} onChange={(event) => change(0, event.target.value)}>
                            <option value="TODOS">Todos</option>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Por página
                        <select
                            value={size}
                            onChange={(event) => change(0, status ?? 'TODOS', Number(event.target.value))}
                        >
                            {[10, 20, 30].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                {loading ? (
                    <p role="status">Carregando reportes...</p>
                ) : error ? (
                    <div>
                        <p role="alert">Não foi possível carregar os reportes.</p>
                        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                            Tentar novamente
                        </button>
                    </div>
                ) : (
                    data && (
                        <>
                            {data.content.length === 0 ? (
                                <p role="status">Nenhum reporte encontrado para este filtro.</p>
                            ) : (
                                <div className="reports-table-wrap">
                                    <table>
                                        <caption>Reportes recebidos</caption>
                                        <thead>
                                            <tr>
                                                <th>Estudante</th>
                                                <th>Origem</th>
                                                <th>Motivo</th>
                                                <th>Status</th>
                                                <th>Data</th>
                                                <th>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.content.map((report) => (
                                                <tr key={report.id}>
                                                    <td>{report.studentName}</td>
                                                    <td>{originLabels[report.origin]}</td>
                                                    <td>{reasonLabels[report.reason]}</td>
                                                    <td>
                                                        <span
                                                            className={`report-status ${report.status.toLowerCase()}`}
                                                        >
                                                            {statusLabels[report.status]}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <time dateTime={report.createdAt}>
                                                            {formatDate(report.createdAt)}
                                                        </time>
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/admin/question-reports/${encodeURIComponent(report.id)}?${params.toString()}`}
                                                            aria-label={`Ver reporte de ${report.studentName}`}
                                                        >
                                                            Ver detalhe
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <nav className="reports-pagination" aria-label="Paginação de reportes">
                                <span>Total: {data.totalElements}</span>
                                <button
                                    type="button"
                                    disabled={data.first || page === 0}
                                    onClick={() => change(page - 1)}
                                >
                                    Anterior
                                </button>
                                <span>
                                    Página {data.number + 1} de {Math.max(1, data.totalPages)}
                                </span>
                                <button type="button" disabled={data.last} onClick={() => change(page + 1)}>
                                    Próxima
                                </button>
                            </nav>
                        </>
                    )
                )}
            </div>
        </section>
    )
}
