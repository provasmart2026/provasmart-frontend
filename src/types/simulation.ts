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

export type Simulation = {
    id: string
    studentId: string
    status: 'EM_ANDAMENTO' | 'FINALIZADO'
    startedAt: string
    finishedAt: string | null
    questions: SimulationQuestion[]
}
