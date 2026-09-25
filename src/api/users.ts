import type {UserRole} from './auth'
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

export function getCurrentUser() {
    return apiRequest<UserResponse>('/users/me', {method: 'GET'})
}

export function requestAccountDeletion() {
    return apiRequest<void>('/users/me/request-deletion', {method: 'PATCH'})
}

export type PageResponse<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

export function getUsers(page = 0, size = 10) {
    return apiRequest<PageResponse<UserResponse>>(`/users?page=${page}&size=${size}`, {method: 'GET'})
}

export function activateUser(id: string) {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}/activate`, {method: 'PATCH'})
}

export function deactivateUser(id: string) {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}/deactivate`, {method: 'PATCH'})
}

export function deleteUser(id: string) {
    return apiRequest<void>(`/users/${encodeURIComponent(id)}`, {method: 'DELETE'})
}
