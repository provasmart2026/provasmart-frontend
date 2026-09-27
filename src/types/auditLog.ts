export type AuditLog = {
    id: string
    actorId: string | null
    actorEmail: string | null
    action: string
    resource: string
    resourceId: string | null
    requestMethod: string
    endpoint: string
    statusCode: number
    success: boolean
    occurredAt: string
}
