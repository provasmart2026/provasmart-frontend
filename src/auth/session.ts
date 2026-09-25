export const tokenKey = 'provasmart.token'
export const roleKey = 'provasmart.role'
export const authChangedEvent = 'provasmart:auth'
export const authRedirectEvent = 'provasmart:auth-redirect'
export type AuthRedirectPath = '/login' | '/'

export function getStoredToken() {
    return localStorage.getItem(tokenKey) ?? sessionStorage.getItem(tokenKey)
}

export function clearSession({notify = true}: {notify?: boolean} = {}) {
    for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem(tokenKey)
        storage.removeItem(roleKey)
    }
    if (notify) window.dispatchEvent(new Event(authChangedEvent))
}

export function requestAuthRedirect(path: AuthRedirectPath) {
    window.dispatchEvent(new CustomEvent<AuthRedirectPath>(authRedirectEvent, {detail: path}))
}
