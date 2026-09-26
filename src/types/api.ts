export type Page<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
    first: boolean
    last: boolean
    empty: boolean
    numberOfElements: number
}
