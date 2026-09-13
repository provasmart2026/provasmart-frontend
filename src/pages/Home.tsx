import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { StudyJourney } from '../components/StudyJourney'
import { HowItWorks } from '../components/HowItWorks'
import { Resources } from '../components/Resources'
import { SignUpCallout } from '../components/SignUpCallout'

export function Home() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#como-funciona' || location.hash === '#recursos') {
      document.getElementById(location.hash.slice(1))?.scrollIntoView()
    }
  }, [location])

  return <>
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <span className="badge">ENEM • UM PASSO DE CADA VEZ</span>
        <h1>Cada questão conta.<br />Seu próximo passo também.</h1>
        <p className="lead">Pratique com simulados, entenda seus erros e descubra o que revisar. Uma preparação que acompanha o seu ritmo.</p>
        <a className="primary-button" href="#comecar">Começar agora</a>
        <p className="supporting-copy">Comece de onde você está. A gente ajuda no próximo passo.</p>
      </div>
      <StudyJourney />
    </section>
    <HowItWorks />
    <Resources />
    <SignUpCallout />
  </>
}
