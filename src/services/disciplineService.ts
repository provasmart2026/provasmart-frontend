import { apiRequest } from './api'
import type { Discipline } from '../types/discipline'
import type { ExamArea } from '../types/examArea'

export const disciplineService = {
    listByExamArea: (area: ExamArea) => apiRequest<Discipline[]>(`/disciplines/exam-area/${encodeURIComponent(area)}`),
}
