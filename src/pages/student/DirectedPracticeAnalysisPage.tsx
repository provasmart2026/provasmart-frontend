import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { directedPracticeService } from '../../services/directedPracticeService'
import type { DirectedPracticeAnalysis, PracticeReview } from '../../types/directedPractice'
import { areaLabel } from './DirectedPracticeStartPage'
import './SimulationsPage.css'
import './DirectedPractice.css'

const formatPercent = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
const boundedPercent = (value: number) => Math.max(0, Math.min(100, value))

function QuestionDetail({ question }: { question: PracticeReview }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className={`practice-analysis-detail ${question.correct ? 'is-correct' : 'is-error'}`} aria-live="polite">
            <div className="practice-analysis-detail-heading">
                <div>
                    <strong>Questão {question.position} · {question.subject} · {question.correct ? 'Acerto' : 'Erro'}</strong>
                    <p>Sua resposta {question.selectedLetter} · correta {question.correctLetter}</p>
                </div>
                <button type="button" aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}>
                    {expanded ? 'Ocultar explicação' : 'Ver explicação'}
                </button>
            </div>
            {expanded && <div id="practice-question-detail" className="practice-analysis-explanation">
                <p className="practice-analysis-statement">{question.statement}</p>
                <ul>{question.alternatives.map((alternative) => (
                    <li key={alternative.id} className={alternative.id === question.correctAlternativeId ? 'is-correct' : ''}>
                        {alternative.letter}. {alternative.text}
                    </li>
                ))}</ul>
                <p><strong>Explicação:</strong> {question.explanation}</p>
            </div>}
        </div>
    )
}

export function DirectedPracticeAnalysisPage() {
    const { practiceId } = useParams()
    const [analysis, setAnalysis] = useState<DirectedPracticeAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        setAnalysis(null)
        setSelectedQuestionId(null)
        setError(null)
        setLoading(true)
        if (!practiceId) {
            setError('Identificador da prática ausente.')
            setLoading(false)
            return
        }
        directedPracticeService.analysis(practiceId)
            .then((result) => { if (active) setAnalysis(result) })
            .catch(() => { if (active) setError('A análise só fica disponível após a finalização da prática. Práticas canceladas não têm análise.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [practiceId])

    const questions = [...(analysis?.questions ?? [])].sort((a, b) => a.position - b.position)
    const selectedQuestion = questions.find((question) => question.questionId === selectedQuestionId)
        ?? questions.find((question) => !question.correct) ?? questions[0]
    const subjectsToReview = [...(analysis?.subjects ?? [])]
        .filter((item) => item.correct < item.total)
        .sort((a, b) => (b.total - b.correct) - (a.total - a.correct)).slice(0, 3)

    return (
        <section className="student-simulations practice practice-analysis" aria-labelledby="analysis-title">
            <div className="hero-copy">
                <span className="badge">CORREÇÃO E ANÁLISE · {analysis ? areaLabel(analysis.area) : 'PRÁTICA DIRECIONADA'}</span>
                <h1 id="analysis-title">Seu resultado</h1>
                {analysis && <p className="supporting-copy">{analysis.total} questões concluídas</p>}
            </div>
            {loading ? <p role="status">Carregando análise...</p> : error ? <p role="alert">{error} <Link to="/praticas">Voltar às práticas</Link></p> : analysis && <>
                <section className="practice-analysis-summary" aria-label="Resumo do resultado">
                    <div className="practice-analysis-ring" role="img" aria-label={`${formatPercent(analysis.percentage)}% de aproveitamento`}
                        style={{ background: `conic-gradient(var(--rose-600) ${boundedPercent(analysis.percentage)}%, var(--violet-100) 0)` }}>
                        <div><strong>{formatPercent(analysis.percentage)}%</strong><span>aproveitamento</span></div>
                    </div>
                    <div className="practice-analysis-summary-content">
                        <div className="practice-analysis-totals">
                            <div><strong>{analysis.correct}</strong><span>acertos</span></div>
                            <div><strong>{analysis.total - analysis.correct}</strong><span>erros</span></div>
                        </div>
                        <div className="practice-analysis-disciplines" aria-label="Desempenho por disciplina">
                            {analysis.disciplines.map((item) => <div key={item.name} className="practice-analysis-discipline">
                                <div><strong>{item.name}</strong><span>{formatPercent(item.percentage)}%</span></div>
                                <div className="practice-analysis-bar" role="img" aria-label={`${item.name}: ${item.correct} acertos de ${item.total}`}>
                                    <span style={{ width: `${boundedPercent(item.percentage)}%` }} />
                                </div>
                            </div>)}
                        </div>
                    </div>
                </section>

                <section className="practice-analysis-map" aria-labelledby="practice-analysis-map-title">
                    <div className="practice-analysis-map-heading">
                        <div><h2 id="practice-analysis-map-title">Mapa das questões</h2><p>Selecione uma questão para ver a correção.</p></div>
                        <div className="practice-analysis-legend" aria-label="Legenda"><span><i className="is-correct" /> Acerto</span><span><i className="is-error" /> Erro</span></div>
                    </div>
                    <div className="practice-analysis-question-map">
                        {questions.map((question) => <button key={question.questionId} type="button"
                            className={question.correct ? 'is-correct' : 'is-error'}
                            aria-label={`Questão ${question.position}: ${question.correct ? 'acerto' : 'erro'}`}
                            aria-pressed={selectedQuestion?.questionId === question.questionId}
                            onClick={() => setSelectedQuestionId(question.questionId)}>{question.position}</button>)}
                    </div>
                    {selectedQuestion && <QuestionDetail key={selectedQuestion.questionId} question={selectedQuestion} />}
                </section>

                {subjectsToReview.length > 0 && <p className="practice-analysis-focus"><strong>Revisar primeiro:</strong> {subjectsToReview.map((item) => item.name).join(' · ')}</p>}
                <details className="practice-analysis-subjects">
                    <summary>Ver desempenho por assunto</summary>
                    <div className="practice-table-wrap"><table className="practice-subject-table">
                        <thead><tr><th>Disciplina</th><th>Assunto</th><th>Acertos</th><th>Erros</th><th>Aproveitamento</th></tr></thead>
                        <tbody>{analysis.subjects.map((item) => <tr key={`${item.discipline}-${item.name}`}>
                            <td>{item.discipline}</td><td>{item.name}</td><td>{item.correct}</td>
                            <td>{item.total - item.correct}</td><td>{formatPercent(item.percentage)}%</td>
                        </tr>)}</tbody>
                    </table></div>
                </details>
                <Link className="practice-analysis-back" to="/praticas">Voltar às práticas</Link>
            </>}
        </section>
    )
}
