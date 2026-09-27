import { getLegalReturnPath } from './navigationState'
import { Link, useLocation } from 'react-router-dom'
import { privacy, terms, type LegalDocument } from './legalDocuments'
import './legal.css'

function LegalPage({ document }: { document: LegalDocument }) {
    const location = useLocation()
    return (
        <div className="legal-page">
            <header className="legal-heading">
                <span className="badge">{document.eyebrow}</span>
                <h1>{document.title}</h1>
                <p>{document.description}</p>
            </header>
            <div className="legal-layout">
                <aside className="legal-nav">
                    <strong>Nesta página</strong>
                    {document.sections.map((section, index) => (
                        <a key={section.title} href={`#secao-${index + 1}`}>
                            {section.title}
                        </a>
                    ))}
                    <Link to={getLegalReturnPath(location)}>← Voltar</Link>
                </aside>
                <article className="legal-content">
                    <span>{document.version}</span>
                    {document.sections.map((section, sectionIndex) => (
                        <section id={`secao-${sectionIndex + 1}`} key={section.title}>
                            <h2>{section.title}</h2>
                            {section.blocks.map((block, blockIndex) =>
                                Array.isArray(block) ? (
                                    <ul key={blockIndex}>
                                        {block.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p key={blockIndex}>{block}</p>
                                )
                            )}
                        </section>
                    ))}
                </article>
            </div>
        </div>
    )
}

export function TermsPage() {
    return <LegalPage document={terms} />
}

export function PrivacyPage() {
    return <LegalPage document={privacy} />
}
