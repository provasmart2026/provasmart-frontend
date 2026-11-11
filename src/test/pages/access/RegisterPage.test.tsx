import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { RegisterPage } from '../../../pages/access/RegisterPage'

const auth = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('../../../services/authService', () => ({ authService: auth }))

describe('cadastro', () => {
    it('envia a declaração de idade junto com o cadastro', async () => {
        auth.register.mockResolvedValueOnce(undefined)
        render(<MemoryRouter><RegisterPage /></MemoryRouter>)
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
        }))
    })

    beforeEach(() => {
        vi.clearAllMocks()
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
