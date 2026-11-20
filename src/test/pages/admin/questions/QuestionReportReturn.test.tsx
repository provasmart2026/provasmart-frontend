import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QuestionFormPage } from '../../../../pages/admin/questions/QuestionFormPage'
import { questionService } from '../../../../services/questionService'

vi.mock('../../../../services/questionService', () => ({ questionService: { get: vi.fn(), update: vi.fn() } }))
vi.mock('../../../../pages/admin/questions/useQuestionSubjects', () => ({
    useQuestionSubjects: () => ({
        subjects: [{ id: 'subject', name: 'Assunto' }],
        creating: false,
        loading: false,
        error: null,
        newSubjectName: '',
    }),
}))
vi.mock('../../../../pages/admin/questions/QuestionForm', () => ({
    QuestionForm: (props: { onSubmit: () => void; onCancel: () => void }) => (
        <>
            <button onClick={props.onSubmit}>Salvar teste</button>
            <button onClick={props.onCancel}>Cancelar teste</button>
        </>
    ),
}))

beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(questionService.get).mockResolvedValue({
        id: 'question',
        statement: 'Enunciado',
        explanation: 'Explicação',
        subjectId: 'subject',
        subjectName: 'Assunto',
        active: true,
        createdAt: '2026-11-15',
        updatedAt: null,
        alternatives: ['A', 'B', 'C', 'D', 'E'].map((letter) => ({
            id: letter,
            letter,
            text: 'Texto',
            correct: letter === 'A',
        })),
    })
})

it.each(['Salvar teste', 'Cancelar teste'])('retorna ao reporte após %s', async (button) => {
    render(
        <MemoryRouter
            initialEntries={[
                {
                    pathname: '/admin/questions/question/edit',
                    state: { returnTo: '/admin/question-reports/report-1?status=TODOS&page=1' },
                },
            ]}
        >
            <Routes>
                <Route path="/admin/questions/:id/edit" element={<QuestionFormPage />} />
                <Route path="/admin/question-reports/:id" element={<p>Reporte de origem</p>} />
            </Routes>
        </MemoryRouter>
    )
    fireEvent.click(await screen.findByRole('button', { name: button }))
    expect(await screen.findByText('Reporte de origem')).toBeInTheDocument()
    if (button === 'Salvar teste') expect(questionService.update).toHaveBeenCalled()
    else expect(questionService.update).not.toHaveBeenCalled()
})
