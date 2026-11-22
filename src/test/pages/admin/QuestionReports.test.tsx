import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QuestionReportsPage } from '../../../pages/admin/reports/QuestionReportsPage'
import { QuestionReportDetailPage } from '../../../pages/admin/reports/QuestionReportDetailPage'
import { questionReportService } from '../../../services/questionReportService'
import { questionService } from '../../../services/questionService'
import { ApiError } from '../../../services/api'
import type { QuestionReportDetail } from '../../../types/questionReport'

vi.mock('../../../services/questionReportService', () => ({
    questionReportService: { list: vi.fn(), get: vi.fn(), updateStatus: vi.fn() },
}))

vi.mock('../../../services/questionService', () => ({
    questionService: { get: vi.fn() },
}))

const detail: QuestionReportDetail = {
    id: 'report-1',
    studentId: 'student-1',
    studentName: 'Ana',
    originalQuestionId: 'question-1',
    origin: 'SIMULADO',
    reason: 'OUTRO',
    status: 'PENDENTE',
    createdAt: '2026-11-15T12:00:00',
    updatedAt: null,
    simulationId: 'simulation-1',
    simulationQuestionId: 'sq-1',
    practiceId: null,
    practiceQuestionId: null,
    description: 'Duas alternativas iguais.',
    contentSnapshot: JSON.stringify({
        statement: 'Enunciado preservado',
        alternatives: [{ letter: 'A', text: 'Texto da alternativa' }],
    }),
}

function EditorLocation() {
    const location = useLocation()
    return <div>{JSON.stringify(location.state)}</div>
}

function open(path = '/admin/question-reports') {
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/admin/question-reports" element={<QuestionReportsPage />} />
                <Route path="/admin/question-reports/:id" element={<QuestionReportDetailPage />} />
                <Route path="/admin/questions/:id/edit" element={<EditorLocation />} />
            </Routes>
        </MemoryRouter>
    )
}

beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(questionReportService.get).mockResolvedValue({ ...detail })
    vi.mocked(questionService.get).mockResolvedValue({
        id: detail.originalQuestionId,
        statement: 'Enunciado original',
        explanation: null,
        subjectId: 'subject-1',
        subjectName: 'Assunto',
        active: true,
        alternatives: [],
        createdAt: detail.createdAt,
        updatedAt: null,
    })
    vi.mocked(questionReportService.list).mockResolvedValue({
        content: [detail],
        number: 0,
        size: 10,
        totalElements: 2,
        totalPages: 2,
        first: true,
        last: false,
        empty: false,
        numberOfElements: 1,
    })
    vi.mocked(questionReportService.updateStatus).mockImplementation(async (_id, status) => ({
        ...detail,
        status,
        updatedAt: '2026-11-15T13:00:00',
    }))
})

describe('lista administrativa de reportes', () => {
    it('consulta pendentes por padrão e permite abrir o detalhe', async () => {
        open()
        fireEvent.click(await screen.findByRole('link', { name: 'Ver reporte de Ana' }))
        expect(await screen.findByText('Duas alternativas iguais.')).toBeInTheDocument()
        expect(questionReportService.list).toHaveBeenCalledWith(0, 10, 'PENDENTE')
    })

    it('muda o filtro e reinicia a paginação', async () => {
        open('/admin/question-reports?page=1&status=TODOS')
        await screen.findByText('Ana')
        expect(questionReportService.list).toHaveBeenCalledWith(1, 10, undefined)
        fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'RESOLVIDO' } })
        await waitFor(() => expect(questionReportService.list).toHaveBeenLastCalledWith(0, 10, 'RESOLVIDO'))
    })

    it('pagina e muda a quantidade de registros', async () => {
        open()
        fireEvent.click(await screen.findByRole('button', { name: 'Próxima' }))
        await waitFor(() => expect(questionReportService.list).toHaveBeenLastCalledWith(1, 10, 'PENDENTE'))
        fireEvent.change(screen.getByLabelText('Por página'), { target: { value: '20' } })
        await waitFor(() => expect(questionReportService.list).toHaveBeenLastCalledWith(0, 20, 'PENDENTE'))
    })

    it('informa quando não há reportes', async () => {
        vi.mocked(questionReportService.list).mockResolvedValue({
            content: [],
            number: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
            empty: true,
            numberOfElements: 0,
        })
        open()
        expect(await screen.findByText('Nenhum reporte encontrado para este filtro.')).toBeInTheDocument()
    })

    it('permite repetir a consulta após falha', async () => {
        vi.mocked(questionReportService.list).mockRejectedValueOnce(new Error('offline'))
        open()
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
        expect(await screen.findByText('Ana')).toBeInTheDocument()
    })
})

