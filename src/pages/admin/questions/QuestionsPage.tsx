import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {questionsApi} from '../../../api/questions'
import type {Page} from '../../../types/api'
import type {Question} from '../../../types/question'
import {QuestionTable} from '../../../components/questions/QuestionTable'
import './QuestionsPage.css'
import {getPaginationItems, getReturnPage} from '../../../utils/pagination'

export function QuestionsPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [page, setPage] = useState(() => getReturnPage(location.state))
    const [data, setData] = useState<Page<Question> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [changingStatus, setChangingStatus] = useState(false)
    const [statusError, setStatusError] = useState<string | null>(null)

    async function toggleActive(question: Question) {
        if (changingStatus) return
        setChangingStatus(true)
        setStatusError(null)
        try {
            if (question.active) await questionsApi.deactivate(question.id)
            else await questionsApi.activate(question.id)
            setAttempt((value) => value + 1)
        } catch {
            setStatusError('Não foi possível alterar o status da questão. Tente novamente.')
        } finally {
            setChangingStatus(false)
        }
    }

    useEffect(() => {
        let ignore = false
        setLoading(true)
        setError(false)
        questionsApi.list(page)
            .then((result) => {
                if (ignore) return
                const lastPage = Math.max(0, result.totalPages - 1)
                if (page > lastPage) {
                    setPage(lastPage)
                    return
                }
                setData(result)
            })
            .catch(() => {
                if (!ignore) setError(true)
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [page, attempt])

    return (
        <section className="admin-questions" aria-labelledby="questions-title">
            <div className="questions-heading">
                <div>
                    <p className="eyebrow">Administração</p>
                    <h1 id="questions-title">Questões</h1>
                    <p className="lead">Consulte as questões do banco e seus status.</p>
                </div>
                <button className="primary-button" type="button" disabled={changingStatus}
                        onClick={() => navigate('/admin/questions/new', {state: {page}})}>Nova questão
                </button>
            </div>
            {statusError && <p role="alert">{statusError}</p>}

            <div className="questions-panel" aria-busy={loading || changingStatus}>
                {loading ? <p role="status">Carregando questões...</p> : error ? (
                    <div>
                        <p role="alert">Não foi possível carregar as questões. Tente novamente.</p>
                        <button type="button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button>
                    </div>
                ) : data && (
                    <>
                        {data.content.length === 0 ? (
                            <p role="status">{data.totalElements === 0 ? 'Nenhuma questão cadastrada.' : 'Nenhuma questão nesta página.'}</p>
                        ) : (
                            <QuestionTable questions={data.content} totalElements={data.totalElements}
                                           onEdit={changingStatus ? undefined : (question) => navigate(`/admin/questions/${encodeURIComponent(question.id)}/edit`, {state: {page}})}
                                           onToggleActive={changingStatus ? undefined : toggleActive}/>
                        )}
                        <nav className="questions-pagination" aria-label="Paginação de questões">
                            <button type="button" disabled={changingStatus || data.first || data.number === 0}
                                    onClick={() => setPage(data.number - 1)}>Anterior
                            </button>
                            <div className="questions-page-numbers">
                                {getPaginationItems(data.number, data.totalPages).map((item, index) =>
                                    item === '...' ? <span key={`gap-${index}`}>...</span> : (
                                        <button key={item} type="button" aria-label={`Página ${item}`}
                                                aria-current={item === data.number + 1 ? 'page' : undefined}
                                                disabled={changingStatus}
                                                onClick={() => setPage(item - 1)}>{item}</button>
                                    ),
                                )}
                            </div>
                            <span className="questions-pagination-status"
                                  role="status">Página {data.totalPages === 0 ? 0 : data.number + 1} de {data.totalPages}</span>
                            <button type="button"
                                    disabled={changingStatus || data.last || data.number + 1 >= data.totalPages}
                                    onClick={() => setPage(data.number + 1)}>Próxima
                            </button>
                        </nav>
                    </>
                )}
            </div>
        </section>
    )
}
