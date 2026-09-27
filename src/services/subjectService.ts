import { apiRequest } from './api'
import type { Subject } from '../types/subject'

export const subjectService = {
    listByDiscipline: (disciplineId: string) =>
        apiRequest<Subject[]>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`),
    create: (disciplineId: string, data: { name: string }) =>
        apiRequest<Subject>(`/subjects/discipline/${encodeURIComponent(disciplineId)}`, { method: 'POST', data }),
}
