import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    )
}
