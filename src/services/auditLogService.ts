import type { Page } from '../types/api'
import type { AuditLog } from '../types/auditLog'
import { apiRequest } from './api'

export const auditLogService = {
    list: (page = 0, size = 15) =>
        apiRequest<Page<AuditLog>>(`/audit-logs?page=${page}&size=${size}&sort=occurredAt,desc`, { method: 'GET' }),
}
