type LegalLocation = {
    pathname: string
    search: string
    hash: string
    state: unknown
}

export function getLegalReturnPath(location: LegalLocation): string {
    if (!['/termos-de-uso', '/politica-de-privacidade'].includes(location.pathname)) {
        return location.pathname + location.search + location.hash
    }

    const state = location.state
    if (!state || typeof state !== 'object' || !('returnTo' in state)) return '/'
    const path = state.returnTo
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || /[\\\s]/.test(path)) return '/'
    if (['/termos-de-uso', '/politica-de-privacidade'].includes(path.split(/[?#]/)[0])) return '/'
    return path
}
