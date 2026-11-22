import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../services/api'
import { subjectService } from '../../services/subjectService'

vi.mock('../../services/api', () => ({ apiRequest: vi.fn() }))

describe('subjectService', () => {
    beforeEach(() => vi.resetAllMocks())

    it('lista os assuntos da disciplina pelo ID codificado', async () => {
        const response = [{ id: 'subject-1', name: 'Geometria' }]
        vi.mocked(apiRequest).mockResolvedValue(response)

        await expect(subjectService.listByDiscipline('discipline/id')).resolves.toEqual(response)
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/subjects/discipline/discipline%2Fid')
    })

    it('cria um assunto na disciplina selecionada', async () => {
        const data = { name: 'Geometria' }
        const response = { id: 'subject-1', ...data }
        vi.mocked(apiRequest).mockResolvedValue(response)

        await expect(subjectService.create('discipline/id', data)).resolves.toEqual(response)
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/subjects/discipline/discipline%2Fid', {
            method: 'POST',
            data,
        })
    })
})
