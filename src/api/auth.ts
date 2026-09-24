import {apiRequest} from './client'

export type LoginCredentials = {
    email: string
    password: string
}

export type RegisterData = LoginCredentials & {
    name: string
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
}

export type UserRole = 'ADMIN' | 'ESTUDANTE'

type MessageResponse = {
    message: string
}

type TokenResponse = {
    token: string
}

export type VerifyTwoFactorData = {
    email: string
    code: string
}

export type ForgotPasswordData = {
    email: string
}

export type ResetPasswordData = ForgotPasswordData & {
    code: string
    newPassword: string
}

export const authChangedEvent = 'provasmart:auth'
const tokenKey = 'provasmart.token'
const roleKey = 'provasmart.role'

export function login(credentials: LoginCredentials) {
    return apiRequest<MessageResponse>('/auth/login', {
        method: 'POST',
        data: credentials,
    })
}

export function forgotPassword(data: ForgotPasswordData) {
    return apiRequest<MessageResponse>('/auth/forgot-password', {method: 'POST', data})
}

export function resetPassword(data: ResetPasswordData) {
    return apiRequest<MessageResponse>('/auth/reset-password', {method: 'POST', data})
}

export function register(data: RegisterData) {
    return apiRequest('/users', {
        method: 'POST',
        data,
    })
}

export function verifyTwoFactor(data: VerifyTwoFactorData) {
    return apiRequest<TokenResponse>('/auth/verify-2fa', {
        method: 'POST',
        data,
    })
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

export function saveSession(response: TokenResponse, remember: boolean) {
    const {token} = response
    if (typeof token !== 'string' || !token.trim()) return false

    const storage = remember ? localStorage : sessionStorage
    const role = getTokenRole(token)
    for (const previousStorage of [localStorage, sessionStorage]) {
        previousStorage.removeItem(tokenKey)
        previousStorage.removeItem(roleKey)
    }
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
