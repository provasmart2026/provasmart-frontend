import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('exibe a mensagem principal e o CTA da Home', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /cada questão conta/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /começar agora/i })).toBeInTheDocument()
  })

  it('exibe as três etapas da jornada', () => {
    render(<App />)
    expect(screen.getByText('Diagnóstico inicial')).toBeInTheDocument()
    expect(screen.getByText('Plano personalizado')).toBeInTheDocument()
    expect(screen.getByText('Evolução contínua')).toBeInTheDocument()
  })

  it('renderiza todas as seções definidas no protótipo', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Da dúvida ao próximo acerto.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tudo que você precisa para evoluir' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /seu próximo acertocomeça aqui/i })).toBeInTheDocument()
    expect(screen.getByText('© 2026 Provasmart. Cada questão conta.')).toBeInTheDocument()
  })

  it('mantém os seis recursos do protótipo disponíveis', () => {
    render(<App />)
    expect(screen.getByText('Simulados completos')).toBeInTheDocument()
    expect(screen.getByText('Análise de desempenho')).toBeInTheDocument()
    expect(screen.getByText('Plano inteligente')).toBeInTheDocument()
    expect(screen.getByText('Banco de questões')).toBeInTheDocument()
    expect(screen.getByText('Metas semanais')).toBeInTheDocument()
    expect(screen.getByText('Progresso contínuo')).toBeInTheDocument()
  })
})
