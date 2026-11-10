import type { ExamArea } from './examArea'

type DashboardPerformance = {
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracyPercentage: number
}

type DashboardEvolutionPoint = {
    finishedAt: string
    totalQuestions: number
    correctAnswers: number
    accuracyPercentage: number
}

export type StudentDashboard = DashboardPerformance & {
    completedActivities: number
    areas: (DashboardPerformance & {
        examArea: ExamArea
        classification: string
    })[]
    evolution: DashboardEvolutionPoint[]
}
