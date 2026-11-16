import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QuestionCorrectionMap, type CorrectionQuestion } from '../../../pages/student/QuestionCorrectionMap'
import { questionReportService } from '../../../services/questionReportService'

vi.mock('../../../services/questionReportService', () => ({ questionReportService: { create: vi.fn() } }))

const questions: CorrectionQuestion[] = [1, 2].map(position => ({
    questionId: `question-${position}`, position, statement: `Enunciado ${position}`,
    explanation: 'Explicação', selectedAlternativeId: 'a', correctAlternativeId: 'b',
    correct: false, alternatives: [{ id: 'a', letter: 'A', text: 'Primeira' }, { id: 'b', letter: 'B', text: 'Segunda' }],
}))

describe('reporte pelo mapa de correção', () => {
    it.each(['SIMULADO', 'PRATICA_DIRECIONADA'] as const)('envia a questão selecionada de %s', async origin => {
        vi.mocked(questionReportService.create).mockReset().mockResolvedValue({} as never)
        render(<QuestionCorrectionMap questions={questions} reportContext={{ origin, activityId: 'activity' }} />)
        fireEvent.click(screen.getByRole('button', { name: 'Reportar questão' }))
        fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: 'Texto da primeira questão' } })
        fireEvent.click(screen.getByRole('button', { name: 'Questão 2: erro' }))
        expect(screen.queryByRole('form')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Reportar questão' }))
        expect(screen.getByLabelText('Descrição do problema')).toHaveValue('')
        fireEvent.change(screen.getByLabelText('Motivo'), { target: { value: 'GABARITO_INCORRETO' } })
        fireEvent.change(screen.getByLabelText('Descrição do problema'), { target: { value: 'Revisar gabarito' } })
        fireEvent.submit(screen.getByRole('form'))
        expect(await screen.findByText('Reporte enviado. Obrigado por avisar!')).toBeInTheDocument()
        expect(questionReportService.create).toHaveBeenCalledExactlyOnceWith(origin, 'activity', 'question-2', {
            reason: 'GABARITO_INCORRETO', description: 'Revisar gabarito',
        })
        fireEvent.click(screen.getByRole('button', { name: 'Ver explicação' }))
        expect(screen.getByText('Enunciado 2')).toBeInTheDocument()
    })
})
