# Help RDS — estudos e Administração

Plataforma **independente** de apoio a estudantes do Ensino Médio Técnico em Administração da Escola Raphael Di Santo — Unidade Garcia. Não é um canal oficial da escola: não fornece grade, horários, notas, provas, comunicados ou materiais oficiais pré-cadastrados. A identidade visual é uma proposta independente, ainda sujeita à revisão dos responsáveis.

## Diagnóstico e transformação V3

A base já era uma aplicação estática Vite/JavaScript com 38 ferramentas, rotas por hash, calculadoras, organizadores, favoritos e registros locais. Não havia servidor, contas, banco, integrações externas ou IA. A primeira etapa acrescentou matérias pessoais, biblioteca de links, agenda, flashcards e uma identidade visual independente.

Antes da V3, a navegação ainda não conectava os conteúdos de Administração a uma jornada de estudo e prática. A auditoria de páginas, dados, tecnologias, integrações, identidade, lacunas e plano está em [`docs/auditoria-admin-v3.md`](docs/auditoria-admin-v3.md); o diagnóstico da etapa anterior está em [`docs/auditoria-e-plano.md`](docs/auditoria-e-plano.md). O aplicativo continua sendo o mesmo: rotas, ferramentas e chaves locais anteriores foram preservadas.

## O que funciona

- **Início e vida escolar:** navegação pelos eixos de estudo, Administração, laboratório, rotina e desenvolvimento profissional; compromissos e contadores refletem apenas os registros do navegador. Matérias podem ser criadas, editadas e excluídas; seus recursos são associados pelo nome informado, ignorando acentos e maiúsculas. Alterar o nome não modifica os registros associados.
- **Trilhas de Administração:** seis percursos introdutórios — fundamentos, custos e preço, finanças, marketing, pessoas e estratégia/projetos. Cada um contém conceito, caso fictício, questão de múltipla escolha com retorno comentado e conexão a uma ferramenta. É possível tentar novamente e marcar/desmarcar uma trilha como estudada. A última tentativa por trilha e as marcações ficam no navegador; não são notas oficiais, prova de aprendizagem ou certificação. Os textos são materiais complementares, não conteúdo curricular da escola.
- **Laboratório empresarial:** informe nome opcional, preço unitário, custo variável unitário, custos fixos e quantidade de um mesmo período. A simulação apresenta receita, custo variável total, contribuição unitária, resultado operacional simplificado, resultado/receita e ponto de equilíbrio. O rascunho fica local; até 100 cenários podem ser salvos, carregados, excluídos com confirmação e comparados dois a dois. A comparação mostra a diferença de resultado B − A e uma tabela de premissas e resultados dos dois cenários. Substituir ou limpar um rascunho preenchido também exige confirmação. Registros inválidos são sinalizados e podem ser removidos separadamente, após confirmação.
- **Meu futuro:** um mapa visual de cinco passos reversíveis para interesses, competências, projetos, apresentação e próximos passos, com acesso a ferramentas de projetos e anotações. As marcações são autodeclarações locais, não qualificações comprovadas.
- **Rotina pessoal preservada:** calendário mensal e exportação `.ics`, tarefas, agenda semanal, anotações, projetos, favoritos, histórico, rascunhos, temporizador e 38 ferramentas originais. As datas são cadastradas pelo estudante, não são eventos oficiais; não há notificações.
- **Biblioteca pessoal:** guardar, editar, excluir, pesquisar, filtrar, ordenar e favoritar links HTTP/HTTPS, com origem informada pelo usuário e detecção de duplicatas que diferem somente no fragmento. A aplicação não hospeda arquivos; documentos são abertos no site de origem e links com usuário/senha embutidos não são aceitos.
- **Flashcards manuais:** pergunta, resposta, matéria, tema, dificuldade e fonte, com criação, edição, exclusão e sessões de revisão. A autoavaliação difícil/médio/fácil sugere retorno em 1/3/7 dias. Os contadores registram atividade, não acertos comprovados. “Difíceis” reúne cartões assim avaliados ou cadastrados inicialmente como difíceis.
- **Pesquisa global local:** encontra ferramentas, áreas, trilhas, guias, cenários e conteúdos pessoais deste navegador. Não indexa PDFs externos. Os três guias anteriores de lógica, HTML/CSS e JavaScript continuam acessíveis como conteúdo extra pela área de desenvolvimento profissional; não executam código e não representam o currículo oficial.
- **Experiência:** nove ilustrações originais geradas, otimizadas em WebP, ícones SVG locais, layout responsivo, modos claro/escuro, foco visível, navegação por teclado e respeito a movimento reduzido. As ilustrações representam objetos e ideias, não fotografias da escola ou de estudantes.
- **Conta (em implantação):** interface para cadastro por e-mail e senha, confirmação de e-mail, entrada, saída e recuperação de senha com Supabase Auth. As ferramentas continuam disponíveis sem conta. O responsável informou que salvou o SMTP personalizado no Supabase, mas a aprovação do provedor e a entrega real de mensagens ainda precisam ser verificadas; os fluxos automatizados usam respostas simuladas.

