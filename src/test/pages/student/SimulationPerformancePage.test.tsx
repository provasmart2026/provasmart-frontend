import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { SimulationPerformancePage } from '../../../pages/student/SimulationPerformancePage'
import { simulationService } from '../../../services/simulationService'

afterEach(() => vi.restoreAllMocks())

it('exibe a correção mesmo quando a análise agregada de um simulado antigo está indisponível', async () => {
    vi.spyOn(simulationService, 'performance').mockRejectedValue(new Error('Análise indisponível'))
    const question = {
        simulationQuestionId: 'sq-1',
        position: 1,
        statement: 'Enunciado',
        explanation: 'Explicação da primeira questão',
        selectedAlternativeId: 'b',
        correctAlternativeId: 'a',
        isCorrect: false,
        alternatives: [{ id: 'a', letter: 'A', text: 'Primeira alternativa' }, { id: 'b', letter: 'B', text: 'Segunda alternativa' }],
    }
    const correction = vi.spyOn(simulationService, 'correction').mockResolvedValue([
        { ...question, simulationQuestionId: 'sq-2', position: 2, correctAlternativeId: null, isCorrect: null },
        question,
    ])

    render(
        <MemoryRouter initialEntries={['/simulados/sim-1/desempenho']}>
            <Routes>
                <Route path="/simulados/:simulationId/desempenho" element={<SimulationPerformancePage />} />
            </Routes>
        </MemoryRouter>
    )

    const map = within(await screen.findByRole('region', { name: 'Mapa das questões' }))
    expect(correction).toHaveBeenCalledWith('sim-1')
    expect(map.getAllByRole('button').slice(0, 2).map(button => button.textContent)).toEqual(['1', '2'])
    expect(map.getByRole('button', { name: 'Questão 1: erro' })).toHaveAttribute('aria-pressed', 'true')
    expect(map.getByText('Sua resposta B · correta A')).toBeInTheDocument()
    fireEvent.click(map.getByRole('button', { name: 'Ver explicação' }))
    expect(map.getByText(/Explicação da primeira questão/)).toBeInTheDocument()

    fireEvent.click(map.getByRole('button', { name: 'Questão 2: resultado indisponível' }))
    expect(map.getByText(/gabarito indisponível/)).toBeInTheDocument()
})
