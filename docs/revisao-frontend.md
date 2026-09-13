# Revisão do ProvaSmart Frontend

## Escopo e conclusão

Revisão do código de `src`, testes, estilos, rotas, configurações de build, dependências declaradas, documentação e referências a recursos estáticos. Alterações locais anteriores foram preservadas; a relação abaixo descreve somente esta revisão.

A estrutura é adequada para um projeto acadêmico: `pages` coordena estado e navegação, `components` apresenta a interface, `api` centraliza HTTP por recurso e `types` descreve dados. Há um cliente Axios, um formulário para criação/edição, uma tabela reutilizável e estilos compartilhados. Não há justificativa atual para Redux, um framework de formulários, uma camada genérica de repositórios ou reorganização completa por funcionalidades.

## Problemas que precisam ser corrigidos

| Achado | Consequência | Resultado |
| --- | --- | --- |
| `Resources` solicitava `/icons/questões.svg`, mas o arquivo disponível é `questoes.svg`. | Ícone do banco de questões não carrega. | Corrigido sem trocar o recurso visual. |
| Links de seções do rodapé usavam hashes relativos à página atual. | No painel, não navegavam até as seções da Home. | Corrigidos com React Router e os mesmos destinos do Header. |
| O salvamento navegava para a listagem mesmo depois da desmontagem do formulário. | Sair pelo Header durante um POST/PUT podia causar um redirecionamento inesperado ao terminar a requisição. | Resultado assíncrono só altera a tela se ela continuar montada. A requisição já enviada não é desfeita. |
| A reconstrução do catálogo da edição falhava ao primeiro erro, inclusive em outra área/disciplina. | Uma questão de Matemática podia ficar bloqueada por falha em Linguagens ou em outra disciplina. | Busca continua nos catálogos disponíveis e aceita somente correspondência pelo ID do assunto; se não encontrar, mantém erro e nova tentativa. |
| Estado de página vindo da navegação não era validado; redução do total podia deixar a lista em uma página inexistente. | Requisição com página inválida ou tela vazia apesar de haver questões. | Validação de inteiro não negativo e retorno à última página disponível. |
| O bloqueio de cadastro de assunto existente dependia apenas dos controles desabilitados. | O manipulador não explicitava a regra de exclusividade. | O hook também impede criar com assunto selecionado; o salvamento impede enviar enquanto há nome novo pendente. |
| Navegação principal desaparece abaixo de 960px, sem alternativa mobile para todas as rotas. | Acesso ao painel fica indisponível pelo Header nessa largura. | Pendente: resolver com um menu responsivo requer decisão de interface; não foi alterado o layout nesta revisão. |

Não foram identificados loops de efeitos no fluxo atual. Isso não equivale a uma medição de desempenho em produção ou auditoria completa de acessibilidade.

## Melhorias recomendadas

### Aplicadas

- Extrair somente os campos de catálogo para `QuestionSubjectFields`, com fragmento React, sem contêiner adicional ou CSS novo. `QuestionForm` mantém enunciado, alternativas, explicação e envio.
- Separar os tipos do controlador do formulário dos DTOs de assunto.
- Centralizar letras A–E, tamanho da página e limite de nome de assunto, eliminando literais repetidos.
- Remontar o estado do formulário quando o ID da rota muda, evitando reaproveitamento de rascunho ou erro entre questões.
- Associar o erro de criação de assunto ao campo, identificar o grupo de explicação e comunicar carregamento no formulário por atributos ARIA.
- Ativar `noUnusedLocals` e `noUnusedParameters` no build, sem dependências novas.
- Atualizar o README para refletir o painel já implementado, responsabilidades, testes e requisito de Node da instalação atual.

### Não aplicadas e motivos

