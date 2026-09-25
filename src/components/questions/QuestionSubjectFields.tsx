import {examAreaLabels, type ExamArea} from '../../types/examArea'
import type {QuestionSubjects} from '../../types/questionForm'
import {SUBJECT_NAME_MAX_LENGTH} from '../../constants/questions'

type QuestionSubjectFieldsProps = {
    id: string
    subjectId: string
    options: QuestionSubjects
    onSubjectChange: (id: string) => void
}

export function QuestionSubjectFields({id, subjectId, options, onSubjectChange}: QuestionSubjectFieldsProps) {
    const newSubjectDisabled = !options.disciplineId || options.creating || Boolean(options.loading)
        || Boolean(options.error) || Boolean(subjectId)
    const existingSubjectDisabled = options.creating || !options.disciplineId || Boolean(options.loading)
        || !options.subjects.length || Boolean(options.newSubjectName)

    return <>
        <label htmlFor={`${id}-area`}>Área</label>
        <select id={`${id}-area`} required value={options.area}
                disabled={options.creating || !options.areas.length}
                onChange={(event) => options.selectArea(event.target.value as ExamArea | '')}>
            <option value="">Selecione uma área</option>
            {options.areas.map((area) => <option key={area}
                                                 value={area}>{examAreaLabels[area] ?? area}</option>)}
        </select>
        <label htmlFor={`${id}-discipline`}>Disciplina</label>
        <select id={`${id}-discipline`} required value={options.disciplineId}
                disabled={options.creating || !options.area || !options.disciplines.length}
                onChange={(event) => options.selectDiscipline(event.target.value)}>
            <option value="">Selecione uma disciplina</option>
            {options.disciplines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <label htmlFor={`${id}-subject`}>Assunto</label>
        <select id={`${id}-subject`} required value={subjectId}
                disabled={existingSubjectDisabled}
                onChange={(event) => onSubjectChange(event.target.value)}>
            <option value="">Selecione um assunto</option>
            {options.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {options.loading && <p role="status">{options.loading}</p>}
        {options.error && <div>
            <p role="alert">{options.error}</p>
            <button type="button" onClick={options.retry}>Tentar carregar novamente</button>
        </div>}
        {!options.loading && !options.error && options.area && !options.disciplines.length
            && <p role="status">Nenhuma disciplina disponível nesta área.</p>}
        {!options.loading && !options.error && options.disciplineId && !options.subjects.length
            && <p role="status">Nenhum assunto cadastrado nesta disciplina.</p>}
        <label htmlFor={`${id}-new-subject`}>Nome do novo assunto</label>
        <input id={`${id}-new-subject`} maxLength={SUBJECT_NAME_MAX_LENGTH} value={options.newSubjectName}
               disabled={newSubjectDisabled}
               aria-invalid={Boolean(options.createError)}
               aria-describedby={options.createError ? `${id}-subject-error` : undefined}
               onChange={(event) => options.setNewSubjectName(event.target.value)}/>
        <div className="question-actions">
            <button type="button" onClick={options.createSubject}
                    disabled={newSubjectDisabled || !options.newSubjectName.trim()}>
                {options.creating ? 'Criando assunto...' : 'Criar assunto'}
            </button>
        </div>
        {options.createError && <p id={`${id}-subject-error`} role="alert">{options.createError}</p>}
    </>
}
