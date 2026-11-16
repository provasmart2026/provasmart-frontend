import type { ExamArea } from './examArea'

export type SimulationPerformanceSummary = {
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    accuracyPercentage: number
}

export type SimulationSubjectPerformance = SimulationPerformanceSummary & {
    subjectId: string
    subjectName: string
}

export type SimulationDisciplinePerformance = SimulationPerformanceSummary & {
    disciplineId: string
    disciplineName: string
    subjects: SimulationSubjectPerformance[]
}

export type SimulationAreaPerformance = SimulationPerformanceSummary & {
    examArea: ExamArea
    disciplines: SimulationDisciplinePerformance[]
}

export type SimulationPerformance = {
    simulationId: string
    summary: SimulationPerformanceSummary
    worstAreas: ExamArea[]
    areas: SimulationAreaPerformance[]
}
