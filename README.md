# ProvaSmart — frontend

Interface web de preparação para o ENEM com React, TypeScript, React Router, Axios e Vite.

## Funcionalidades implementadas

- Home responsiva, navegação, identidade visual e documentos de Termos de Uso e Política de Privacidade.
- Cadastro com validação de senha, confirmação e aceites obrigatórios.
- Login seguido de verificação de código por e-mail (2FA). O token só é salvo após a verificação.
- Recuperação e redefinição de senha por código, sem iniciar uma sessão automaticamente.
- Sessão persistente ou limitada à aba, logout, atualização do menu e proteção de rotas por perfil.
- Tratamento global de 401/403 com proteção contra respostas de uma sessão anterior.
- Perfil em `/profile`: dados pessoais, estado da conta, consentimentos e solicitação de exclusão.
- Administração de usuários em `/admin/users`: paginação do backend, ativação/desativação de estudantes e exclusão definitiva quando solicitada. Administradores não têm ações nessa tabela.
- Administração de questões em `/admin/questions`: listagem paginada, criação, edição, ativação/desativação e seleção dependente de área, disciplina e assunto, incluindo criação de assuntos.
- Simulados para estudantes em `/simulados`: criação identificada pelo JWT, execução, persistência de respostas e finalização com exatamente 40 questões respondidas.
- Estados de carregamento, erros e bloqueios de operações duplicadas nos fluxos cobertos pelos testes.

## O que ainda não está implementado

- Dashboard do estudante, correção detalhada, resultados e desempenho por área/assunto.
- Histórico de simulados, plano de estudos, metas e prática direcionada.
- Filtros na listagem administrativa de questões.
- Telas de ajuda e contato ligadas às referências da Home/rodapé.

A Home apresenta também recursos planejados; seus textos não significam que todos esses fluxos já estejam implementados. Não há integração com ViaCEP no frontend atual. A administração de questões permite ativar/desativar; não há ação de exclusão definitiva de questões na interface.

## Executar localmente

Requisitos: Node.js `^20.19.0` ou `>=22.12.0`, npm e backend executando separadamente para trabalhar com dados reais.

```sh
npm ci
npm run dev
```

O servidor de desenvolvimento usa `http://localhost:5173`. Por padrão, o cliente Axios usa `/api`; o proxy do Vite encaminha as chamadas para `http://localhost:8080`, removendo esse prefixo. Para configurar outra base, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

O proxy é de desenvolvimento. Ao servir o build, configure o encaminhamento de `/api` para o backend ou a URL da API no ambiente de build. O servidor do frontend também deve suportar o fallback para `index.html` nas rotas do React Router.

## Arquitetura

```text
Páginas e componentes ──→ api/* ──→ API do ProvaSmart
         │                  │
         └──→ auth/session ←─┘
                    │ eventos
                    ├──→ auth/useSession → Header e RequireAuth
                    └──→ routes/AuthRedirect → React Router
```

- `api/` contém um objeto por recurso (`authApi`, `usersApi`, `questionsApi` etc.), contratos HTTP específicos e um único cliente Axios. Identificadores inseridos nos caminhos usam `encodeURIComponent`.
- `auth/session.ts` concentra token, perfil `UserRole`, armazenamento, leitura mínima do JWT, limpeza e eventos. Não depende das APIs.
- `auth/useSession.ts` acompanha os eventos de autenticação e de armazenamento entre abas.
- `routes/` define as rotas e aplica restrições por sessão/perfil; `AuthRedirect` conecta os eventos do cliente HTTP ao React Router.
- As páginas coordenam estado e operações. Componentes compartilhados recebem dados e callbacks; hooks de fluxos específicos ficam junto às páginas.
- `types/api.ts` define o único contrato de paginação Spring, `Page<T>`, usado por questões e usuários.
- `ApiError` preserva o status HTTP para tratamentos específicos com `instanceof`.

Não há camada de serviços duplicando `api/`, gerenciador global de estado ou refresh token.

## Autenticação e sessão

1. `POST /auth/login` recebe e-mail e senha e inicia a verificação em duas etapas.
2. A navegação para `/verificar-codigo` leva e-mail e preferência de persistência no estado do React Router.
3. `POST /auth/verify-2fa` recebe e-mail e código de seis dígitos. Uma resposta com token permite salvar a sessão.
4. “Manter conectado” usa `localStorage`; sem essa opção, usa `sessionStorage`. Uma nova sessão limpa os dados anteriores de ambos os armazenamentos e publica `authChangedEvent` com a sessão final.
5. O interceptor acrescenta `Authorization: Bearer <token>` às requisições.
6. Um 401 enviado com o token da sessão atual limpa a sessão e redireciona para `/login`. Um 403 autenticado mantém a sessão e redireciona para `/`. Respostas de requisições anteriores ao login ou com outro token não invalidam a sessão atual.
7. O logout limpa ambos os armazenamentos, atualiza a interface e leva ao login. O evento `storage` atualiza a interface quando outra aba muda a sessão.

