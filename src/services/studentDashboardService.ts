import { apiRequest } from './api'
import type { StudentDashboard } from '../types/studentDashboard'

export const studentDashboardService = {
    simulations: () => apiRequest<StudentDashboard>('/student-dashboard/simulations'),
    'directed-practices': () => apiRequest<StudentDashboard>('/student-dashboard/directed-practices'),
}
