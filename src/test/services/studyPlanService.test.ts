import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../services/api'
import { studyPlanService } from '../../services/studyPlanService'
import type { StudyPlanCreateRequest } from '../../types/studyPlan'

vi.mock('../../services/api', () => ({ apiRequest: vi.fn() }))

describe('studyPlanService', () => {
    beforeEach(() => vi.resetAllMocks())

    it('envia simulado, carga diária e confirmação de substituição na criação', async () => {
        const data: StudyPlanCreateRequest = { simulationId: 'simulation-1', dailyHours: 2, replaceCurrentPlan: true }
        await studyPlanService.create(data)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/study-plans', { method: 'POST', data })
    })

    it.each([
        { data: { id: 'plan-1' }, expected: { id: 'plan-1' } },
        { data: undefined, expected: null },
    ])('consulta o plano atual e retorna $expected', async ({ data, expected }) => {
        vi.mocked(apiRequest).mockResolvedValue(data)

        await expect(studyPlanService.current()).resolves.toEqual(expected)
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/study-plans/current')
    })

    it('busca os detalhes do plano pelo ID codificado', async () => {
        await studyPlanService.get('plan/id')

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/study-plans/plan%2Fid')
    })

    it.each([undefined, 'ARQUIVADO'] as const)('lista planos com status %s', async (status) => {
        await studyPlanService.list(1, 15, status)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/study-plans', { params: { page: 1, size: 15, status } })
    })

    it.each([true, false])('envia a alteração de conclusão para %s com os IDs codificados', async (completed) => {
        await studyPlanService.updateCompletion('plan/id', 'activity/id', completed)

        expect(apiRequest).toHaveBeenCalledExactlyOnceWith(
            '/study-plans/plan%2Fid/activities/activity%2Fid/completion',
            { method: 'PATCH', data: { completed } }
        )
    })
})
