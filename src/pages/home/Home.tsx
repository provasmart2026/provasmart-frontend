import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { StudyJourney } from '../../components/StudyJourney'
import { HowItWorks } from './HowItWorks'
import { Resources } from './Resources'
import { SignUpCallout } from './SignUpCallout'

export function Home() {
    const location = useLocation()

    useEffect(() => {
        if (location.hash === '#como-funciona' || location.hash === '#recursos') {
            document.getElementById(location.hash.slice(1))?.scrollIntoView()
        }
    }, [location])

    return (
        <>
            <section className="hero" id="inicio">
                <div className="hero-copy">
                    <span className="badge">ENEM • UM PASSO DE CADA VEZ</span>
                    <h1>
                        Cada questão conta.
                        <br />
                        Seu próximo passo também.
                    </h1>
                    <p className="lead">
                        Pratique com simulados, entenda seus erros e descubra o que revisar. Uma preparação que
                        acompanha o seu ritmo.
                    </p>
                    <Link className="primary-button" to="/cadastro">
                        Começar agora
                    </Link>
                    <p className="supporting-copy">Comece de onde você está. A gente ajuda no próximo passo.</p>
                </div>
                <StudyJourney />
            </section>
            <HowItWorks />
            <Resources />
            <SignUpCallout />
        </>
    )
}
