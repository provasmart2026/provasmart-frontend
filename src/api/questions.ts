import {apiRequest} from './client'
import type {Page} from '../types/api'
import type {Question, QuestionInput} from '../types/question'
import {QUESTIONS_PAGE_SIZE} from '../constants/questions'

export const questionsApi = {
    get: (id: string) => apiRequest<Question>(`/questions/${encodeURIComponent(id)}`),
    create: (data: QuestionInput) => apiRequest<Question>('/questions', {method: 'POST', data}),
    update: (id: string, data: QuestionInput) =>
        apiRequest<Question>(`/questions/${encodeURIComponent(id)}`, {method: 'PUT', data}),
    activate: (id: string) =>
        apiRequest<void>(`/questions/${encodeURIComponent(id)}/activate`, {method: 'PATCH'}),
    deactivate: (id: string) =>
        apiRequest<void>(`/questions/${encodeURIComponent(id)}/deactivate`, {method: 'PATCH'}),
    list: (page = 0, size = QUESTIONS_PAGE_SIZE) =>
        apiRequest<Page<Question>>(`/questions?page=${page}&size=${size}`),
}
