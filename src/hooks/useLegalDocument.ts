import { useEffect, useState } from 'react'
import { legalDocumentService } from '../services/legalDocumentService'
import type { LegalDocument, LegalDocumentType } from '../types/legalDocument'

export function useLegalDocument(type: LegalDocumentType) {
    const [document, setDocument] = useState<LegalDocument | null>(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setDocument(null)
        setError(false)
        legalDocumentService.current(type)
            .then(result => { if (active) setDocument(result) })
            .catch(() => { if (active) setError(true) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [type, attempt])

    return { document, error, loading, retry: () => setAttempt(value => value + 1) }
}
