import {apiRequest} from './client'

export type LoginCredentials = {
    email: string
    password: string
}

export type RegisterData = LoginCredentials & {
    name: string
}

export type UserRole = 'ADMIN' | 'ESTUDANTE'

type LoginResponse = {
    accessToken?: string
    token?: string
    role?: UserRole
}

export const authChangedEvent = 'provasmart:auth'
const tokenKey = 'provasmart.token'
const roleKey = 'provasmart.role'

export function login(credentials: LoginCredentials) {
    return apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        data: credentials,
    })
}

export function register(data: RegisterData) {
    return apiRequest('/users', {
        method: 'POST',
        data,
    })
}

export function getToken(response: LoginResponse) {
    return response.accessToken ?? response.token
}

function getTokenRole(token: string): UserRole | null {
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')))
        const value = payload.role ?? payload.roles?.[0] ?? payload.authorities?.[0]
        const role = typeof value === 'string' ? value.replace('ROLE_', '') : ''
        return role === 'ADMIN' || role === 'ESTUDANTE' ? role : null
    } catch {
        return null
    }
}

export function saveSession(response: LoginResponse, remember: boolean) {
    const token = getToken(response)
    if (!token) return false

    const storage = remember ? localStorage : sessionStorage
    const role = response.role ?? getTokenRole(token)
    storage.setItem(tokenKey, token)
    if (role) storage.setItem(roleKey, role)
    window.dispatchEvent(new Event(authChangedEvent))
    return true
}

export function getSession() {
    const storage = localStorage.getItem(tokenKey) ? localStorage : sessionStorage
    const token = storage.getItem(tokenKey)
    const storedRole = storage.getItem(roleKey)
    const role = storedRole === 'ADMIN' || storedRole === 'ESTUDANTE'
        ? storedRole
        : token ? getTokenRole(token) : null
    return {authenticated: Boolean(token), role}
}
