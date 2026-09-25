import {Link, useNavigate} from 'react-router-dom'
import {clearSession} from '../../auth/session'
import {useSession} from '../../auth/useSession'

export function Header() {
    const session = useSession()
    const navigate = useNavigate()

    function handleLogout() {
        clearSession()
        navigate('/login')
    }

    return (
        <header className="site-header">
            <Link className="brand" to="/" aria-label="ProvaSmart — página inicial">
                <img src="/brand/provasmart-logo-horizontal.svg" alt=""/>
            </Link>
            <nav aria-label="Navegação principal">
                <Link to="/">Início</Link>
                {session.authenticated && session.role === 'ADMIN' && <>
                    <Link to="/admin/questions">Questões</Link>
                    <Link to="/admin/users">Usuários</Link>
                </>}
                {session.authenticated && session.role === 'ESTUDANTE'
                    && <Link to="/simulados">Simulados</Link>}
                {session.authenticated && <Link to="/profile">Meu perfil</Link>}
                {!session.authenticated && <>
                    <Link to="/#como-funciona">Como funciona</Link>
                    <Link to="/#recursos">Recursos</Link>
                </>}
            </nav>
            <div className="account-actions">
                {session.authenticated ? (
                    <button className="primary-button header-button" type="button" onClick={handleLogout}>Sair</button>
                ) : <>
                    <Link className="header-action" to="/login">Entrar</Link>
                    <Link className="primary-button header-button" to="/cadastro">Criar conta</Link>
                </>}
            </div>
        </header>
    )
}
