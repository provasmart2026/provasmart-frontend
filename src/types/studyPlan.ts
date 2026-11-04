import type { ExamArea } from './examArea'

export type StudyPlanStatus = 'ATIVO' | 'ARQUIVADO'

export type StudyPlanActivity = {
    id: string
    dayNumber: number
    position: number
    examArea: ExamArea
    disciplineId: string
    disciplineName: string
    subjectId: string
    subjectName: string
    type: 'ESTUDO' | 'REVISAO'
    completed: boolean
    completedAt: string | null
}

export type StudyPlanSummary = {
    id: string
    simulationId: string
    dailyHours: number
    startDate: string
    status: StudyPlanStatus
    createdAt: string
    archivedAt: string | null
    totalActivities: number
    completedActivities: number
    progressPercentage: number
}

export type StudyPlan = StudyPlanSummary & {
    activities: StudyPlanActivity[]
}

export type StudyPlanCreateRequest = {
    simulationId: string
    dailyHours: 1 | 2 | 3
    replaceCurrentPlan: boolean
}
