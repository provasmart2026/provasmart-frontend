import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authRedirectEvent } from '../services/sessionService'

export function AuthRedirect() {
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = useRef(location.pathname)
    currentPath.current = location.pathname

    useEffect(() => {
        const redirect = (event: Event) => {
            const path: unknown = (event as CustomEvent).detail
            if ((path === '/login' || path === '/') && currentPath.current !== path) {
                currentPath.current = path
                navigate(path, { replace: true })
            }
        }
        window.addEventListener(authRedirectEvent, redirect)
        return () => window.removeEventListener(authRedirectEvent, redirect)
    }, [navigate])

    return null
}
