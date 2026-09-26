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
        await expect(simulationService.get('simulation-1')).resolves.toEqual({ id: 'simulation-1' })
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/simulations/simulation-1' })
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
})
