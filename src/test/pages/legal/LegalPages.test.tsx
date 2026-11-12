import { Footer } from '../../../layouts/Footer'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PrivacyPage, TermsPage } from '../../../pages/legal/LegalPages'
import fixtures from '../../fixtures/legalDocuments.json'
import { legalDocumentService } from '../../../services/legalDocumentService'

vi.mock('../../../services/legalDocumentService', () => ({ legalDocumentService: { current: vi.fn() } }))
beforeEach(() => {
    vi.mocked(legalDocumentService.current).mockImplementation(async type => ({
        id: type, type, version: '1.1', effectiveAt: '2026-11-11T00:00:00', createdAt: '2026-11-11T00:00:00',
        title: type === 'TERMOS_DE_USO' ? fixtures.terms.title : fixtures.privacy.title,
        content: type === 'TERMOS_DE_USO' ? fixtures.terms : fixtures.privacy,
    }))
})

describe('documentos legais', () => {
    it('oferece nova tentativa após falha no carregamento', async () => {
        vi.mocked(legalDocumentService.current).mockRejectedValueOnce(new Error('indisponível'))
        render(<MemoryRouter><TermsPage /></MemoryRouter>)
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar o documento')
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        expect(await screen.findByRole('heading', { name: '6. VLibras e acessibilidade' })).toBeInTheDocument()
    })

    it('mantém os documentos legais disponíveis em rotas próprias', async () => {
        const { unmount } = render(
            <MemoryRouter>
                <TermsPage />
            </MemoryRouter>
        )
        expect(screen.getByRole('heading', { name: 'Termos de Uso do ProvaSmart' })).toBeInTheDocument()
        expect(await screen.findByRole('heading', { name: '6. VLibras e acessibilidade' })).toBeInTheDocument()
        unmount()

        render(
            <MemoryRouter>
                <PrivacyPage />
            </MemoryRouter>
        )
        expect(screen.getByRole('heading', { name: 'Política de Privacidade do ProvaSmart' })).toBeInTheDocument()
        expect(await screen.findByRole('heading', { name: '12. Direitos do titular' })).toBeInTheDocument()
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
