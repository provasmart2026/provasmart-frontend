const steps = [
    {
        title: 'Teste o que você sabe',
        description: 'Questões do formato ENEM organizadas por área e nível de dificuldade, para entender o que você precisa dar atenção.',
    },
    {
        title: 'Entenda cada resultado',
        description: 'Veja acertos, tempo de prova e evolução em relatórios fáceis de interpretar.',
    },
    {
        title: 'Escolha o próximo passo',
        description: 'Receba prioridades personalizadas e simulados conforme sua necessidade e concentre energia no que mais gera resultado.',
    },
]

export function HowItWorks() {
    return (
        <section className="how-it-works" id="como-funciona">
            <div className="section-heading centered">
                <span className="eyebrow">Como funciona</span>
                <h2>Da dúvida ao próximo acerto.</h2>
                <p>Na Provasmart, cada simulado vira uma pista para organizar seus estudos.</p>
            </div>
            <ol className="steps-grid">
                {steps.map((step, index) => (
                    <li key={step.title} className={`info-card info-card-${index + 1}`}>
                        <span className="card-number">0{index + 1}</span>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                    </li>
                ))}
            </ol>
        </section>
    )
}