### Premissas e limites do laboratório

- Valores monetários aceitam vírgula ou ponto e até duas casas decimais, **sem separador de milhar**. Preço e custo variável: de R$ 0,00 a R$ 1.000.000,00 por unidade; custo fixo: de R$ 0,00 a R$ 1.000.000.000,00; quantidade inteira de 0 a 1.000.000 unidades. Os cálculos monetários usam centavos inteiros.
- Receita = preço × quantidade; contribuição unitária = preço − custo variável unitário; resultado = receita − custos variáveis totais − custos fixos. Resultado/receita não é calculado se a receita for zero.
- Com contribuição unitária positiva, o equilíbrio é o custo fixo dividido pela contribuição, arredondado para cima. Se o custo fixo for zero, zero unidades já dão resultado zero; com contribuição negativa, cada unidade vendida piora o resultado. Se houver custo fixo positivo e contribuição não positiva, o modelo não atinge o equilíbrio.
- O modelo **não prevê demanda nem calcula automaticamente** tributos, despesas, perdas, estoque, inadimplência ou outros fatores. Só considera valores incluídos nas premissas. Não é lucro contábil ou aconselhamento fiscal, contábil, jurídico ou financeiro. Use dados fictícios para aprender e consulte profissionais para decisões reais.

## Limitações e privacidade

**Os registros de estudo são locais, não privados por autenticação.** Entrar na conta não protege nem sincroniza as anotações, tarefas, favoritos ou quaisquer outros dados de estudo. Qualquer pessoa com acesso ao mesmo perfil do navegador pode lê-los ou alterá-los; não há backup automático. O navegador pode bloquear ou apagar o armazenamento; quando uma gravação falha, a interface avisa. Não inclua senhas, dados pessoais sensíveis, links privados ou dados de colegas ou empresas. Em dispositivo compartilhado, saia da conta, exporte o necessário e apague os dados em Configurações. Apagar os dados locais não encerra a sessão.

A autenticação envia e-mail e senha ao Supabase por HTTPS; a gestão de credenciais é feita pelo Supabase Auth, não pelo código da plataforma. A sessão usa `sessionStorage` da aba, ou memória quando indisponível; não é exportada junto aos registros locais. Não há exclusão de conta na interface: o responsável deve providenciar atendimento às solicitações e definir política de retenção, privacidade e medidas para menores antes do uso real.

A exportação JSON é uma cópia sob responsabilidade de quem a baixar; **não há importador integrado**. Links externos podem coletar dados segundo a política do site de destino; origem e disponibilidade não são verificadas automaticamente. O temporizador funciona somente enquanto a aplicação está aberta, sem serviço em segundo plano.

Não foram implementados perfil ou dados de estudo sincronizados, uploads/arquivos privados, biblioteca compartilhada, painel administrativo, avisos oficiais, moderação, comunidade, colaboração, assistente de IA, leitura de PDFs, geração automática de conteúdos, simulados completos, área ENEM, notificações ou funcionamento offline/PWA. Há seis questões simples nas trilhas, não uma plataforma de avaliações. Antes de salvar dados privados no banco, será necessário criar tabelas com RLS e políticas de acesso verificadas entre usuários, consentimento e governança adequados para menores. Não há tabelas de registros de estudo nem testes reais de isolamento entre contas nesta etapa.

## Tecnologias e arquivos

