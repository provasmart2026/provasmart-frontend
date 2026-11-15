import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LegalAcceptancePage } from '../../../pages/legal/LegalAcceptancePage'
import { legalDocumentService } from '../../../services/legalDocumentService'
import { ApiError } from '../../../services/api'
import { PrivacyPage, TermsPage } from '../../../pages/legal/LegalPages'
import fixtures from '../../fixtures/legalDocuments.json'

vi.mock('../../../services/legalDocumentService', () => ({
    legalDocumentService: { acceptanceStatus: vi.fn(), current: vi.fn(), accept: vi.fn() },
}))

function openPage() {
    render(<MemoryRouter initialEntries={['/aceite-documentos']}><Routes>
        <Route path="/aceite-documentos" element={<LegalAcceptancePage />} />
        <Route path="/" element={<p>Sistema disponível</p>} />
        <Route path="/termos-de-uso" element={<TermsPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
    </Routes></MemoryRouter>)
}

describe('aviso de atualização dos documentos', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(legalDocumentService.acceptanceStatus).mockResolvedValue({
            termsAcceptanceRequired: true, privacyAcceptanceRequired: false,
        })
        vi.mocked(legalDocumentService.current).mockImplementation(async type => ({
            id: type, type, version: type === 'TERMOS_DE_USO' ? '1.2' : '1.1',
            effectiveAt: '2026-11-15T00:00:00', createdAt: '2026-11-15T00:00:00',
            title: type === 'TERMOS_DE_USO' ? fixtures.terms.title : fixtures.privacy.title,
            content: type === 'TERMOS_DE_USO' ? fixtures.terms : fixtures.privacy,
        }))
        vi.mocked(legalDocumentService.accept).mockResolvedValue(undefined)
    })

    it('entra diretamente quando os documentos já foram aceitos', async () => {
        vi.mocked(legalDocumentService.acceptanceStatus).mockResolvedValue({
            termsAcceptanceRequired: false, privacyAcceptanceRequired: false,
        })
        openPage()
        expect(await screen.findByText('Sistema disponível')).toBeInTheDocument()
        expect(legalDocumentService.current).not.toHaveBeenCalled()
    })

    it.each([[true, false], [false, true], [true, true]])('mostra atualizações termos=%s política=%s', async (terms, privacy) => {
        vi.mocked(legalDocumentService.acceptanceStatus).mockResolvedValue({
            termsAcceptanceRequired: terms, privacyAcceptanceRequired: privacy,
        })
        openPage()
        const checkbox = await screen.findByRole('checkbox')
        expect(checkbox).not.toBeChecked()
        expect(screen.getAllByText(/novo aceite pendente/)).toHaveLength(Number(terms) + Number(privacy))
        expect(screen.getByRole('button', { name: 'Aceitar e continuar' })).toBeDisabled()
    })

    it('não oferece botão para continuar sem aceitar', async () => {
        openPage()
        await screen.findByRole('checkbox')
        expect(screen.queryByRole('button', { name: 'Continuar sem aceitar agora' })).not.toBeInTheDocument()
        expect(legalDocumentService.accept).not.toHaveBeenCalled()
    })

    it('envia as versões apresentadas somente após confirmação explícita', async () => {
        openPage()
        fireEvent.click(await screen.findByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar e continuar' }))
        expect(await screen.findByText('Sistema disponível')).toBeInTheDocument()
        expect(legalDocumentService.accept).toHaveBeenCalledWith({
            acceptTerms: true, acceptPrivacyPolicy: true, termsVersion: '1.2', privacyVersion: '1.1',
        })
    })

    it('permite tentar carregar novamente quando a consulta falha', async () => {
        vi.mocked(legalDocumentService.acceptanceStatus).mockRejectedValueOnce(new Error('offline'))
        openPage()
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        expect(await screen.findByRole('checkbox')).toBeInTheDocument()
    })

    it('recarrega as versões e exige nova confirmação após conflito', async () => {
        vi.mocked(legalDocumentService.accept).mockRejectedValueOnce(new ApiError(409, 'Atualizados'))
        openPage()
        fireEvent.click(await screen.findByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar e continuar' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('atualizados durante a leitura')
        await waitFor(() => expect(legalDocumentService.acceptanceStatus).toHaveBeenCalledTimes(2))
        expect(await screen.findByRole('checkbox')).not.toBeChecked()
        expect(screen.getByRole('button', { name: 'Aceitar e continuar' })).toBeDisabled()
    })

    it('permite tentar aceitar novamente após falha ao salvar', async () => {
        vi.mocked(legalDocumentService.accept).mockRejectedValueOnce(new Error('offline'))
        openPage()
        fireEvent.click(await screen.findByRole('checkbox'))
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar e continuar' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível registrar')
        expect(screen.getByRole('button', { name: 'Aceitar e continuar' })).toBeEnabled()
    })

    it('permite ler os termos e voltar ao aviso', async () => {
        openPage()
        fireEvent.click(await screen.findByRole('link', { name: 'Ler Termos de Uso' }))
        await screen.findByRole('heading', { name: fixtures.terms.title })
        fireEvent.click(screen.getByRole('link', { name: /voltar/i }))
        expect(await screen.findByRole('checkbox')).toBeInTheDocument()
        expect(legalDocumentService.accept).not.toHaveBeenCalled()
    })
})