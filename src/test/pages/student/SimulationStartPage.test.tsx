import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../App'
import { simulationService } from '../../../services/simulationService'
import { ApiError } from '../../../services/api'
import type { Simulation } from '../../../types/simulation'

const simulation: Simulation = {
    id: 'created-simulation',
    studentId: 'student-from-response',
    status: 'EM_ANDAMENTO',
    startedAt: '2026-09-13T12:00:00',
    finishedAt: null,
    questions: [],
}

describe('Fluxo inicial do simulado', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        localStorage.setItem('provasmart.token', 'token-de-teste')
        localStorage.setItem('provasmart.role', 'ESTUDANTE')
        vi.spyOn(simulationService, 'get').mockResolvedValue(simulation)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
        sessionStorage.clear()
        window.history.replaceState(null, '', '/')
    })

    it('acessa pelo Header, bloqueia cliques repetidos e redireciona com o ID retornado', async () => {
        let resolve!: (value: Simulation) => void
        const create = vi.spyOn(simulationService, 'create').mockReturnValue(
            new Promise<Simulation>((done) => {
                resolve = done
            })
        )
        render(<App />)
        const header = within(screen.getByRole('banner'))
        const link = header.getByRole('link', { name: 'Simulados' })
        expect(header.getByRole('link', { name: 'Início' }).nextElementSibling).toBe(link)
        fireEvent.click(link)
        expect(window.location.pathname).toBe('/simulados')
        expect(screen.getByRole('heading', { name: 'Simulado' })).toBeInTheDocument()
        expect(screen.getByText(/40 questões, com 10 questões de cada área do ENEM/)).toBeInTheDocument()
        const button = screen.getByRole('button', { name: 'Iniciar simulado' })
        fireEvent.click(button)
        expect(screen.getByRole('button', { name: 'Criando simulado...' })).toBeDisabled()
        fireEvent.click(button)
        expect(create).toHaveBeenCalledExactlyOnceWith()
        await act(async () => resolve(simulation))
        expect(window.location.pathname).toBe(`/simulados/${simulation.id}`)
        expect(simulationService.get).toHaveBeenCalledWith(simulation.id)
    })

    it('permite tentar novamente quando a criação falha', async () => {
        const create = vi
            .spyOn(simulationService, 'create')
            .mockRejectedValueOnce(new Error('Falha'))
            .mockResolvedValueOnce(simulation)
        window.history.replaceState(null, '', '/simulados')
        render(<App />)
        fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível criar o simulado.')
        expect(window.location.pathname).toBe('/simulados')
        const button = screen.getByRole('button', { name: 'Iniciar simulado' })
        expect(button).toBeEnabled()
        fireEvent.click(button)
        await waitFor(() => expect(window.location.pathname).toBe(`/simulados/${simulation.id}`))
        expect(create).toHaveBeenCalledTimes(2)
    })

    it('informa conflito sem buscar ou navegar para outro simulado', async () => {
        vi.spyOn(simulationService, 'create').mockRejectedValue(new ApiError(409, 'detalhe interno'))
        window.history.replaceState(null, '', '/simulados')
        render(<App />)
        fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('Você já possui um simulado em andamento.')
        expect(screen.getByRole('button', { name: 'Iniciar simulado' })).toBeEnabled()
        expect(window.location.pathname).toBe('/simulados')
        expect(simulationService.get).not.toHaveBeenCalled()
    })

    it('não redireciona quando o aluno sai da página durante a criação', async () => {
        let resolve!: (value: Simulation) => void
        vi.spyOn(simulationService, 'create').mockReturnValue(
            new Promise<Simulation>((done) => {
                resolve = done
            })
        )
        window.history.replaceState(null, '', '/simulados')
        render(<App />)
        fireEvent.click(screen.getByRole('button', { name: 'Iniciar simulado' }))
        fireEvent.click(within(screen.getByRole('banner')).getByRole('link', { name: 'Início' }))
        await act(async () => resolve(simulation))
        expect(window.location.pathname).toBe('/')
    })
})
