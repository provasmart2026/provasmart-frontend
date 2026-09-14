import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {simulationsApi} from '../../../api/simulations'
import type {Simulation} from '../../../types/simulation'
import {SimulationPage} from './SimulationPage'

function fixture(answered = false): Simulation {
    return {
        id: 'simulation-1', studentId: 'student-1', status: 'EM_ANDAMENTO',
        startedAt: '2026-09-13T12:00:00', finishedAt: null,
        questions: Array.from({length: 40}, (_, index) => ({
            id: `sq-${index + 1}`, questionId: `q-${index + 1}`, position: index + 1,
            statement: `Enunciado ${index + 1}`,
            alternatives: ['E', 'D', 'C', 'B', 'A'].map(letter => ({
                id: `${index + 1}-${letter}`, letter, text: `Alternativa ${letter}`,
            })),
            selectedAlternativeId: answered ? `${index + 1}-A` : null,
        })).reverse(),
    }
}

function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>(done => { resolve = done })
    return {promise, resolve}
}

function renderPage() {
    render(<MemoryRouter initialEntries={['/simulados/simulation-1']}>
        <Routes><Route path="/simulados/:simulationId" element={<SimulationPage/>}/></Routes>
    </MemoryRouter>)
}

async function open(simulation = fixture()) {
    vi.spyOn(simulationsApi, 'get').mockResolvedValue(simulation)
    renderPage()
    await screen.findByText('Questão 1 de 40')
}

function lastQuestion() {
    for (let index = 1; index < 40; index++) fireEvent.click(screen.getByRole('button', {name: 'Próxima'}))
}

