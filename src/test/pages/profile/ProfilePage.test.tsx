import { MemoryRouter } from 'react-router-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../../../services/api'
import type { UserResponse } from '../../../types/user'
import { ProfilePage } from '../../../pages/profile/ProfilePage'

const user: UserResponse = {
    id: 'private-user-uuid',
    name: 'Aline Souza',
    email: 'aline@exemplo.com',
    role: 'ESTUDANTE',
    active: true,
    deletionRequested: false,
    deletionRequestedAt: null,
    termsVersion: 'termos-1',
    termsAcceptedAt: '2026-09-20T10:30:00',
    privacyVersion: 'privacidade-2',
    privacyAcceptedAt: '2026-09-21T11:45:00',
    createdAt: '2026-09-19T09:15:00',
    updatedAt: '2026-09-22T12:00:00',
}

function deferred<T>() {
    let resolve!: (value: T) => void
    const promise = new Promise<T>((done) => {
        resolve = done
    })
    return { promise, resolve }
}

async function open(data = user) {
    const request = vi.spyOn(api, 'request').mockResolvedValue({ data })
    render(<ProfilePage />, { wrapper: MemoryRouter })
    await screen.findByText(data.name)
    return request
}

describe('Meu perfil', () => {
    afterEach(() => vi.restoreAllMocks())

    it('mostra carregamento enquanto aguarda GET /users/me', async () => {
        const pending = deferred<{ data: UserResponse }>()
        const request = vi.spyOn(api, 'request').mockReturnValue(pending.promise)
        render(<ProfilePage />, { wrapper: MemoryRouter })
        expect(screen.getByRole('status')).toHaveTextContent('Carregando seus dados...')
        expect(request).toHaveBeenCalledExactlyOnceWith({ url: '/users/me', method: 'GET' })
        await act(async () => pending.resolve({ data: user }))
        expect(screen.queryByText('Carregando seus dados...')).not.toBeInTheDocument()
        expect(screen.getByText(user.name)).toBeInTheDocument()
    })

    it.each([
        ['ESTUDANTE', true, 'Estudante', 'Ativa'],
        ['ADMIN', false, 'Administrador', 'Inativa'],
    ] as const)('exibe dados de %s com status %s', async (role, active, label, status) => {
        const localWrite = vi.spyOn(Storage.prototype, 'setItem')
        await open({ ...user, role, active })
        expect(screen.getByText(user.name)).toBeInTheDocument()
        expect(screen.getByText(user.email)).toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()
        expect(screen.getByText(status)).toBeInTheDocument()
        expect(screen.queryByText(user.id)).not.toBeInTheDocument()
        expect(screen.queryByText(/22\/09\/2026/)).not.toBeInTheDocument()
        expect(screen.queryByText(user.updatedAt!)).not.toBeInTheDocument()
        expect(screen.getByText('Versão dos Termos de Uso')).toBeInTheDocument()
        expect(screen.getByText(user.termsVersion)).toBeInTheDocument()
        expect(screen.getByText('Versão da Política de Privacidade')).toBeInTheDocument()
        expect(screen.getByText(user.privacyVersion)).toBeInTheDocument()
        expect(screen.getByText('19/09/2026, 09:15')).toBeInTheDocument()
        expect(screen.getByText('20/09/2026, 10:30')).toBeInTheDocument()
        expect(screen.getByText('21/09/2026, 11:45')).toBeInTheDocument()
        expect(screen.queryByText(user.createdAt)).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Solicitar exclusão da conta' })).toBeEnabled()
        expect(localWrite).not.toHaveBeenCalled()
    })

    it('não envia PATCH quando a confirmação é cancelada', async () => {
        const request = await open()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        fireEvent.click(screen.getByRole('button', { name: 'Solicitar exclusão da conta' }))
        expect(confirm).toHaveBeenCalledWith(
            'Deseja realmente solicitar a exclusão da sua conta? Um administrador precisará concluir a exclusão definitiva.'
        )
        expect(request).toHaveBeenCalledTimes(1)
    })

    it.each(['ADMIN', 'ESTUDANTE'] as const)('solicita exclusão para %s sem body e atualiza o perfil', async (role) => {
        const request = await open({ ...user, role })
        const pending = deferred<{ data: undefined; status: number }>()
        request.mockReturnValueOnce(pending.promise).mockResolvedValueOnce({
            data: {
                ...user,
                role,
                deletionRequested: true,
                deletionRequestedAt: '2026-09-25T14:30:00',
            },
        })
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        const button = screen.getByRole('button', { name: 'Solicitar exclusão da conta' })
        fireEvent.click(button)
        expect(button).toBeDisabled()
        expect(button).toHaveTextContent('Solicitando exclusão...')
        fireEvent.click(button)
        expect(request).toHaveBeenCalledTimes(2)
        expect(request).toHaveBeenNthCalledWith(2, { url: '/users/me/request-deletion', method: 'PATCH' })
        await act(async () => pending.resolve({ data: undefined, status: 204 }))
        expect(request).toHaveBeenNthCalledWith(3, { url: '/users/me', method: 'GET' })
        expect(screen.getByRole('status')).toHaveTextContent('Exclusão solicitada')
        expect(
            screen.getByText('Sua solicitação de exclusão foi registrada e aguarda processamento.')
        ).toBeInTheDocument()
        expect(screen.getByText('25/09/2026, 14:30')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        fireEvent.click(button)
        expect(request).toHaveBeenCalledTimes(3)
        expect(window.confirm).toHaveBeenCalledTimes(1)
    })

    it.each([false, true])(
        'aguarda o GET e respeita deletionRequested=%s retornado pelo backend',
        async (deletionRequested) => {
            const request = await open()
            const refresh = deferred<{ data: UserResponse }>()
            request.mockResolvedValueOnce({ status: 204, data: undefined }).mockReturnValueOnce(refresh.promise)
            vi.spyOn(window, 'confirm').mockReturnValue(true)
            fireEvent.click(screen.getByRole('button'))
            await waitFor(() => expect(request).toHaveBeenCalledTimes(3))
            const button = screen.getByRole('button', { name: 'Solicitando exclusão...' })
            expect(button).toBeDisabled()
            expect(screen.queryByText('Exclusão solicitada')).not.toBeInTheDocument()
            fireEvent.click(button)
            expect(request).toHaveBeenCalledTimes(3)
            await act(async () => refresh.resolve({ data: { ...user, name: 'Nome atualizado', deletionRequested } }))
            expect(screen.getByText('Nome atualizado')).toBeInTheDocument()
            if (deletionRequested) {
                expect(screen.getByText('Exclusão solicitada')).toBeInTheDocument()
                expect(screen.queryByRole('button')).not.toBeInTheDocument()
            } else {
                expect(screen.queryByText('Exclusão solicitada')).not.toBeInTheDocument()
                expect(screen.getByRole('button', { name: 'Solicitar exclusão da conta' })).toBeEnabled()
            }
            expect(screen.queryByText('Solicitando exclusão...')).not.toBeInTheDocument()
            expect(request).toHaveBeenCalledTimes(3)
        }
    )

    it.each([null, '2026-09-25T14:30:00'])('mostra solicitação existente com data %s', async (deletionRequestedAt) => {
        await open({ ...user, deletionRequested: true, deletionRequestedAt })
        expect(screen.getByText('Exclusão solicitada')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        if (deletionRequestedAt) expect(screen.getByText('25/09/2026, 14:30')).toBeInTheDocument()
        else expect(screen.queryByText(/Data da solicitação/)).not.toBeInTheDocument()
    })

    it('mostra erro amigável ao carregar', async () => {
        vi.spyOn(api, 'request').mockRejectedValue(new Error('detalhe interno'))
        render(<ProfilePage />, { wrapper: MemoryRouter })
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar seus dados.')
        expect(screen.queryByText('detalhe interno')).not.toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('mantém o botão disponível após falha do PATCH', async () => {
        const request = await open()
        request.mockRejectedValueOnce(new Error('detalhe interno'))
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        fireEvent.click(screen.getByRole('button'))
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Não foi possível solicitar a exclusão da conta. Tente novamente.'
        )
        expect(screen.getByRole('button', { name: 'Solicitar exclusão da conta' })).toBeEnabled()
        expect(screen.queryByText('Exclusão solicitada')).not.toBeInTheDocument()
        expect(request).toHaveBeenCalledTimes(2)
    })

    it('preserva os últimos dados do backend e informa falha ao atualizar após o PATCH', async () => {
        const request = await open()
        request.mockResolvedValueOnce({ status: 204, data: undefined }).mockRejectedValueOnce(new Error('Falha'))
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        fireEvent.click(screen.getByRole('button'))
        await waitFor(() => expect(request).toHaveBeenCalledTimes(3))
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Sua solicitação foi registrada, mas não foi possível atualizar seus dados agora.'
        )
        expect(screen.queryByText('Exclusão solicitada')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Solicitar exclusão da conta' })).toBeEnabled()
    })
})
