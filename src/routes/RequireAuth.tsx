import {useEffect, useState} from 'react'
import {Navigate, Outlet, useLocation} from 'react-router-dom'
import {authChangedEvent, getSession, type UserRole} from '../api/auth'

type RequireAuthProps = {
    allowedRoles?: UserRole[]
}

export function RequireAuth({allowedRoles}: RequireAuthProps) {
    const [session, setSession] = useState(getSession)
    const location = useLocation()

    useEffect(() => {
        const updateSession = () => setSession(getSession())
        window.addEventListener(authChangedEvent, updateSession)
        window.addEventListener('storage', updateSession)
        return () => {
            window.removeEventListener(authChangedEvent, updateSession)
            window.removeEventListener('storage', updateSession)
        }
    }, [])

    if (!session.authenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    if (allowedRoles && (!session.role || !allowedRoles.includes(session.role))) {
        return <Navigate to="/" replace/>
    }

    return <Outlet/>
}
