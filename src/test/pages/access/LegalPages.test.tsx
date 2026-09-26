import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PrivacyPage, TermsPage } from '../../../pages/access/LegalPages'

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
