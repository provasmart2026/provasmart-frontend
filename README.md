# ProvaSmart — frontend

Interface web do ProvaSmart, criada com React, TypeScript e Vite para apoiar a preparação para o ENEM com simulados, acompanhamento de desempenho e gestão de conteúdo.

## visão geral

O frontend do ProvaSmart foi pensado para apresentar a experiência do estudante de forma clara e responsiva, conectando-se à API do backend para consultar questões, áreas de conhecimento, disciplinas, assuntos e simulados.

A solução atual já inclui a estrutura inicial da interface, os componentes visuais da landing page, o cliente HTTP e a configuração para integração local com a API em `http://localhost:8080`.

## o que já está pronto

- página inicial baseada no protótipo do projeto;
- navegação visual com cabeçalho, jornada de estudos, como funciona, recursos, chamada para cadastro e rodapé;
- identidade visual com os logos e ícones do projeto;
- layout responsivo para telas menores;
- cliente HTTP com axios;
- proxy local para a API em `http://localhost:8080`;
- teste de renderização da página e teste do cliente da API;
- comandos de build e testes configurados.
- painel administrativo em `/admin/questions`, com tabela e paginação;
- criação e edição de questões usando o mesmo formulário;
- seleção dependente de área, disciplina e assunto, com criação de assunto;
- ativação e desativação de questões e atualização da listagem;
- testes de integração da interface com respostas HTTP simuladas.

## funcionalidades previstas

### para estudantes

- cadastro e autenticação;
- preenchimento de endereço com apoio da API ViaCEP;
- realização de questões das quatro áreas do ENEM;
- realização e finalização de simulados;
- visualização da correção automática;
- consulta ao histórico de tentativas e resultados;
- dashboards de evolução do desempenho;
- análise de acertos e erros por área e assunto;
- prática direcionada aos conteúdos com maior dificuldade;
- consulta a um plano de estudos personalizado.

### para administradores

- acesso restrito por perfil;
- cadastro, consulta, alteração e exclusão de questões;
- gerenciamento das informações necessárias à geração de simulados.

## arquitetura e integrações

```text
Aluno / Administrador
         │
         ▼
Aplicação React ──────────► ViaCEP
         │             consulta de CEP
         │ HTTP/HTTPS + JSON
         ▼
API Spring Boot ─────────► PostgreSQL
```

O frontend é responsável pela apresentação das telas, validações de interface, responsividade e comunicação com serviços externos. O backend concentra autenticação, autorização, regras de negócio e persistência dos dados.

## requisitos

- Node.js `^20.19.0` ou `>=22.12.0`, conforme a versão instalada do Vite;
- npm;
- backend do ProvaSmart executando separadamente para testar dados reais.

## como executar

instale as dependências:

```bash
npm install
```

inicie o frontend:

```bash
npm run dev
```

o Vite abre a aplicação em `http://localhost:5173`.

por padrão, o axios usa `/api` como endereço base. durante o desenvolvimento, o Vite encaminha esse caminho para `http://localhost:8080` e remove o prefixo `/api` antes de enviar a requisição. para trocar o endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

## testes e build

```bash
npm run test:run
npm run build
```

`npm run test` mantém o Vitest em modo de observação.

## integração com o backend

o backend fica no repositório [provasmart-backend](https://github.com/provasmart2026/provasmart-backend) e não é alterado por este projeto.

na branch `develop`, a API disponibiliza recursos para:

- áreas do ENEM: `GET /exam-areas`;
- disciplinas: `GET /disciplines/exam-area/{examArea}`;
- assuntos: `GET /subjects/discipline/{disciplineId}` e `POST /subjects/discipline/{disciplineId}`;
- banco de questões: `POST /questions`, `GET /questions`, `GET /questions/active`, `GET /questions/{id}`, `PUT /questions/{id}`, `PATCH /questions/{id}/activate` e `PATCH /questions/{id}/deactivate`;
- simulados: `POST /simulations/student/{studentId}`, `GET /simulations/{simulationId}`, `PUT /simulations/{simulationId}/questions/{simulationQuestionId}/answer` e `PATCH /simulations/{simulationId}/finish`.

o backend usa Java 25, Spring Boot e PostgreSQL. as variáveis de banco esperadas são `DB_URL`, `DB_USERNAME` e `DB_PASSWORD`.

## o que ainda falta no front

- telas e rotas de login, cadastro e autenticação;
- dashboard do estudante;
- fluxo completo de criação, execução e finalização de simulados;
- filtros na listagem de questões;
- correção, resultados e desempenho por área do ENEM;
- histórico de simulados e plano de estudos;
- autenticação e autorização da área administrativa;
- ligar cada tela aos endpoints correspondentes;
- tratamento de sessão expirada quando a autenticação for implementada.

O fluxo administrativo de questões já consome os endpoints de questões, áreas, disciplinas e assuntos. Os estados de carregamento, erro e nova tentativa estão implementados nesse fluxo. As demais integrações serão adicionadas junto às respectivas telas.

## estrutura principal

```text
public/       logos e ícones usados pela interface
src/api/      cliente axios e chamadas da api
src/components/ componentes visuais da Home, layout compartilhado e formulário/tabela de questões
src/pages/    páginas da aplicação e hooks específicos de cada fluxo
src/routes/   configuração de navegação
src/types/    contratos de dados e tipos da interface separados por responsabilidade
src/constants/ valores compartilhados do fluxo de questões
src/utils/    funções puras compartilhadas
src/styles.css estilos globais e identidade visual
```

As páginas coordenam estado, carregamento e navegação. `QuestionForm` e `QuestionSubjectFields` recebem dados e callbacks e não fazem requisições HTTP. `useQuestionSubjects` coordena o catálogo dependente usando as APIs separadas por recurso; o cliente Axios é único.

Na edição, a resposta da questão contém `subjectId`, sem os IDs da área e da disciplina. Por isso, o frontend localiza o assunto nos catálogos disponíveis. Essa busca pode exigir várias consultas; não há cache global para evitar dados desatualizados. Apenas o `subjectId` vincula a questão ao catálogo no envio para o backend.

O fluxo exige cinco alternativas (A–E), exatamente uma correta e os campos obrigatórios. Trocar a área limpa disciplina e assunto; trocar a disciplina limpa o assunto. Selecionar um assunto existente bloqueia o cadastro de outro, e digitar um novo nome bloqueia a seleção existente.

Use `npm ci` para reproduzir as versões do `package-lock.json`. O build também verifica tipos, variáveis e parâmetros não utilizados. Os testes usam HTTP simulado e não substituem a validação de integração com o backend em execução.

## protótipo

- [Design do ProvaSmart no Figma](https://www.figma.com/design/GmUPMt8JXVWeKDm0zqlvUV/ProvaSmart?node-id=9-2)

## repositório relacionado

- [Backend do ProvaSmart](https://github.com/provasmart2026/provasmart-backend)

## status

🚧 em desenvolvimento.

