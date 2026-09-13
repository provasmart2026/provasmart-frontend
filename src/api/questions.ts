import { apiRequest } from './client'

export type Alternative = {
  id: string
  description: string
}

export type Question = {
  id: string
  statement: string
  active: boolean
  alternatives: Alternative[]
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const questionsApi = {
  listActive: (page = 0, size = 10) =>
    apiRequest<Page<Question>>(`/questions/active?page=${page}&size=${size}`),
}
