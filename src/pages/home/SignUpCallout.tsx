import { Link } from 'react-router-dom'

export function SignUpCallout() {
    return (
        <section className="signup-wrap" id="criar-conta">
            <div className="signup-panel">
                <div>
                    <h2>
                        Seu próximo acerto
                        <br />
                        começa aqui.
                    </h2>
                    <p>
                        Abra espaço para uma preparação que cabe na sua rotina. Crie sua conta e comece pelo primeiro
                        simulado.
                    </p>
                </div>
                <Link className="primary-button" to="/cadastro">
                    Criar minha conta
                </Link>
            </div>
        </section>
    )
}
