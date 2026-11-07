import { useId, useState } from 'react'
import './QuestionCorrectionMap.css'

export type CorrectionQuestion = {
    questionId: string
    position: number
    statement: string
    explanation: string
    subject?: string
    selectedAlternativeId: string | null
    correctAlternativeId: string | null
    correct: boolean | null
    alternatives: { id: string; letter: string; text: string }[]
}

function outcome(correct: boolean | null) {
    if (correct === true) return { label: 'Acerto', className: 'is-correct' }
    if (correct === false) return { label: 'Erro', className: 'is-error' }
    return { label: 'Resultado indisponível', className: 'is-unavailable' }
}

function QuestionDetail({ question }: { question: CorrectionQuestion }) {
    const [expanded, setExpanded] = useState(false)
    const result = outcome(question.correct)
    const selectedLetter = question.alternatives.find(item => item.id === question.selectedAlternativeId)?.letter
    const correctLetter = question.alternatives.find(item => item.id === question.correctAlternativeId)?.letter
    return (
        <div className={`correction-detail ${result.className}`} aria-live="polite">
            <div className="correction-detail-heading">
                <div>
                    <strong>Questão {question.position} · {question.subject ? question.subject + ' · ' : ''}{result.label}</strong>
                    <p>Sua resposta {selectedLetter ?? 'indisponível'} · {correctLetter ? 'correta ' + correctLetter : 'gabarito indisponível'}</p>
                </div>
                <button type="button" aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}>
                    {expanded ? 'Ocultar explicação' : 'Ver explicação'}
                </button>
            </div>
            {expanded && <div className="correction-explanation">
                <p className="correction-statement">{question.statement}</p>
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

export function QuestionCorrectionMap({ questions }: { questions: CorrectionQuestion[] }) {
    const titleId = useId()
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
    const ordered = [...questions].sort((a, b) => a.position - b.position)
    const selectedQuestion = ordered.find(question => question.questionId === selectedQuestionId)
        ?? ordered.find(question => question.correct === false) ?? ordered[0]

    return (
        <section className="correction-map" aria-labelledby={titleId}>
            <div className="correction-map-heading">
                <div><h2 id={titleId}>Mapa das questões</h2><p>Selecione uma questão para ver a correção.</p></div>
                <div className="correction-legend" aria-label="Legenda"><span><i className="is-correct" /> Acerto</span><span><i className="is-error" /> Erro</span>{ordered.some(question => question.correct === null) && <span><i className="is-unavailable" /> Resultado indisponível</span>}</div>
            </div>
            <div className="correction-question-map">
                {ordered.map((question) => <button key={question.questionId} type="button"
                    className={outcome(question.correct).className}
                    aria-label={`Questão ${question.position}: ${outcome(question.correct).label.toLowerCase()}`}
                    aria-pressed={selectedQuestion?.questionId === question.questionId}
                    onClick={() => setSelectedQuestionId(question.questionId)}>{question.position}</button>)}
            </div>
            {selectedQuestion ? <QuestionDetail key={selectedQuestion.questionId} question={selectedQuestion} />
                : <p>Nenhuma questão disponível para correção.</p>}
        </section>
    )
}
