import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { directedPracticeService } from '../../services/directedPracticeService'
import type { DirectedPractice } from '../../types/directedPractice'
import './SimulationsPage.css'
import './DirectedPractice.css'

export const areaLabel = (area: string) => ({
    LINGUAGENS: 'Linguagens',
    CIENCIAS_HUMANAS: 'Ciências Humanas',
    CIENCIAS_DA_NATUREZA: 'Ciências da Natureza',
    MATEMATICA: 'Matemática',
}[area] ?? area)

export function DirectedPracticeStartPage() {
    const navigate = useNavigate()
    const [practices, setPractices] = useState<DirectedPractice[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        directedPracticeService.list()
            .then((result) => { if (active) setPractices(result) })
            .catch(() => { if (active) setError('Não foi possível carregar suas práticas.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    async function create() {
        if (creating) return
        setCreating(true)
        setError(null)
        try {
            const practice = await directedPracticeService.create()
            navigate(`/praticas/${encodeURIComponent(practice.id)}`)
        } catch {
            setError('Não foi possível iniciar. Finalize um Simulado Geral e verifique se há 20 questões ativas na sua área de menor aproveitamento.')
        } finally {
            setCreating(false)
        }
    }

    const activePractice = practices.find((practice) => practice.status === 'EM_ANDAMENTO')

    return (
        <section className="student-simulations practice" aria-labelledby="practice-title">
            <div className="hero-copy">
                <span className="badge">ENEM • FOCO NO QUE PRECISA DE ATENÇÃO</span>
                <h1 id="practice-title">Prática direcionada</h1>
                <p className="lead">20 questões da área em que você teve menor aproveitamento no último Simulado Geral finalizado.</p>
            </div>
            <div className="simulation-panel">
                <p className="supporting-copy">Você pode rever respostas antes de finalizar. A correção aparece somente após concluir as 20 questões.</p>
                {loading ? <p role="status">Carregando práticas...</p> : activePractice ? (
                    <Link className="primary-button practice-link-button" to={`/praticas/${encodeURIComponent(activePractice.id)}`}>
                        Continuar prática de {areaLabel(activePractice.area)}
                    </Link>
                ) : (
                    <button className="primary-button" type="button" disabled={creating} onClick={() => void create()}>
                        {creating ? 'Preparando 20 questões...' : 'Iniciar prática direcionada'}
                    </button>
                )}
                {error && <p role="alert">{error}</p>}
            </div>
            {!loading && practices.length > 0 && (
                <section className="practice-history" aria-labelledby="practice-history-title">
                    <h2 id="practice-history-title">Suas práticas</h2>
                    <div className="practice-history-list">
                        {practices.map((practice) => (
                            <div className="practice-history-item" key={practice.id}>
                                <div>
                                    <strong>{areaLabel(practice.area)}</strong>
                                    <p>{practice.status === 'FINALIZADA' ? 'Finalizada' : practice.status === 'CANCELADA' ? 'Cancelada' : 'Em andamento'} · {new Date(practice.startedAt).toLocaleDateString('pt-BR')}</p>
                                </div>
                                {practice.status === 'FINALIZADA' ? (
                                    <Link to={`/praticas/${encodeURIComponent(practice.id)}/analise`}>Ver análise</Link>
                                ) : practice.status === 'EM_ANDAMENTO' ? (
                                    <Link to={`/praticas/${encodeURIComponent(practice.id)}`}>Continuar</Link>
                                ) : <span>Sem análise</span>}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </section>
    )
}