`UserRole` admite `ADMIN` e `ESTUDANTE`. A leitura local do JWT serve à apresentação e às restrições da interface; o backend é responsável por validar o token e autorizar as operações.

`/profile` exige sessão. `/admin/users` e `/admin/questions` exigem `ADMIN`; `/simulados` exige `ESTUDANTE`. Login, cadastro, recuperação de senha e documentos legais são públicos.

As regras de senha, e-mail e código ficam em `pages/access/validation.ts`. Os contextos de navegação do 2FA e da recuperação são validados antes de mostrar os formulários dependentes. As particularidades de validação de cada fluxo foram preservadas.

## Fluxos com persistência

**Perfil e usuários.** O perfil carrega com `GET /users/me`. Após confirmar, `PATCH /users/me/request-deletion` registra a solicitação e uma nova consulta atualiza os dados. `deletionRequested` e `deletionRequestedAt` vêm do backend; a interface não antecipa esse estado. O administrador usa `GET /users`, `PATCH /users/{id}/activate`, `PATCH /users/{id}/deactivate` e `DELETE /users/{id}`. A exclusão definitiva de um estudante exige solicitação existente e confirmação.

**Questões.** A criação e edição usam o mesmo formulário, com cinco alternativas A–E e exatamente uma correta. Trocar área limpa disciplina e assunto; trocar disciplina limpa assunto. Na edição, o backend retorna `subjectId`, sem área e disciplina: `useQuestionSubjects` localiza o assunto nos catálogos disponíveis. O controle de versão ignora respostas atrasadas; falhas parciais em outros catálogos não impedem localizar o assunto. Não há cache global desses dados.

**Simulados.** `POST /simulations` não recebe body nem identificador de estudante: o backend identifica o estudante pelo JWT. `GET /simulations/{simulationId}` carrega a execução. A resposta é enviada por `PUT /simulations/{simulationId}/questions/{simulationQuestionId}/answer`, com apenas `alternativeId`. Cliques rápidos atualizam a seleção visível e são persistidos sequencialmente, mantendo a última escolha. Se a resposta do salvamento estiver desatualizada, uma consulta confirma a persistência. A navegação permanece bloqueada durante o salvamento. `PATCH /simulations/{simulationId}/finish` só é enviado com exatamente 40 questões respondidas.

## Estrutura principal

```text
src/
├── App.tsx / main.tsx
├── api/                          cliente HTTP e APIs por recurso
├── auth/
│   ├── session.ts                sessão, UserRole, JWT e eventos
│   └── useSession.ts             assinatura compartilhada dos eventos
├── components/
│   ├── layout/                   Header e Footer
│   ├── questions/                formulário, campos de assunto e tabela
│   └── ...                       seções da Home
├── pages/
│   ├── access/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── VerifyTwoFactorPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── LegalPages.tsx / legalDocuments.ts
│   │   ├── validation.ts / navigationState.ts / errors.ts
│   │   ├── components/            AccessLayout e AccessFields
│   │   └── access.css
│   ├── admin/questions/           páginas e useQuestionSubjects
│   ├── admin/users/
│   ├── profile/
│   ├── student/simulations/
│   └── Home.tsx
├── routes/                       AppRoutes, RequireAuth e AuthRedirect
├── types/                        paginação e contratos compartilhados
├── constants/                    regras compartilhadas de questões
├── utils/                        datas e paginação
├── test/                         configuração do ambiente de testes
└── styles.css
```

Os testes ficam próximos dos módulos. Os de acesso são organizados por cadastro, login/2FA, recuperação de senha e documentos legais, preservando os cenários que atravessam mais de uma página.

## Validação

```sh
npm run build
npm run test:run
git diff --check
```

No PowerShell, use `npm.cmd` se a política de execução bloquear `npm.ps1`. `npm run test` inicia o modo de observação. O build verifica tipos, variáveis e parâmetros não utilizados. A suíte usa Vitest, Testing Library e HTTP simulado; não substitui os testes com o backend real.

## Referências

- [Backend do ProvaSmart](https://github.com/provasmart2026/provasmart-backend)
- [Protótipo no Figma](https://www.figma.com/design/GmUPMt8JXVWeKDm0zqlvUV/ProvaSmart?node-id=9-2)
