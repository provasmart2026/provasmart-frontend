import type { QuestionReportOrigin, QuestionReportReason, QuestionReportStatus } from '../../../types/questionReport'

export const statusLabels: Record<QuestionReportStatus, string> = {
    PENDENTE: 'Pendente', RESOLVIDO: 'Resolvido', DESCARTADO: 'Descartado',
}
export const originLabels: Record<QuestionReportOrigin, string> = {
    SIMULADO: 'Simulado geral', PRATICA_DIRECIONADA: 'Prática direcionada',
}
export const reasonLabels: Record<QuestionReportReason, string> = {
    ENUNCIADO_INCORRETO: 'Enunciado incorreto', ALTERNATIVAS_COM_PROBLEMA: 'Problema nas alternativas',
    GABARITO_INCORRETO: 'Gabarito incorreto', EXPLICACAO_INCORRETA: 'Explicação incorreta', OUTRO: 'Outro',
}