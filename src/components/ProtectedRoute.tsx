import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../services/sessionService'
import { useSession } from '../hooks/useSession'

type ProtectedRouteProps = {
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const session = useSession()
    const location = useLocation()

    if (!session.authenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (allowedRoles && (!session.role || !allowedRoles.includes(session.role))) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
