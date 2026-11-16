import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { questionReportService } from '../../../services/questionReportService'
import { ApiError } from '../../../services/api'
import type { QuestionReportDetail } from '../../../types/questionReport'
import { formatDate } from '../../../utils/date'
import { originLabels, reasonLabels, statusLabels } from './reportLabels'
import './QuestionReports.css'

type Snapshot = { statement: string; alternatives: { letter: string; text: string }[] }

function parseSnapshot(content: string): Snapshot | null {
    try {
        const value = JSON.parse(content)
        if (typeof value?.statement !== 'string' || !Array.isArray(value.alternatives)
            || !value.alternatives.every((item: unknown) => item !== null && typeof item === 'object'
                && 'letter' in item && typeof item.letter === 'string' && 'text' in item && typeof item.text === 'string')) return null
        return value
    } catch { return null }
}

export function QuestionReportDetailPage() {
    const { id } = useParams()
    return <QuestionReportDetailScreen key={id} id={id} />
}

function QuestionReportDetailScreen({ id }: { id?: string }) {
    const location = useLocation()
    const [report, setReport] = useState<QuestionReportDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [actionError, setActionError] = useState('')
    const [success, setSuccess] = useState('')
    const [busy, setBusy] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const pending = useRef(false)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    useEffect(() => {
        let active = true
        setLoading(true)
        setLoadError('')
        if (!id) { setLoadError('Reporte não encontrado.'); setLoading(false); return }
        questionReportService.get(id)
            .then(result => { if (active) setReport(result) })
            .catch(error => { if (active) setLoadError(error instanceof ApiError && error.status === 404
                ? 'Reporte não encontrado.' : 'Não foi possível carregar o reporte.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [id, attempt])

    async function update(status: 'RESOLVIDO' | 'DESCARTADO') {
        if (!report || pending.current || report.status !== 'PENDENTE') return
        if (!window.confirm(status === 'RESOLVIDO' ? 'Marcar este reporte como resolvido?' : 'Descartar este reporte?')) return
        pending.current = true
        setBusy(true)
        setActionError('')
        setSuccess('')
        try {
            const result = await questionReportService.updateStatus(report.id, status)
            if (mounted.current) {
                setReport(result)
                setSuccess(status === 'RESOLVIDO' ? 'Reporte marcado como resolvido.' : 'Reporte descartado.')
            }
        } catch (error) {
            if (mounted.current) {
                setActionError(error instanceof ApiError && error.backendMessage ? error.backendMessage : 'Não foi possível atualizar o reporte. Tente novamente.')
                if (error instanceof ApiError && error.status === 409) setAttempt(value => value + 1)
            }
        } finally {
            pending.current = false
            if (mounted.current) setBusy(false)
        }
    }

    const snapshot = report ? parseSnapshot(report.contentSnapshot) : null
    return <section className="admin-reports" aria-labelledby="report-title">
        <p className="eyebrow">Administração</p><h1 id="report-title">Detalhe do reporte</h1>
        <Link className="reports-back" to={`/admin/question-reports${location.search}`}>Voltar aos reportes</Link>
        {loading ? <p role="status">Carregando reporte...</p> : loadError ? <div className="reports-panel">
            <p role="alert">{loadError}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button>
        </div> : report && <>
            <div className="reports-panel">
                <dl className="report-metadata">
                    <div><dt>Estudante</dt><dd>{report.studentName}</dd></div>
                    <div><dt>Origem</dt><dd>{originLabels[report.origin]}</dd></div>
                    <div><dt>Motivo</dt><dd>{reasonLabels[report.reason]}</dd></div>
                    <div><dt>Status</dt><dd><span className={`report-status ${report.status.toLowerCase()}`}>{statusLabels[report.status]}</span></dd></div>
                    <div><dt>Enviado em</dt><dd>{formatDate(report.createdAt)}</dd></div>
                    {report.updatedAt && <div><dt>Atualizado em</dt><dd>{formatDate(report.updatedAt)}</dd></div>}
                </dl>
                <h2>Descrição do problema</h2><p className="report-text">{report.description}</p>
                <Link className="primary-button report-edit-link" to={`/admin/questions/${encodeURIComponent(report.originalQuestionId)}/edit`}
                    state={{ returnTo: `/admin/question-reports/${encodeURIComponent(report.id)}${location.search}` }}>Abrir questão original</Link>
            </div>
            <div className="reports-panel">
                <h2>Conteúdo da questão no envio</h2>
                {snapshot ? <><p className="report-text">{snapshot.statement}</p>
                    <ul className="report-alternatives">{snapshot.alternatives.map((item, index) => <li key={`${item.letter}-${index}`}>
                        <strong>{item.letter}.</strong> <span className="report-text">{item.text}</span>
                    </li>)}</ul>
                </> : <p role="alert">Não foi possível exibir o conteúdo preservado da questão.</p>}
            </div>
            <div className="reports-panel">
                {actionError && <p role="alert">{actionError}</p>}
                {success && <p role="status">{success}</p>}
                {report.status === 'PENDENTE' ? <div className="reports-actions">
                    <button type="button" className="primary-button" disabled={busy} onClick={() => void update('RESOLVIDO')}>Marcar como resolvido</button>
                    <button type="button" className="report-discard" disabled={busy} onClick={() => void update('DESCARTADO')}>Descartar reporte</button>
                </div> : <p>Este reporte está encerrado.</p>}
            </div>
        </>}
    </section>
}