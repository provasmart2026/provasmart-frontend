import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SimulationPage } from '../../../pages/student/SimulationPage'
import { DirectedPracticePage } from '../../../pages/student/DirectedPracticePage'
import { simulationService } from '../../../services/simulationService'
import { directedPracticeService } from '../../../services/directedPracticeService'
import { questionReportService } from '../../../services/questionReportService'
import type { Simulation } from '../../../types/simulation'
import type { DirectedPractice } from '../../../types/directedPractice'

vi.mock('../../../services/simulationService', () => ({ simulationService: { get: vi.fn() } }))
vi.mock('../../../services/directedPracticeService', () => ({ directedPracticeService: { get: vi.fn() } }))
vi.mock('../../../services/questionReportService', () => ({ questionReportService: { create: vi.fn() } }))

const question = {
    id: 'activity-question', questionId: 'original-question', position: 1,
    statement: 'Enunciado de teste', discipline: 'Matemática', subject: 'Álgebra',
    alternatives: [{ id: 'alternative-a', letter: 'A', text: 'Alternativa marcada' }],
    selectedAlternativeId: 'alternative-a',
}

function open(practice: boolean) {
    const path = practice ? '/praticas/activity' : '/simulados/activity'
    render(<MemoryRouter initialEntries={[path]}><Routes>
        <Route path="/simulados/:simulationId" element={<SimulationPage />} />
        <Route path="/praticas/:practiceId" element={<DirectedPracticePage />} />
    </Routes></MemoryRouter>)
}

function simulation(status: Simulation['status'] = 'EM_ANDAMENTO'): Simulation {
    return { id: 'activity', studentId: 'student', status, startedAt: '2026-11-15T12:00:00',
        finishedAt: null, questions: [question] }
}

function practice(status: DirectedPractice['status'] = 'EM_ANDAMENTO'): DirectedPractice {
    return { id: 'activity', sourceSimulationId: null, area: 'MATEMATICA', status,
        startedAt: '2026-11-15T12:00:00', finishedAt: null, questions: [question] }
}

describe('reporte nas atividades do estudante', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(simulationService.get).mockResolvedValue(simulation())
        vi.mocked(directedPracticeService.get).mockResolvedValue(practice())
        vi.mocked(questionReportService.create).mockResolvedValue({} as never)
    })

    it.each([false, true])('preserva a resposta e a questão ao reportar, prática=%s', async isPractice => {
        open(isPractice)
        fireEvent.click(await screen.findByRole('button', { name: 'Reportar problema' }))
        expect(screen.getByRole('radio')).toBeChecked()
        fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'OUTRO' } })
        fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: 'Descrição do problema' } })
        fireEvent.submit(screen.getByRole('form', { name: 'Reportar problema na questão' }))
        expect(await screen.findByText('Reporte enviado. Obrigado por avisar!')).toBeInTheDocument()
        expect(screen.getByRole('radio')).toBeChecked()
        expect(screen.getByText('Questão 1 de 1')).toBeInTheDocument()
        expect(questionReportService.create).toHaveBeenCalledWith(isPractice ? 'PRATICA_DIRECIONADA' : 'SIMULADO',
            'activity', 'activity-question', { reason: 'OUTRO', description: 'Descrição do problema' })
    })

    it.each(['FINALIZADO', 'CANCELADO'] as const)('não oferece reporte em simulado %s', async status => {
        vi.mocked(simulationService.get).mockResolvedValue(simulation(status))
        open(false)
        await screen.findByText(status === 'FINALIZADO' ? 'Simulado finalizado com sucesso.' : 'Este simulado foi cancelado e não pode ser retomado.')
        expect(screen.queryByRole('button', { name: 'Reportar problema' })).not.toBeInTheDocument()
    })

    it.each(['FINALIZADA', 'CANCELADA'] as const)('não oferece reporte em prática %s', async status => {
        vi.mocked(directedPracticeService.get).mockResolvedValue(practice(status))
        open(true)
        if (status === 'FINALIZADA') await screen.findByText('Prática finalizada.')
        else await screen.findByText(/Esta prática foi cancelada/)
        expect(screen.queryByRole('button', { name: 'Reportar problema' })).not.toBeInTheDocument()
    })
})
