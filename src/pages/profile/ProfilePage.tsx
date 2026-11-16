import { LegalLink } from '../../components/LegalLink'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/api'
import { userService } from '../../services/userService'
import type { UserResponse } from '../../types/user'
import './ProfilePage.css'
import { formatDate } from '../../utils/date'

function ProfileDate({ value }: { value: string }) {
    return <time dateTime={value}>{formatDate(value)}</time>
}

export function ProfilePage() {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [requesting, setRequesting] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)
    const [editingName, setEditingName] = useState(false)
    const [name, setName] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [nameError, setNameError] = useState('')
    const [nameSuccess, setNameSuccess] = useState('')
    const namePending = useRef(false)
    const deletionPending = useRef(false)
    const mounted = useRef(false)

    useEffect(() => {
        mounted.current = true
        let cancelled = false
        userService
            .getCurrent()
            .then((data) => {
                if (!cancelled) setUser(data)
            })
            .catch(() => {
                if (!cancelled) setLoadError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
            mounted.current = false
        }
    }, [])

    function startEditingName() {
        if (!user || deletionPending.current) return
        setName(user.name)
        setNameError('')
        setNameSuccess('')
        setEditingName(true)
    }

    async function saveName(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!user || namePending.current || deletionPending.current) return
        const normalizedName = name.trim()
        if (!normalizedName || name.length > 150) {
            setNameError('Informe um nome com até 150 caracteres.')
            return
        }
        namePending.current = true
        setSavingName(true)
        setNameError('')
        try {
            const result = await userService.updateName(normalizedName)
            if (mounted.current) {
                setUser(result)
                setEditingName(false)
                setNameSuccess('Nome atualizado com sucesso.')
            }
        } catch (error) {
            if (mounted.current) setNameError(error instanceof ApiError && error.backendMessage
                ? error.backendMessage : 'Não foi possível atualizar o nome. Tente novamente.')
        } finally {
            namePending.current = false
            if (mounted.current) setSavingName(false)
        }
    }

    async function refreshUserAfterDeletion() {
        try {
            const updatedUser = await userService.getCurrent()
            if (mounted.current) setUser(updatedUser)
        } catch {
            if (mounted.current)
                setRequestError('Sua solicitação foi registrada, mas não foi possível atualizar seus dados agora.')
        }
    }

    async function handleRequestDeletion() {
        if (deletionPending.current || namePending.current || !user || user.deletionRequested) return
        if (
            !window.confirm(
                'Deseja realmente solicitar a exclusão da sua conta? Um administrador precisará concluir a exclusão definitiva.'
            )
        )
            return
        deletionPending.current = true
        setRequesting(true)
        setRequestError(null)
        try {
            await userService.requestDeletion()
            if (!mounted.current) return
            await refreshUserAfterDeletion()
        } catch {
            if (mounted.current) setRequestError('Não foi possível solicitar a exclusão da conta. Tente novamente.')
        } finally {
            deletionPending.current = false
            if (mounted.current) setRequesting(false)
        }
    }

    return (
        <section className="profile-page" aria-labelledby="profile-title">
            <h1 id="profile-title">Meu perfil</h1>
            {loading && <p role="status">Carregando seus dados...</p>}
            {loadError && <p role="alert">Não foi possível carregar seus dados.</p>}
            {user && (
                <>
                    <section className="profile-panel" aria-labelledby="personal-title">
                        <h2 id="personal-title">Dados pessoais</h2>
                        <dl>
                            <div>
                                <dt>Nome</dt>
                                <dd className="profile-name-value">
                                    <span>{user.name}</span>
                                    {!editingName && <button className="profile-edit-name" type="button"
                                        aria-label="Editar nome" title="Editar nome" disabled={requesting || savingName}
                                        onClick={startEditingName}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="m16 3 5 5-12 12-6 1 1-6L16 3Z" />
                                            <path d="m13 6 5 5" />
                                        </svg>
                                    </button>}
                                </dd>
                            </div>
                            <div>
                                <dt>E-mail</dt>
                                <dd>{user.email}</dd>
                            </div>
                            <div>
                                <dt>Perfil</dt>
                                <dd>{user.role === 'ADMIN' ? 'Administrador' : 'Estudante'}</dd>
                            </div>
                        </dl>
                        {editingName ? <form className="profile-name-form" aria-label="Alterar nome" onSubmit={saveName}>
                            <label htmlFor="profile-name">Nome</label>
                            <input id="profile-name" name="name" autoComplete="name" required maxLength={150}
                                value={name} disabled={savingName || requesting} onChange={event => setName(event.target.value)} autoFocus />
                            <span className="profile-name-count">{name.length}/150 caracteres</span>
                            {nameError && <p role="alert">{nameError}</p>}
                            <div className="profile-name-actions">
                                <button type="button" disabled={savingName} onClick={() => {
                                    setEditingName(false)
                                    setNameError('')
                                }}>Cancelar</button>
                                <button className="primary-button" type="submit" disabled={savingName || requesting}>
                                    {savingName ? 'Salvando nome...' : 'Salvar nome'}
                                </button>
                            </div>
                        </form> : null}
                        {nameSuccess && <p role="status">{nameSuccess}</p>}
                    </section>
                    <section className="profile-panel" aria-labelledby="account-title">
                        <h2 id="account-title">Conta</h2>
                        <dl>
                            <div>
                                <dt>Status da conta</dt>
                                <dd>{user.active ? 'Ativa' : 'Inativa'}</dd>
                            </div>
                            <div>
                                <dt>Data de criação</dt>
                                <dd>
                                    <ProfileDate value={user.createdAt} />
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <section className="profile-panel" aria-labelledby="privacy-title">
                        <h2 id="privacy-title">Privacidade e registros de aceite</h2>
                        <nav className="profile-legal-links" aria-label="Documentos de privacidade e uso">
                            <LegalLink to="/termos-de-uso">Termos de Uso</LegalLink>
                            <LegalLink to="/politica-de-privacidade">Política de Privacidade</LegalLink>
                        </nav>
                        <dl>
                            <div>
                                <dt>Versão dos Termos de Uso</dt>
                                <dd>{user.termsVersion}</dd>
                            </div>
                            <div>
                                <dt>Aceite dos Termos de Uso</dt>
                                <dd>
                                    <ProfileDate value={user.termsAcceptedAt} />
                                </dd>
                            </div>
                            <div>
                                <dt>Versão da Política de Privacidade</dt>
                                <dd>{user.privacyVersion}</dd>
                            </div>
                            <div>
                                <dt>Ciência da Política de Privacidade</dt>
                                <dd>
                                    <ProfileDate value={user.privacyAcceptedAt} />
                                </dd>
                            </div>
                        </dl>
                    </section>
                    <section className="profile-panel profile-deletion" aria-labelledby="deletion-title">
                        <h2 id="deletion-title">Exclusão da conta</h2>
                        {user.deletionRequested ? (
                            <>
                                <p role="status">
                                    <strong>Exclusão solicitada</strong>
                                </p>
                                <p>Sua solicitação de exclusão foi registrada e aguarda processamento.</p>
                                {user.deletionRequestedAt && (
                                    <p>
                                        Data da solicitação: <ProfileDate value={user.deletionRequestedAt} />
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p>A exclusão definitiva será concluída por um administrador após sua solicitação.</p>
                                <button
                                    className="primary-button"
                                    type="button"
                                    disabled={requesting || savingName}
                                    onClick={handleRequestDeletion}
                                >
                                    {requesting ? 'Solicitando exclusão...' : 'Solicitar exclusão da conta'}
                                </button>
                            </>
                        )}
                        {requestError && <p role="alert">{requestError}</p>}
                    </section>
                </>
            )}
        </section>
    )
}
