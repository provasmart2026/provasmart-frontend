import type { UserResponse } from '../types/user'
import type { Page } from '../types/api'
import { apiRequest } from './api'

export const userService = {
    getCurrent: () => apiRequest<UserResponse>('/users/me', { method: 'GET' }),
    requestDeletion: () => apiRequest<void>('/users/me/request-deletion', { method: 'PATCH' }),
    list: (page = 0, size = 10) =>
        apiRequest<Page<UserResponse>>(`/users?page=${page}&size=${size}`, { method: 'GET' }),
    activate: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}/activate`, { method: 'PATCH' }),
    deactivate: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}/deactivate`, { method: 'PATCH' }),
    delete: (id: string) => apiRequest<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
