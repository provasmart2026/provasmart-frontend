import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession } from '../services/sessionService'
import { useSession } from '../hooks/useSession'

export function Header() {
    const session = useSession()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuButton = useRef<HTMLButtonElement>(null)

    function handleLogout() {
        clearSession()
        setMenuOpen(false)
        navigate('/login')
    }

    return (
        <header className="site-header" onKeyDown={(event) => {
            if (event.key === 'Escape' && menuOpen) {
                setMenuOpen(false)
                menuButton.current?.focus()
            }
        }}>
            <Link className="brand" to="/" aria-label="ProvaSmart — página inicial">
                <img src="/brand/provasmart-logo-horizontal.svg" alt="" />
            </Link>
            <button
                ref={menuButton}
                className="menu-toggle"
                type="button"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                aria-controls="main-navigation"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
            </button>
            <nav id="main-navigation" className={menuOpen ? 'is-open' : undefined} aria-label="Navegação principal" onClick={() => setMenuOpen(false)}>
                <Link to="/">Início</Link>
                {session.authenticated && session.role === 'ADMIN' && (
                    <>
                        <Link to="/admin/questions">Questões</Link>
                        <Link to="/admin/question-reports">Reportes</Link>
                        <Link to="/admin/users">Usuários</Link>
                        <Link to="/admin/audit-logs">Auditoria</Link>
                    </>
                )}
                {session.authenticated && session.role === 'ESTUDANTE' && (
                    <>
                        <Link to="/simulados">Simulados</Link>
                        <Link to="/praticas">Prática direcionada</Link>
                        <Link to="/plano-de-estudos">Plano de estudos</Link>
                        <Link to="/dashboard">Meu Dashboard</Link>
                        <Link to="/historico">Histórico</Link>
                    </>
                )}
                {session.authenticated && <Link to="/profile">Meu perfil</Link>}
                {!session.authenticated && (
                    <>
                        <Link to="/#como-funciona">Como funciona</Link>
                        <Link to="/#recursos">Recursos</Link>
                    </>
                )}
            </nav>
            <div className="account-actions">
                {session.authenticated ? (
                    <button className="primary-button header-button" type="button" onClick={handleLogout}>
                        Sair
                    </button>
                ) : (
                    <>
                        <Link className="header-action" to="/login">
                            Entrar
                        </Link>
                        <Link className="primary-button header-button" to="/cadastro">
                            Criar conta
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}
