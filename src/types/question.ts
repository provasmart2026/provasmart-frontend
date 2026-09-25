type Alternative = {
    id: string
    letter: string
    text: string
    correct: boolean
}

export type QuestionInput = {
    statement: string
    explanation: string
    subjectId: string
    alternatives: Pick<Alternative, 'letter' | 'text' | 'correct'>[]
}

export type Question = {
    id: string
    statement: string
    explanation: string | null
    subjectId: string
    subjectName: string
    active: boolean
    alternatives: Alternative[]
    createdAt: string
    updatedAt: string | null
}

