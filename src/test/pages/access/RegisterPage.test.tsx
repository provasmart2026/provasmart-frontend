import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RegisterPage } from '../../../pages/access/RegisterPage'
import fixtures from '../../fixtures/legalDocuments.json'
import { legalDocumentService } from '../../../services/legalDocumentService'
import { ApiError } from '../../../services/api'

const auth = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('../../../services/authService', () => ({ authService: auth }))
vi.mock('../../../services/legalDocumentService', () => ({ legalDocumentService: { current: vi.fn() } }))

describe('cadastro', () => {
    it('bloqueia cadastro quando a consulta dos documentos falha e permite tentar novamente', async () => {
        vi.mocked(legalDocumentService.current).mockRejectedValueOnce(new Error('indisponível'))
        render(<MemoryRouter><RegisterPage /></MemoryRouter>)
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os documentos')
        expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        await waitFor(() => expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled())
        expect(auth.register).not.toHaveBeenCalled()
    })

    it('exige nova confirmação quando as versões são rejeitadas pelo backend', async () => {
        auth.register.mockRejectedValueOnce(new ApiError(409, 'Conflito', 'Os documentos legais foram atualizados.'))
        render(<MemoryRouter><RegisterPage /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled())
        fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Estudante' } })
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'estudante@example.com' } })
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@123' } })
        fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'Senha@123' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /li e aceito/i }))
        fireEvent.click(screen.getByRole('checkbox', { name: /declaro que tenho 13 anos/i }))
        fireEvent.submit(screen.getByRole('button', { name: 'Criar minha conta' }).closest('form')!)
        expect(await screen.findByRole('alert')).toHaveTextContent('Leia as novas versões')
        expect(screen.getByRole('checkbox', { name: /li e aceito/i })).not.toBeChecked()
        expect(screen.getByLabelText('Nome')).toHaveValue('Estudante')
        await waitFor(() => expect(legalDocumentService.current).toHaveBeenCalledTimes(4))
    })

    it('envia a declaração de idade junto com o cadastro', async () => {
        auth.register.mockResolvedValueOnce(undefined)
        render(<MemoryRouter><RegisterPage /></MemoryRouter>)
        await waitFor(() => expect(screen.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled())
        fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Aline Souza' } })
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'aline@exemplo.com' } })
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@123' } })
        fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'Senha@123' } })
        fireEvent.click(screen.getByRole('checkbox', { name: /li e aceito/i }))
        fireEvent.click(screen.getByRole('checkbox', { name: /declaro que tenho 13 anos/i }))
        fireEvent.submit(screen.getByRole('button', { name: 'Criar minha conta' }).closest('form')!)
        await waitFor(() => expect(auth.register).toHaveBeenCalledWith({
            name: 'Aline Souza', email: 'aline@exemplo.com', password: 'Senha@123',
            acceptTerms: true, acceptPrivacyPolicy: true, ageDeclarationAccepted: true,
            termsVersion: '1.1', privacyVersion: '1.1',
        }))
    })

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(legalDocumentService.current).mockImplementation(async type => ({
            id: type, type, version: '1.1', title: type, effectiveAt: '2026-11-11T00:00:00',
            createdAt: '2026-11-11T00:00:00',
            content: type === 'TERMOS_DE_USO' ? fixtures.terms : fixtures.privacy,
        }))
        localStorage.clear()
        sessionStorage.clear()
    })

    it('exibe os aceites obrigatórios no cadastro', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        )

        expect(screen.getByRole('checkbox', { name: /li e aceito/i })).toBeRequired()
        expect(screen.getByRole('checkbox', { name: /declaro que tenho 13 anos/i })).toBeRequired()
        expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos-de-uso')
        expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
            'href',
            '/politica-de-privacidade'
        )
    })

    it('valida a confirmação da senha antes de cadastrar', () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Aline Souza' } })
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'aline@exemplo.com' } })
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@123' } })
        fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'Senha@456' } })
        fireEvent.submit(screen.getByRole('button', { name: 'Criar minha conta' }).closest('form')!)

        expect(screen.getByRole('alert')).toHaveTextContent('As senhas digitadas não coincidem.')
        expect(auth.register).not.toHaveBeenCalled()
    })
})
