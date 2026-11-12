import { apiRequest } from './api'
import type { Simulation, SimulationQuestionCorrection, SimulationSummary } from '../types/simulation'
import type { SimulationPerformance } from '../types/simulationPerformance'
import type { Page } from '../types/api'

export const simulationService = {
    history: (page: number, size: number) =>
        apiRequest<Page<SimulationSummary>>('/simulations/history', { params: { page, size } }),
    current: async () => (await apiRequest<Simulation | undefined>('/simulations/current')) || null,
    latestFinished: () => apiRequest<Simulation>('/simulations/latest-finished'),
    create: () => apiRequest<Simulation>('/simulations', { method: 'POST' }),
    get: (simulationId: string) => apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}`),
    performance: (simulationId: string) =>
        apiRequest<SimulationPerformance>(`/simulations/${encodeURIComponent(simulationId)}/performance`),
    correction: (simulationId: string) =>
        apiRequest<SimulationQuestionCorrection[]>(`/simulations/${encodeURIComponent(simulationId)}/correction`),
    answer: (simulationId: string, simulationQuestionId: string, alternativeId: string) =>
        apiRequest<Simulation>(
            `/simulations/${encodeURIComponent(simulationId)}/questions/${encodeURIComponent(simulationQuestionId)}/answer`,
            { method: 'PUT', data: { alternativeId } }
        ),
    finish: (simulationId: string) =>
        apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}/finish`, { method: 'PATCH' }),
    cancel: (simulationId: string) =>
        apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}/cancel`, { method: 'PATCH' }),
}
