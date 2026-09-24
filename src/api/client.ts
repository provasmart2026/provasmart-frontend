import axios, {type AxiosRequestConfig} from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('provasmart.token') ?? sessionStorage.getItem('provasmart.token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
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
