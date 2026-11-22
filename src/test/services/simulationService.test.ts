import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../services/api'
import { simulationService } from '../../services/simulationService'

describe('simulationService', () => {
    afterEach(() => vi.restoreAllMocks())

    it('cria via POST sem body, parâmetros ou identificação de estudante', async () => {
        const response = { id: 'simulation-1', studentId: 'student-from-response' }
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })
        await expect(simulationService.create()).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations', method: 'POST' })
    })

    it('busca pelo ID do simulado', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: { id: 'simulation-1' } })
        await expect(simulationService.get('simulation/id')).resolves.toEqual({ id: 'simulation-1' })
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation%2Fid' })
    })

    it('busca a correção pelo ID do simulado', async () => {
        const response = [{ simulationQuestionId: 'sq-1', isCorrect: false }]
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })
        await expect(simulationService.correction('simulation-1')).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation-1/correction' })
    })

    it('responde com somente alternativeId no body', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: { id: 'simulation-1' } })
        await simulationService.answer('simulation-1', 'question-1', 'alternative-1')
        expect(request).toHaveBeenCalledExactlyOnceWith({
            url: '/simulations/simulation-1/questions/question-1/answer',
            method: 'PUT',
            data: { alternativeId: 'alternative-1' },
        })
    })

    it('finaliza pelo ID do simulado sem body', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: { id: 'simulation-1' } })
        await simulationService.finish('simulation-1')
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation-1/finish', method: 'PATCH' })
    })

    it('consulta o histórico com a página e o tamanho solicitados', async () => {
        const response = { content: [{ id: 'simulation-1' }], totalElements: 1 }
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })

        await expect(simulationService.history(2, 15)).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/history', params: { page: 2, size: 15 } })
    })

    it.each([
        { data: { id: 'simulation-1' }, expected: { id: 'simulation-1' } },
        { data: undefined, expected: null },
    ])('consulta o simulado atual e retorna $expected', async ({ data, expected }) => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data })

        await expect(simulationService.current()).resolves.toEqual(expected)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/current' })
    })

    it('consulta o último simulado finalizado', async () => {
        const response = { id: 'finished-1', status: 'FINALIZADO' }
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })

        await expect(simulationService.latestFinished()).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/latest-finished' })
    })

    it('consulta o desempenho com o ID codificado', async () => {
        const response = { simulationId: 'simulation/id' }
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })

        await expect(simulationService.performance('simulation/id')).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation%2Fid/performance' })
    })

    it('cancela o simulado via PATCH sem corpo', async () => {
        const response = { id: 'simulation/id', status: 'CANCELADO' }
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: response })

        await expect(simulationService.cancel('simulation/id')).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation%2Fid/cancel', method: 'PATCH' })
    })
})
