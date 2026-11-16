import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {StudentHistoryPage} from '../../../pages/student/StudentHistoryPage'
import {simulationService} from '../../../services/simulationService'
import {directedPracticeService} from '../../../services/directedPracticeService'
import {studyPlanService} from '../../../services/studyPlanService'
import type {Page} from '../../../types/api'
import type {SimulationSummary} from '../../../types/simulation'

vi.mock('../../../services/simulationService', () => ({simulationService: {history: vi.fn()}}))
vi.mock('../../../services/directedPracticeService', () => ({directedPracticeService: {history: vi.fn()}}))
vi.mock('../../../services/studyPlanService', () => ({studyPlanService: {list: vi.fn()}}))

function result<T>(content: T[], overrides = {}): Page<T> {
    return {
        content, totalElements: content.length, totalPages: 1, number: 0, size: 10,
        first: true, last: true, empty: content.length === 0, numberOfElements: content.length, ...overrides
    }
}

const simulation: SimulationSummary = {
    id: 'simulation-1', status: 'FINALIZADO', startedAt: '2026-11-12T10:00:00',
    finishedAt: '2026-11-12T11:00:00', totalQuestions: 40, answeredQuestions: 40,
    correctAnswers: 30, incorrectAnswers: 10, accuracyPercentage: 75,
}

function openHistory(path = '/historico') {
    render(<MemoryRouter initialEntries={[path]}><StudentHistoryPage/></MemoryRouter>)
}

describe('StudentHistoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(simulationService.history).mockResolvedValue(result([simulation]))
        vi.mocked(directedPracticeService.history).mockResolvedValue(result([]))
        vi.mocked(studyPlanService.list).mockResolvedValue(result([]))
    })

    it('mostra o resultado finalizado e mantém cancelados sem link de análise', async () => {
        vi.mocked(simulationService.history).mockResolvedValue(result([
            simulation, {
                ...simulation, id: 'cancelled', status: 'CANCELADO',
                correctAnswers: null, incorrectAnswers: null, accuracyPercentage: null
            },
        ]))
        openHistory()
        expect(await screen.findByText(/75% de aproveitamento/)).toBeInTheDocument()
        expect(screen.getAllByRole('link', {name: 'Ver análise de desempenho'})).toHaveLength(1)
        expect(screen.getByRole('link', {name: 'Ver análise de desempenho'})).toHaveAttribute('href', '/simulados/simulation-1/desempenho')
        expect(screen.getByText('Atividade cancelada, sem resultado de desempenho.')).toBeInTheDocument()
    })

    it('consulta práticas na sua aba e somente planos arquivados na outra', async () => {
        openHistory()
        fireEvent.click(screen.getByRole('link', {name: 'Práticas direcionadas'}))
        await waitFor(() => expect(directedPracticeService.history).toHaveBeenCalledWith(0, 10))
        fireEvent.click(screen.getByRole('link', {name: 'Planos arquivados'}))
        await waitFor(() => expect(studyPlanService.list).toHaveBeenCalledWith(0, 10, 'ARQUIVADO'))
        expect(await screen.findByText('Seus planos aparecerão aqui quando forem arquivados.')).toBeInTheDocument()
    })

    it('pagina no servidor e volta à primeira página ao mudar o tamanho', async () => {
        vi.mocked(simulationService.history).mockResolvedValue(result([simulation], {totalPages: 3, last: false}))
        openHistory()
        fireEvent.click(await screen.findByRole('button', {name: 'Próxima'}))
        await waitFor(() => expect(simulationService.history).toHaveBeenLastCalledWith(1, 10))
        fireEvent.change(screen.getByRole('combobox', {name: 'Registros por página'}), {target: {value: '20'}})
        await waitFor(() => expect(simulationService.history).toHaveBeenLastCalledWith(0, 20))
        fireEvent.change(screen.getByRole('combobox', {name: 'Registros por página'}), {target: {value: '30'}})
        await waitFor(() => expect(simulationService.history).toHaveBeenLastCalledWith(0, 30))
    })

    it('permite tentar novamente após falha', async () => {
        vi.mocked(simulationService.history).mockRejectedValueOnce(new Error('offline'))
        openHistory()
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
        fireEvent.click(screen.getByRole('button', {name: 'Tentar novamente'}))
        expect(await screen.findByText('Simulado geral')).toBeInTheDocument()
    })
})
