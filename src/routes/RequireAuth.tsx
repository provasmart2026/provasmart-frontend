import {Navigate, Outlet, useLocation} from 'react-router-dom'
import type {UserRole} from '../auth/session'
import {useSession} from '../auth/useSession'

type RequireAuthProps = {
    allowedRoles?: UserRole[]
}

export function RequireAuth({allowedRoles}: RequireAuthProps) {
    const session = useSession()
    const location = useLocation()

    if (!session.authenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    if (allowedRoles && (!session.role || !allowedRoles.includes(session.role))) {
        return <Navigate to="/" replace/>
    }

    return <Outlet/>
}
