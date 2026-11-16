export type QuestionReportOrigin = 'SIMULADO' | 'PRATICA_DIRECIONADA'
export type QuestionReportStatus = 'PENDENTE' | 'RESOLVIDO' | 'DESCARTADO'
export type QuestionReportReason = 'ENUNCIADO_INCORRETO' | 'ALTERNATIVAS_COM_PROBLEMA'
    | 'GABARITO_INCORRETO' | 'EXPLICACAO_INCORRETA' | 'OUTRO'

export type QuestionReportRequest = { reason: QuestionReportReason; description: string }

export type QuestionReportResponse = {
    id: string
    origin: QuestionReportOrigin
    reason: QuestionReportReason
    description: string
    status: QuestionReportStatus
    createdAt: string
}
export type QuestionReportSummary = {
    id: string
    studentId: string
    studentName: string
    originalQuestionId: string
    origin: QuestionReportOrigin
    reason: QuestionReportReason
    status: QuestionReportStatus
    createdAt: string
}

export type QuestionReportDetail = QuestionReportSummary & {
    simulationId: string | null
    simulationQuestionId: string | null
    practiceId: string | null
    practiceQuestionId: string | null
    description: string
    contentSnapshot: string
    updatedAt: string | null
}