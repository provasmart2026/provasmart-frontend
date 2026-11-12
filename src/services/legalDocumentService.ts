import { apiRequest } from './api'
import type { LegalDocument, LegalDocumentContent, LegalDocumentType } from '../types/legalDocument'

function parseContent(value: string): LegalDocumentContent {
    const content = JSON.parse(value)
    if (!content || typeof content.eyebrow !== 'string' || typeof content.description !== 'string'
        || !Array.isArray(content.sections) || !content.sections.every((section: LegalDocumentContent['sections'][number]) =>
            section && typeof section.title === 'string' && Array.isArray(section.blocks)
            && section.blocks.every(block => typeof block === 'string'
                || (Array.isArray(block) && block.every(item => typeof item === 'string'))))) {
        throw new Error('Conteúdo do documento legal inválido.')
    }
    return content
}

export const legalDocumentService = {
    async current(type: LegalDocumentType): Promise<LegalDocument> {
        const response = await apiRequest<Omit<LegalDocument, 'content'> & { content: string }>(
            `/legal-documents/${type}/current`)
        return { ...response, content: parseContent(response.content) }
    },
}
