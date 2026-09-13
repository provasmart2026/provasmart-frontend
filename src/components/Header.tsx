export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="ProvaSmart — página inicial">
        <img src="/brand/provasmart-logo-horizontal.svg" alt="" />
      </a>
      <nav aria-label="Navegação principal">
        <a href="#inicio">Início</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
      </nav>
      <div className="account-actions">
        <a className="header-action" href="#entrar">Entrar</a>
        <a className="primary-button header-button" href="#criar-conta">Criar conta</a>
      </div>
    </header>
  )
}
