import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { questionService } from '../../../services/questionService'
import { QuestionForm } from './QuestionForm'
import type { QuestionInput } from '../../../types/question'
import { useQuestionSubjects } from './useQuestionSubjects'
import './QuestionsPage.css'
import { getReturnPage } from '../../../utils/pagination'

const ALTERNATIVE_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

const emptyQuestion = (): QuestionInput => ({
    statement: '',
    explanation: '',
    subjectId: '',
    alternatives: ALTERNATIVE_LETTERS.map((letter) => ({ letter, text: '', correct: false })),
})

export function QuestionFormPage() {
    const { id } = useParams()
    return <QuestionFormScreen key={id ?? 'new'} id={id} />
}

function QuestionFormScreen({ id }: { id: string | undefined }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [value, setValue] = useState<QuestionInput>(emptyQuestion)
    const [loading, setLoading] = useState(Boolean(id))
    const [loadError, setLoadError] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const mounted = useRef(false)
    const [initialSubjectId, setInitialSubjectId] = useState<string | null>(id ? null : '')
    const changeSubject = useCallback((subjectId: string) => {
        setValue((current) => ({ ...current, subjectId }))
    }, [])
    const subjectOptions = useQuestionSubjects(initialSubjectId, value.subjectId, changeSubject)

    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])

    useEffect(() => {
        let ignore = false
        setError(null)
        setLoadError(false)
        setValue(emptyQuestion())
        setLoading(Boolean(id))
        setInitialSubjectId(id ? null : '')
        if (id) {
            questionService
                .get(id)
                .then((question) => {
                    if (!ignore) {
                        setInitialSubjectId(question.subjectId)
                        setValue({
                            statement: question.statement,
                            explanation: question.explanation ?? '',
                            subjectId: question.subjectId,
                            alternatives: ALTERNATIVE_LETTERS.map((letter) => {
                                const alternative = question.alternatives.find((item) => item.letter === letter)
                                return { letter, text: alternative?.text ?? '', correct: alternative?.correct ?? false }
                            }),
                        })
                    }
                })
                .catch(() => {
                    if (!ignore) setLoadError(true)
                })
                .finally(() => {
                    if (!ignore) setLoading(false)
                })
        }
        return () => {
            ignore = true
        }
    }, [id, attempt])

    function returnToList() {
        navigate('/admin/questions', { state: { page: getReturnPage(location.state) } })
    }

    async function save() {
        const cannotSave =
            saving ||
            subjectOptions.creating ||
            subjectOptions.loading ||
            subjectOptions.error ||
            subjectOptions.newSubjectName
        if (cannotSave) return
        const input: QuestionInput = {
            ...value,
            statement: value.statement.trim(),
            explanation: value.explanation.trim(),
            subjectId: value.subjectId.trim(),
            alternatives: value.alternatives.map((item) => ({ ...item, text: item.text.trim() })),
        }
        const hasValidSubject =
            input.subjectId && subjectOptions.subjects.some((subject) => subject.id === input.subjectId)
        const hasRequiredContent = input.statement && input.explanation && input.alternatives.every((item) => item.text)
        const hasExactlyOneCorrectAlternative = input.alternatives.filter((item) => item.correct).length === 1
        if (!hasValidSubject || !hasRequiredContent || !hasExactlyOneCorrectAlternative) {
            setError('Preencha todos os campos e selecione exatamente uma alternativa correta.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            if (id) await questionService.update(id, input)
            else await questionService.create(input)
            if (mounted.current) returnToList()
        } catch {
            if (mounted.current) setError('Não foi possível salvar a questão. Verifique os dados e tente novamente.')
        } finally {
            if (mounted.current) setSaving(false)
        }
    }

    return (
        <section className="admin-questions" aria-labelledby="question-form-title">
            <div className="questions-heading">
                <div>
                    <p className="eyebrow">Administração</p>
                    <h1 id="question-form-title">{id ? 'Editar questão' : 'Nova questão'}</h1>
                </div>
            </div>
            <div className="questions-panel" aria-busy={loading}>
                {loading ? (
                    <p role="status">Carregando questão...</p>
                ) : loadError ? (
                    <div>
                        <p role="alert">Não foi possível carregar a questão. Tente novamente.</p>
                        <div className="question-actions">
                            <button type="button" onClick={() => setAttempt((current) => current + 1)}>
                                Tentar novamente
                            </button>
                            <button type="button" onClick={returnToList}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <QuestionForm
                        value={value}
                        onChange={setValue}
                        onSubmit={save}
                        onCancel={returnToList}
                        saving={saving}
                        error={error}
                        subjectOptions={subjectOptions}
                    />
                )}
            </div>
        </section>
    )
}
