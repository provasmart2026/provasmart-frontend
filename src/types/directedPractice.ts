export type PracticeStatus = 'EM_ANDAMENTO' | 'FINALIZADA' | 'CANCELADA'

export type PracticeAlternative = { id: string; letter: string; text: string }

export type PracticeQuestion = {
    id: string
    position: number
    statement: string
    discipline: string
    subject: string
    alternatives: PracticeAlternative[]
    selectedAlternativeId: string | null
}

export type DirectedPractice = {
    id: string
    sourceSimulationId: string | null
    area: string
    status: PracticeStatus
    startedAt: string
    finishedAt: string | null
    questions: PracticeQuestion[]
}

export type PerformanceBreakdown = { name: string; discipline: string | null; total: number; correct: number; percentage: number }

export type PracticeReview = {
    questionId: string
    position: number
    statement: string
    explanation: string
    discipline: string
    subject: string
    selectedAlternativeId: string
    correctAlternativeId: string
    selectedLetter: string
    correctLetter: string
    correct: boolean
    alternatives: PracticeAlternative[]
}

export type DirectedPracticeAnalysis = {
    practiceId: string
    area: string
    total: number
    correct: number
    percentage: number
    disciplines: PerformanceBreakdown[]
    subjects: PerformanceBreakdown[]
    questions: PracticeReview[]
}
