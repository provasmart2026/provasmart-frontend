import type { ReactNode } from 'react'
import { StudyJourney } from '../../../components/StudyJourney'
import '../access.css'

export function AccessLayout({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <section className="access-page">
            <div className="access-intro">
                <span className="badge">ENEM • NO SEU RITMO</span>
                <h1>{title}</h1>
                <p>{description}</p>
                <StudyJourney />
            </div>
            {children}
        </section>
    )
}
