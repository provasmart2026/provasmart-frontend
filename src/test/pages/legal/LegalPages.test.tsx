import { Footer } from '../../../layouts/Footer'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrivacyPage, TermsPage } from '../../../pages/legal/LegalPages'

describe('documentos legais', () => {
    it('mantém os documentos legais disponíveis em rotas próprias', () => {
        const { unmount } = render(
            <MemoryRouter>
                <TermsPage />
            </MemoryRouter>
        )
        expect(screen.getByRole('heading', { name: 'Termos de Uso do ProvaSmart' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '6. VLibras e acessibilidade' })).toBeInTheDocument()
        unmount()

        render(
            <MemoryRouter>
                <PrivacyPage />
            </MemoryRouter>
        )
        expect(screen.getByRole('heading', { name: 'Política de Privacidade do ProvaSmart' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '12. Direitos do titular' })).toBeInTheDocument()
    })
})


describe('retorno dos documentos legais', () => {
    it.each(['/cadastro', '/profile', '/simulados?pagina=2'])('retorna à origem %s mesmo após trocar de documento', (origin) => {
        render(
            <MemoryRouter initialEntries={[origin]}>
                <Routes>
                    <Route path="/termos-de-uso" element={<TermsPage />} />
                    <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
                    <Route path="*" element={<p>Página de origem</p>} />
                </Routes>
                <Footer />
            </MemoryRouter>
        )
        fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Termos de uso' }))
        expect(screen.getByRole('link', { name: '← Voltar' })).toHaveAttribute('href', origin)
        fireEvent.click(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Política de privacidade' }))
        expect(screen.getByRole('link', { name: '← Voltar' })).toHaveAttribute('href', origin)
        fireEvent.click(screen.getByRole('link', { name: '← Voltar' }))
        expect(screen.getByText('Página de origem')).toBeInTheDocument()
    })

    it.each(['/termos-de-uso', '/politica-de-privacidade'])('oferece o início ao abrir %s diretamente', (path) => {
        render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/termos-de-uso" element={<TermsPage />} />
                    <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByRole('link', { name: '← Voltar' })).toHaveAttribute('href', '/')
    })
})
