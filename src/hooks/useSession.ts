import { useEffect, useState } from 'react'
import { authChangedEvent, getSession } from '../services/sessionService'

export function useSession() {
    const [session, setSession] = useState(getSession)

    useEffect(() => {
        const updateSession = () => setSession(getSession())
        window.addEventListener(authChangedEvent, updateSession)
        window.addEventListener('storage', updateSession)
        return () => {
            window.removeEventListener(authChangedEvent, updateSession)
            window.removeEventListener('storage', updateSession)
        }
    }, [])

    return session
}
