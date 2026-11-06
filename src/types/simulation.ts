type SimulationAlternative = {
    id: string
    letter: string
    text: string
}

type SimulationQuestion = {
    id: string
    position: number
    questionId: string
    statement: string
    alternatives: SimulationAlternative[]
    selectedAlternativeId: string | null
}

export type SimulationQuestionCorrection = {
    simulationQuestionId: string
    position: number
    statement: string
    alternatives: SimulationAlternative[]
    selectedAlternativeId: string | null
    correctAlternativeId: string | null
    isCorrect: boolean | null
    explanation: string
}

export type Simulation = {
    id: string
    studentId: string
    status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO'
    startedAt: string
    finishedAt: string | null
    questions: SimulationQuestion[]
}
