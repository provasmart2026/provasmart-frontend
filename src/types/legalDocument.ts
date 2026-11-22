export type LegalDocumentType = 'TERMOS_DE_USO' | 'POLITICA_DE_PRIVACIDADE'

export type LegalDocumentContent = {
    eyebrow: string
    title: string
    description: string
    version: string
    sections: { title: string; blocks: (string | string[])[] }[]
}

export type LegalDocument = {
    id: string
    type: LegalDocumentType
    version: string
    title: string
    content: LegalDocumentContent
    effectiveAt: string
    createdAt: string
}

export type LegalAcceptanceStatus = {
    termsAcceptanceRequired: boolean
    privacyAcceptanceRequired: boolean
}

export type LegalAcceptanceRequest = {
    acceptTerms: boolean
    acceptPrivacyPolicy: boolean
    termsVersion: string
    privacyVersion: string
}
