import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {Header} from './Header'

function renderHeader(role?: 'ADMIN' | 'ESTUDANTE') {
    if (role) {
        localStorage.setItem('provasmart.token', 'token-de-teste')
        localStorage.setItem('provasmart.role', role)
    }
    render(<MemoryRouter><Header/></MemoryRouter>)
}

describe('Header', () => {
    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('oculta questões e simulados sem login', () => {
        renderHeader()
        expect(screen.queryByRole('link', {name: 'Questões'})).not.toBeInTheDocument()
        expect(screen.queryByRole('link', {name: 'Simulados'})).not.toBeInTheDocument()
    })

    it('exibe somente simulados para estudante', () => {
        renderHeader('ESTUDANTE')
        expect(screen.queryByRole('link', {name: 'Questões'})).not.toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Simulados'})).toBeInTheDocument()
    })

    it('exibe questões e simulados para administrador', () => {
        renderHeader('ADMIN')
        expect(screen.getByRole('link', {name: 'Questões'})).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Simulados'})).toBeInTheDocument()
    })
})
