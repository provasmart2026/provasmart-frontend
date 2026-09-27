export type LegalDocument = {
    eyebrow: string
    title: string
    description: string
    version: string
    sections: {
        title: string
        blocks: (string | string[])[]
    }[]
}

export const terms: LegalDocument = {
    eyebrow: 'Documento legal',
    title: 'Termos de Uso do ProvaSmart',
    description:
        'Regras para utilização da plataforma, responsabilidades, segurança da conta e condições de acesso aos recursos educacionais.',
    version: 'Versão 1.0 • vigente desde 20 de setembro de 2026',
    sections: [
        {
            title: '1. Apresentação',
            blocks: [
                'O ProvaSmart é uma plataforma digital de apoio aos estudos para o Exame Nacional do Ensino Médio. O serviço reúne questões, simulados, correção automática, histórico de tentativas, indicadores de desempenho, prática direcionada e plano de estudos. Também disponibiliza uma área administrativa para gerenciamento do conteúdo.',
                'Estes Termos regulam o acesso e o uso da plataforma. Ao criar uma conta ou continuar a utilizar o ProvaSmart, o usuário declara que leu e compreendeu este documento e a Política de Privacidade.',
                'O ProvaSmart é mantido pela equipe responsável pela plataforma, com contato pelo e-mail provasmrt@gmail.com.',
            ],
        },
        {
            title: '2. Público e requisitos de acesso',
            blocks: [
                'A plataforma é destinada a estudantes com 13 anos ou mais. Usuários com menos de 18 anos devem utilizar o serviço com a ciência e a assistência de seu responsável legal.',
                'O usuário deve fornecer informações corretas e manter seu e-mail atualizado. Cada conta é individual. Não é permitido compartilhar senha, token de acesso ou qualquer outro meio de autenticação. Caso perceba uso não autorizado, o usuário deverá alterar a senha e avisar a equipe do ProvaSmart.',
            ],
        },
        {
            title: '3. Perfis e funcionalidades',
            blocks: [
                'O ProvaSmart possui os perfis de estudante e administrador.',
                'O estudante pode acessar questões, realizar simulados, consultar respostas e correções, acompanhar o histórico, visualizar indicadores de desempenho, praticar conteúdos em que apresentou maior dificuldade e organizar o plano de estudos.',
                'O administrador pode cadastrar, consultar, editar e excluir questões, alternativas, disciplinas, assuntos e demais conteúdos necessários ao funcionamento da plataforma. O acesso administrativo é restrito às pessoas autorizadas e não permite o uso dos dados para finalidade particular.',
                'Algumas funcionalidades podem ser atualizadas, substituídas ou liberadas gradualmente. Uma mudança relevante será informada quando afetar a forma de uso, os direitos do usuário ou o tratamento de dados pessoais.',
            ],
        },
        {
            title: '4. Natureza educacional do serviço',
            blocks: [
                'O ProvaSmart é uma ferramenta de apoio. Os resultados, percentuais e recomendações apresentados não correspondem à nota oficial do Enem, não garantem aprovação e não substituem acompanhamento pedagógico. A plataforma não possui vínculo institucional com o Inep ou com o Ministério da Educação.',
                'Questões de terceiros somente poderão ser utilizadas quando houver autorização, licença compatível, domínio público ou outra hipótese permitida. O usuário não adquire direito de reprodução comercial sobre o conteúdo disponibilizado na plataforma.',
            ],
        },
        {
            title: '5. Uso permitido',
            blocks: [
                'O usuário compromete-se a utilizar o ProvaSmart de maneira lícita e compatível com a finalidade educacional. É proibido:',
                [
                    'tentar acessar conta, dado ou função sem autorização;',
                    'interferir no funcionamento da aplicação ou contornar limites de segurança;',
                    'utilizar automações para copiar, sobrecarregar ou explorar a plataforma;',
                    'publicar código malicioso, conteúdo ilícito ou material que viole direitos de terceiros;',
                    'compartilhar questões ou materiais protegidos fora das hipóteses autorizadas;',
                    'utilizar resultados de outros estudantes para exposição, discriminação ou constrangimento.',
                ],
                'O descumprimento poderá resultar em restrição temporária ou encerramento da conta, conforme a gravidade. Sempre que possível, o usuário será informado sobre a medida e poderá entrar em contato para solicitar revisão.',
            ],
        },
        {
            title: '6. VLibras e acessibilidade',
            blocks: [
                'O ProvaSmart incorpora o VLibras Widget como recurso complementar de tradução automática de conteúdos em português para Libras. O componente é fornecido por serviço externo e pode depender da conexão com a internet e da disponibilidade da infraestrutura do VLibras.',
                'A tradução automática pode conter limitações. O VLibras não substitui intérprete humano, revisão especializada nem outras medidas de acessibilidade. Falha ou indisponibilidade do widget não impede o acesso às funções principais da plataforma. Dificuldades de acesso podem ser comunicadas pelo e-mail provasmrt@gmail.com.',
            ],
        },
        {
            title: '7. Disponibilidade, manutenção e alterações',
            blocks: [
                'A equipe procura manter o serviço disponível e seguro, mas poderá realizar manutenções, atualizações e correções. Interrupções também podem ocorrer por falhas de infraestrutura, indisponibilidade de fornecedores, eventos de segurança ou situações fora do controle razoável da plataforma.',
                'Quando uma alteração afetar de modo relevante o serviço, estes Termos ou a Política de Privacidade, a nova versão será publicada com a data de vigência. Se a mudança depender de nova manifestação do usuário, a plataforma apresentará a solicitação adequada antes da continuidade do uso.',
            ],
        },
        {
            title: '8. Segurança da conta',
            blocks: [
                'O usuário é responsável por escolher senha forte, preservar suas credenciais e encerrar a sessão em equipamento compartilhado. A equipe do ProvaSmart não solicita senha por e-mail ou mensagem.',
                'O ProvaSmart adota controles técnicos e administrativos compatíveis com os riscos do serviço. Nenhum ambiente conectado à internet, contudo, é completamente imune a falhas. Suspeitas de vulnerabilidade ou incidente devem ser encaminhadas a provasmrt@gmail.com.',
            ],
        },
        {
            title: '9. Suspensão e encerramento',
            blocks: [
                'O usuário pode solicitar o encerramento da conta em Minha conta > Privacidade e dados. Após a solicitação, os dados serão excluídos ou anonimizados conforme a Política de Privacidade e o Plano de Retenção, ressalvadas as informações cuja conservação seja necessária para cumprimento de obrigação legal, prevenção de fraude, exercício regular de direitos ou segurança.',
                'A equipe poderá suspender ou encerrar uma conta em caso de violação destes Termos, risco à segurança, fraude ou determinação legal. A medida deverá ser proporcional e poderá ser contestada pelo canal de atendimento.',
            ],
        },
        {
            title: '10. Responsabilidades',
            blocks: [
                'O ProvaSmart responde pelo serviço nos limites da legislação aplicável. A equipe não se responsabiliza por decisões acadêmicas tomadas exclusivamente com base em estimativas, indisponibilidade causada pelo equipamento ou pela conexão do usuário, nem por serviços externos fora de seu controle.',
                'Nada neste documento limita direitos que não possam ser afastados por contrato, especialmente aqueles previstos na legislação de proteção de dados e de defesa do consumidor.',
            ],
        },
        {
            title: '11. Privacidade',
            blocks: [
                'O tratamento de dados pessoais é descrito na Política de Privacidade. Dúvidas, solicitações de direitos e comunicações sobre privacidade podem ser enviadas para provasmrt@gmail.com.',
            ],
        },
        {
            title: '12. Lei aplicável e contato',
            blocks: [
                'Estes Termos são regidos pela legislação brasileira. O usuário pode procurar os canais administrativos e judiciais competentes. Antes disso, a equipe se coloca à disposição pelo e-mail provasmrt@gmail.com para tentar resolver a questão de forma direta.',
                'Data da última atualização: 24 de setembro de 2026.',
            ],
        },
    ],
}