describe('Execução do simulado', () => {
    afterEach(() => vi.restoreAllMocks())

    it('carrega pelo ID da rota e ordena questões e alternativas', async () => {
        const request = deferred<Simulation>()
        const get = vi.spyOn(simulationsApi, 'get').mockReturnValue(request.promise)
        renderPage()
        expect(screen.getByRole('status')).toHaveTextContent('Carregando simulado...')
        expect(get).toHaveBeenCalledExactlyOnceWith('simulation-1')
        await act(async () => request.resolve(fixture()))
        expect(screen.getByText('Questão 1 de 40')).toBeInTheDocument()
        expect(screen.getByRole('group', {name: 'Enunciado 1'})).toBeInTheDocument()
        expect(screen.getAllByRole('radio').map(input => input.getAttribute('value'))).toEqual(['1-A', '1-B', '1-C', '1-D', '1-E'])
        expect(screen.getByRole('button', {name: 'Anterior'})).toBeDisabled()
    })

    it('exibe erro quando o carregamento falha', async () => {
        vi.spyOn(simulationsApi, 'get').mockRejectedValue(new Error('Falha'))
        renderPage()
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o simulado.')
        expect(screen.queryByText('Carregando simulado...')).not.toBeInTheDocument()
    })

    it('envia o ID de SimulationQuestion, bloqueia envios simultâneos e mantém a resposta ao voltar', async () => {
        await open()
        const request = deferred<Simulation>()
        const answer = vi.spyOn(simulationsApi, 'answer').mockReturnValue(request.promise)
        fireEvent.click(screen.getByText('Alternativa B'))
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
        expect(screen.getByText('Alternativa B').closest('label')).toHaveClass('is-selected')
        expect(answer).toHaveBeenCalledExactlyOnceWith('simulation-1', 'sq-1', '1-B')
        expect(screen.getByText('Salvando resposta...')).toBeInTheDocument()
        const other = screen.getByRole('radio', {name: 'C Alternativa C'})
        expect(other).toBeEnabled()
        fireEvent.click(screen.getByRole('radio', {name: 'B Alternativa B'}))
        expect(answer).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('button', {name: 'Próxima'})).toBeDisabled()
        const updated = fixture()
        updated.questions.find(question => question.id === 'sq-1')!.selectedAlternativeId = '1-B'
        await act(async () => request.resolve(updated))
        expect(screen.getByText('Questão 1 de 40')).toBeInTheDocument()
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
        fireEvent.click(screen.getByRole('button', {name: 'Próxima'}))
        expect(screen.getByRole('group', {name: 'Enunciado 2'})).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', {name: 'Anterior'}))
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
    })

    it('troca imediatamente e salva a escolha mais recente sem requisições simultâneas', async () => {
        await open(fixture(true))
        const first = deferred<Simulation>()
        const last = deferred<Simulation>()
        const answer = vi.spyOn(simulationsApi, 'answer')
            .mockReturnValueOnce(first.promise).mockReturnValueOnce(last.promise)
        fireEvent.click(screen.getByText('Alternativa B'))
        fireEvent.click(screen.getByText('Alternativa C'))
        fireEvent.click(screen.getByText('Alternativa D'))
        expect(screen.getByRole('radio', {name: 'D Alternativa D'})).toBeChecked()
        expect(screen.getAllByRole('radio').filter(input => (input as HTMLInputElement).checked)).toHaveLength(1)
        expect(document.querySelectorAll('.simulation-alternative.is-selected')).toHaveLength(1)
        expect(answer).toHaveBeenCalledTimes(1)
        const updated = fixture(true)
        updated.questions.find(question => question.id === 'sq-1')!.selectedAlternativeId = '1-B'
        await act(async () => first.resolve(updated))
        expect(answer).toHaveBeenNthCalledWith(2, 'simulation-1', 'sq-1', '1-D')
        expect(screen.getByRole('radio', {name: 'D Alternativa D'})).toBeChecked()
        const final = fixture(true)
        final.questions.find(question => question.id === 'sq-1')!.selectedAlternativeId = '1-D'
        await act(async () => last.resolve(final))
        expect(screen.getByRole('radio', {name: 'D Alternativa D'})).toBeChecked()
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).not.toBeChecked()
        expect(screen.getByRole('button', {name: 'Próxima'})).toBeEnabled()
    })

    it('não volta à alternativa anterior quando o salvamento retorna uma seleção desatualizada', async () => {
        await open(fixture(true))
        const refresh = deferred<Simulation>()
        vi.mocked(simulationsApi.get).mockReturnValueOnce(refresh.promise)
        const answer = vi.spyOn(simulationsApi, 'answer').mockResolvedValue(fixture(true))
        fireEvent.click(screen.getByText('Alternativa B'))
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
        await act(async () => {})
        expect(simulationsApi.get).toHaveBeenCalledTimes(2)
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
        expect(screen.getByRole('radio', {name: 'A Alternativa A'})).not.toBeChecked()
        const confirmed = fixture(true)
        confirmed.questions.find(question => question.id === 'sq-1')!.selectedAlternativeId = '1-B'
        await act(async () => refresh.resolve(confirmed))
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
        expect(answer).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByRole('button', {name: 'Próxima'}))
        fireEvent.click(screen.getByRole('button', {name: 'Anterior'}))
        expect(screen.getByRole('radio', {name: 'B Alternativa B'})).toBeChecked()
    })

    it('preserva a resposta salva quando uma alteração falha e permite tentar novamente', async () => {
        await open(fixture(true))
        const answer = vi.spyOn(simulationsApi, 'answer').mockRejectedValueOnce(new Error('Falha')).mockResolvedValueOnce(fixture(true))
        fireEvent.click(screen.getByRole('radio', {name: 'B Alternativa B'}))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar a resposta.')
        expect(screen.getByRole('radio', {name: 'A Alternativa A'})).toBeChecked()
        fireEvent.click(screen.getByRole('radio', {name: 'B Alternativa B'}))
        await act(async () => {})
        expect(answer).toHaveBeenCalledTimes(2)
    })

    it('bloqueia a finalização e informa o total exato de questões pendentes', async () => {
        const simulation = fixture(true)
        simulation.questions[0].selectedAlternativeId = null
        simulation.questions[12].selectedAlternativeId = null
        const finish = vi.spyOn(simulationsApi, 'finish')
        await open(simulation)
        lastQuestion()
        expect(screen.queryByRole('button', {name: 'Próxima'})).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', {name: 'Finalizar simulado'}))
        expect(screen.getByRole('alert')).toHaveTextContent('2 questões não respondidas')
        expect(finish).not.toHaveBeenCalled()
    })

    it('finaliza com 40 respostas, bloqueia repetição e exibe sucesso', async () => {
        const simulation = fixture(true)
        const request = deferred<Simulation>()
        const finish = vi.spyOn(simulationsApi, 'finish').mockReturnValue(request.promise)
        await open(simulation)
        lastQuestion()
        fireEvent.click(screen.getByRole('button', {name: 'Finalizar simulado'}))
        const button = screen.getByRole('button', {name: 'Finalizando...'})
        expect(button).toBeDisabled()
        fireEvent.click(button)
        expect(finish).toHaveBeenCalledExactlyOnceWith('simulation-1')
        await act(async () => request.resolve({...simulation, status: 'FINALIZADO', finishedAt: '2026-09-13T13:00:00'}))
        expect(screen.getByRole('status')).toHaveTextContent('Simulado finalizado com sucesso.')
        expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    })

    it('permite repetir a finalização após falha', async () => {
        const finish = vi.spyOn(simulationsApi, 'finish').mockRejectedValue(new Error('Falha'))
        await open(fixture(true))
        lastQuestion()
        fireEvent.click(screen.getByRole('button', {name: 'Finalizar simulado'}))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível finalizar o simulado.')
        expect(screen.getByRole('button', {name: 'Finalizar simulado'})).toBeEnabled()
        expect(finish).toHaveBeenCalledTimes(1)
    })

    it('exibe um simulado já finalizado sem permitir responder novamente', async () => {
        vi.spyOn(simulationsApi, 'get').mockResolvedValue({...fixture(true), status: 'FINALIZADO'})
        renderPage()
        expect(await screen.findByText('Simulado finalizado com sucesso.')).toBeInTheDocument()
        expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    })
})
