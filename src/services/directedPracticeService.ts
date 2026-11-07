import { apiRequest } from './api'
import type { DirectedPractice, DirectedPracticeAnalysis } from '../types/directedPractice'

const base = '/directed-practices'
const path = (id: string) => `${base}/${encodeURIComponent(id)}`

export const directedPracticeService = {
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
