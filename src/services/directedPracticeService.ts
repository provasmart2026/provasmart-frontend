import { apiRequest } from './api'
import type { DirectedPractice, DirectedPracticeAnalysis, DirectedPracticeSummary } from '../types/directedPractice'
import type { Page } from '../types/api'

const base = '/directed-practices'
const path = (id: string) => `${base}/${encodeURIComponent(id)}`

export const directedPracticeService = {
    history: (page: number, size: number) =>
        apiRequest<Page<DirectedPracticeSummary>>(`${base}/history`, { params: { page, size } }),
    list: () => apiRequest<DirectedPractice[]>(base),
    create: () => apiRequest<DirectedPractice>(base, { method: 'POST' }),
    get: (id: string) => apiRequest<DirectedPractice>(path(id)),
    answer: (id: string, questionId: string, alternativeId: string) =>
        apiRequest<DirectedPractice>(`${path(id)}/questions/${encodeURIComponent(questionId)}/answer`,
            { method: 'PUT', data: { alternativeId } }),
    finish: (id: string) => apiRequest<DirectedPractice>(`${path(id)}/finish`, { method: 'PATCH' }),
    cancel: (id: string) => apiRequest<DirectedPractice>(`${path(id)}/cancel`, { method: 'PATCH' }),
    analysis: (id: string) => apiRequest<DirectedPracticeAnalysis>(`${path(id)}/analysis`),
}
