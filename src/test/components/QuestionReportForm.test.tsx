import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QuestionReportForm } from '../../components/QuestionReportForm'
import { questionReportService } from '../../services/questionReportService'
import { ApiError } from '../../services/api'
import type { QuestionReportOrigin } from '../../types/questionReport'

vi.mock('../../services/questionReportService', () => ({ questionReportService: { create: vi.fn() } }))

function open(origin: QuestionReportOrigin = 'SIMULADO') {
    render(<QuestionReportForm origin={origin} activityId="activity" questionId="question" />)
    fireEvent.click(screen.getByRole('button', { name: 'Reportar problema' }))
}

function fill() {
    fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'OUTRO' } })
    fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: ' Problema de teste ' } })
}

describe('formulário de reporte', () => {
    beforeEach(() => vi.resetAllMocks())

    it.each(['SIMULADO', 'PRATICA_DIRECIONADA'] as const)('envia o reporte de %s e confirma sucesso', async origin => {
        vi.mocked(questionReportService.create).mockResolvedValue({} as never)
        open(origin)
        fill()
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('status')).toHaveTextContent('Reporte enviado')
        expect(questionReportService.create).toHaveBeenCalledWith(origin, 'activity', 'question', {
            reason: 'OUTRO', description: 'Problema de teste',
        })
    })

    it.each(['', '   ', 'a'.repeat(1001)])('rejeita descrição inválida', async description => {
        open()
        fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'OUTRO' } })
        fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: description } })
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('alert')).toHaveTextContent('até 1.000 caracteres')
        expect(questionReportService.create).not.toHaveBeenCalled()
    })

    it('exige motivo e mostra o limite de caracteres', async () => {
        open()
        expect(screen.getByLabelText('Descrição do problema')).toHaveAttribute('maxlength', '1000')
        fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: 'Descrição' } })
        expect(screen.getByText('9/1000 caracteres')).toBeInTheDocument()
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('alert')).toBeInTheDocument()
        expect(questionReportService.create).not.toHaveBeenCalled()
    })

    it('mostra mensagem de duplicidade sem apagar a descrição', async () => {
        vi.mocked(questionReportService.create).mockRejectedValue(new ApiError(409, 'Conflito', 'Você já possui um reporte pendente para esta questão.'))
        open()
        fill()
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('alert')).toHaveTextContent('reporte pendente')
        expect(screen.getByLabelText('Descrição do problema')).toHaveValue(' Problema de teste ')
        expect(screen.getByRole('button', { name: 'Enviar reporte' })).toBeEnabled()
    })

    it('permite nova tentativa após erro de conexão', async () => {
        vi.mocked(questionReportService.create).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({} as never)
        open()
        fill()
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('alert')).toHaveTextContent('Tente novamente')
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByRole('status')).toHaveTextContent('Reporte enviado')
    })

    it('cancela sem enviar', () => {
        open()
        fill()
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar reporte' }))
        expect(screen.queryByRole('form')).not.toBeInTheDocument()
        expect(questionReportService.create).not.toHaveBeenCalled()
    })

    it('impede envio duplo enquanto aguarda a resposta', async () => {
        let resolve!: () => void
        vi.mocked(questionReportService.create).mockImplementation(() => new Promise(done => { resolve = () => done({} as never) }))
        open()
        fill()
        fireEvent.submit(screen.getByRole('form'))
        fireEvent.submit(screen.getByRole('form'))
        expect(questionReportService.create).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('button', { name: 'Enviando reporte...' })).toBeDisabled()
        resolve()
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Reporte enviado'))
    })
})