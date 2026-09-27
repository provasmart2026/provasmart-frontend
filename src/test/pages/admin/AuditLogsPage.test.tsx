import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../../services/api'
import type { Page } from '../../../types/api'
import type { AuditLog } from '../../../types/auditLog'
import { AuditLogsPage } from '../../../pages/admin/audit/AuditLogsPage'

const log: AuditLog = {
    id: 'log-uuid',
    actorId: 'actor-uuid',
    actorEmail: 'admin@provasmart.com',
    action: 'CREATE',
    resource: 'QUESTIONS',
    resourceId: 'question-uuid',
    requestMethod: 'POST',
    endpoint: '/questions',
    statusCode: 201,
    success: true,
    occurredAt: '2026-09-27T14:30:00',
}

function page(content: AuditLog[], number = 0, totalPages = 1): Page<AuditLog> {
    return {
        content,
        totalElements: totalPages > 1 ? 16 : content.length,
        totalPages,
        number,
        size: 15,
        first: number === 0,
        last: number >= totalPages - 1,
        empty: content.length === 0,
        numberOfElements: content.length,
    }
}

describe('Auditoria de logs', () => {
    afterEach(() => vi.restoreAllMocks())

    it('carrega e apresenta os dados de rastreabilidade', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValue({ data: page([log]) })
        render(<AuditLogsPage />)

        const row = within(await screen.findByRole('row', { name: /admin@provasmart.com/ }))
        expect(request).toHaveBeenCalledWith({
            url: '/audit-logs?page=0&size=15&sort=occurredAt,desc',
            method: 'GET',
        })
        expect(row.getByText('Criação')).toBeInTheDocument()
        expect(row.getByText('QUESTIONS')).toBeInTheDocument()
        expect(row.getByText('POST')).toBeInTheDocument()
        expect(row.getByText('/questions')).toBeInTheDocument()
        expect(row.getByText('201 · Criado')).toBeInTheDocument()
        expect(row.getByText('Sucesso')).toBeInTheDocument()
        expect(row.getByText('actor-uuid')).toBeInTheDocument()
        expect(row.getByText('question-uuid')).toBeInTheDocument()
        expect(row.getByText('log-uuid')).toBeInTheDocument()
    })

    it('navega entre as páginas', async () => {
        const request = vi
            .spyOn(api, 'request')
            .mockResolvedValueOnce({ data: page([log], 0, 2) })
            .mockResolvedValueOnce({ data: page([{ ...log, id: 'second-log' }], 1, 2) })
        render(<AuditLogsPage />)
        await screen.findByText('Página 1 de 2')
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
        await screen.findByText('Página 2 de 2')
        expect(request).toHaveBeenLastCalledWith({
            url: '/audit-logs?page=1&size=15&sort=occurredAt,desc',
            method: 'GET',
        })
    })

    it('permite tentar novamente após falha', async () => {
        const request = vi
            .spyOn(api, 'request')
            .mockRejectedValueOnce(new Error('falha interna'))
            .mockResolvedValueOnce({ data: page([log]) })
        render(<AuditLogsPage />)
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os registros de auditoria.')
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        await screen.findByText('admin@provasmart.com')
        expect(request).toHaveBeenCalledTimes(2)
    })
})
