import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {simulationsApi} from '../../../api/simulations'
import {TEMPORARY_STUDENT_ID} from '../../../constants/student'
import './SimulationsPage.css'

export function SimulationStartPage() {
    const navigate = useNavigate()
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const mounted = useRef(false)
    const pending = useRef(false)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    async function startSimulation() {
        if (pending.current) return
        pending.current = true
        setCreating(true)
        setError(null)
        try {
            const simulation = await simulationsApi.create(TEMPORARY_STUDENT_ID)
            if (mounted.current) navigate(`/simulados/${encodeURIComponent(simulation.id)}`)
        } catch {
            if (mounted.current) setError('Não foi possível criar o simulado. Tente novamente.')
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
                <p className="supporting-copy">Reserve um momento para se concentrar e dar o próximo passo na sua preparação.</p>
                {error && <p role="alert">{error}</p>}
                <button className="primary-button" type="button" disabled={creating}
                        onClick={startSimulation}>
                    <span role="status">{creating ? 'Criando simulado...' : 'Iniciar simulado'}</span>
                </button>
            </div>
        </section>
    )
}
