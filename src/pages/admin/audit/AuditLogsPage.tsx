import { useEffect, useState } from 'react'
import { auditLogService } from '../../../services/auditLogService'
import type { Page } from '../../../types/api'
import type { AuditLog } from '../../../types/auditLog'
import { formatDate } from '../../../utils/date'
import './AuditLogsPage.css'

const actionLabels: Record<string, string> = {
    LOGIN: 'Login',
    VERIFY_2FA: 'Validação do código',
    REQUEST_PASSWORD_RESET: 'Solicitação de nova senha',
    RESET_PASSWORD: 'Redefinição de senha',
    CREATE: 'Criação',
    READ: 'Consulta',
    UPDATE: 'Atualização',
    DELETE: 'Exclusão',
    START_SIMULATION: 'Início de simulado',
    ANSWER_QUESTION: 'Resposta de questão',
    FINISH_SIMULATION: 'Finalização de simulado',
}

const statusLabels: Record<number, string> = {
    200: 'OK',
    201: 'Criado',
    204: 'Sem conteúdo',
    400: 'Requisição inválida',
    401: 'Não autenticado',
    403: 'Acesso negado',
    404: 'Não encontrado',
    409: 'Conflito',
    500: 'Erro interno',
}

function textOrFallback(value: string | null, fallback = 'Não informado') {
    return value || fallback
}

export function AuditLogsPage() {
    const [page, setPage] = useState(0)
    const [revision, setRevision] = useState(0)
    const [data, setData] = useState<Page<AuditLog> | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setLoadError(false)
        auditLogService
            .list(page)
            .then((result) => {
                if (cancelled) return
                if (page > 0 && page >= result.totalPages) {
                    setPage(Math.max(0, result.totalPages - 1))
                    return
                }
                setData(result)
            })
            .catch(() => {
                if (!cancelled) setLoadError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [page, revision])

    return (
        <section className="audit-page" aria-labelledby="audit-title">
            <div className="audit-heading">
                <div>
                    <span className="eyebrow">Administração</span>
                    <h1 id="audit-title">Auditoria de logs</h1>
                    <p className="lead">Consulte as operações realizadas no sistema e acompanhe sua rastreabilidade.</p>
                </div>
                <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)}>
                    {loading ? 'Atualizando...' : 'Atualizar registros'}
                </button>
            </div>

            {loading && !data && <p role="status">Carregando registros de auditoria...</p>}
            {loadError && (
                <div className="audit-alert" role="alert">
                    <p>Não foi possível carregar os registros de auditoria.</p>
                    <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {data && (
                <div className="audit-panel">
                    <div className="audit-summary">
                        <div>
                            <strong>{data.totalElements}</strong>
                            <span>registros encontrados</span>
                        </div>
                        <p>Os eventos mais recentes aparecem primeiro.</p>
                    </div>

                    <div className="audit-table-wrap" role="region" aria-label="Registros de auditoria" tabIndex={0}>
                        <table>
                            <caption>Operações registradas pelo backend</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Data e hora</th>
                                    <th scope="col">Usuário</th>
                                    <th scope="col">Ação</th>
                                    <th scope="col">Recurso</th>
                                    <th scope="col">Método</th>
                                    <th scope="col">Endpoint</th>
                                    <th scope="col">Status HTTP</th>
                                    <th scope="col">Resultado</th>
                                    <th scope="col">ID do usuário</th>
                                    <th scope="col">ID do recurso</th>
                                    <th scope="col">ID do log</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.content.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <time dateTime={log.occurredAt}>{formatDate(log.occurredAt)}</time>
                                        </td>
                                        <td>{textOrFallback(log.actorEmail, 'Não identificado')}</td>
                                        <td>
                                            <span className="audit-action">{actionLabels[log.action] ?? log.action}</span>
                                            <small>{log.action}</small>
                                        </td>
                                        <td>{log.resource}</td>
                                        <td>
                                            <code>{log.requestMethod}</code>
                                        </td>
                                        <td>
                                            <code>{log.endpoint}</code>
                                        </td>
                                        <td>
                                            <span className={`audit-status audit-status--${log.success ? 'success' : 'error'}`}>
                                                {log.statusCode} · {statusLabels[log.statusCode] ?? 'Resposta HTTP'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`audit-result audit-result--${log.success ? 'success' : 'error'}`}>
                                                {log.success ? 'Sucesso' : 'Falha'}
                                            </span>
                                        </td>
                                        <td>
                                            <code>{textOrFallback(log.actorId)}</code>
                                        </td>
                                        <td>
                                            <code>{textOrFallback(log.resourceId)}</code>
                                        </td>
                                        <td>
                                            <code>{log.id}</code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {data.content.length === 0 && <p>Nenhum registro de auditoria encontrado.</p>}
                    <nav className="audit-pagination" aria-label="Paginação dos registros de auditoria">
                        <span>
                            Página {data.number + 1} de {Math.max(1, data.totalPages)}
                        </span>
                        <div>
                            <button
                                type="button"
                                disabled={data.first || loading}
                                onClick={() => setPage(data.number - 1)}
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                disabled={data.last || loading}
                                onClick={() => setPage(data.number + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </section>
    )
}
