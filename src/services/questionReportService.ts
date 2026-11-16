import { apiRequest } from './api'
import type { Page } from '../types/api'
import type { QuestionReportStatus, QuestionReportSummary, QuestionReportDetail } from '../types/questionReport'
import type { QuestionReportOrigin, QuestionReportRequest, QuestionReportResponse } from '../types/questionReport'

export const questionReportService = {
    list: (page = 0, size = 10, status?: QuestionReportStatus) =>
        apiRequest<Page<QuestionReportSummary>>('/question-reports', { params: { page, size, status } }),
    get: (id: string) => apiRequest<QuestionReportDetail>(`/question-reports/${encodeURIComponent(id)}`),
    updateStatus: (id: string, status: 'RESOLVIDO' | 'DESCARTADO') =>
        apiRequest<QuestionReportDetail>(`/question-reports/${encodeURIComponent(id)}/status`, { method: 'PATCH', data: { status } }),
    create(origin: QuestionReportOrigin, activityId: string, questionId: string, data: QuestionReportRequest) {
        const base = origin === 'SIMULADO' ? '/simulations' : '/directed-practices'
        return apiRequest<QuestionReportResponse>(
            `${base}/${encodeURIComponent(activityId)}/questions/${encodeURIComponent(questionId)}/reports`,
            { method: 'POST', data },
        )
    },
}