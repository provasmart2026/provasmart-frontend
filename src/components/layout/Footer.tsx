import {Link, useLocation} from 'react-router-dom'

const compactRoutes = ['/login', '/cadastro', '/termos-de-uso', '/politica-de-privacidade']

export function Footer() {
    const {pathname} = useLocation()

    if (compactRoutes.includes(pathname)) {
        return <footer className="compact-footer">
            <span>© 2026 Provasmart. Cada questão conta.</span>
            <nav aria-label="Links legais">
                <span>Acessibilidade</span>
                <Link to="/termos-de-uso">Termos de uso</Link>
                <Link to="/politica-de-privacidade">Política de privacidade</Link>
            </nav>
        </footer>
    }

    return (
        <footer className="site-footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <img src="/brand/provasmart-logo-horizontal.svg" alt="Provasmart"/>
                    <p>Questões, descobertas e próximos passos.<br/>No seu ritmo, rumo ao ENEM.</p>
                </div>
                <div className="footer-links">
                    <div>
                        <strong>Produto</strong>
                        <Link to="/#como-funciona">Como funciona</Link>
                        <Link to="/#recursos">Recursos</Link>
                        <a href="#simulados">Simulados</a>
                    </div>
                    <div>
                        <strong>Suporte</strong>
                        <a href="#ajuda">Central de ajuda</a>
                        <a href="#contato">Contato</a>
                        <Link to="/politica-de-privacidade">Privacidade</Link>
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
                <span>Acessibilidade&nbsp; • &nbsp;<Link to="/termos-de-uso">Termos de uso</Link>&nbsp; • &nbsp;<Link to="/politica-de-privacidade">Política de privacidade</Link></span>
            </div>
        </footer>
    )
}
