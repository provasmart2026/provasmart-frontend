import { useState } from 'react'
import type { StudentDashboard } from '../../types/studentDashboard'
import { formatPercentage } from './PerformanceSummary'

const ticks = [0, 25, 50, 75, 100]
const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function DashboardEvolutionChart({ evolution }: { evolution: StudentDashboard['evolution'] }) {
    const [hovered, setHovered] = useState<number | null>(null)
    const [focused, setFocused] = useState<number | null>(null)
    const width = Math.max(320, 96 + (evolution.length - 1) * 60)
    const points = evolution.map((activity, index) => ({
        ...activity,
        date: new Date(activity.finishedAt),
        x: evolution.length === 1 ? width / 2 : 52 + index * (width - 88) / (evolution.length - 1),
        y: 180 - activity.accuracyPercentage * 1.6,
    }))
    const active = points[hovered ?? focused ?? -1]

    return (
        <section className="simulation-panel dashboard-evolution" aria-labelledby="dashboard-evolution-title">
            <h2 id="dashboard-evolution-title">Evolução do desempenho</h2>
            {points.length === 0 ? <p>Ainda não há resultados para mostrar a evolução.</p> : (
                <>
                    <p>Mostra até as 10 atividades finalizadas mais recentes.</p>
                    <div className="dashboard-evolution-scroll">
                        <svg viewBox={`0 0 ${width} 216`} style={{ minWidth: width }}
                            role="group" aria-label="Percentual de acertos por atividade concluída">
                            {ticks.map(tick => (
                                <g key={tick} aria-hidden="true">
                                    <line x1="46" x2={width - 16} y1={180 - tick * 1.6} y2={180 - tick * 1.6} />
                                    <text x="40" y={184 - tick * 1.6} textAnchor="end">{tick}%</text>
                                </g>
                            ))}
                            {points.length > 1 && <polyline aria-hidden="true"
                                points={points.map(point => `${point.x},${point.y}`).join(' ')} />}
                            {points.map((point, index) => {
                                const detail = `${dateTimeFormat.format(point.date)} · ${point.correctAnswers} de ${point.totalQuestions} acertos · ${formatPercentage(point.accuracyPercentage)}`
                                return (
                                    <g key={index}>
                                        <circle cx={point.x} cy={point.y} r="6" tabIndex={0}
                                            aria-label={detail}
                                            onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}
                                            onFocus={() => setFocused(index)} onBlur={() => setFocused(null)} />
                                        <text x={point.x} y="204" textAnchor="middle" aria-hidden="true">
                                            {dateFormat.format(point.date)}
                                        </text>
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                    <p className="dashboard-evolution-detail">
                        {active ? `${dateTimeFormat.format(active.date)} · ${active.correctAnswers} de ${active.totalQuestions} acertos · ${formatPercentage(active.accuracyPercentage)}`
                            : 'Passe o mouse ou use Tab para ver os detalhes de cada atividade.'}
                    </p>
                </>
            )}
        </section>
    )
}
