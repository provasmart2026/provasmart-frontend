import { apiRequest } from './api'
import type { Simulation } from '../types/simulation'

export const simulationService = {
    create: () => apiRequest<Simulation>('/simulations', { method: 'POST' }),
    get: (simulationId: string) => apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}`),
    answer: (simulationId: string, simulationQuestionId: string, alternativeId: string) =>
        apiRequest<Simulation>(
            `/simulations/${encodeURIComponent(simulationId)}/questions/${encodeURIComponent(simulationQuestionId)}/answer`,
            { method: 'PUT', data: { alternativeId } }
        ),
    finish: (simulationId: string) =>
        apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}/finish`, { method: 'PATCH' }),
}
