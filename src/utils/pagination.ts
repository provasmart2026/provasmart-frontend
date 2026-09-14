export function getPaginationItems(currentPage: number, totalPages: number): (number | '...')[] {
    if (totalPages <= 0) return []
    if (totalPages <= 7) return Array.from({length: totalPages}, (_, index) => index + 1)

    const current = Math.min(totalPages, Math.max(1, currentPage + 1))
    const start = Math.max(2, Math.min(current - 1, totalPages - 2))
    const end = Math.min(totalPages - 1, Math.max(current + 1, 3))
    const items: (number | '...')[] = [1]

    if (start === 3) items.push(2)
    else if (start > 3) items.push('...')
    for (let page = start; page <= end; page++) items.push(page)
    if (end === totalPages - 2) items.push(totalPages - 1)
    else if (end < totalPages - 2) items.push('...')
    items.push(totalPages)
    return items
}

export function getReturnPage(state: unknown): number {
    if (!state || typeof state !== 'object' || !('page' in state)) return 0
    const page = state.page
    return typeof page === 'number' && Number.isInteger(page) && page >= 0 ? page : 0
}
