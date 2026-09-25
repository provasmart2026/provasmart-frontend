import {apiRequest} from './client'
import type {Simulation, SimulationAnswerInput} from '../types/simulation'

export const simulationsApi = {
    create: () =>
        apiRequest<Simulation>('/simulations', {method: 'POST'}),
    get: (simulationId: string) =>
        apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}`),
    answer: (simulationId: string, simulationQuestionId: string, alternativeId: string) => {
        const data: SimulationAnswerInput = {alternativeId}
        return apiRequest<Simulation>(
            `/simulations/${encodeURIComponent(simulationId)}/questions/${encodeURIComponent(simulationQuestionId)}/answer`,
            {method: 'PUT', data},
        )
    },
    finish: (simulationId: string) =>
        apiRequest<Simulation>(`/simulations/${encodeURIComponent(simulationId)}/finish`, {method: 'PATCH'}),
}
