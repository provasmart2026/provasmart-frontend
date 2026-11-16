import { getLegalReturnPath } from './navigationState'
import { Link, useLocation } from 'react-router-dom'
import type { LegalDocumentType } from '../../types/legalDocument'
import { useLegalDocument } from '../../hooks/useLegalDocument'
import './legal.css'

function LegalPage({ type }: { type: LegalDocumentType }) {
    const location = useLocation()
    const { document: response, loading, error, retry } = useLegalDocument(type)
    if (loading || error || !response) {
        return <div className="legal-page">
            <h1>{type === 'TERMOS_DE_USO' ? 'Termos de Uso do ProvaSmart' : 'Política de Privacidade do ProvaSmart'}</h1>
            {loading ? <p role="status">Carregando documento...</p> : <>
                <p role="alert">Não foi possível carregar o documento. Tente novamente.</p>
                <button type="button" onClick={retry}>Tentar novamente</button>
            </>}
            <Link to={getLegalReturnPath(location)}>← Voltar</Link>
        </div>
    }
    const document = response.content
    return (
        <div className="legal-page">
            <header className="legal-heading">
                <span className="badge">{document.eyebrow}</span>
                <h1>{response.title}</h1>
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
                    <span>Versão {response.version} · vigente desde {response.effectiveAt.slice(0, 10).split('-').reverse().join('/')}</span>
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
    return <LegalPage type="TERMOS_DE_USO" />
}

export function PrivacyPage() {
    return <LegalPage type="POLITICA_DE_PRIVACIDADE" />
}
