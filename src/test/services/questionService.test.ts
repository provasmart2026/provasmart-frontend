import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../services/api'
import { questionService } from '../../services/questionService'
import type { QuestionInput } from '../../types/question'

vi.mock('../../services/api', () => ({ apiRequest: vi.fn() }))

const input: QuestionInput = {
    statement: 'Enunciado da questão',
    explanation: 'Explicação da resposta',
    subjectId: 'subject-1',
    alternatives: ['A', 'B', 'C', 'D', 'E'].map((letter) => ({
        letter,
        text: `Alternativa ${letter}`,
        correct: letter === 'A',
    })),
}

describe('questionService', () => {
    beforeEach(() => vi.resetAllMocks())

    it('lista com a paginação padrão', async () => {
        await questionService.list()

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/questions?page=0&size=10')
    })

    it('repassa a página e o tamanho solicitados', async () => {
        await questionService.list(2, 20)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/questions?page=2&size=20')
    })

    it('busca uma questão pelo ID codificado', async () => {
        const response = { id: 'question/id', active: true }
        vi.mocked(apiRequest).mockResolvedValue(response)

        await expect(questionService.get('question/id')).resolves.toEqual(response)
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/questions/question%2Fid')
    })

    it('cria a questão com POST', async () => {
        await questionService.create(input)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/questions', { method: 'POST', data: input })
    })

    it('atualiza a questão com PUT', async () => {
        await questionService.update('question/id', input)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/questions/question%2Fid', { method: 'PUT', data: input })
    })

    it.each(['activate', 'deactivate'] as const)('chama %s com PATCH e sem corpo', async (action) => {
        await questionService[action]('question/id')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith(`/questions/question%2Fid/${action}`, { method: 'PATCH' })
    })
})