- HTML semântico, CSS responsivo, JavaScript ES modules, Vite 6 e `@supabase/supabase-js`. O SDK é carregado sob demanda ao abrir a conta ou retomar uma sessão; registros de estudo continuam locais.
- `src/admin.js`: conteúdo complementar e regras puras das trilhas, progresso e simulação. `src/admin-pages.js` e `src/admin.css`: páginas e estilos da V3.
- `src/tools.js`, `src/calculations.js`: catálogo e fórmulas das ferramentas anteriores. `src/study.js`: calendário, URLs, flashcards, iCalendar e guias extras.
- `src/main.js`, `src/study-pages.js`, `src/subject-pages.js`: shell, navegação, pesquisa e interfaces. `src/storage.js`: persistência tolerante a falhas com o prefixo anterior `help-rds:`. `src/auth.js`, `src/auth-pages.js`, `src/auth.css`: integração, interface e estilos da conta.
- Novas coleções V3: `records:admin-progress`, `records:admin-attempts`, `records:business-scenarios`, `records:career-progress` e rascunho `calculator:admin-lab`. Coleções anteriores, incluindo `records:subjects`, `records:library` e `records:flashcards`, continuam legíveis. Não houve migração de banco.
- `src/styles.css`, `src/design-components.css`, `src/visual.css` e `src/admin.css` compartilham estilos; `src/icons.js` e `src/assets/` contêm ícones e imagens locais. As nove WebPs somam aproximadamente 504 KiB e têm dimensões explícitas; imagens fora da área inicial usam carregamento tardio. Confira os termos aplicáveis às imagens geradas antes de distribuição que exija autorização ou licença específica.

**Variáveis de ambiente:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` configuram o acesso ao Supabase; veja `.env.example`. As variáveis `VITE_` são públicas no navegador: use somente uma chave `sb_publishable_`, nunca `service_role`, `sb_secret_`, senha do banco ou credenciais SMTP. Sem essas variáveis, a conta fica indisponível e as demais ferramentas continuam utilizáveis. Arquivos `.env.local` ficam fora do Git. `APP_URL` e `CHROMIUM_PATH` são usados apenas nos testes opcionais de navegador.

## Executar e publicar

Requer Node.js 20.19+ ou 22.12+ e npm:

```bash
cd atividade-do-gugu
npm ci
npm run dev
npm test
npm run build
npm run preview
```

O servidor de desenvolvimento/preview aceita hosts externos para pré-visualização; não o use como servidor de produção exposto. Para publicação estática, execute o build e publique **o conteúdo de `atividade-do-gugu/dist/`**, incluindo `assets/`. Os caminhos são relativos e as rotas usam `#`, funcionando também em subdiretórios sem fallback de rotas. Verifique início, trilha, laboratório, dados locais e tema após publicar. Use HTTPS e configure cache e cabeçalhos de segurança conforme a hospedagem existente. O custo de hospedagem depende do plano contratado; serviços futuros precisam de avaliação separada.

### Configuração do projeto no Vercel

O projeto conectado ao GitHub usa **Root Directory: `atividade-do-gugu`** e o preset **Vite**. Com isso, o Vercel encontra `package.json` e `package-lock.json`, instala as dependências, executa `npm run build` e publica `dist`. A configuração é feita no projeto do Vercel, não em um arquivo versionado neste repositório. A branch `main` é a origem de produção.

Se o log mostrar `vite: command not found`, confira primeiro o Root Directory: se ele apontar para a raiz do repositório, o Vercel não encontrará as dependências do aplicativo, que fica na subpasta. Após ajustar, faça um novo deploy e confirme a versão publicada; o erro de um deploy antigo não é alterado retroativamente.

### Autenticação Supabase e pendências para uso público

Um projeto Supabase separado foi criado para a autenticação, com confirmação de e-mail ativada e URL de produção definida. As variáveis públicas também foram configuradas no projeto Vercel para builds futuros; a implantação de produção não muda até que o código seja publicado. O SDK usa o fluxo de retorno por fragmento, que é processado e removido antes da navegação por hash. O allowlist de redirecionamento deve conter apenas URLs controladas; remova prévias temporárias quando não forem mais necessárias.

**Ainda não está pronto para cadastro público:**

