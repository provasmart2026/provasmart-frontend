type QuestionMapProps = {
    questions: readonly { id: string; selectedAlternativeId: string | null }[]
    currentIndex: number
    disabled: boolean
    onSelect: (index: number) => void
}

export function QuestionMap({ questions, currentIndex, disabled, onSelect }: QuestionMapProps) {
    return (
        <div className="question-map" role="group" aria-label="Ir para uma questão">
            {questions.map((question, index) => {
                const answered = Boolean(question.selectedAlternativeId)
                return (
                    <button
                        key={question.id}
                        type="button"
                        disabled={disabled}
                        aria-label={`Questão ${index + 1}, ${answered ? 'respondida' : 'pendente'}`}
                        aria-current={index === currentIndex ? 'step' : undefined}
                        className={answered ? 'is-answered' : undefined}
                        onClick={() => onSelect(index)}
                    >
                        {index + 1}
                    </button>
                )
            })}
        </div>
    )
}
