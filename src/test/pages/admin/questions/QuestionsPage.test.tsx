import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { AxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../../../App'
import { api } from '../../../../services/api'
import type { Question, QuestionInput } from '../../../../types/question'

const subjectId = '550e8400-e29b-41d4-a716-446655440000'
const catalogRequest = vi.fn<(config: AxiosRequestConfig) => Promise<{ data: unknown }>>()

function mockQuestionRequests() {
    const request = vi.fn<(config: AxiosRequestConfig) => Promise<{ data: unknown }>>()
    vi.spyOn(api, 'request').mockImplementation(async (config) => {
        return (await (config.url?.startsWith('/questions') ? request(config) : catalogRequest(config))) as never
    })
    return request
}

async function selectSubject() {
    await screen.findByRole('option', { name: 'Matemática' })
    fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'MATEMATICA' } })
    await screen.findByRole('option', { name: 'Álgebra' })
    fireEvent.change(screen.getByLabelText('Disciplina'), { target: { value: 'math' } })
    await screen.findByRole('option', { name: 'Soma' })
    fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: subjectId } })
}

const input: QuestionInput = {
    statement: 'Quanto é dois mais dois?',
    explanation: 'A soma é quatro.',
    subjectId,
    alternatives: ['A', 'B', 'C', 'D', 'E'].map((letter, index) => ({
        letter,
        text: `Resposta ${index + 1}`,
        correct: index === 3,
    })),
}
const question: Question = {
    ...input,
    id: 'question-1',
    subjectName: 'Matemática',
    active: true,
    alternatives: input.alternatives.map((item) => ({ ...item, id: item.letter })),
    createdAt: '2026-09-13T12:00:00',
    updatedAt: null,
}

function page(content: Question[], number = 0, totalPages = 1) {
    return {
        content,
        number,
        size: 10,
        totalElements: content.length,
        totalPages,
        first: number === 0,
        last: number === totalPages - 1,
        empty: content.length === 0,
        numberOfElements: content.length,
    }
}

function open(path = '/admin/questions') {
    window.history.replaceState(null, '', path)
    render(<App />)
}

async function fillForm() {
    fireEvent.change(screen.getByLabelText('Enunciado'), { target: { value: input.statement } })
    fireEvent.change(screen.getByLabelText('Explicação'), { target: { value: input.explanation } })
    await selectSubject()
    input.alternatives.forEach((item) => {
        fireEvent.change(screen.getByLabelText(`Alternativa ${item.letter}`), { target: { value: item.text } })
    })
    fireEvent.click(screen.getByLabelText('D é a correta'))
}

