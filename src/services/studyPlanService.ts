import { apiRequest } from './api'
import type { Page } from '../types/api'
import type {
    StudyPlan,
    StudyPlanCreateRequest,
    StudyPlanStatus,
    StudyPlanSummary,
} from '../types/studyPlan'

export const studyPlanService = {
    create: (data: StudyPlanCreateRequest) =>
        apiRequest<StudyPlan>('/study-plans', {
            method: 'POST',
            data,
        }),

    current: async () =>
        (await apiRequest<StudyPlan | undefined>('/study-plans/current')) || null,

    get: (planId: string) =>
        apiRequest<StudyPlan>(`/study-plans/${encodeURIComponent(planId)}`),

    list: (page: number, size: number, status?: StudyPlanStatus) =>
        apiRequest<Page<StudyPlanSummary>>('/study-plans', {
            params: { page, size, status },
        }),

    updateCompletion: (
        planId: string,
        activityId: string,
        completed: boolean
    ) =>
        apiRequest<StudyPlan>(
            `/study-plans/${encodeURIComponent(planId)}/activities/${encodeURIComponent(activityId)}/completion`,
            {
                method: 'PATCH',
                data: { completed },
            }
        ),
}
