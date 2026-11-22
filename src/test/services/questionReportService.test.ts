import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../services/api'
import { questionReportService } from '../../services/questionReportService'

vi.mock('../../services/api', () => ({ apiRequest: vi.fn() }))

describe('serviço de reporte', () => {
    beforeEach(() => vi.resetAllMocks())
    it.each([
        ['SIMULADO', '/simulations'],
        ['PRATICA_DIRECIONADA', '/directed-practices'],
    ] as const)('monta a rota de %s com os IDs da atividade', async (origin, base) => {
        const data = { reason: 'OUTRO' as const, description: 'Descrição' }
        await questionReportService.create(origin, 'activity/id', 'question/id', data)
        expect(apiRequest).toHaveBeenCalledWith(`${base}/activity%2Fid/questions/question%2Fid/reports`, {
            method: 'POST',
            data,
        })
    })

    it('consulta a lista e o detalhe administrativos e atualiza o status', async () => {
        await questionReportService.list(1, 20, 'PENDENTE')
        expect(apiRequest).toHaveBeenCalledWith('/question-reports', { params: { page: 1, size: 20, status: 'PENDENTE' } })
        await questionReportService.get('report/id')
        expect(apiRequest).toHaveBeenCalledWith('/question-reports/report%2Fid')
        await questionReportService.updateStatus('report/id', 'DESCARTADO')
        expect(apiRequest).toHaveBeenCalledWith('/question-reports/report%2Fid/status', {
            method: 'PATCH',
            data: { status: 'DESCARTADO' },
        })
    })

    it.each([0, 100])('consulta e retorna a contagem de %i reportes pendentes', async (count) => {
        vi.mocked(apiRequest).mockResolvedValue({ count })

        await expect(questionReportService.countPending()).resolves.toEqual({ count })
        expect(apiRequest).toHaveBeenCalledExactlyOnceWith('/question-reports/pending-count')
    })
})
