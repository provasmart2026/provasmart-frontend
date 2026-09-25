import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import {api} from '../../../api/client'
import type {UserResponse} from '../../../api/users'
import type {Page} from '../../../types/api'
import {UsersPage} from './UsersPage'

const student: UserResponse = {
    id: 'student-uuid', name: 'Aline Souza', email: 'aline@exemplo.com', role: 'ESTUDANTE',
    active: true, deletionRequested: false, deletionRequestedAt: null,
    createdAt: '2026-09-19T09:15:00', updatedAt: '2026-09-22T12:00:00',
    termsVersion: '1', termsAcceptedAt: '2026-09-19T09:15:00',
    privacyVersion: '1', privacyAcceptedAt: '2026-09-19T09:15:00',
}
const inactive = {...student, id: 'inactive-uuid', name: 'Bruno', active: false}
const requested = {...student, id: 'requested-uuid', name: 'Carla', deletionRequested: true, deletionRequestedAt: '2026-09-25T14:30:00'}
const admin: UserResponse = {...requested, id: 'admin-uuid', name: 'Administrador teste', role: 'ADMIN'}

function page(content: UserResponse[], number = 0, totalPages = 1): Page<UserResponse> {
    return {content, empty: content.length === 0, numberOfElements: content.length, number, totalPages, totalElements: totalPages > 1 ? 11 : content.length, size: 10, first: number === 0, last: number >= totalPages - 1}
}

async function open(content = [student, inactive, requested, admin]) {
    const request = vi.spyOn(api, 'request').mockResolvedValue({data: page(content)})
    render(<UsersPage/>)
    await screen.findByText(content[0].name)
    return request
}

function row(name: string) {
    return within(screen.getByRole('row', {name: new RegExp(name)}))
}

