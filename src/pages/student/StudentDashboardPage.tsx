import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { studentDashboardService } from '../../services/studentDashboardService'
import { examAreaLabels } from '../../types/examArea'
import type { StudentDashboard } from '../../types/studentDashboard'
import { formatPercentage } from './PerformanceSummary'
import './SimulationsPage.css'
import './StudentDashboardPage.css'

const modalities = {
    simulations: { label: 'Simulados Gerais', activity: 'Simulados finalizados', path: '/simulados' },
    'directed-practices': { label: 'Práticas Direcionadas', activity: 'Práticas finalizadas', path: '/praticas' },
}

type Modality = keyof typeof modalities

export function StudentDashboardPage() {
    const [modality, setModality] = useState<Modality>('simulations')

    return (
        <section className="student-simulations" aria-labelledby="dashboard-title">
            <div className="hero-copy">
                <h1 id="dashboard-title">Meu Dashboard</h1>
                <p className="lead">Acompanhe seu desempenho nas atividades finalizadas.</p>
            </div>
            <div className="dashboard-switch" role="group" aria-label="Modalidade">
                {(Object.keys(modalities) as Modality[]).map(item => (
                    <button key={item} type="button" aria-pressed={item === modality} onClick={() => setModality(item)}>
                        {modalities[item].label}
                    </button>
                ))}
            </div>
            <DashboardResults key={modality} modality={modality} />
        </section>
    )
}

function DashboardResults({ modality }: { modality: Modality }) {
    const [result, setResult] = useState<StudentDashboard | null>(null)
    const [error, setError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const options = modalities[modality]

    useEffect(() => {
        let active = true
        studentDashboardService[modality]().then(
            data => { if (active) setResult(data) },
            () => { if (active) setError(true) },
        )
        return () => { active = false }
    }, [modality, attempt])

    if (error) return (
        <div className="simulation-panel">
            <p role="alert">Não foi possível carregar o desempenho.</p>
            <button className="simulation-secondary-button" type="button" onClick={() => {
                setError(false)
                setAttempt(value => value + 1)
            }}>Tentar novamente</button>
        </div>
    )
    if (!result) return <div className="simulation-panel"><p role="status">Carregando desempenho...</p></div>
    if (!result.completedActivities) return (
        <div className="simulation-panel">
            <p>{modality === 'simulations'
                ? 'Você ainda não finalizou nenhum simulado geral.'
                : 'Você ainda não finalizou nenhuma prática direcionada.'}</p>
            <Link to={options.path}>Ir para {options.label.toLowerCase()}</Link>
        </div>
    )

    const indicators = [
        [options.activity, result.completedActivities],
        ['Questões respondidas', result.totalQuestions],
        ['Acertos', result.correctAnswers],
        ['Erros', result.incorrectAnswers],
        ['Aproveitamento geral', formatPercentage(result.accuracyPercentage)],
    ]

    return (
        <>
            <dl className="dashboard-indicators" aria-label="Resumo de desempenho">
                {indicators.map(([label, value]) => (
                    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
            </dl>
            <section className="simulation-panel dashboard-chart" aria-labelledby="dashboard-chart-title">
                <h2 id="dashboard-chart-title">Aproveitamento por área do ENEM</h2>
                {result.areas.length === 0 ? <p>Não há resultados por área disponíveis.</p> : (
                    <ul>
                        {result.areas.map(area => (
                            <li key={area.examArea}>
                                <div className="dashboard-chart-heading">
                                    <strong>{examAreaLabels[area.examArea]}</strong>
                                    <span>{formatPercentage(area.accuracyPercentage)} · {area.classification}</span>
                                </div>
                                <div className="dashboard-bar" aria-hidden="true">
                                    <span style={{ width: `${area.accuracyPercentage}%` }} />
                                </div>
                                <small>{area.correctAnswers} acertos · {area.incorrectAnswers} erros · {area.totalQuestions} questões</small>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    )
}
