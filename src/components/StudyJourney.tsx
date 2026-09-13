const steps = [
  ['Diagnóstico inicial', 'Descubra seus pontos fortes e desafios.'],
  ['Plano personalizado', 'Organize matérias e metas semanais.'],
  ['Evolução contínua', 'Ajuste o foco conforme você avança.'],
]

export function StudyJourney() {
  return (
    <aside className="study-card" aria-label="Jornada de preparação">
      <span className="eyebrow">Seu caderno de estudos</span>
      <h2>Hoje, um pouco mais perto.</h2>
      <p>Uma questão resolvida. Um conteúdo entendido.<br />É assim que a sua preparação avança.</p>
      <ol>
        {steps.map(([title, description], index) => (
          <li key={title}>
            <span className={`step-number step-${index + 1}`}>{index + 1}</span>
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
