import './SimulationPerformancePage.css'

const percentageFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })
export const formatPercentage = (value: number) => `${percentageFormat.format(value)}%`

export function PerformanceSummary({ total, correct, incorrect, percentage }: {
    total: number
    correct: number
    incorrect: number
    percentage: number
}) {
    return (
        <dl className="performance-summary" aria-label="Resultado geral">
            <div className="summary-questions"><dt><span className="summary-icon" aria-hidden="true">▤</span>Questões</dt><dd>{total}</dd></div>
            <div className="summary-correct"><dt><span className="summary-icon" aria-hidden="true">✓</span>Acertos</dt><dd>{correct}</dd></div>
            <div className="summary-incorrect"><dt><span className="summary-icon" aria-hidden="true">×</span>Erros</dt><dd>{incorrect}</dd></div>
            <div className="summary-accuracy"><dt>Aproveitamento</dt><dd>
                <svg className="summary-ring" viewBox="0 0 100 100" aria-hidden="true">
                    <circle className="summary-ring-track" cx="50" cy="50" r="42" />
                    <circle className="summary-ring-value" cx="50" cy="50" r="42" pathLength="100"
                        strokeDasharray={`${Math.max(0, Math.min(100, percentage))} 100`} />
                </svg>
                <span>{formatPercentage(percentage)}</span>
            </dd></div>
        </dl>
    )
}
