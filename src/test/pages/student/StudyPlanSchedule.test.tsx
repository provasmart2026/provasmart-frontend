import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {StudyPlanSchedule} from '../../../pages/student/StudyPlanSchedule'
import type {StudyPlan} from '../../../types/studyPlan'

const plan: StudyPlan = {
    id: 'plan', simulationId: 'simulation', dailyHours: 1, startDate: '2026-11-12',
    status: 'ATIVO', createdAt: '2026-11-12T12:00:00', archivedAt: null,
    totalActivities: 2, completedActivities: 0, progressPercentage: 0,
    activities: [1, 2].map(day => ({
        id: `activity-${day}`, dayNumber: day, position: 1,
        examArea: 'MATEMATICA', disciplineId: 'discipline', disciplineName: 'Matemática',
        subjectId: `subject-${day}`, subjectName: `Assunto ${day}`, type: 'ESTUDO', completed: false, completedAt: null
    })),
}

describe('StudyPlanSchedule', () => {
    it('exibe somente o dia escolhido e permite concluir sua atividade', () => {
        const toggle = vi.fn()
        render(<StudyPlanSchedule plan={plan} onToggleActivity={toggle}/>)
        expect(screen.getByText('Assunto 1')).toBeInTheDocument()
        expect(screen.queryByText('Assunto 2')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', {name: /Dia 2 13\/11/}))
        expect(screen.getByText('Assunto 2')).toBeInTheDocument()
        expect(screen.queryByText('Assunto 1')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('checkbox'))
        expect(toggle).toHaveBeenCalledWith(plan.activities[1])
    })

    it('mantém planos arquivados somente para consulta e limita a navegação', () => {
        render(<StudyPlanSchedule plan={{...plan, status: 'ARQUIVADO'}} onToggleActivity={vi.fn()}/>)
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Dia anterior'})).toBeDisabled()
        fireEvent.click(screen.getByRole('button', {name: /Dia 7/}))
        expect(screen.getByRole('button', {name: 'Próximo dia'})).toBeDisabled()
    })
})