1. Validar o [SMTP personalizado no Supabase](https://supabase.com/docs/guides/auth/auth-smtp). O responsável informou ter autenticado `help-rds.de5.net` na Brevo e salvado as configurações SMTP no Supabase; isso não comprova ativação da plataforma transacional, envio ou entrega. Faça um teste real e acompanhe limites, validade e inatividade da chave. O endereço é um subdomínio gratuito cedido por terceiro, sujeito à renovação, e sua autenticação não cria uma caixa de entrada. Nunca cole credenciais SMTP no repositório ou em conversas.
2. Ajustar a política de senha **no servidor** no painel Supabase antes de abrir cadastros. A interface solicita 8 caracteres, mas a configuração inicial observada no servidor aceita 6; validação no navegador não impede chamadas diretas.
3. Definir responsável, política de privacidade/retenção e processo de exclusão de conta, incluindo requisitos aplicáveis a menores. Avaliar medidas antiautomatização e limites de envio sem desativar a confirmação de e-mail.
4. Publicar o código e fazer teste real de cadastro, confirmação por e-mail, login, logout e recuperação em ambiente autorizado. Os testes de navegador atuais simulam o serviço e **não comprovam entrega de mensagens nem o fluxo real em produção**.

O Supabase Auth armazena as contas no serviço gerenciado; esta etapa não cria tabelas públicas nem envia registros de estudo. Uma consulta de privilégios confirmou que os papéis `anon` e `authenticated` não têm SELECT nem UPDATE direto em `auth.users`; isso não substitui testes completos de segurança. Caso sejam criadas tabelas futuramente, habilite RLS e teste efetivamente acesso negado sem sessão e entre usuários antes de armazenar qualquer dado privado.

## Testes e qualidade

- `npm test`: 35 testes unitários cobrindo os recursos anteriores e validação, mensagens, retornos e integração simulada da conta.
- `npm run build`: compilação de produção. Os dois testes de navegador também passaram no build servido a partir de um subdiretório estático; confira novamente na hospedagem de destino.
- `scripts/qa-browser.mjs`: fluxos anteriores, 38 rotas de ferramentas, dados locais, exclusões, busca, exportações e larguras de 320, 390, 768, 1024 e 1440 px.
- `scripts/qa-admin.mjs`: trilhas e correção, simulação com vírgula, comparação, persistência, recuperação de dados inválidos, confirmações, carreira, compatibilidade com dados anteriores, busca, exportação, falha de armazenamento e as mesmas cinco larguras.
- `scripts/qa-a11y.mjs`: axe WCAG 2/2.1 A/AA em 29 rotas, dois temas e duas larguras, incluindo exercícios e simulações preenchidas.
- `scripts/qa-auth.mjs`: cadastro, login, sessão, logout e recuperação com respostas simuladas; acessibilidade nas rotas de conta em dois temas e duas larguras, e overflow em cinco larguras. Nenhum usuário real é criado. Testes automatizados não substituem avaliação humana de acessibilidade, conteúdo ou segurança.

Para reproduzir os testes opcionais, tenha um Chromium compatível e instale somente as dependências de teste, sem alterar o manifesto:

```bash
npm install --no-save --package-lock=false playwright-core @axe-core/playwright
npm run dev
# em outro terminal:
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-browser.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-admin.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-a11y.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-auth.mjs
# APP_URL pode apontar para outra instância da aplicação
```

## Próximos passos e créditos

Validar conteúdo, identidade e eventual alinhamento à grade real com os responsáveis, sem atribuir caráter oficial sem autorização. Antes de sincronização ou colaboração, definir governança, retenção, autenticação, proteção de arquivos, revisão de uploads e autorização real no servidor e no banco; avaliar custos e fontes antes de integrar IA ou conteúdo externo.

**Programação — Ytalo Lima:** desenvolvimento e implementação técnica, arquitetura e navegação, integração visual, responsividade, acessibilidade, testes e manutenção.

**Equipe de design — Pedro Miranda e Matheus Gama:** direção visual, identidade, cores, tipografia, linguagem gráfica, layouts, componentes e orientações de UX/UI. As contribuições individuais não são subdivididas. A proposta visual e as ilustrações geradas não são apresentadas como materiais aprovados pela equipe ou pela escola; veja [`docs/design-handoff.md`](docs/design-handoff.md).
