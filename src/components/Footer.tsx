export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/brand/provasmart-logo-horizontal.svg" alt="Provasmart" />
          <p>Questões, descobertas e próximos passos.<br />No seu ritmo, rumo ao ENEM.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Produto</strong>
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#simulados">Simulados</a>
          </div>
          <div>
            <strong>Suporte</strong>
            <a href="#ajuda">Central de ajuda</a>
            <a href="#contato">Contato</a>
            <a href="#privacidade">Privacidade</a>
          </div>
          <div>
            <strong>Social</strong>
            <a href="#instagram">Instagram</a>
            <a href="#youtube">YouTube</a>
            <a href="#tiktok">TikTok</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Provasmart. Cada questão conta.</span>
        <span>Acessibilidade&nbsp; • &nbsp;Termos de uso</span>
      </div>
    </footer>
  )
}
