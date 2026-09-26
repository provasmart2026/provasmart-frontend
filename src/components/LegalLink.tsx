import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getLegalReturnPath } from '../pages/legal/navigationState'

export function LegalLink({ to, children }: {
    to: '/termos-de-uso' | '/politica-de-privacidade'
    children: ReactNode
}) {
    const location = useLocation()
    return <Link to={to} state={{ returnTo: getLegalReturnPath(location) }}>{children}</Link>
}
