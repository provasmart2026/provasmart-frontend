export type UserRole = 'ADMIN' | 'ESTUDANTE'

export const tokenKey = 'provasmart.token'
export const roleKey = 'provasmart.role'
export const authChangedEvent = 'provasmart:auth'
export const authRedirectEvent = 'provasmart:auth-redirect'
type AuthRedirectPath = '/login' | '/'

export function getStoredToken() {
    return localStorage.getItem(tokenKey) ?? sessionStorage.getItem(tokenKey)
}

export function clearSession({ notify = true }: { notify?: boolean } = {}) {
    for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem(tokenKey)
        storage.removeItem(roleKey)
    }
    if (notify) window.dispatchEvent(new Event(authChangedEvent))
}

export function requestAuthRedirect(path: AuthRedirectPath) {
    window.dispatchEvent(new CustomEvent<AuthRedirectPath>(authRedirectEvent, { detail: path }))
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

export function saveSession(response: { token: string }, remember: boolean) {
    const { token } = response
    if (typeof token !== 'string' || !token.trim()) return false

    const storage = remember ? localStorage : sessionStorage
    const role = getTokenRole(token)
    clearSession({ notify: false })
    storage.setItem(tokenKey, token)
    if (role) storage.setItem(roleKey, role)
    window.dispatchEvent(new Event(authChangedEvent))
    return true
}

export function getSession() {
    const storage = localStorage.getItem(tokenKey) ? localStorage : sessionStorage
    const token = storage.getItem(tokenKey)
    const storedRole = storage.getItem(roleKey)
    const role = storedRole === 'ADMIN' || storedRole === 'ESTUDANTE' ? storedRole : token ? getTokenRole(token) : null
    return { authenticated: Boolean(token), role }
}
