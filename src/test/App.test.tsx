import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { clearSession, saveSession } from '../services/sessionService'

describe('App', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
        sessionStorage.clear()
        window.history.replaceState(null, '', '/')
    })
    it('exibe a mensagem principal e o CTA da Home', () => {
        render(<App />)
        expect(screen.getByRole('heading', { name: /cada questão conta/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /começar agora/i })).toHaveAttribute('href', '/cadastro')
    })

    it.each([false, true])('Começar agora leva o estudante aos simulados, lembrar=%s', (remember) => {
        saveSession({ token: `header.${btoa(JSON.stringify({ role: 'ESTUDANTE' }))}.signature` }, remember)
        render(<App />)
        expect(screen.getByRole('link', { name: /começar agora/i })).toHaveAttribute('href', '/simulados')
    })

    it('atualiza Começar agora quando a sessão muda', () => {
        render(<App />)
        act(() => {
            saveSession({ token: `header.${btoa(JSON.stringify({ role: 'ESTUDANTE' }))}.signature` }, false)
        })
        expect(screen.getByRole('link', { name: /começar agora/i })).toHaveAttribute('href', '/simulados')
        act(() => clearSession())
        expect(screen.getByRole('link', { name: /começar agora/i })).toHaveAttribute('href', '/cadastro')
    })

    it('Começar agora leva o administrador à gestão de questões', () => {
        saveSession({ token: `header.${btoa(JSON.stringify({ role: 'ADMIN' }))}.signature` }, false)
        render(<App />)
        expect(screen.getByRole('link', { name: /começar agora/i })).toHaveAttribute('href', '/admin/questions')
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
        expect(screen.getByText('Banco de questões').closest('article')?.querySelector('img')).toHaveAttribute(
            'src',
            '/icons/questoes.svg'
        )
    })

    it.each(['Como funciona', 'Recursos'])('o rodapé navega para a seção %s saindo do painel', async (name) => {
        const { api } = await import('../services/api')
        vi.spyOn(api, 'request').mockResolvedValue({ data: [] } as never)
        const scroll = vi.fn()
        const original = Element.prototype.scrollIntoView
        Element.prototype.scrollIntoView = scroll
        try {
            localStorage.setItem('provasmart.token', 'token-de-teste')
            localStorage.setItem('provasmart.role', 'ADMIN')
            window.history.replaceState(null, '', '/admin/questions/new')
            render(<App />)
            fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name }))
            const hash = name === 'Recursos' ? '#recursos' : '#como-funciona'
            await waitFor(() => expect(scroll).toHaveBeenCalled())
            expect(window.location.pathname + window.location.hash).toBe('/' + hash)
            expect(scroll.mock.instances.at(-1)).toBe(document.getElementById(hash.slice(1)))
        } finally {
            Element.prototype.scrollIntoView = original
        }
    })
})
