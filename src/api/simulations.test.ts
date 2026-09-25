import {afterEach, describe, expect, it, vi} from 'vitest'
import {api} from './client'
import {simulationsApi} from './simulations'

describe('simulationsApi', () => {
    afterEach(() => vi.restoreAllMocks())

    it('cria via POST sem body, parâmetros ou identificação de estudante', async () => {
        const response = {id: 'simulation-1', studentId: 'student-from-response'}
        const request = vi.spyOn(api, 'request').mockResolvedValue({data: response})
        await expect(simulationsApi.create()).resolves.toEqual(response)
        expect(request).toHaveBeenCalledExactlyOnceWith({url: '/simulations', method: 'POST'})
    })

    it('busca pelo ID do simulado', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({data: {id: 'simulation-1'}})
        await expect(simulationsApi.get('simulation-1')).resolves.toEqual({id: 'simulation-1'})
        expect(request).toHaveBeenCalledExactlyOnceWith({url: '/simulations/simulation-1'})
    })

    it('responde com somente alternativeId no body', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({data: {id: 'simulation-1'}})
        await simulationsApi.answer('simulation-1', 'question-1', 'alternative-1')
        expect(request).toHaveBeenCalledExactlyOnceWith({
            url: '/simulations/simulation-1/questions/question-1/answer',
            method: 'PUT', data: {alternativeId: 'alternative-1'},
        })
    })

    it('finaliza pelo ID do simulado sem body', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({data: {id: 'simulation-1'}})
        await simulationsApi.finish('simulation-1')
        expect(request).toHaveBeenCalledExactlyOnceWith({url: '/simulations/simulation-1/finish', method: 'PATCH'})
    })
})
