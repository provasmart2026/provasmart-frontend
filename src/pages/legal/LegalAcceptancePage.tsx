import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LegalLink } from '../../components/LegalLink'
import { AccessLayout } from '../access/components/AccessLayout'
import { legalDocumentService } from '../../services/legalDocumentService'
import { ApiError } from '../../services/api'
import { useSession } from '../../hooks/useSession'
import type { LegalAcceptanceStatus, LegalDocument } from '../../types/legalDocument'

type Documents = { terms: LegalDocument; privacy: LegalDocument; status: LegalAcceptanceStatus }

export function LegalAcceptancePage() {
    const navigate = useNavigate()
    const session = useSession()
    const nextPath = session.role === 'ADMIN' ? '/admin/questions' : '/simulados'
    const [documents, setDocuments] = useState<Documents | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setDocuments(null)
        setAccepted(false)
        async function load() {
            try {
                const status = await legalDocumentService.acceptanceStatus()
                if (!active) return
                if (!status.termsAcceptanceRequired && !status.privacyAcceptanceRequired) {
                    navigate(nextPath, { replace: true })
                    return
                }
                const [terms, privacy] = await Promise.all([
                    legalDocumentService.current('TERMOS_DE_USO'),
                    legalDocumentService.current('POLITICA_DE_PRIVACIDADE'),
                ])
                if (active) setDocuments({ terms, privacy, status })
            } catch {
                if (active) setError('Não foi possível carregar as atualizações. Tente novamente.')
            } finally {
                if (active) setLoading(false)
            }
        }
        void load()
        return () => { active = false }
    }, [attempt, navigate, nextPath])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!documents || !accepted || saving) return
        setSaving(true)
        setError('')
        try {
            await legalDocumentService.accept({
                acceptTerms: true,
                acceptPrivacyPolicy: true,
                termsVersion: documents.terms.version,
                privacyVersion: documents.privacy.version,
            })
            navigate(nextPath, { replace: true })
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 409) {
                setError('Os documentos foram atualizados durante a leitura. Confira as novas versões e confirme novamente.')
                setAttempt(value => value + 1)
            } else {
                setError('Não foi possível registrar o aceite. Tente novamente.')
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <AccessLayout title="Confira o que mudou." description="Mantenha-se informado sobre os documentos do ProvaSmart.">
            <form className="access-card" onSubmit={handleSubmit}>
                <span className="eyebrow">Documentos atualizados</span>
                <h2>Atualização dos documentos</h2>
                <p>Há novas versões disponíveis. Leia os documentos e confirme o aceite das versões apresentadas.</p>
                {loading && <p role="status">Consultando atualizações...</p>}
                {documents && <>
                    <p className="legal-document-reference">
                        <LegalLink to="/termos-de-uso">Ler Termos de Uso</LegalLink>
                        {' — versão '}{documents.terms.version}
                        {documents.status.termsAcceptanceRequired ? ' (novo aceite pendente)' : ' (já aceita)'}
                    </p>
                    <p className="legal-document-reference">
                        <LegalLink to="/politica-de-privacidade">Ler Política de Privacidade</LegalLink>
                        {' — versão '}{documents.privacy.version}
                        {documents.status.privacyAcceptanceRequired ? ' (novo aceite pendente)' : ' (já aceita)'}
                    </p>
                    <label className="checkbox legal-check">
                        <input type="checkbox" checked={accepted} disabled={saving}
                            onChange={event => setAccepted(event.target.checked)} />
                        <span>Li e aceito os Termos de Uso e a Política de Privacidade nas versões apresentadas.</span>
                    </label>
                </>}
                {error && <p className="form-error" role="alert">{error}</p>}
                {!loading && !documents && <button type="button" className="secondary-button submit-button"
                    onClick={() => { setError(''); setAttempt(value => value + 1) }}>Tentar novamente</button>}
                {documents && <button className="primary-button submit-button" type="submit"
                    disabled={!accepted || saving || loading}>{saving ? 'Registrando...' : 'Aceitar e continuar'}</button>}
            </form>
        </AccessLayout>
    )
}
