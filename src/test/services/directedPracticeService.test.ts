import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../services/api'
import { directedPracticeService } from '../../services/directedPracticeService'

vi.mock('../../services/api', () => ({ apiRequest: vi.fn() }))

describe('directedPracticeService', () => {
    beforeEach(() => vi.resetAllMocks())

    it('envia os parâmetros de paginação do histórico', async () => {
        await directedPracticeService.history(2, 15)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/directed-practices/history', {
            params: { page: 2, size: 15 },
        })
    })

    it('lista as práticas do estudante', async () => {
        const response = [{ id: 'practice-1' }]
        vi.mocked(apiRequest).mockResolvedValue(response)

        await expect(directedPracticeService.list()).resolves.toEqual(response)
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/directed-practices')
    })

    it('cria uma prática com POST e sem corpo', async () => {
        await directedPracticeService.create()

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/directed-practices', { method: 'POST' })
    })

    it('consulta uma prática pelo ID codificado', async () => {
        await directedPracticeService.get('practice/id')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/directed-practices/practice%2Fid')
    })

    it('salva a resposta com os IDs codificados e só a alternativa no corpo', async () => {
        await directedPracticeService.answer('practice/id', 'question/id', 'alternative-1')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith(
            '/directed-practices/practice%2Fid/questions/question%2Fid/answer',
            { method: 'PUT', data: { alternativeId: 'alternative-1' } }
        )
    })

    it.each(['finish', 'cancel'] as const)('chama %s com PATCH e sem corpo', async (action) => {
        await directedPracticeService[action]('practice/id')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith(`/directed-practices/practice%2Fid/${action}`, {
            method: 'PATCH',
        })
    })

    it('consulta a análise pelo ID codificado', async () => {
        await directedPracticeService.analysis('practice/id')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/directed-practices/practice%2Fid/analysis')
    })
})
