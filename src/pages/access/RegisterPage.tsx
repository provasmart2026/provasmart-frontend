import { LegalLink } from '../../components/LegalLink'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { AccessLayout } from './components/AccessLayout'
import { Field, PasswordField } from './components/AccessFields'
import { isValidPassword } from './validation'
import { getAccountAccessError } from './errors'
import { useLegalDocument } from '../../hooks/useLegalDocument'
import { ApiError } from '../../services/api'

export function RegisterPage() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const terms = useLegalDocument('TERMOS_DE_USO')
    const privacy = useLegalDocument('POLITICA_DE_PRIVACIDADE')
    const documentsReady = !terms.loading && !privacy.loading && !terms.error && !privacy.error
        && terms.document && privacy.document

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        const form = new FormData(event.currentTarget)
        const password = String(form.get('password'))

        if (!isValidPassword(password)) {
            setError('A senha precisa atender a todos os requisitos informados.')
            return
        }
        if (password !== form.get('confirmPassword')) {
            setError('As senhas digitadas não coincidem.')
            return
        }

        if (!documentsReady || !accepted) {
            setError('Aguarde os documentos e confirme a leitura antes de cadastrar.')
            return
        }

        setLoading(true)
        try {
            await authService.register({
                name: String(form.get('name')),
                email: String(form.get('email')),
                password,
                acceptTerms: Boolean(form.get('terms')),
                acceptPrivacyPolicy: Boolean(form.get('terms')),
                ageDeclarationAccepted: Boolean(form.get('age')),
                termsVersion: terms.document!.version,
                privacyVersion: privacy.document!.version,
            })
            navigate('/login?cadastro=sucesso')
        } catch (requestError) {
            if (requestError instanceof ApiError && requestError.status === 409
                && requestError.backendMessage?.includes('documentos legais')) {
                setAccepted(false)
                terms.retry()
                privacy.retry()
                setError('Os documentos foram atualizados. Leia as novas versões e confirme novamente.')
                return
            }
            setError(getAccountAccessError(requestError))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AccessLayout
            title="Uma conta para organizar seus próximos passos."
            description="Crie seu acesso para reunir simulados, resultados e plano de estudos em um só lugar."
        >
            <form className="access-card register-card" onSubmit={handleSubmit}>
                <span className="eyebrow">Crie sua conta</span>
                <h2>Comece sua preparação</h2>
                <p>Preencha seus dados. Leva menos de dois minutos.</p>
                <Field id="name" label="Nome" placeholder="Como você quer ser chamado" autoComplete="name" />
                <Field id="email" label="E-mail" type="email" placeholder="voce@exemplo.com" autoComplete="email" />
                <PasswordField
                    id="password"
                    label="Senha"
                    placeholder="Crie uma senha segura"
                    autoComplete="new-password"
                    helper="Use 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial."
                />
                <PasswordField
                    id="confirmPassword"
                    label="Confirmar senha"
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                />
                <label className="checkbox legal-check">
                    <input name="terms" type="checkbox" required checked={accepted}
                        disabled={!documentsReady || loading} onChange={event => setAccepted(event.target.checked)} />
                    <span>
                        Li e aceito os <LegalLink to="/termos-de-uso">Termos de Uso</LegalLink> e estou ciente da{' '}
                        <LegalLink to="/politica-de-privacidade">Política de Privacidade</LegalLink>.
                    </span>
                </label>
                {(terms.loading || privacy.loading) && <p role="status">Carregando termos e política...</p>}
                {(terms.error || privacy.error) && <div>
                    <p className="form-error" role="alert">Não foi possível carregar os documentos necessários ao cadastro.</p>
                    <button type="button" onClick={() => { setAccepted(false); terms.retry(); privacy.retry() }}>Tentar novamente</button>
                </div>}
                {documentsReady && <p>Termos: versão {terms.document!.version}. Política: versão {privacy.document!.version}.</p>}
                <label className="checkbox legal-check">
                    <input name="age" type="checkbox" required />
                    <span>
                        Declaro que tenho 13 anos ou mais. Se eu tiver menos de 18 anos, utilizarei a plataforma com a
                        ciência e a assistência do meu responsável legal. Esta declaração não verifica minha idade
                        nem comprova autorização do responsável.
                    </span>
                </label>
                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}
                <button className="primary-button submit-button" type="submit" disabled={loading || !documentsReady}>
                    {loading ? 'Criando conta...' : 'Criar minha conta'}
                </button>
                <p className="form-switch">
                    Já tem uma conta? <Link to="/login">Entrar</Link>
                </p>
            </form>
        </AccessLayout>
    )
}
