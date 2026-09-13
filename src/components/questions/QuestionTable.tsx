import type {Question} from '../../types/question'

type QuestionTableProps = {
    questions: Question[]
    totalElements: number
    onEdit?: (question: Question) => void
    onToggleActive?: (question: Question) => void
}

export function QuestionTable({questions, totalElements, onEdit, onToggleActive}: QuestionTableProps) {
    return (
        <div className="questions-table-wrap">
            <table>
                <caption className="supporting-copy">{totalElements} questões cadastradas</caption>
                <thead>
                <tr>
                    <th scope="col">Enunciado</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                </tr>
                </thead>
                <tbody>
                {questions.map((question) => (
                    <tr key={question.id}>
                        <td className="question-statement">{question.statement}</td>
                        <td>{question.subjectName}</td>
                        <td><span
                            className={`question-status ${question.active ? 'is-active' : ''}`}>{question.active ? 'Ativa' : 'Inativa'}</span>
                        </td>
                        <td>
                            <div className="question-actions">
                                <button type="button" disabled={!onEdit} onClick={() => onEdit?.(question)}>Editar
                                </button>
                                <button type="button" disabled={!onToggleActive}
                                        onClick={() => onToggleActive?.(question)}>{question.active ? 'Desativar' : 'Ativar'}</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
