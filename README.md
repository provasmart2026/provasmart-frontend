# ProvaSmart — Frontend

Interface web do **ProvaSmart**, uma plataforma de apoio à preparação para o Exame Nacional do Ensino Médio (ENEM). O frontend permitirá que estudantes realizem simulados, consultem resultados e acompanhem sua evolução por área e assunto.

> O projeto está em fase inicial. As tecnologias, funcionalidades e estruturas descritas abaixo representam a solução planejada e serão atualizadas conforme a implementação evoluir.

## Sobre o ProvaSmart

O ProvaSmart foi idealizado para organizar a prática de questões e tornar o desempenho do estudante mais fácil de compreender. Com base nas tentativas registradas, a plataforma deverá destacar dificuldades e apoiar a priorização dos estudos.

A primeira versão será dedicada ao ENEM e não terá como objetivo oferecer aulas, apostilas ou videoaulas próprias, nem atender vestibulares, concursos públicos ou outras modalidades de prova.

## Funcionalidades previstas

### Para estudantes

- cadastro e autenticação;
- preenchimento de endereço com apoio da API ViaCEP;
- realização de questões das quatro áreas de conhecimento do ENEM;
- realização e finalização de simulados;
- visualização da correção automática;
- consulta ao histórico de tentativas e resultados;
- dashboards de evolução do desempenho;
- análise de acertos e erros por área e assunto;
- prática direcionada aos conteúdos com maior dificuldade;
- consulta a um plano de estudos personalizado.

### Para administradores

- acesso restrito por perfil;
- cadastro, consulta, alteração e exclusão de questões;
- gerenciamento das informações necessárias à geração de simulados.

## Tecnologias planejadas

- React;
- JavaScript;
- HTML5;
- CSS3;
- API REST com dados em JSON;
- ViaCEP para consulta de endereço;
- Git e GitHub;
- Vercel como opção prevista de hospedagem do frontend.

As bibliotecas complementares, o gerenciador de pacotes e a ferramenta de build serão registrados após a criação efetiva da aplicação.

## Arquitetura e integrações

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

O frontend será responsável pela apresentação das telas, validações de interface, responsividade e comunicação com os serviços externos. A API do ProvaSmart concentrará autenticação, autorização, regras de negócio e persistência dos dados.

## Telas previstas

- cadastro e login;
- página inicial do estudante;
- seleção e realização de simulado;
- resultado e revisão de respostas;
- histórico de tentativas;
- dashboard de desempenho;
- prática direcionada;
- plano de estudos;
- painel administrativo de questões.

## Requisitos de interface

A aplicação deverá:

- funcionar em computadores, tablets e dispositivos móveis;
- apresentar informações de forma clara e organizada;
- oferecer navegação consistente e boa usabilidade;
- considerar práticas de acessibilidade;
- informar erros de validação e falhas de integração de maneira compreensível;
- proteger rotas conforme o perfil autenticado.

## Como executar

O código da aplicação ainda não foi adicionado ao repositório. Quando o projeto React for criado, esta seção deverá ser atualizada com informações confirmadas pelos arquivos versionados:

1. versão necessária do Node.js;
2. gerenciador de pacotes adotado;
3. instalação das dependências;
4. variáveis de ambiente;
5. comandos de desenvolvimento, testes e build.

Por enquanto, o repositório pode ser clonado com:

```bash
git clone https://github.com/weblyne/provasmart-frontend.git
cd provasmart-frontend
```

## Configuração

A URL definitiva da API será configurada por variável de ambiente. O nome abaixo é apenas a convenção inicial e deverá ser ajustado à ferramenta de build escolhida:

```dotenv
VITE_API_URL=http://localhost:8080
```

Nenhuma credencial ou segredo deve ser armazenado no frontend ou versionado no Git.

## Integração com ViaCEP

Durante o cadastro, a interface deverá validar o formato do CEP, consultar o serviço ViaCEP e preencher ou validar informações como cidade e estado. Também deverá tratar CEPs inexistentes, respostas inválidas e indisponibilidade do serviço.

## Protótipo

- [Design do ProvaSmart no Figma](https://www.figma.com/design/GmUPMt8JXVWeKDm0zqlvUV/ProvaSmart?node-id=9-2)

## Repositório relacionado

- [Backend do ProvaSmart](https://github.com/weblyne/provasmart-backend)

## Equipe

Projeto Final de Curso do Bacharelado em Sistemas de Informação da Universidade de Mogi das Cruzes (UMC), desenvolvido por Alyne Rodrigues de Campos e Gustavo Gonçalves Baião.

## Status

🚧 Em desenvolvimento.
