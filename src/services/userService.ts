import type { UserAdminSummary, UserResponse } from '../types/user'
import type { Page } from '../types/api'
import { apiRequest } from './api'

export const userService = {
    updateName: (name: string) => apiRequest<UserResponse>('/users/me/name', { method: 'PATCH', data: { name } }),
    getCurrent: () => apiRequest<UserResponse>('/users/me', { method: 'GET' }),
    requestDeletion: () => apiRequest<void>('/users/me/request-deletion', { method: 'PATCH' }),
    list: (page = 0, size = 10) =>
        apiRequest<Page<UserAdminSummary>>(`/users?page=${page}&size=${size}`, { method: 'GET' }),
    revealEmail: (id: string) =>
        apiRequest<{ email: string }>(`/users/${encodeURIComponent(id)}/email`),
    activate: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}/activate`, { method: 'PATCH' }),
    deactivate: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}/deactivate`, { method: 'PATCH' }),
    delete: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