describe('Administração de questões', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        localStorage.setItem('provasmart.token', 'token-de-teste')
        localStorage.setItem('provasmart.role', 'ADMIN')
        window.history.replaceState(null, '', '/')
        catalogRequest.mockReset().mockImplementation(async ({ url }) => {
            if (url === '/exam-areas') return { data: ['LINGUAGENS', 'MATEMATICA'] }
            if (url === '/disciplines/exam-area/MATEMATICA')
                return {
                    data: [
                        { id: 'math', name: 'Álgebra', examArea: 'MATEMATICA' },
                        { id: 'geometry', name: 'Geometria', examArea: 'MATEMATICA' },
                    ],
                }
            if (url === '/disciplines/exam-area/LINGUAGENS')
                return {
                    data: [
                        {
                            id: 'portuguese',
                            name: 'Português',
                            examArea: 'LINGUAGENS',
                        },
                    ],
                }
            if (url === '/subjects/discipline/math') return { data: [{ id: subjectId, name: 'Soma' }] }
            return { data: [] }
        })
    })
    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.restoreAllMocks()
        window.history.replaceState(null, '', '/')
    })

    it('navega diretamente pelos números e mantém Anterior e Próxima nos limites', async () => {
        const request = mockQuestionRequests().mockImplementation(async ({ url }) => {
            const number = Number(new URL(url!, 'http://localhost').searchParams.get('page'))
            return { data: page([question], number, 20) }
        })
        open()
        await screen.findByText('Página 1 de 20')
        expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Próxima' })).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
        const nav = screen.getByRole('navigation', { name: 'Paginação de questões' })
        expect(within(nav).getByText('...').tagName).toBe('SPAN')
        expect(within(nav).queryByRole('button', { name: '...' })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Página 20' }))
        await screen.findByText('Página 20 de 20')
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=19&size=10' })
        expect(screen.getByRole('button', { name: 'Página 20' })).toHaveAttribute('aria-current', 'page')
        expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()

        fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
        await screen.findByText('Página 19 de 20')
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=18&size=10' })
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
        await screen.findByText('Página 20 de 20')
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=19&size=10' })
    })

    it('exibe todos os números quando há poucas páginas', async () => {
        mockQuestionRequests().mockResolvedValueOnce({ data: page([question], 0, 5) })
        open()
        await screen.findByText('Página 1 de 5')
        const nav = screen.getByRole('navigation', { name: 'Paginação de questões' })
        expect(
            within(nav)
                .getAllByRole('button')
                .map((button) => button.textContent?.trim())
        ).toEqual(['Anterior', '1', '2', '3', '4', '5', 'Próxima'])
        expect(within(nav).queryByText('...')).not.toBeInTheDocument()
    })

    it('cria uma questão com POST e busca a listagem atualizada', async () => {
        const request = mockQuestionRequests()
            .mockResolvedValueOnce({ data: page([]) })
            .mockResolvedValueOnce({ data: question })
            .mockResolvedValueOnce({ data: page([question]) })
        open()
        await screen.findByText('Nenhuma questão cadastrada.')
        expect(screen.queryByText('Voltar ao início')).not.toBeInTheDocument()
        expect(screen.queryByText(/Criação, edição e alteração de status/)).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Nova questão' }))
        expect(window.location.pathname).toBe('/admin/questions/new')
        await fillForm()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await screen.findByRole('cell', { name: question.statement })
        expect(request).toHaveBeenNthCalledWith(2, { url: '/questions', method: 'POST', data: input })
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=0&size=10' })
        expect(window.location.pathname).toBe('/admin/questions')
    })

    it('carrega a edição com GET, salva com PUT e preserva a página da listagem', async () => {
        const request = mockQuestionRequests()
            .mockResolvedValueOnce({ data: page([question], 0, 2) })
            .mockResolvedValueOnce({ data: page([question], 1, 2) })
            .mockResolvedValueOnce({ data: question })
            .mockResolvedValueOnce({ data: { ...question, statement: 'Enunciado revisado' } })
            .mockResolvedValueOnce({ data: page([{ ...question, statement: 'Enunciado revisado' }], 1, 2) })
        open()
        await screen.findByRole('cell', { name: question.statement })
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
        await screen.findByText('Página 2 de 2')
        fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
        await screen.findByDisplayValue(question.statement)
        expect(request).toHaveBeenNthCalledWith(3, { url: '/questions/question-1' })
        await waitFor(() => expect(screen.getByLabelText('Assunto')).toHaveValue(subjectId))
        expect(screen.getByLabelText('Área')).toHaveValue('MATEMATICA')
        expect(screen.getByLabelText('Disciplina')).toHaveValue('math')
        expect(screen.getByLabelText('Explicação')).toHaveValue(input.explanation)
        input.alternatives.forEach((item) =>
            expect(screen.getByLabelText(`Alternativa ${item.letter}`)).toHaveValue(item.text)
        )
        expect(screen.getByLabelText('D é a correta')).toBeChecked()
        fireEvent.change(screen.getByLabelText('Enunciado'), { target: { value: 'Enunciado revisado' } })
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await screen.findByRole('cell', { name: 'Enunciado revisado' })
        expect(request).toHaveBeenNthCalledWith(4, {
            url: '/questions/question-1',
            method: 'PUT',
            data: { ...input, statement: 'Enunciado revisado' },
        })
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=1&size=10' })
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    })

    it.each([
        [true, 'Desativar', 'deactivate', 'Inativa'],
        [false, 'Ativar', 'activate', 'Ativa'],
    ] as const)(
        'altera o status active=%s via PATCH e recarrega a tabela',
        async (active, action, endpoint, status) => {
            const request = mockQuestionRequests()
                .mockResolvedValueOnce({ data: page([{ ...question, active }]) })
                .mockResolvedValueOnce({ data: undefined })
                .mockResolvedValueOnce({ data: page([{ ...question, active: !active }]) })
            open()
            fireEvent.click(await screen.findByRole('button', { name: action }))
            await screen.findByText(status)
            expect(request).toHaveBeenNthCalledWith(2, { url: `/questions/question-1/${endpoint}`, method: 'PATCH' })
            expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=0&size=10' })
        }
    )

    it('preserva os dados e permite tentar novamente quando salvar falha', async () => {
        const request = mockQuestionRequests().mockRejectedValueOnce(new Error('Falha'))
        open('/admin/questions/new')
        await fillForm()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await screen.findByRole('alert')
        expect(screen.getByLabelText('Enunciado')).toHaveValue(input.statement)
        expect(screen.getByRole('button', { name: 'Salvar questão' })).toBeEnabled()
        expect(window.location.pathname).toBe('/admin/questions/new')
        request.mockResolvedValueOnce({ data: question }).mockResolvedValueOnce({ data: page([question]) })
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await screen.findByRole('cell', { name: question.statement })
    })

    it('permite tentar novamente quando o carregamento da edição falha', async () => {
        const request = mockQuestionRequests().mockRejectedValueOnce(new Error('Falha'))
        open('/admin/questions/question-1/edit')
        await screen.findByRole('alert')
        expect(screen.queryByRole('button', { name: 'Salvar questão' })).not.toBeInTheDocument()
        request.mockResolvedValueOnce({ data: question })
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        await screen.findByDisplayValue(question.statement)
    })

    it('mantém o status original quando o PATCH falha', async () => {
        const request = mockQuestionRequests()
            .mockResolvedValueOnce({ data: page([question]) })
            .mockRejectedValueOnce(new Error('Falha'))
        open()
        fireEvent.click(await screen.findByRole('button', { name: 'Desativar' }))
        await screen.findByRole('alert')
        expect(screen.getByText('Ativa')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Desativar' })).toBeEnabled()
        expect(request).toHaveBeenCalledTimes(2)
    })

    it('bloqueia envios repetidos enquanto salva e permite cancelar sem salvar', async () => {
        let finish!: (value: { data: Question }) => void
        const request = mockQuestionRequests().mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve
                })
        )
        open('/admin/questions/new')
        await fillForm()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
        expect(screen.getByLabelText('Enunciado')).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Salvando...' }))
        expect(request).toHaveBeenCalledTimes(1)
        request.mockResolvedValue({ data: page([question]) })
        finish({ data: question })
        await screen.findByRole('cell', { name: question.statement })
        fireEvent.click(screen.getByRole('button', { name: 'Nova questão' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
        await screen.findByRole('cell', { name: question.statement })
        expect(request.mock.calls.filter(([config]) => config.method === 'POST')).toHaveLength(1)
    })

    it('rejeita conteúdo em branco sem enviar para a API', async () => {
        const request = mockQuestionRequests()
        open('/admin/questions/new')
        await fillForm()
        fireEvent.change(screen.getByLabelText('Enunciado'), { target: { value: '   ' } })
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Preencha todos os campos'))
        expect(request).not.toHaveBeenCalled()
    })

    it('habilita os selects em sequência e limpa as seleções dependentes', async () => {
        mockQuestionRequests()
        open('/admin/questions/new')
        expect(screen.getByLabelText('Disciplina')).toBeDisabled()
        expect(screen.getByLabelText('Assunto')).toBeDisabled()
        expect(screen.queryByLabelText('ID do assunto')).not.toBeInTheDocument()
        await selectSubject()
        expect(catalogRequest).toHaveBeenCalledWith({ url: '/exam-areas' })
        expect(catalogRequest).toHaveBeenCalledWith({ url: '/disciplines/exam-area/MATEMATICA' })
        expect(catalogRequest).toHaveBeenCalledWith({ url: '/subjects/discipline/math' })
        fireEvent.change(screen.getByLabelText('Disciplina'), { target: { value: 'geometry' } })
        expect(screen.getByLabelText('Assunto')).toHaveValue('')
        await screen.findByText('Nenhum assunto cadastrado nesta disciplina.')
        expect(screen.getByRole('button', { name: 'Salvar questão' })).toBeDisabled()
        fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'LINGUAGENS' } })
        expect(screen.getByLabelText('Disciplina')).toHaveValue('')
        expect(screen.getByLabelText('Assunto')).toHaveValue('')
        expect(screen.getByLabelText('Assunto')).toBeDisabled()
        await screen.findByRole('option', { name: 'Português' })
        fireEvent.change(screen.getByLabelText('Área'), { target: { value: '' } })
        expect(screen.getByLabelText('Disciplina')).toBeDisabled()
        expect(screen.getByLabelText('Assunto')).toBeDisabled()
    })

    it('cria e seleciona um assunto e envia somente seu ID no cadastro da questão', async () => {
        const request = mockQuestionRequests()
            .mockResolvedValueOnce({ data: question })
            .mockResolvedValueOnce({ data: page([question]) })
        open('/admin/questions/new')
        await fillForm()
        catalogRequest.mockResolvedValueOnce({ data: { id: 'new-subject', name: 'Multiplicação' } })
        expect(screen.getByLabelText('Nome do novo assunto')).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Criar assunto' })).toBeDisabled()
        fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: '' } })
        expect(screen.getByLabelText('Nome do novo assunto')).toBeEnabled()
        fireEvent.change(screen.getByLabelText('Nome do novo assunto'), { target: { value: ' Multiplicação ' } })
        expect(screen.getByLabelText('Assunto')).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Criar assunto' }))
        expect(screen.getByRole('button', { name: 'Criando assunto...' })).toBeDisabled()
        expect(screen.getByLabelText('Área')).toBeDisabled()
        await waitFor(() => expect(screen.getByLabelText('Assunto')).toHaveValue('new-subject'))
        expect(catalogRequest).toHaveBeenLastCalledWith({
            url: '/subjects/discipline/math',
            method: 'POST',
            data: { name: 'Multiplicação' },
        })
        expect(screen.getByLabelText('Nome do novo assunto')).toHaveValue('')
        expect(screen.getByLabelText('Nome do novo assunto')).toBeDisabled()
        expect(screen.getByLabelText('Assunto')).toBeEnabled()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        await screen.findByRole('cell', { name: question.statement })
        expect(request).toHaveBeenNthCalledWith(1, {
            url: '/questions',
            method: 'POST',
            data: { ...input, subjectId: 'new-subject' },
        })
    })

    it('mantém o nome quando criar assunto falha e libera o select ao limpar o nome', async () => {
        mockQuestionRequests()
        open('/admin/questions/new')
        await selectSubject()
        catalogRequest.mockRejectedValueOnce(new Error('Falha'))
        fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: '' } })
        fireEvent.change(screen.getByLabelText('Nome do novo assunto'), { target: { value: 'Multiplicação' } })
        fireEvent.click(screen.getByRole('button', { name: 'Criar assunto' }))
        await screen.findByText('Não foi possível criar o assunto. Tente novamente.')
        expect(screen.getByLabelText('Assunto')).toHaveValue('')
        expect(screen.getByLabelText('Assunto')).toBeDisabled()
        expect(screen.getByLabelText('Nome do novo assunto')).toHaveValue('Multiplicação')
        expect(screen.getByRole('button', { name: 'Criar assunto' })).toBeEnabled()
        fireEvent.change(screen.getByLabelText('Nome do novo assunto'), { target: { value: '' } })
        expect(screen.getByLabelText('Assunto')).toBeEnabled()
        expect(screen.getByRole('button', { name: 'Criar assunto' })).toBeDisabled()
        fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: subjectId } })
        expect(screen.getByLabelText('Nome do novo assunto')).toBeDisabled()
    })

    it.each(['areas', 'disciplines', 'subjects'])('mostra erro e permite repetir a consulta de %s', async (step) => {
        mockQuestionRequests()
        if (step === 'areas') catalogRequest.mockRejectedValueOnce(new Error('Falha'))
        open('/admin/questions/new')
        if (step !== 'areas') {
            await screen.findByRole('option', { name: 'Matemática' })
            if (step === 'disciplines') catalogRequest.mockRejectedValueOnce(new Error('Falha'))
            fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'MATEMATICA' } })
            if (step === 'subjects') {
                await screen.findByRole('option', { name: 'Álgebra' })
                catalogRequest.mockRejectedValueOnce(new Error('Falha'))
                fireEvent.change(screen.getByLabelText('Disciplina'), { target: { value: 'math' } })
            }
        }
        await screen.findByRole('alert')
        fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar novamente' }))
        await screen.findByRole('option', {
            name: step === 'areas' ? 'Matemática' : step === 'disciplines' ? 'Álgebra' : 'Soma',
        })
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('ignora respostas atrasadas de uma área que deixou de estar selecionada', async () => {
        mockQuestionRequests()
        open('/admin/questions/new')
        await screen.findByRole('option', { name: 'Matemática' })
        let finish!: (value: { data: unknown }) => void
        catalogRequest.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve
                })
        )
        fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'MATEMATICA' } })
        expect(screen.getByText('Carregando disciplinas...')).toBeInTheDocument()
        fireEvent.change(screen.getByLabelText('Área'), { target: { value: 'LINGUAGENS' } })
        await screen.findByRole('option', { name: 'Português' })
        await act(async () => {
            finish({ data: [{ id: 'math', name: 'Álgebra', examArea: 'MATEMATICA' }] })
        })
        expect(screen.queryByRole('option', { name: 'Álgebra' })).not.toBeInTheDocument()
        expect(screen.getByLabelText('Área')).toHaveValue('LINGUAGENS')
    })

    it('não redireciona após salvar quando o usuário já saiu do formulário', async () => {
        let finish!: (value: { data: Question }) => void
        mockQuestionRequests().mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve
                })
        )
        open('/admin/questions/new')
        await fillForm()
        fireEvent.click(screen.getByRole('button', { name: 'Salvar questão' }))
        fireEvent.click(screen.getByRole('link', { name: 'Início' }))
        await screen.findByRole('heading', { name: /cada questão conta/i })
        await act(async () => {
            finish({ data: question })
        })
        expect(window.location.pathname).toBe('/')
        expect(screen.getByRole('heading', { name: /cada questão conta/i })).toBeInTheDocument()
    })

    it.each(['/disciplines/exam-area/LINGUAGENS', '/subjects/discipline/geometry'])(
        'preenche a edição mesmo quando falha um catálogo não relacionado: %s',
        async (failedUrl) => {
            const defaultCatalog = catalogRequest.getMockImplementation()!
            catalogRequest.mockImplementation((config) =>
                config.url === failedUrl ? Promise.reject(new Error('Falha em outro catálogo')) : defaultCatalog(config)
            )
            mockQuestionRequests().mockResolvedValueOnce({ data: question })
            open('/admin/questions/question-1/edit')
            await waitFor(() => expect(screen.getByLabelText('Assunto')).toHaveValue(subjectId))
            expect(screen.getByLabelText('Área')).toHaveValue('MATEMATICA')
            expect(screen.getByLabelText('Disciplina')).toHaveValue('math')
            expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        }
    )

    it('bloqueia o salvamento e permite repetir quando o catálogo do assunto da edição falha', async () => {
        const defaultCatalog = catalogRequest.getMockImplementation()!
        catalogRequest.mockImplementation((config) =>
            config.url === '/subjects/discipline/math' ? Promise.reject(new Error('Falha')) : defaultCatalog(config)
        )
        const request = mockQuestionRequests().mockResolvedValueOnce({ data: question })
        open('/admin/questions/question-1/edit')
        await screen.findByRole('alert')
        expect(screen.getByRole('button', { name: 'Salvar questão' })).toBeDisabled()
        catalogRequest.mockImplementation(defaultCatalog)
        fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar novamente' }))
        await waitFor(() => expect(screen.getByLabelText('Assunto')).toHaveValue(subjectId))
        expect(request).toHaveBeenCalledTimes(1)
    })

    it('volta à última página disponível quando o total de páginas diminui', async () => {
        const request = mockQuestionRequests()
            .mockResolvedValueOnce({ data: page([question], 0, 2) })
            .mockResolvedValueOnce({ data: page([], 1, 1) })
            .mockResolvedValueOnce({ data: page([question], 0, 1) })
        open()
        await screen.findByRole('cell', { name: question.statement })
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
        await screen.findByText('Página 1 de 1')
        expect(request).toHaveBeenLastCalledWith({ url: '/questions?page=0&size=10' })
        expect(screen.getByRole('cell', { name: question.statement })).toBeInTheDocument()
    })
})
