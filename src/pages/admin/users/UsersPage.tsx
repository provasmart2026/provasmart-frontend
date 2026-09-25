import {useEffect, useRef, useState} from 'react'
import {activateUser, deactivateUser, deleteUser, getUsers, type PageResponse, type UserResponse} from '../../../api/users'
import {formatDate} from '../../../utils/date'
import './UsersPage.css'

type Action = 'activate' | 'deactivate' | 'delete'

export function UsersPage() {
    const [page, setPage] = useState(0)
    const [revision, setRevision] = useState(0)
    const [data, setData] = useState<PageResponse<UserResponse> | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const pending = useRef(false)
    const mounted = useRef(false)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setLoadError(false)
        getUsers(page).then(result => {
            if (cancelled) return
            if (page > 0 && page >= result.totalPages) {
                setPage(Math.max(0, result.totalPages - 1))
                return
            }
            setData(result)
        }).catch(() => {
            if (!cancelled) setLoadError(true)
        }).finally(() => {
            if (!cancelled) setLoading(false)
        })
        return () => { cancelled = true }
    }, [page, revision])

    async function handleAction(user: UserResponse, action: Action) {
        if (pending.current || loading || user.role !== 'ESTUDANTE') return
        if (action === 'delete' && !user.deletionRequested) return
        if (action === 'deactivate' && !window.confirm('Deseja desativar este usuário?')) return
        if (action === 'delete' && !window.confirm('Esta exclusão é definitiva e não poderá ser desfeita. Deseja continuar?')) return
        pending.current = true
        setBusy(user.id)
        setActionError(null)
        try {
            if (action === 'delete') await deleteUser(user.id)
            else if (action === 'activate') await activateUser(user.id)
            else await deactivateUser(user.id)
            if (!mounted.current) return
            setLoading(true)
            if (action === 'delete' && data?.content.length === 1 && page > 0) setPage(page - 1)
            else setRevision(value => value + 1)
        } catch {
            if (mounted.current) setActionError(action === 'delete'
                ? 'Não foi possível excluir o usuário. Tente novamente.'
                : 'Não foi possível atualizar o usuário. Tente novamente.')
        } finally {
            pending.current = false
            if (mounted.current) setBusy(null)
        }
    }

    return (
        <section className="admin-users" aria-labelledby="users-title">
            <h1 id="users-title">Usuários</h1>
            <p className="lead">Gerencie os usuários cadastrados e as solicitações de exclusão.</p>
            {loading && <p role="status">Carregando usuários...</p>}
            {loadError && <div role="alert">
                <p>Não foi possível carregar os usuários.</p>
                <button type="button" disabled={loading || busy !== null} onClick={() => setRevision(value => value + 1)}>Tentar novamente</button>
            </div>}
            {actionError && <p role="alert">{actionError}</p>}
            {data && <div className="users-panel">
                <div className="users-table-wrap" role="region" aria-label="Lista de usuários" tabIndex={0}>
                    <table>
                        <caption>Usuários cadastrados</caption>
                        <thead><tr>{['Nome', 'E-mail', 'Perfil', 'Status', 'Solicitação de exclusão', 'Cadastro', 'Ações'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                        <tbody>{data.content.map(user => <tr key={user.id}>
                            <th scope="row">{user.name}</th>
                            <td>{user.email}</td>
                            <td>{user.role === 'ADMIN' ? 'Administrador' : 'Estudante'}</td>
                            <td><span className="users-status">{user.active ? 'Ativo' : 'Inativo'}</span></td>
                            <td>{user.deletionRequested ? <>
                                <strong className="users-deletion">Solicitada</strong>
                                {user.deletionRequestedAt && <time dateTime={user.deletionRequestedAt}>{formatDate(user.deletionRequestedAt)}</time>}
                            </> : 'Não solicitada'}</td>
                            <td><time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time></td>
                            <td>{user.role === 'ESTUDANTE' ? <div className="users-actions">
                                <button type="button" disabled={busy !== null || loading || loadError} onClick={() => handleAction(user, user.active ? 'deactivate' : 'activate')}>
                                    {busy === user.id ? 'Processando...' : user.active ? 'Desativar' : 'Ativar'}
                                </button>
                                {user.deletionRequested && <button className="users-delete" type="button" disabled={busy !== null || loading || loadError} onClick={() => handleAction(user, 'delete')}>Excluir definitivamente</button>}
                            </div> : 'Sem ações disponíveis'}</td>
                        </tr>)}</tbody>
                    </table>
                </div>
                {data.content.length === 0 && <p>Nenhum usuário cadastrado.</p>}
                <nav className="users-pagination" aria-label="Paginação de usuários">
                    <span>Total: {data.totalElements} usuários</span>
                    <button type="button" disabled={data.first || loading || busy !== null} onClick={() => setPage(data.number - 1)}>Anterior</button>
                    <span>Página {data.number + 1} de {Math.max(1, data.totalPages)}</span>
                    <button type="button" disabled={data.last || loading || busy !== null} onClick={() => setPage(data.number + 1)}>Próxima</button>
                </nav>
            </div>}
        </section>
    )
}