export const privacy: LegalDocument = {
    eyebrow: 'Privacidade e dados',
    title: 'Política de Privacidade do ProvaSmart',
    description: 'Como os dados são utilizados, protegidos, armazenados e como o titular pode exercer seus direitos.',
    version: 'Versão 1.0 • vigente desde 24 de setembro de 2026',
    sections: [
        {
            title: '1. Quem trata os dados',
            blocks: [
                'O ProvaSmart é uma plataforma de apoio à preparação para o Enem. O responsável pelas decisões sobre o tratamento de dados pessoais é o ProvaSmart, por meio de sua equipe responsável.',
                'O canal para assuntos de privacidade é provasmrt@gmail.com.',
            ],
        },
        {
            title: '2. A quem esta Política se aplica',
            blocks: [
                'Esta Política se aplica às pessoas que visitam o site, criam conta ou utilizam as funções do ProvaSmart. A plataforma é destinada a pessoas com 13 anos ou mais. Usuários com menos de 18 anos devem utilizar o serviço com a ciência e a assistência do responsável legal.',
            ],
        },
        {
            title: '3. Dados utilizados',
            blocks: [
                'De acordo com a função acessada, o ProvaSmart trata:',
                [
                    'dados da conta: nome, e-mail, senha armazenada em formato de hash, perfil, situação da conta e datas de criação e atualização;',
                    'dados de autenticação e segurança: identificadores de sessão, endereço IP, data e hora de acesso, tentativas de autenticação e registros técnicos necessários à proteção do serviço;',
                    'dados de estudo: simulados gerados, questões vinculadas, alternativas selecionadas, situação e duração da tentativa, acertos, resultados por área, disciplina e assunto, histórico e evolução;',
                    'dados do plano de estudos: conteúdos sugeridos, prioridades, tarefas, progresso e ajustes realizados pelo usuário;',
                    'dados de atendimento: mensagem enviada, contato informado, histórico da solicitação e providências adotadas;',
                    'dados técnicos do dispositivo e do navegador indispensáveis ao funcionamento e à segurança da aplicação.',
                ],
                'O ProvaSmart não precisa de CPF, endereço residencial, fotografia, voz, biometria, informação de saúde, dado financeiro ou declaração de deficiência para oferecer suas funções regulares. Se uma nova função exigir outro dado, esta Política será atualizada antes do início do tratamento.',
            ],
        },
        {
            title: '4. Finalidades e fundamentos',
            blocks: [
                'Os dados da conta, dos simulados, do desempenho e do plano de estudos são utilizados para prestar o serviço solicitado pelo usuário, manter seu histórico e personalizar as atividades de estudo. Esse tratamento está relacionado à execução do contrato e aos procedimentos necessários ao uso da plataforma.',
                'Registros de segurança são utilizados para prevenir fraude, investigar acesso indevido, preservar a disponibilidade da aplicação e proteger usuários e administradores. A equipe deverá documentar a avaliação de necessidade e de impacto quando utilizar legítimo interesse.',
                'Informações também poderão ser mantidas para cumprir obrigação legal ou regulatória, atender ordem de autoridade competente e exercer direitos em processo administrativo, arbitral ou judicial.',
                'Quando uma finalidade depender de consentimento, a solicitação será apresentada de modo destacado e poderá ser revogada. A revogação não torna ilícitos os tratamentos realizados anteriormente e não afeta operações apoiadas em outro fundamento válido.',
            ],
        },
        {
            title: '5. Como os dados são obtidos',
            blocks: [
                'Parte das informações é fornecida diretamente pelo usuário no cadastro, no uso dos simulados, no plano de estudos e no atendimento. Outras são geradas pela própria utilização do serviço, como identificadores, horários, respostas, resultados e registros técnicos.',
                'A plataforma não compra bases de dados pessoais nem obtém informações de redes sociais para formar perfis de estudantes.',
            ],
        },
        {
            title: '6. Personalização e resultados',
            blocks: [
                'O ProvaSmart utiliza respostas e resultados para calcular indicadores, identificar assuntos com maior dificuldade, sugerir prática direcionada e organizar o plano de estudos. Essas recomendações servem como apoio e podem ser revistas pelo usuário. Elas não produzem decisão sobre matrícula, acesso à educação, concessão de benefício ou aprovação no Enem.',
                'O usuário pode solicitar explicações sobre os critérios utilizados e contestar resultado que considere incorreto pelo canal de privacidade.',
            ],
        },
        {
            title: '7. Compartilhamento e operadores',
            blocks: [
                'Os dados podem ser processados por fornecedores contratados para hospedagem, banco de dados, envio de mensagens, monitoramento de segurança, cópias de segurança e suporte técnico. Cada fornecedor deverá receber apenas as informações necessárias e assumir obrigações de confidencialidade, segurança e proteção de dados.',
                'Também poderá haver compartilhamento para cumprimento de lei, ordem de autoridade, proteção da segurança da plataforma ou exercício regular de direitos. O ProvaSmart não vende dados pessoais e não compartilha histórico de estudo para publicidade comportamental.',
            ],
        },
        {
            title: '8. VLibras',
            blocks: [
                'O VLibras Widget é carregado no navegador como recurso externo de acessibilidade. O componente traduz automaticamente conteúdos em português para Libras e não possui acesso direto ao banco de dados do ProvaSmart.',
                'A equipe configura e testa o widget para reduzir a exposição desnecessária de informações pessoais. Nome, e-mail, senha, token, mensagens de atendimento e dados internos de administração não devem ser enviados para tradução. A infraestrutura externa, a disponibilidade e os registros próprios do VLibras são regidos pelos documentos do fornecedor.',
                'O uso do widget é opcional. Sua indisponibilidade não impede a realização de questões e simulados nem o acesso ao histórico e ao plano de estudos.',
            ],
        },
        {
            title: '9. Cookies e armazenamento local',
            blocks: [
                'O ProvaSmart utiliza apenas tecnologias necessárias à autenticação, à segurança e à manutenção da sessão. Cookies ou mecanismos opcionais de análise e publicidade somente serão ativados após atualização desta Política e, quando exigido, mediante escolha do usuário.',
                'O usuário pode configurar o navegador para limitar o armazenamento, mas o bloqueio dos recursos estritamente necessários pode impedir o login ou o funcionamento de áreas autenticadas.',
            ],
        },
        {
            title: '10. Segurança',
            blocks: [
                'São adotadas medidas como controle de acesso por perfil, autorização sobre registros do próprio usuário, hash de senhas, conexão criptografada em produção, validação de entradas, limitação de registros técnicos, cópias de segurança e revisão de permissões administrativas.',
                'O acesso interno é restrito às pessoas que necessitam dos dados para suas atividades. Incidentes são registrados, avaliados e tratados. Quando houver risco ou dano relevante, o controlador comunicará a ANPD e os titulares no prazo e na forma previstos na regulamentação aplicável.',
            ],
        },
        {
            title: '11. Retenção e eliminação',
            blocks: [
                'Os dados são mantidos somente enquanto necessários às finalidades descritas, ao cumprimento de obrigações e ao exercício de direitos. Após o encerramento da conta, os dados são excluídos ou anonimizados conforme o plano. Informações que precisem ser conservadas ficam bloqueadas para outras finalidades e com acesso restrito.',
            ],
        },
        {
            title: '12. Direitos do titular',
            blocks: [
                'O titular pode solicitar confirmação do tratamento, acesso, correção, informação sobre compartilhamentos, anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade, portabilidade quando regulamentada e aplicável, revisão de decisões automatizadas, informação sobre a possibilidade de negar consentimento e revogação do consentimento.',
                'O pedido deve ser enviado para provasmrt@gmail.com ou realizado em Minha conta > Privacidade e dados. A equipe poderá solicitar informações proporcionais para confirmar a identidade e impedir que terceiros obtenham os dados do titular. A resposta observará os prazos legais; pedidos complexos receberão informação sobre as providências adotadas.',
                'O titular também pode apresentar petição à Autoridade Nacional de Proteção de Dados e procurar os órgãos de defesa do consumidor quando cabível.',
            ],
        },
        {
            title: '13. Crianças e adolescentes',
            blocks: [
                'A criação de conta por pessoa com menos de 13 anos não é permitida. O ProvaSmart não solicita data de nascimento completa; utiliza uma declaração etária no cadastro para aplicar essa regra sem coletar informação excessiva. Se a equipe identificar conta criada em desacordo com esta seção, adotará as medidas necessárias para verificar a situação e excluir ou regularizar os dados.',
                'No tratamento relacionado a adolescentes, a plataforma considera seu melhor interesse, utiliza linguagem adequada e evita exposição pública de desempenho. Não existe ranking público nominal.',
            ],
        },
        {
            title: '14. Atualizações',
            blocks: [
                'Esta Política poderá ser atualizada para refletir mudança de função, fornecedor, tecnologia ou obrigação legal. A versão vigente e a data de atualização permanecerão disponíveis na plataforma. Alterações relevantes serão comunicadas antes de produzirem efeito.',
                'Data da última atualização: 24 de setembro de 2026.',
            ],
        },
    ],
}
