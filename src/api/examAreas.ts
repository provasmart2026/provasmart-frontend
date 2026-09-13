import {apiRequest} from './client'
import type {ExamArea} from '../types/examArea'

export const examAreasApi = {
    list: () => apiRequest<ExamArea[]>('/exam-areas'),
}
