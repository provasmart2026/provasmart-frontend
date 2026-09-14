import {Link} from 'react-router-dom'

export function Header() {
    return (
        <header className="site-header">
            <Link className="brand" to="/" aria-label="ProvaSmart — página inicial">
                <img src="/brand/provasmart-logo-horizontal.svg" alt=""/>
            </Link>
            <nav aria-label="Navegação principal">
                <Link to="/">Início</Link>
                <Link to="/admin/questions">Questões</Link>
                <Link to="/simulados">Simulados</Link>
                <Link to="/#como-funciona">Como funciona</Link>
                <Link to="/#recursos">Recursos</Link>
            </nav>
            <div className="account-actions">
                <a className="header-action" href="#entrar">Entrar</a>
                <a className="primary-button header-button" href="#criar-conta">Criar conta</a>
            </div>
        </header>
    )
}
