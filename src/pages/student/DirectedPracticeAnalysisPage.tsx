import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { directedPracticeService } from '../../services/directedPracticeService'
import { ApiError } from '../../services/api'
import type { DirectedPracticeAnalysis } from '../../types/directedPractice'
import { areaLabel } from './DirectedPracticeStartPage'
import { PerformanceSummary, formatPercentage } from './PerformanceSummary'
import { QuestionCorrectionMap } from './QuestionCorrectionMap'
import './SimulationsPage.css'
import './DirectedPractice.css'

const boundedPercent = (value: number) => Math.max(0, Math.min(100, value))

export function DirectedPracticeAnalysisPage() {
    const { practiceId } = useParams()
    const [analysis, setAnalysis] = useState<DirectedPracticeAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        setAnalysis(null)
        setError(null)
        setLoading(true)
        if (!practiceId) {
            setError('Identificador da prática ausente.')
            setLoading(false)
            return
        }
        directedPracticeService.analysis(practiceId)
            .then((result) => { if (active) setAnalysis(result) })
            .catch((cause: unknown) => { if (active) setError(cause instanceof ApiError && cause.status === 409 && cause.backendMessage
                ? cause.backendMessage : 'Não foi possível carregar a análise. Verifique sua conexão e tente novamente.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [practiceId])

    const subjectsToReview = [...(analysis?.subjects ?? [])]
        .filter((item) => item.correct < item.total)
        .sort((a, b) => (b.total - b.correct) - (a.total - a.correct)).slice(0, 3)

    return (
        <section className="student-simulations practice practice-analysis" aria-labelledby="analysis-title">
            <div className="hero-copy">
                <span className="badge">PRÁTICA DIRECIONADA{analysis ? ` · ${areaLabel(analysis.area)}` : ''}</span>
                <h1 id="analysis-title">Análise de desempenho</h1>
            </div>
            {loading ? <p role="status">Carregando análise...</p> : error ? <p role="alert">{error} <Link to="/praticas">Voltar às práticas</Link></p> : analysis && <>
                <PerformanceSummary total={analysis.total} correct={analysis.correct}
                    incorrect={analysis.total - analysis.correct} percentage={analysis.percentage} />
                <section className="simulation-panel performance-section" aria-labelledby="practice-disciplines-title">
                    <h2 id="practice-disciplines-title">Desempenho por disciplina</h2>
                    <p className="performance-legend"><span className="legend-correct">Acertos</span><span className="legend-incorrect">Erros</span></p>
                    <div className="practice-analysis-disciplines">
                        {analysis.disciplines.map((item) => <div key={item.name} className="practice-analysis-discipline">
                            <div><strong>{item.name}</strong><span>{formatPercentage(item.percentage)}</span></div>
                            <div className="practice-analysis-bar" role="img" aria-label={`${item.name}: ${item.correct} acertos e ${item.total - item.correct} erros`}>
                                <span className="practice-bar-correct" style={{ width: `${boundedPercent(item.percentage)}%` }} />
                                <span className="practice-bar-error" style={{ width: `${100 - boundedPercent(item.percentage)}%` }} />
                            </div>
                            <small>{item.correct} acertos · {item.total - item.correct} erros</small>
                        </div>)}
                    </div>
                </section>

                <QuestionCorrectionMap key={practiceId} questions={analysis.questions} />

                {subjectsToReview.length > 0 && <p className="practice-analysis-focus"><strong>Revisar primeiro:</strong> {subjectsToReview.map((item) => item.name).join(' · ')}</p>}
                <details className="practice-analysis-subjects">
                    <summary>Ver desempenho por assunto</summary>
                    <div className="practice-table-wrap"><table className="practice-subject-table">
                        <thead><tr><th>Disciplina</th><th>Assunto</th><th>Acertos</th><th>Erros</th><th>Aproveitamento</th></tr></thead>
                        <tbody>{analysis.subjects.map((item) => <tr key={`${item.discipline}-${item.name}`}>
                            <td>{item.discipline}</td><td>{item.name}</td><td>{item.correct}</td>
                            <td>{item.total - item.correct}</td><td>{formatPercentage(item.percentage)}</td>
                        </tr>)}</tbody>
                    </table></div>
                </details>
                <Link className="practice-analysis-back" to="/praticas">Voltar às práticas</Link>
            </>}
        </section>
    )
}
