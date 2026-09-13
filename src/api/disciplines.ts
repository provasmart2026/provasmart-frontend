import {apiRequest} from './client'
import type {Discipline} from '../types/discipline'
import type {ExamArea} from '../types/examArea'

export const disciplinesApi = {
    listByExamArea: (area: ExamArea) =>
        apiRequest<Discipline[]>(`/disciplines/exam-area/${encodeURIComponent(area)}`),
}
