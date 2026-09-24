const resources = [
    [
        'simulados',
        'Simulados completos',
        'Provas por área ou no formato completo do ENEM.',
    ],
    [
        'desempenho',
        'Análise de desempenho',
        'Relatórios claros para acompanhar sua evolução.',
    ],
    [
        'plano',
        'Plano inteligente',
        'Recomendações baseadas nas suas maiores dificuldades.',
    ],
    [
        'questoes',
        'Banco de questões',
        'Questões comentadas e filtradas por tema.',
    ],
    [
        'metas',
        'Metas semanais',
        'Organize sua rotina e mantenha a constância.',
    ],
    [
        'progresso',
        'Progresso contínuo',
        'Compare resultados e celebre cada conquista.',
    ],
]

export function Resources() {
    return (
        <section className="resources" id="recursos">
            <div className="section-heading centered">
                <span className="eyebrow">Recursos</span>
                <h2>Tudo que você precisa para evoluir</h2>
                <p>Ferramentas que unem prática, análise e direção para uma preparação mais eficiente.</p>
            </div>
            <div className="resources-grid">
                {resources.map(([icon, title, description]) => (
                    <article className="resource-card" key={title}>
                        <span className="icon-box"><img src={`/icons/${icon}.svg`} alt=""/></span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
