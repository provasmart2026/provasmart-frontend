import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { simulationService } from '../../services/simulationService'
import { ApiError } from '../../services/api'
import type { Simulation } from '../../types/simulation'
import './SimulationsPage.css'

export function SimulationStartPage() {
    const navigate = useNavigate()
    const { state }: { state: unknown } = useLocation()
    const simulationCancelled =
        typeof state === 'object' && state !== null && 'simulationCancelled' in state && state.simulationCancelled === true
    const [creating, setCreating] = useState(false)
    const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadFailed, setLoadFailed] = useState(false)
    const [cancelling, setCancelling] = useState(false)
    const [success, setSuccess] = useState(simulationCancelled)
    const [error, setError] = useState<string | null>(null)
    const mounted = useRef(false)
    const pending = useRef(false)

    useEffect(() => {
        mounted.current = true
        let active = true
        void loadCurrent(() => active)
        return () => {
            active = false
            mounted.current = false
        }
    }, [])

    async function loadCurrent(isActive = () => mounted.current) {
        setLoading(true)
        setLoadFailed(false)
        setError(null)
        try {
            const simulation = await simulationService.current()
            if (isActive()) setCurrentSimulation(simulation)
        } catch (error) {
            if (isActive()) {
                setLoadFailed(true)
                setError(error instanceof ApiError && error.backendMessage
                    ? error.backendMessage : 'Não foi possível consultar o simulado em andamento. Tente novamente.')
            }
        } finally {
            if (isActive()) setLoading(false)
        }
    }

    async function cancelSimulation() {
        if (!currentSimulation || pending.current) return
        if (!window.confirm('Tem certeza que deseja cancelar este simulado? Após o cancelamento, ele não poderá ser retomado.')) return
        pending.current = true
        setCancelling(true)
        setError(null)
        setSuccess(false)
        try {
            await simulationService.cancel(currentSimulation.id)
            if (mounted.current) {
                setCurrentSimulation(null)
                setSuccess(true)
            }
        } catch (error) {
            if (mounted.current)
                setError(error instanceof ApiError && error.backendMessage
                    ? error.backendMessage : 'Não foi possível cancelar o simulado. Tente novamente.')
        } finally {
            pending.current = false
            if (mounted.current) setCancelling(false)
        }
    }

    async function startSimulation() {
        if (pending.current || loading || loadFailed || currentSimulation) return
        pending.current = true
        setCreating(true)
        setError(null)
        try {
            const simulation = await simulationService.create()
            if (mounted.current) navigate(`/simulados/${encodeURIComponent(simulation.id)}`)
        } catch (error) {
            if (mounted.current)
                setError(
                    error instanceof ApiError && error.status === 409
                        ? 'Você já possui um simulado em andamento.'
                        : 'Não foi possível criar o simulado. Tente novamente.'
                )
        } finally {
            pending.current = false
            if (mounted.current) setCreating(false)
        }
    }

    return (
        <section className="student-simulations" aria-labelledby="simulation-start-title">
            <div className="hero-copy">
                <span className="badge">ENEM • UM PASSO DE CADA VEZ</span>
                <h1 id="simulation-start-title">Simulado</h1>
                <p className="lead">Pratique com um simulado de 40 questões, com 10 questões de cada área do ENEM.</p>
            </div>
            <div className="simulation-panel">
                {success && <p role="status">Simulado cancelado com sucesso.</p>}
                <p className="supporting-copy">
                    Reserve um momento para se concentrar e dar o próximo passo na sua preparação.
                </p>
                {error && <p role="alert">{error}</p>}
                {loading ? <p role="status">Consultando simulado em andamento...</p> : loadFailed ? (
                    <button className="simulation-secondary-button" type="button" onClick={() => void loadCurrent()}>
                        Tentar novamente
                    </button>
                ) : currentSimulation ? (
                    <>
                        <p className="supporting-copy">
                            Você possui um simulado em andamento. {currentSimulation.questions.filter(question => question.selectedAlternativeId).length} de {currentSimulation.questions.length} questões respondidas.
                        </p>
                        <div className="simulation-navigation">
                            <button className="primary-button" type="button" disabled={cancelling}
                                onClick={() => navigate(`/simulados/${encodeURIComponent(currentSimulation.id)}`)}>
                                Continuar simulado
                            </button>
                            <button className="simulation-secondary-button" type="button" disabled={cancelling}
                                onClick={() => void cancelSimulation()}>
                                {cancelling ? 'Cancelando simulado...' : 'Cancelar simulado'}
                            </button>
                        </div>
                    </>
                ) : <button className="primary-button" type="button" disabled={creating} onClick={startSimulation}>
                    <span role="status">{creating ? 'Criando simulado...' : 'Iniciar simulado'}</span>
                </button>}
            </div>
        </section>
    )
}
