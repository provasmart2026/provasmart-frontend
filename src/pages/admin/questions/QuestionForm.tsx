import { useId, type FormEvent } from 'react'
import type { QuestionInput } from '../../../types/question'
import { QuestionSubjectFields } from './QuestionSubjectFields'
import type { QuestionSubjects } from './questionSubjects'

type QuestionFormProps = {
    value: QuestionInput
    onChange: (value: QuestionInput) => void
    onSubmit: () => void
    onCancel: () => void
    saving: boolean
    error: string | null
    subjectOptions: QuestionSubjects
}

export function QuestionForm({
    value,
    onChange,
    onSubmit,
    onCancel,
    saving,
    error,
    subjectOptions: options,
}: QuestionFormProps) {
    const id = useId()
    const hasValidSubject = options.subjects.some((subject) => subject.id === value.subjectId)
    const cannotSave =
        saving ||
        options.creating ||
        Boolean(options.loading) ||
        Boolean(options.error) ||
        Boolean(options.newSubjectName) ||
        !hasValidSubject

    function changeAlternativeText(index: number, text: string) {
        onChange({
            ...value,
            alternatives: value.alternatives.map((alternative, alternativeIndex) =>
                alternativeIndex === index ? { ...alternative, text } : alternative
            ),
        })
    }

    function selectCorrectAlternative(index: number) {
        onChange({
            ...value,
            alternatives: value.alternatives.map((alternative, alternativeIndex) => ({
                ...alternative,
                correct: alternativeIndex === index,
            })),
        })
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!saving) onSubmit()
    }

    return (
        <form
            className="question-form"
            onSubmit={submit}
            aria-busy={saving || options.creating || Boolean(options.loading)}
            aria-describedby={error ? `${id}-error` : undefined}
        >
            <fieldset disabled={saving}>
                <legend>Dados da questão</legend>
                <QuestionSubjectFields
                    id={id}
                    subjectId={value.subjectId}
                    options={options}
                    onSubjectChange={(subjectId) => onChange({ ...value, subjectId })}
                />
                <label htmlFor={`${id}-statement`}>Enunciado</label>
                <textarea
                    id={`${id}-statement`}
                    required
                    rows={5}
                    value={value.statement}
                    onChange={(event) => onChange({ ...value, statement: event.target.value })}
                />
            </fieldset>
            <fieldset disabled={saving}>
                <legend>Alternativas</legend>
                <p className="supporting-copy">Preencha as cinco alternativas e marque a correta.</p>
                {value.alternatives.map((alternative, index) => (
                    <div className="question-alternative" key={alternative.letter}>
                        <label htmlFor={`${id}-${alternative.letter}`}>Alternativa {alternative.letter}</label>
                        <textarea
                            id={`${id}-${alternative.letter}`}
                            required
                            rows={2}
                            value={alternative.text}
                            onChange={(event) => changeAlternativeText(index, event.target.value)}
                        />
                        <label className="question-correct-option">
                            <input
                                type="radio"
                                name={`${id}-correct`}
                                required
                                checked={alternative.correct}
                                onChange={() => selectCorrectAlternative(index)}
                            />
                            {alternative.letter} é a correta
                        </label>
                    </div>
                ))}
            </fieldset>
            <fieldset disabled={saving} aria-label="Explicação da questão">
                <label htmlFor={`${id}-explanation`}>Explicação</label>
                <textarea
                    id={`${id}-explanation`}
                    required
                    rows={4}
                    value={value.explanation}
                    onChange={(event) => onChange({ ...value, explanation: event.target.value })}
                />
            </fieldset>
            {error && (
                <p id={`${id}-error`} role="alert">
                    {error}
                </p>
            )}
            <div className="question-actions">
                <button className="primary-button" type="submit" disabled={cannotSave}>
                    {saving ? 'Salvando...' : 'Salvar questão'}
                </button>
                <button type="button" disabled={saving || options.creating} onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    )
}
