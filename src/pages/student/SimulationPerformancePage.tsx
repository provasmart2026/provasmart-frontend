import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../services/api'
import { simulationService } from '../../services/simulationService'
import { examAreaLabels, type ExamArea } from '../../types/examArea'
import type { SimulationPerformance } from '../../types/simulationPerformance'
import './SimulationsPage.css'
import './SimulationPerformancePage.css'

const percentageFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
const formatPercentage = (value: number) => `${percentageFormat.format(value)}%`

export function SimulationPerformancePage() {
    const { simulationId } = useParams()
    return <PerformanceView key={simulationId} simulationId={simulationId} />
}

function PerformanceView({ simulationId }: { simulationId: string | undefined }) {
    const [performance, setPerformance] = useState<SimulationPerformance | null>(null)
    const [selectedArea, setSelectedArea] = useState<ExamArea | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(null)
        setPerformance(null)
        async function load() {
            try {
                if (!simulationId) throw new Error('Identificador ausente')
                const result = await simulationService.performance(simulationId)
                if (active) {
                    setPerformance(result)
                    setSelectedArea(result.areas[0]?.examArea ?? null)
                }
            } catch (cause) {
                if (active) setError(cause instanceof ApiError && cause.backendMessage
                    ? cause.backendMessage : 'Não foi possível carregar a análise. Tente novamente.')
            } finally {
                if (active) setLoading(false)
            }
        }
        void load()
        return () => { active = false }
    }, [simulationId, attempt])

    const area = performance?.areas.find(item => item.examArea === selectedArea)

    return (
        <section className="student-simulations simulation-performance" aria-labelledby="performance-title">
            <div className="hero-copy">
                <span className="badge">SIMULADO GERAL • SEUS RESULTADOS</span>
                <h1 id="performance-title">Análise de desempenho</h1>
                <p className="lead">Veja seus resultados e explore o desempenho em cada área, disciplina e assunto.</p>
            </div>
            <Link className="performance-back" to="/simulados">Voltar aos simulados</Link>

            {loading ? <div className="simulation-panel"><p role="status">Carregando análise...</p></div> : error ? (
                <div className="simulation-panel">
                    <p role="alert">{error}</p>
                    <button className="simulation-secondary-button" type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button>
                </div>
            ) : performance && (
                <>
                    <dl className="performance-summary" aria-label="Resultado geral">
                        <div className="summary-questions"><dt><span className="summary-icon" aria-hidden="true">▤</span>Questões</dt><dd>{performance.summary.totalQuestions}</dd></div>
                        <div className="summary-correct"><dt><span className="summary-icon" aria-hidden="true">✓</span>Acertos</dt><dd>{performance.summary.correctAnswers}</dd></div>
                        <div className="summary-incorrect"><dt><span className="summary-icon" aria-hidden="true">×</span>Erros</dt><dd>{performance.summary.incorrectAnswers}</dd></div>
                        <div className="summary-accuracy"><dt>Aproveitamento</dt><dd>
                            <svg className="summary-ring" viewBox="0 0 100 100" aria-hidden="true">
                                <circle className="summary-ring-track" cx="50" cy="50" r="42" />
                                <circle className="summary-ring-value" cx="50" cy="50" r="42" pathLength="100"
                                    strokeDasharray={`${Math.max(0, Math.min(100, performance.summary.accuracyPercentage))} 100`} />
                            </svg>
                            <span>{formatPercentage(performance.summary.accuracyPercentage)}</span>
                        </dd></div>
                    </dl>

                    <section className="simulation-panel performance-section" aria-labelledby="area-chart-title">
                        <h2 id="area-chart-title">Desempenho por área</h2>
                        <p className="performance-legend"><span className="legend-correct">Acertos</span><span className="legend-incorrect">Erros</span></p>
                        <ul className="performance-chart">
                            {performance.areas.map(item => (
                                <li key={item.examArea}>
                                    <div className="performance-chart-heading"><strong>{examAreaLabels[item.examArea]}</strong><span>{formatPercentage(item.accuracyPercentage)}</span></div>
                                    <div className="performance-bars" aria-hidden="true">
                                        <span className="performance-bar-correct" style={{ width: `${item.totalQuestions ? item.correctAnswers * 100 / item.totalQuestions : 0}%` }} />
                                        <span className="performance-bar-incorrect" style={{ width: `${item.totalQuestions ? item.incorrectAnswers * 100 / item.totalQuestions : 0}%` }} />
                                    </div>
                                    <p>{item.correctAnswers} acertos · {item.incorrectAnswers} erros · {item.totalQuestions} questões</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {performance.worstAreas.length > 0 && (
                        <section className="performance-highlight" aria-labelledby="worst-areas-title">
                            <h2 id="worst-areas-title">{performance.worstAreas.length > 1 ? 'Áreas com menor aproveitamento' : 'Área com menor aproveitamento'}</h2>
                            <p>{performance.worstAreas.map(item => examAreaLabels[item]).join(' · ')}</p>
                            {performance.worstAreas.length > 1 && <p className="supporting-copy">Essas áreas estão empatadas no menor aproveitamento deste simulado.</p>}
                        </section>
                    )}

                    <section className="simulation-panel performance-section" aria-labelledby="details-title">
                        <h2 id="details-title">Disciplinas e assuntos</h2>
                        <p className="performance-area-hint">Selecione uma área para explorar suas disciplinas e assuntos.</p>
                        <div className="performance-area-options" role="group" aria-label="Área do conhecimento">
                            {performance.areas.map(item => (
                                <button key={item.examArea} type="button" className="performance-area-option"
                                    aria-pressed={selectedArea === item.examArea} aria-controls="performance-area-details"
                                    onClick={() => setSelectedArea(item.examArea)}>
                                    <span className="performance-area-name">{examAreaLabels[item.examArea]}</span>
                                    <strong>{formatPercentage(item.accuracyPercentage)}</strong>
                                    <span className="performance-area-count">{item.correctAnswers} de {item.totalQuestions} acertos</span>
                                    <span className="performance-area-state">{selectedArea === item.examArea ? '✓ Selecionada' : 'Ver detalhes'}</span>
                                </button>
                            ))}
                        </div>
                        <div id="performance-area-details">
                        {area ? area.disciplines.map(discipline => (
                            <section className="performance-discipline" key={discipline.disciplineId} aria-label={discipline.disciplineName}>
                                <div className="performance-chart-heading"><h3>{discipline.disciplineName}</h3><strong>{formatPercentage(discipline.accuracyPercentage)}</strong></div>
                                <p>{discipline.correctAnswers} acertos · {discipline.incorrectAnswers} erros · {discipline.totalQuestions} questões</p>
                                <progress max={100} value={discipline.accuracyPercentage} aria-label={`Aproveitamento em ${discipline.disciplineName}`} />
                                <div className="performance-table-scroll">
                                    <table>
                                        <caption>Desempenho por assunto — {discipline.disciplineName}</caption>
                                        <thead><tr><th scope="col">Assunto</th><th scope="col">Questões</th><th scope="col">Acertos</th><th scope="col">Erros</th><th scope="col">Aproveitamento</th></tr></thead>
                                        <tbody>{discipline.subjects.map(subject => (
                                            <tr key={subject.subjectId}><th scope="row">{subject.subjectName}</th><td>{subject.totalQuestions}</td><td>{subject.correctAnswers}</td><td>{subject.incorrectAnswers}</td><td>{formatPercentage(subject.accuracyPercentage)}</td></tr>
                                        ))}</tbody>
                                    </table>
                                </div>
                            </section>
                        )) : <p>Nenhuma área disponível para detalhamento.</p>}
                        </div>
                    </section>
                </>
            )}
        </section>
    )
}
