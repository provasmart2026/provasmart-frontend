import axios, {type AxiosRequestConfig} from 'axios'
import {clearSession, getStoredToken, requestAuthRedirect} from '../auth/session'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = getStoredToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(response => response, error => {
    if (axios.isAxiosError(error)) {
        const token = getStoredToken()
        const status = error.response?.status
        const authorization = error.config?.headers.get('Authorization')
        const isRequestFromCurrentSession = token && authorization === `Bearer ${token}`
        if (isRequestFromCurrentSession) {
            if (status === 401) {
                clearSession()
                requestAuthRedirect('/login')
            } else if (status === 403) {
                requestAuthRedirect('/')
            }
        }
    }
    return Promise.reject(error)
})

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export async function apiRequest<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    try {
        const response = await api.request<T>({...config, url: path})
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? 0
            throw new ApiError(status, `Erro ao acessar a API (${status || 'sem resposta'})`)
        }
        throw error
    }
}