- **Erros estruturados do backend:** `apiRequest` preserva o status, mas transforma a falha em mensagem genérica; as telas também usam mensagens locais. Falta um contrato explícito de erros por campo no frontend. Não foi inferido um formato nem exibido conteúdo técnico bruto do servidor. Recomenda-se definir e tipar esse contrato antes de apresentar validações detalhadas.
- **Busca dos pais do assunto:** permanece com várias consultas na edição porque a questão só fornece `subjectId`. Não existe, entre os endpoints utilizados, consulta direta que devolva os pais desse assunto. Não foram inventados endpoints nem introduzido cache global com risco de dados desatualizados.
- **Rota não encontrada:** não há fallback para URLs desconhecidas. Uma página simples de 404 é recomendada na próxima evolução de navegação; não foi adicionada uma nova tela nesta revisão.
- **Links de funcionalidades futuras:** login, simulados e outros links ainda são placeholders. Destinos reais dependem das funcionalidades correspondentes, por isso foram preservados.
- **Versões `latest`:** o lockfile reproduz a instalação com `npm ci`, mas uma atualização deliberada pode trazer mudanças amplas. Recomenda-se trocar `latest` por faixas revisadas quando houver uma atualização planejada. Dependências e lockfile foram preservados.
- **Ferramentas de build em `dependencies`:** Vite, TypeScript e plugin React poderiam ficar em `devDependencies`. A mudança foi adiada para uma revisão do processo de instalação/deploy, pois instalações que omitem dependências de desenvolvimento podem depender da disposição atual.
- **Padronização de formatação e lint de hooks:** há estilos de indentação diferentes entre arquivos. O build agora acusa símbolos não utilizados; as dependências dos hooks foram revisadas manualmente. Não foi instalado ESLint/formatter nem reformulado o projeto inteiro apenas por formatação.

## Melhorias opcionais

- Cache de catálogos, deduplicação e cancelamento de GETs, quando o volume justificar. Hoje respostas obsoletas são ignoradas, mas requisições já iniciadas podem terminar. Em desenvolvimento, o `StrictMode` pode executar novamente efeitos; isso não justifica removê-lo.
- Estados de consulta discriminados em vez de vários `useState`, se o hook crescer. Os estados atuais representam informações diferentes; não há ganho claro em um reducer genérico agora.
- Validação dos JSONs em tempo de execução se houver instabilidade no contrato. `apiRequest<T>` oferece tipagem de uso, não valida o payload recebido. Não foi adicionada biblioteca de schemas.
- Paginação na URL para compartilhar ou restaurar a posição com mais previsibilidade. O retorno da edição mantém a página por estado de navegação atualmente.
- Lazy loading de telas futuras, testes de navegador e medição de acessibilidade/contraste. Não foram adicionados `memo` ou `useMemo` sem evidência de lentidão: as listas são pequenas e os campos controlados precisam atualizar ao digitar.
- Mover componentes da Home para uma subpasta quando a quantidade aumentar. Agora a quantidade de arquivos é pequena e os nomes são claros.

## Verificação do fluxo de questões

| Regra | Implementação revisada |
| --- | --- |
| Ordem visual | Área → Disciplina → Assunto → novo assunto → Enunciado → A–E → Explicação → Salvar/Cancelar. |
| Trocar área | Limpa disciplina, assunto, catálogo dependente e rascunho de novo assunto. |
| Trocar disciplina | Limpa assunto e rascunho de novo assunto. |
| Pertencimento | O select recebe somente o catálogo da disciplina atual; o salvamento confirma que o ID está nesse catálogo. Respostas de seleções antigas são ignoradas. |
| Exclusividade | Selecionar assunto bloqueia novo cadastro; digitar nome bloqueia o select; limpar libera a outra opção. Criar assunto também valida a ausência de seleção no hook. |
| Assunto criado | É adicionado ao catálogo atual, selecionado automaticamente e o nome é limpo. |
| Edição | Carrega a questão e encontra os pais pelo ID, sem usar nome como identificador. Não permite salvar com catálogo indisponível. |
| Payload | `QuestionInput` contém enunciado, explicação, alternativas e `subjectId`. Área e disciplina não são enviadas. |
| Alternativas | Cinco campos A–E e radios com um grupo único. A seleção marca exatamente uma correta; conteúdo em branco é rejeitado antes do envio. |
| Loading/erro | Consultas e mutações possuem estados visíveis e nova tentativa. Falha de gravação conserva o rascunho. |
| Retorno | Criar/editar volta à listagem, que consulta os dados novamente. Ativar/desativar também recarrega a página atual. |

As dependências dos `useEffect` foram conferidas contra o que cada efeito lê. O callback de alteração de assunto é estável por `useCallback`; não é usado pelo efeito de inicialização do catálogo e não precisa ser incluído nele. As funções de seleção não precisam de memoização só por serem passadas como props.

