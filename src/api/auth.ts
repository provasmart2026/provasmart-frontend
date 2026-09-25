import {apiRequest} from './client'

type LoginCredentials = {
    email: string
    password: string
}

type RegisterData = LoginCredentials & {
    name: string
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
}

type MessageResponse = {
    message: string
}

type VerifyTwoFactorData = {
    email: string
    code: string
}

type ForgotPasswordData = {
    email: string
}

type ResetPasswordData = ForgotPasswordData & {
    code: string
    newPassword: string
}

export const authApi = {
    login: (data: LoginCredentials) =>
        apiRequest<MessageResponse>('/auth/login', {method: 'POST', data}),
    register: (data: RegisterData) =>
        apiRequest('/users', {method: 'POST', data}),
    verifyTwoFactor: (data: VerifyTwoFactorData) =>
        apiRequest<{token: string}>('/auth/verify-2fa', {method: 'POST', data}),
    forgotPassword: (data: ForgotPasswordData) =>
        apiRequest<MessageResponse>('/auth/forgot-password', {method: 'POST', data}),
    resetPassword: (data: ResetPasswordData) =>
        apiRequest<MessageResponse>('/auth/reset-password', {method: 'POST', data}),
}
