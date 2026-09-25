import {apiRequest} from './client'
import type {Subject} from '../types/subject'

export const subjectsApi = {
    listByDiscipline: (disciplineId: string) =>
        apiRequest<Subject[]>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`),
    create: (disciplineId: string, data: {name: string}) =>
        apiRequest<Subject>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`, {method: 'POST', data}),
}
