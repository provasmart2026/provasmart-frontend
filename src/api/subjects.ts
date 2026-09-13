import {apiRequest} from './client'
import type {Subject, SubjectInput} from '../types/subject'

export const subjectsApi = {
    listByDiscipline: (disciplineId: string) =>
        apiRequest<Subject[]>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`),
    create: (disciplineId: string, data: SubjectInput) =>
        apiRequest<Subject>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`, {method: 'POST', data}),
}