describe('detalhe administrativo do reporte', () => {
    it('exibe o conteúdo preservado e leva à questão original com retorno', async () => {
        open('/admin/question-reports/report-1?status=TODOS&page=1')
        expect(await screen.findByText('Enunciado preservado')).toBeInTheDocument()
        expect(screen.getByText('Texto da alternativa')).toBeInTheDocument()
        const link = screen.getByRole('link', { name: 'Abrir questão original' })
        expect(link).toHaveAttribute('href', '/admin/questions/question-1/edit')
        expect(screen.getByRole('link', { name: 'Voltar aos reportes' })).toHaveAttribute(
            'href',
            '/admin/question-reports?status=TODOS&page=1'
        )
        fireEvent.click(link)
        expect(screen.getByText(/returnTo/)).toHaveTextContent('/admin/question-reports/report-1?status=TODOS&page=1')
    })

    it.each([
        ['Marcar como resolvido', 'RESOLVIDO', 'Reporte marcado como resolvido.'],
        ['Descartar reporte', 'DESCARTADO', 'Reporte descartado.'],
    ] as const)('executa a ação %s', async (label, status, message) => {
        open('/admin/question-reports/report-1')
        fireEvent.click(await screen.findByRole('button', { name: label }))
        expect(await screen.findByText(message)).toBeInTheDocument()
        expect(questionReportService.updateStatus).toHaveBeenCalledWith('report-1', status)
        expect(screen.queryByRole('button', { name: 'Marcar como resolvido' })).not.toBeInTheDocument()
        expect(screen.getByText('Este reporte está encerrado.')).toBeInTheDocument()
    })

    it('não envia a ação se o administrador cancelar a confirmação', async () => {
        vi.mocked(window.confirm).mockReturnValue(false)
        open('/admin/question-reports/report-1')
        fireEvent.click(await screen.findByRole('button', { name: 'Descartar reporte' }))
        expect(questionReportService.updateStatus).not.toHaveBeenCalled()
    })

    it('mantém ações disponíveis após falha de conexão', async () => {
        vi.mocked(questionReportService.updateStatus).mockRejectedValueOnce(new Error('offline'))
        open('/admin/question-reports/report-1')
        fireEvent.click(await screen.findByRole('button', { name: 'Marcar como resolvido' }))
        expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível atualizar')
        expect(screen.getByRole('button', { name: 'Marcar como resolvido' })).toBeEnabled()
    })

    it('recarrega o status após conflito de atualização', async () => {
        vi.mocked(questionReportService.updateStatus).mockRejectedValueOnce(
            new ApiError(409, 'Conflito', 'Reporte já encerrado.')
        )
        vi.mocked(questionReportService.get)
            .mockResolvedValueOnce({ ...detail })
            .mockResolvedValueOnce({ ...detail, status: 'RESOLVIDO' })
        open('/admin/question-reports/report-1')
        fireEvent.click(await screen.findByRole('button', { name: 'Descartar reporte' }))
        expect(await screen.findByText('Este reporte está encerrado.')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Reporte já encerrado.')
    })

    it('não quebra a página quando o snapshot é inválido', async () => {
        vi.mocked(questionReportService.get).mockResolvedValue({ ...detail, contentSnapshot: '{inválido' })
        open('/admin/question-reports/report-1')
        expect(await screen.findByRole('alert')).toHaveTextContent('conteúdo preservado')
        expect(screen.getByText('Duas alternativas iguais.')).toBeInTheDocument()
    })

    it('informa reporte inexistente', async () => {
        vi.mocked(questionReportService.get).mockRejectedValue(new ApiError(404, 'Ausente'))
        open('/admin/question-reports/ausente')
        expect(await screen.findByRole('alert')).toHaveTextContent('Reporte não encontrado.')
    })
})