## Arquivos alterados nesta revisão

| Arquivo | Alteração e motivo |
| --- | --- |
| `src/components/Resources.tsx` | Corrige o caminho do ícone existente. |
| `src/components/layout/Footer.tsx` | Usa `Link` para navegar às seções da Home. |
| `src/components/questions/QuestionForm.tsx` | Delega os campos dependentes, reforça condição de envio e atributos de acessibilidade. |
| `src/pages/admin/questions/QuestionFormPage.tsx` | Isola estado por ID da rota, ignora finalização de salvamento após saída, usa constantes e valida página de retorno. |
| `src/pages/admin/questions/useQuestionSubjects.ts` | Tolera falhas não relacionadas na edição, limpa estado na inicialização, valida seleções, reforça exclusividade e ignora finalizações obsoletas. |
| `src/pages/admin/questions/QuestionsPage.tsx` | Valida página inicial, corrige página fora do total e usa tamanho padrão da API. |
| `src/api/questions.ts` | Compartilha tamanho padrão de paginação, mantendo endpoints e parâmetros. |
| `src/types/subject.ts` | Mantém apenas os tipos de dados do recurso; controlador foi movido. |
| `src/App.test.tsx` | Cobre destino do rodapé e caminho do ícone. |
| `src/pages/admin/questions/QuestionsPage.test.tsx` | Acrescenta regressões de navegação, catálogo e paginação. |
| `tsconfig.app.json` | Habilita verificação de símbolos não utilizados. |
| `README.md` | Atualiza estado das funcionalidades, estrutura e instruções. |

## Arquivos criados nesta revisão

| Arquivo | Finalidade |
| --- | --- |
| `src/components/questions/QuestionSubjectFields.tsx` | Bloco visual dependente, sem HTTP ou estado duplicado. |
| `src/types/questionForm.ts` | Tipos específicos do controlador do formulário, separados dos DTOs. |
| `src/constants/questions.ts` | Valores compartilhados A–E, tamanho da página e limite de nome. |
| `src/utils/pagination.ts` | Validação pura do estado de página recebido pela navegação. |
| `src/utils/pagination.test.ts` | Testa entradas válidas e inválidas dessa validação. |
| `docs/revisao-frontend.md` | Registra achados, decisões, alterações e limites da revisão. |

Nenhum arquivo removido. Nenhuma biblioteca, endpoint ou contrato backend alterado. Nenhum commit realizado.

## Duplicação, impactos e validação

Foram eliminadas repetições das letras A–E, dos valores 10/150 e das condições comuns de bloqueio do novo assunto. O bloco extraído foi movido, não copiado; não havia formulários separados de criação/edição para unificar. `listActive` foi mantido por ser uma API disponível para funcionalidades futuras, embora não seja consumido pelas telas atuais.

Os estilos e a estrutura visual do formulário são preservados. O único reparo visual é fazer o ícone existente carregar. A edição pode continuar consultando outros catálogos após uma falha; se o catálogo correto estiver disponível, permite editar. Se não estiver, mantém o bloqueio. A paginação pode fazer um GET adicional para corrigir uma página que deixou de existir. O build passará a falhar quando forem introduzidos imports, variáveis ou parâmetros não utilizados.

Validação: build de produção e 37 testes em quatro arquivos. Os testes usam HTTP simulado; não foram gravados dados reais no backend nem realizada auditoria visual automatizada em navegador. Não há warnings de compilação nos comandos finais. Não foi executado lint de hooks porque o projeto não tem essa ferramenta configurada.

## Preparação para as próximas funcionalidades

A base está adequada para adicionar Simulados, Dashboard, Desempenho, Prática direcionada e Plano de estudos de forma incremental: páginas por fluxo, APIs por recurso, tipos de request/response, componentes quando houver responsabilidade visual clara e hooks locais quando a coordenação assíncrona exigir.

Antes de disponibilizar uma área personalizada real, será necessário implementar autenticação/autorização, sessão e navegação apropriada. Isso é trabalho funcional futuro, não uma deficiência a resolver com abstrações agora. A necessidade de cache compartilhado, layouts diferentes para aluno/admin ou gerenciamento global de estado deve ser avaliada quando esses fluxos existirem e apresentarem compartilhamento concreto.
