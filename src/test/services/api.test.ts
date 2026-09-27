import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, apiRequest } from '../../services/api'

describe('apiRequest', () => {
    afterEach(() => vi.restoreAllMocks())

    it('converte uma resposta JSON bem-sucedida', async () => {
        vi.spyOn(api, 'request').mockResolvedValue({ data: { content: [] } } as never)
        await expect(apiRequest('/questions/active')).resolves.toEqual({ content: [] })
    })

    it('informa o status quando o backend responde com erro', async () => {
        vi.spyOn(api, 'request').mockRejectedValue({
            isAxiosError: true,
            response: { status: 500 },
        })
        await expect(apiRequest('/questions')).rejects.toEqual(expect.objectContaining({ status: 500 }))
    })
})
