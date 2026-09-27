import { describe, expect, it } from 'vitest'
import { getPaginationItems, getReturnPage } from '../../utils/pagination'

describe('getPaginationItems', () => {
    it.each([
        { current: 0, total: 0, expected: [] },
        { current: 0, total: 1, expected: [1] },
        { current: 2, total: 5, expected: [1, 2, 3, 4, 5] },
        { current: 0, total: 20, expected: [1, 2, 3, '...', 20] },
        { current: 1, total: 20, expected: [1, 2, 3, '...', 20] },
        { current: 4, total: 20, expected: [1, '...', 4, 5, 6, '...', 20] },
        { current: 19, total: 20, expected: [1, '...', 18, 19, 20] },
        { current: 18, total: 20, expected: [1, '...', 18, 19, 20] },
        { current: 3, total: 8, expected: [1, 2, 3, 4, 5, '...', 8] },
    ])('gera páginas para índice $current e total $total', ({ current, total, expected }) => {
        expect(getPaginationItems(current, total)).toEqual(expected)
    })
})

describe('getReturnPage', () => {
    it.each([null, undefined, {}, { page: -1 }, { page: '2' }, { page: 1.5 }, { page: Infinity }])(
        'retorna a primeira página para estado inválido: %j',
        (state) => {
            expect(getReturnPage(state)).toBe(0)
        }
    )
    it('preserva uma página válida', () => {
        expect(getReturnPage({ page: 2 })).toBe(2)
    })
})
