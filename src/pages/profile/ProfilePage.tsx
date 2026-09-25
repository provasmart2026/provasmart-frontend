import {useEffect, useRef, useState} from 'react'
import {getCurrentUser, requestAccountDeletion, type UserResponse} from '../../api/users'
import './ProfilePage.css'
import {formatDate} from '../../utils/date'

function ProfileDate({value}: {value: string}) {
    return <time dateTime={value}>{formatDate(value)}</time>
}

export function ProfilePage() {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [requesting, setRequesting] = useState(false)
    const [requestError, setRequestError] = useState<string | null>(null)
    const pending = useRef(false)
    const mounted = useRef(false)

    useEffect(() => {
        mounted.current = true
        let cancelled = false
        getCurrentUser().then(data => {
            if (!cancelled) setUser(data)
        }).catch(() => {
            if (!cancelled) setLoadError(true)
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => {
            cancelled = true
            mounted.current = false
        }
    }, [])

    async function handleRequestDeletion() {
        if (pending.current || !user || user.deletionRequested) return
        if (!window.confirm('Deseja realmente solicitar a exclusão da sua conta? Um administrador precisará concluir a exclusão definitiva.')) return
        pending.current = true
        setRequesting(true)
        setRequestError(null)
        try {
            await requestAccountDeletion()
            if (!mounted.current) return
            try {
                const updatedUser = await getCurrentUser()
                if (mounted.current) {
                    setUser(updatedUser)
                }
            } catch {
                if (mounted.current) setRequestError('Sua solicitação foi registrada, mas não foi possível atualizar seus dados agora.')
            }
        } catch {
            if (mounted.current) setRequestError('Não foi possível solicitar a exclusão da conta. Tente novamente.')
        } finally {
            pending.current = false
            if (mounted.current) setRequesting(false)
        }
    }

    return (
        <section className="profile-page" aria-labelledby="profile-title">
            <h1 id="profile-title">Meu perfil</h1>
            {loading && <p role="status">Carregando seus dados...</p>}
            {loadError && <p role="alert">Não foi possível carregar seus dados.</p>}
            {user && <>
                <section className="profile-panel" aria-labelledby="personal-title">
                    <h2 id="personal-title">Dados pessoais</h2>
                    <dl>
                        <div><dt>Nome</dt><dd>{user.name}</dd></div>
                        <div><dt>E-mail</dt><dd>{user.email}</dd></div>
                        <div><dt>Perfil</dt><dd>{user.role === 'ADMIN' ? 'Administrador' : 'Estudante'}</dd></div>
                    </dl>
                </section>
                <section className="profile-panel" aria-labelledby="account-title">
                    <h2 id="account-title">Conta</h2>
                    <dl>
                        <div><dt>Status da conta</dt><dd>{user.active ? 'Ativa' : 'Inativa'}</dd></div>
                        <div><dt>Data de criação</dt><dd><ProfileDate value={user.createdAt}/></dd></div>
                    </dl>
                </section>
                <section className="profile-panel" aria-labelledby="privacy-title">
                    <h2 id="privacy-title">Privacidade e consentimentos</h2>
                    <dl>
                        <div><dt>Versão dos Termos de Uso</dt><dd>{user.termsVersion}</dd></div>
                        <div><dt>Aceite dos Termos de Uso</dt><dd><ProfileDate value={user.termsAcceptedAt}/></dd></div>
                        <div><dt>Versão da Política de Privacidade</dt><dd>{user.privacyVersion}</dd></div>
                        <div><dt>Aceite da Política de Privacidade</dt><dd><ProfileDate value={user.privacyAcceptedAt}/></dd></div>
                    </dl>
                </section>
                <section className="profile-panel profile-deletion" aria-labelledby="deletion-title">
                    <h2 id="deletion-title">Exclusão da conta</h2>
                    {user.deletionRequested ? <>
                        <p role="status"><strong>Exclusão solicitada</strong></p>
                        <p>Sua solicitação de exclusão foi registrada e aguarda processamento.</p>
                        {user.deletionRequestedAt && <p>Data da solicitação: <ProfileDate value={user.deletionRequestedAt}/></p>}
                    </> : <>
                        <p>A exclusão definitiva será concluída por um administrador após sua solicitação.</p>
                        <button className="primary-button" type="button" disabled={requesting} onClick={handleRequestDeletion}>
                            {requesting ? 'Solicitando exclusão...' : 'Solicitar exclusão da conta'}
                        </button>
                    </>}
                    {requestError && <p role="alert">{requestError}</p>}
                </section>
            </>}
        </section>
    )
}