describe('Administração de usuários', () => {
    afterEach(() => vi.restoreAllMocks())

    it('busca a primeira página e exibe dados e ações conforme perfil e estado', async () => {
        const storage = vi.spyOn(Storage.prototype, 'setItem')
        const request = await open()
        expect(request).toHaveBeenCalledExactlyOnceWith({url: '/users?page=0&size=10', method: 'GET'})
        expect(row(student.name).getByText(student.email)).toBeInTheDocument()
        expect(row(student.name).getByText('Estudante')).toBeInTheDocument()
        expect(row(student.name).getByText('Ativo')).toBeInTheDocument()
        expect(row(inactive.name).getByText('Inativo')).toBeInTheDocument()
        expect(row(admin.name).getByText('Administrador')).toBeInTheDocument()
        expect(row(admin.name).queryByRole('button')).not.toBeInTheDocument()
        expect(row(student.name).getByRole('button', {name: 'Desativar'})).toBeEnabled()
        expect(row(inactive.name).getByRole('button', {name: 'Ativar'})).toBeEnabled()
        expect(row(student.name).getByText('Não solicitada')).toBeInTheDocument()
        expect(row(student.name).queryByRole('button', {name: 'Excluir definitivamente'})).not.toBeInTheDocument()
        expect(row(requested.name).getByRole('button', {name: 'Excluir definitivamente'})).toBeEnabled()
        expect(row(requested.name).getByText('Solicitada')).toBeInTheDocument()
        expect(row(requested.name).getByText('25/09/2026, 14:30')).toBeInTheDocument()
        expect(row(student.name).getByText('19/09/2026, 09:15')).toBeInTheDocument()
        for (const user of [student, inactive, requested, admin]) expect(screen.queryByText(user.id)).not.toBeInTheDocument()
        expect(screen.queryByText(/22\/09\/2026/)).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Anterior'})).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Próxima'})).toBeDisabled()
        expect(storage).not.toHaveBeenCalled()
    })

    it.each(['Desativar', 'Excluir definitivamente'])('cancelar %s não chama API', async (action) => {
        const request = await open([requested])
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        fireEvent.click(screen.getByRole('button', {name: action}))
        expect(request).toHaveBeenCalledTimes(1)
    })

    it.each([
        [student, 'Desativar', '/users/student-uuid/deactivate', 'PATCH'],
        [inactive, 'Ativar', '/users/inactive-uuid/activate', 'PATCH'],
        [requested, 'Excluir definitivamente', '/users/requested-uuid', 'DELETE'],
    ] as const)('%s: %s chama endpoint e atualiza listagem', async (user, action, url, method) => {
        const request = await open([user])
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
        request.mockResolvedValueOnce({status: 204, data: undefined}).mockResolvedValueOnce({data: page([])})
        fireEvent.click(screen.getByRole('button', {name: action}))
        await screen.findByText('Nenhum usuário cadastrado.')
        expect(request).toHaveBeenNthCalledWith(2, {url, method})
        expect(request).toHaveBeenNthCalledWith(3, {url: '/users?page=0&size=10', method: 'GET'})
        expect(screen.queryByText(user.name)).not.toBeInTheDocument()
        if (action === 'Ativar') expect(confirm).not.toHaveBeenCalled()
        else expect(confirm).toHaveBeenCalledWith(action === 'Desativar' ? 'Deseja desativar este usuário?' : 'Esta exclusão é definitiva e não poderá ser desfeita. Deseja continuar?')
    })

    it.each(['Desativar', 'Ativar', 'Excluir definitivamente'])('preserva listagem quando %s falha', async (action) => {
        const request = await open([{...requested, active: action !== 'Ativar'}])
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        request.mockRejectedValueOnce(new Error('detalhe interno'))
        fireEvent.click(screen.getByRole('button', {name: action}))
        expect(await screen.findByRole('alert')).toHaveTextContent(action === 'Excluir definitivamente'
            ? 'Não foi possível excluir o usuário. Tente novamente.'
            : 'Não foi possível atualizar o usuário. Tente novamente.')
        expect(screen.getByText(requested.name)).toBeInTheDocument()
        expect(screen.getByRole('button', {name: action})).toBeEnabled()
        expect(request).toHaveBeenCalledTimes(2)
        expect(screen.queryByText('detalhe interno')).not.toBeInTheDocument()
    })

    it('bloqueia cliques duplicados até concluir a ação', async () => {
        const request = await open([inactive])
        let resolve!: (value: {data: undefined}) => void
        request.mockReturnValueOnce(new Promise(done => { resolve = done }))
        const button = screen.getByRole('button', {name: 'Ativar'})
        fireEvent.click(button)
        expect(button).toBeDisabled()
        expect(button).toHaveTextContent('Processando...')
        fireEvent.click(button)
        expect(request).toHaveBeenCalledTimes(2)
        await act(async () => resolve({data: undefined}))
        expect(request).toHaveBeenCalledTimes(3)
    })

    it('mostra loading, erro de listagem e permite tentar novamente', async () => {
        const request = vi.spyOn(api, 'request').mockRejectedValueOnce(new Error('interno'))
        render(<UsersPage/>)
        expect(screen.getByRole('status')).toHaveTextContent('Carregando usuários...')
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os usuários.')
        request.mockResolvedValueOnce({data: page([student])})
        fireEvent.click(screen.getByRole('button', {name: 'Tentar novamente'}))
        await screen.findByText(student.name)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('navega pelas páginas do backend respeitando first e last', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValueOnce({data: page([student], 0, 2)})
            .mockResolvedValueOnce({data: page([inactive], 1, 2)})
            .mockResolvedValueOnce({data: page([student], 0, 2)})
        render(<UsersPage/>)
        await screen.findByText(student.name)
        expect(screen.getByRole('button', {name: 'Anterior'})).toBeDisabled()
        fireEvent.click(screen.getByRole('button', {name: 'Próxima'}))
        await screen.findByText('Página 2 de 2')
        expect(request).toHaveBeenNthCalledWith(2, {url: '/users?page=1&size=10', method: 'GET'})
        expect(screen.getByRole('button', {name: 'Próxima'})).toBeDisabled()
        fireEvent.click(screen.getByRole('button', {name: 'Anterior'}))
        await screen.findByText('Página 1 de 2')
        expect(request).toHaveBeenNthCalledWith(3, {url: '/users?page=0&size=10', method: 'GET'})
    })

    it('volta à página anterior ao excluir o último usuário da página', async () => {
        const request = vi.spyOn(api, 'request').mockResolvedValueOnce({data: page([student], 0, 2)})
            .mockResolvedValueOnce({data: page([requested], 1, 2)})
            .mockResolvedValueOnce({status: 204, data: undefined})
            .mockResolvedValueOnce({data: page([student])})
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        render(<UsersPage/>)
        await screen.findByText(student.name)
        fireEvent.click(screen.getByRole('button', {name: 'Próxima'}))
        await screen.findByText(requested.name)
        fireEvent.click(screen.getByRole('button', {name: 'Excluir definitivamente'}))
        await screen.findByText('Página 1 de 1')
        expect(request).toHaveBeenNthCalledWith(4, {url: '/users?page=0&size=10', method: 'GET'})
        expect(screen.queryByText(requested.name)).not.toBeInTheDocument()
    })

    it('não atualiza a página após desmontar durante uma ação', async () => {
        let resolve!: (value: {data: undefined}) => void
        const request = vi.spyOn(api, 'request').mockResolvedValueOnce({data: page([inactive])})
            .mockReturnValueOnce(new Promise(done => { resolve = done }))
        const {unmount} = render(<UsersPage/>)
        await screen.findByText(inactive.name)
        fireEvent.click(screen.getByRole('button', {name: 'Ativar'}))
        unmount()
        await act(async () => resolve({data: undefined}))
        await waitFor(() => expect(request).toHaveBeenCalledTimes(2))
    })
})
