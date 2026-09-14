export type SimulationStatus =
    | 'EM_ANDAMENTO'
    | 'FINALIZADO'

export type SimulationAlternative = {
    id: string
    letter: string
    text: string
}

export type SimulationQuestion = {
    id: string
    position: number
    questionId: string
    statement: string
    alternatives: SimulationAlternative[]
    selectedAlternativeId: string | null
}

export type Simulation = {
    id: string
    studentId: string
    status: SimulationStatus
    startedAt: string
    finishedAt: string | null
    questions: SimulationQuestion[]
}

export type SimulationAnswerInput = {
    alternativeId: string
}
