import type {ExamArea} from './examArea'
import type {Discipline} from './discipline'
import type {Subject} from './subject'

export type QuestionSubjects = {
    areas: ExamArea[]
    area: ExamArea | ''
    disciplines: Discipline[]
    disciplineId: string
    subjects: Subject[]
    loading: string | null
    error: string | null
    creating: boolean
    createError: string | null
    newSubjectName: string
    setNewSubjectName: (name: string) => void
    selectArea: (area: ExamArea | '') => void
    selectDiscipline: (id: string) => void
    createSubject: () => void
    retry: () => void
}
