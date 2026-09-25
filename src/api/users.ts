import type {UserRole} from '../auth/session'
import type {Page} from '../types/api'
import {apiRequest} from './client'

export type UserResponse = {
    id: string
    name: string
    email: string
    role: UserRole
    active: boolean
    deletionRequested: boolean
    deletionRequestedAt: string | null
    termsVersion: string
    termsAcceptedAt: string
    privacyVersion: string
    privacyAcceptedAt: string
    createdAt: string
    updatedAt: string | null
}

export const usersApi = {
    getCurrent: () => apiRequest<UserResponse>('/users/me', {method: 'GET'}),
    requestDeletion: () => apiRequest<void>('/users/me/request-deletion', {method: 'PATCH'}),
    list: (page = 0, size = 10) =>
        apiRequest<Page<UserResponse>>(`/users?page=${page}&size=${size}`, {method: 'GET'}),
    activate: (id: string) =>
        apiRequest<void>(`/users/${encodeURIComponent(id)}/activate`, {method: 'PATCH'}),
    deactivate: (id: string) =>
        apiRequest<void>(`/users/${encodeURIComponent(id)}/deactivate`, {method: 'PATCH'}),
    delete: (id: string) =>
        apiRequest<void>(`/users/${encodeURIComponent(id)}`, {method: 'DELETE'}),
}
