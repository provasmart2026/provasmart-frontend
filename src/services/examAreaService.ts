import { apiRequest } from './api'
import type { ExamArea } from '../types/examArea'

export const examAreaService = {
    list: () => apiRequest<ExamArea[]>('/exam-areas'),
}
