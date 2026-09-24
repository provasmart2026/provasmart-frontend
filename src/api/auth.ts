import {apiRequest} from './client'

export type LoginCredentials = {
    email: string
    password: string
}

export type RegisterData = LoginCredentials & {
    name: string
}

type LoginResponse = {
    accessToken?: string
    token?: string
}

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
