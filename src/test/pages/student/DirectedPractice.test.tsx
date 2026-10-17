import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DirectedPracticeStartPage } from '../../../pages/student/DirectedPracticeStartPage'
import { DirectedPracticePage } from '../../../pages/student/DirectedPracticePage'
import { DirectedPracticeAnalysisPage } from '../../../pages/student/DirectedPracticeAnalysisPage'
import { directedPracticeService } from '../../../services/directedPracticeService'
import type { DirectedPractice } from '../../../types/directedPractice'

function practice(answered = false): DirectedPractice {
    return {
        id: 'practice-1', sourceSimulationId: 'simulation-1', area: 'MATEMATICA',
        status: 'EM_ANDAMENTO', startedAt: '2026-10-16T10:00:00', finishedAt: null,
        questions: Array.from({ length: 20 }, (_, index) => ({
            id: `pq-${index + 1}`, position: index + 1, statement: `Enunciado ${index + 1}`,
            discipline: 'Matemática', subject: 'Funções',
            alternatives: [{ id: `pa-${index + 1}`, letter: 'A', text: 'Opção A' }],
            selectedAlternativeId: answered ? `pa-${index + 1}` : null,
        })),
    }
}

function renderRoute(route: string) {
    render(<MemoryRouter initialEntries={[route]}><Routes>
        <Route path="/praticas" element={<DirectedPracticeStartPage />} />
        <Route path="/praticas/:practiceId" element={<DirectedPracticePage />} />
        <Route path="/praticas/:practiceId/analise" element={<DirectedPracticeAnalysisPage />} />
    </Routes></MemoryRouter>)
}

describe('Prática direcionada', () => {
    afterEach(() => vi.restoreAllMocks())

    it('impede iniciar outra prática quando existe uma em andamento', async () => {
        vi.spyOn(directedPracticeService, 'list').mockResolvedValue([practice()])
        const create = vi.spyOn(directedPracticeService, 'create')
        renderRoute('/praticas')
        expect(await screen.findByRole('link', { name: 'Continuar prática de Matemática' })).toHaveAttribute('href', '/praticas/practice-1')
        expect(screen.queryByRole('button', { name: 'Iniciar prática direcionada' })).not.toBeInTheDocument()
        expect(create).not.toHaveBeenCalled()
    })

    it('não apresenta gabarito durante a execução e exige 20 respostas', async () => {
        vi.spyOn(directedPracticeService, 'get').mockResolvedValue(practice())
        const analysis = vi.spyOn(directedPracticeService, 'analysis')
        renderRoute('/praticas/practice-1')
        expect(await screen.findByText('Questão 1 de 20')).toBeInTheDocument()
        expect(screen.queryByText(/Resposta correta/)).not.toBeInTheDocument()
        expect(analysis).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Questão 20, pendente' }))
        expect(screen.getByRole('button', { name: 'Finalizar prática' })).toBeDisabled()
    })

    it('finaliza com confirmação e mostra estado concluído antes da análise', async () => {
        vi.spyOn(directedPracticeService, 'get').mockResolvedValue(practice(true))
        const finish = vi.spyOn(directedPracticeService, 'finish').mockResolvedValue({
            ...practice(true), status: 'FINALIZADA', finishedAt: '2026-10-16T11:00:00',
        })
        const analysis = vi.spyOn(directedPracticeService, 'analysis')
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderRoute('/praticas/practice-1')
        await screen.findByText('Questão 1 de 20')
        fireEvent.click(screen.getByRole('button', { name: 'Questão 20, respondida' }))
        fireEvent.click(screen.getByRole('button', { name: 'Finalizar prática' }))
        await waitFor(() => expect(finish).toHaveBeenCalledExactlyOnceWith('practice-1'))
        expect(await screen.findByText('Prática finalizada.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ver correção e análise' })).toHaveAttribute('href', '/praticas/practice-1/analise')
        expect(analysis).not.toHaveBeenCalled()
    })

    it('não oferece análise para prática cancelada', async () => {
        vi.spyOn(directedPracticeService, 'list').mockResolvedValue([{
            ...practice(), status: 'CANCELADA', finishedAt: '2026-10-16T11:00:00',
        }])
        renderRoute('/praticas')
        expect(await screen.findByText(/Cancelada ·/)).toBeInTheDocument()
        expect(screen.getByText('Sem análise')).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Ver análise' })).not.toBeInTheDocument()
    })

    it('mostra resumo visual, mapa e correção sob demanda somente na análise final', async () => {
        vi.spyOn(directedPracticeService, 'analysis').mockResolvedValue({
            practiceId: 'practice-1', area: 'MATEMATICA', total: 20, correct: 12, percentage: 60,
            disciplines: [{ name: 'Matemática', discipline: null, total: 20, correct: 12, percentage: 60 }],
            subjects: [{ name: 'Funções', discipline: 'Matemática', total: 20, correct: 12, percentage: 60 }],
            questions: [{ questionId: 'pq-1', position: 1, statement: 'Enunciado 1',
                explanation: 'Explicação histórica', discipline: 'Matemática', subject: 'Funções',
                selectedAlternativeId: 'pa-b', correctAlternativeId: 'pa-a', selectedLetter: 'B',
                correctLetter: 'A', correct: false,
                alternatives: [{ id: 'pa-a', letter: 'A', text: 'Certa' }, { id: 'pa-b', letter: 'B', text: 'Errada' }],
            }, { questionId: 'pq-2', position: 2, statement: 'Enunciado 2',
                explanation: 'Explicação da segunda questão', discipline: 'Matemática', subject: 'Funções',
                selectedAlternativeId: 'pa-c', correctAlternativeId: 'pa-c', selectedLetter: 'C',
                correctLetter: 'C', correct: true,
                alternatives: [{ id: 'pa-c', letter: 'C', text: 'Certa' }],
            }],
        })
        renderRoute('/praticas/practice-1/analise')
        expect(await screen.findByText('Seu resultado')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: '60% de aproveitamento' })).toBeInTheDocument()
        expect(screen.getByText('12', { selector: 'strong' })).toBeInTheDocument()
        expect(screen.getByText('8', { selector: 'strong' })).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Matemática: 12 acertos de 20' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Questão 1: erro' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.queryByText(/Explicação histórica/)).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Ver explicação' }))
        expect(screen.getByText(/Explicação histórica/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Questão 2: acerto' }))
        expect(screen.getByRole('button', { name: 'Questão 2: acerto' })).toHaveAttribute('aria-pressed', 'true')
        expect(screen.getByText('Questão 2 · Funções · Acerto')).toBeInTheDocument()
        expect(screen.queryByText(/Explicação histórica/)).not.toBeInTheDocument()
        fireEvent.click(screen.getByText('Ver desempenho por assunto'))
        expect(screen.getByRole('table')).toHaveTextContent('Funções')
        expect(screen.queryByText(/evolução entre simulados/i)).not.toBeInTheDocument()
    })
})
