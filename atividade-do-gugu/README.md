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
- **Conta (em implantação):** entrada somente pelo Google usando Supabase Auth. O serviço cria a conta no primeiro acesso e reconhece o usuário nos seguintes, conforme sua configuração; é possível sair da sessão. As ferramentas continuam disponíveis sem conta. A configuração do Google OAuth precisa ser confirmada e testada de verdade; os testes automatizados usam respostas simuladas.

### Premissas e limites do laboratório

- Valores monetários aceitam vírgula ou ponto e até duas casas decimais, **sem separador de milhar**. Preço e custo variável: de R$ 0,00 a R$ 1.000.000,00 por unidade; custo fixo: de R$ 0,00 a R$ 1.000.000.000,00; quantidade inteira de 0 a 1.000.000 unidades. Os cálculos monetários usam centavos inteiros.
- Receita = preço × quantidade; contribuição unitária = preço − custo variável unitário; resultado = receita − custos variáveis totais − custos fixos. Resultado/receita não é calculado se a receita for zero.
- Com contribuição unitária positiva, o equilíbrio é o custo fixo dividido pela contribuição, arredondado para cima. Se o custo fixo for zero, zero unidades já dão resultado zero; com contribuição negativa, cada unidade vendida piora o resultado. Se houver custo fixo positivo e contribuição não positiva, o modelo não atinge o equilíbrio.
- O modelo **não prevê demanda nem calcula automaticamente** tributos, despesas, perdas, estoque, inadimplência ou outros fatores. Só considera valores incluídos nas premissas. Não é lucro contábil ou aconselhamento fiscal, contábil, jurídico ou financeiro. Use dados fictícios para aprender e consulte profissionais para decisões reais.

## Limitações e privacidade

**Os registros de estudo são locais, não privados por autenticação.** Entrar na conta não protege nem sincroniza as anotações, tarefas, favoritos ou quaisquer outros dados de estudo. Qualquer pessoa com acesso ao mesmo perfil do navegador pode lê-los ou alterá-los; não há backup automático. O navegador pode bloquear ou apagar o armazenamento; quando uma gravação falha, a interface avisa. Não inclua senhas, dados pessoais sensíveis, links privados ou dados de colegas ou empresas. Em dispositivo compartilhado, saia da conta, exporte o necessário e apague os dados em Configurações. Apagar os dados locais não encerra a sessão.

A autenticação ocorre pelo Google e Supabase Auth com OAuth/PKCE por HTTPS; o aplicativo não recebe senha Google e deixa o SDK gerenciar a sessão em `sessionStorage` da aba. Recarregar mantém a sessão enquanto a aba durar; ela não é sincronizada entre abas e uma aba sem cópia dessa sessão exige nova entrada. O código PKCE precisa voltar na mesma aba; se o armazenamento da aba ou Web Crypto estiverem indisponíveis, o acesso é interrompido com aviso, sem tentar um fluxo de memória que não sobreviveria ao redirecionamento. A sessão não é exportada junto aos registros locais. Não há exclusão de conta na interface: o responsável deve providenciar atendimento às solicitações e definir política de retenção, privacidade e medidas para menores antes do uso real.

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

### Autenticação Google: configuração e pendências

O frontend foi preparado para `signInWithOAuth` com `provider: google` e PKCE. A volta usa um código de uso único na query, que é retirado da URL e trocado pelo SDK antes da navegação para `#/home`. Cancelamento, erro e links antigos não são tratados como autenticação bem-sucedida. Rotas antigas de conta mostram a tela Google, sem formulários anteriores. Não há confirmação, senha, códigos OTP, magic links nem recuperação por e-mail implementados no aplicativo.

**O estado do provedor Google não foi verificado e o acesso real ainda não foi testado; não houve alteração externa nesta etapa.** O projeto Supabase é `help-rds-auth`; a publicação de produção não muda até que este código seja publicado. Antes de retirar o método anterior, preserve o acesso existente e siga esta ordem:

1. No [Google Auth Platform](https://console.cloud.google.com/auth/overview), configure marca, público e tela de consentimento do Help RDS. Em **Data Access**, habilite os escopos básicos `openid`, `userinfo.email` e `userinfo.profile` conforme as instruções do Supabase. Se o app estiver em teste, inclua as contas de teste autorizadas; para disponibilização ampla, verifique os requisitos de publicação/verificação do Google e as políticas aplicáveis a menores. Não solicite permissões extras sem necessidade.
2. Em **Clients**, crie um cliente OAuth do tipo **Web application**. Em **Authorized JavaScript origins**, adicione a origem de produção `https://rds-apoio-para-aprender.vercel.app` e, somente se necessário, a origem exata de uma prévia controlada ou `http://localhost:5173`. Em **Authorized redirect URIs**, adicione o callback do Supabase (não é a rota de conta do site):

   ```text
   https://mzjrfyuqsbumgkmwxplo.supabase.co/auth/v1/callback
   ```

3. No Supabase, abra **Authentication → Sign In / Providers → Google**, habilite o provedor e insira o Client ID e Client Secret gerados pelo Google diretamente no painel. Nunca coloque o Client Secret, chaves secretas do Supabase ou outras credenciais no frontend, repositório, logs ou conversa. Confirme que **Allow new users to sign up** não esteja desativado globalmente, pois isso também impediria o primeiro acesso Google.
4. Em **Authentication → URL Configuration**, confira a Site URL de produção e inclua na lista de Redirect URLs o retorno exato `https://rds-apoio-para-aprender.vercel.app/`. Para testar em prévia, adicione também sua URL exata, com o caminho onde a aplicação está publicada e sem `#`; para desenvolvimento local, se usado, `http://localhost:5173/`. O aplicativo retorna à mesma origem/caminho em que o login começou. Use somente URLs controladas, evite curingas amplos e remova entradas temporárias após os testes.
5. Publique primeiro em prévia autorizada e teste com consentimento: primeiro acesso, mesmo usuário após sair e entrar novamente, escolha/cancelamento da conta Google, retorno à página inicial, recarregamento, saída, falhas e preservação dos dados locais. Os testes automatizados simulam Google/Supabase e **não comprovam configuração, criação ou vinculação reais**. Defina responsável, política de privacidade/retenção e atendimento para exclusão de conta antes de uso público.
6. **Somente após configurar e validar o Google** e organizar a migração dos usuários, desabilite o provedor **Email** em Authentication → Sign In / Providers → Email e salve. Revise se telefone, login anônimo, outros provedores ou SSO estão ativos e, quando aplicável e sem afetar outros consumidores, desabilite os métodos que não sejam Google. Verifique com testes autorizados que e-mail/senha e links/códigos antigos sejam recusados pela API. Não confunda desativar o provedor Email com desligar a confirmação de e-mail ou o cadastro global. Enquanto o método antigo permanecer habilitado no Supabase, sua API poderá aceitá-lo mesmo que a interface não o ofereça.

As contas existentes não são apagadas nem recriadas por esta alteração de código. O Supabase pode [vincular automaticamente identidades](https://supabase.com/docs/guides/auth/auth-identity-linking) com o mesmo e-mail, conforme suas regras de verificação; ele pode remover identidades não confirmadas como proteção. Um endereço diferente não garante acesso à conta anterior. Avalie os usuários existentes e um procedimento seguro para casos que não se vinculem; não associe contas manualmente apenas pela semelhança de e-mail. A sessão da versão antiga usa outra chave e não é retomada automaticamente; sessões já emitidas em outros clientes não são revogadas por esta mudança e devem ser tratadas conforme a política do projeto. Nenhum usuário, tabela, dado escolar, política RLS ou configuração SMTP foi alterado aqui.

O Supabase Auth armazena as contas no serviço gerenciado; esta etapa não cria tabelas públicas nem envia registros de estudo. Uma consulta anterior de privilégios confirmou que os papéis `anon` e `authenticated` não tinham SELECT nem UPDATE direto em `auth.users`; isso não substitui testes completos de segurança. Caso sejam criadas tabelas futuramente, habilite RLS e teste efetivamente acesso negado sem sessão e entre usuários antes de armazenar qualquer dado privado.

## Testes e qualidade

- `npm test`: testes unitários cobrindo os recursos anteriores, configuração, mensagens, retorno PKCE e integração simulada da conta.
- `npm run build`: compilação de produção. Os testes de conta, fluxos gerais e Administração também passaram no build servido a partir de um subdiretório estático; confira novamente na hospedagem de destino.
- `scripts/qa-browser.mjs`: fluxos anteriores, 38 rotas de ferramentas, dados locais, exclusões, busca, exportações e larguras de 320, 390, 768, 1024 e 1440 px.
- `scripts/qa-admin.mjs`: trilhas e correção, simulação com vírgula, comparação, persistência, recuperação de dados inválidos, confirmações, carreira, compatibilidade com dados anteriores, busca, exportação, falha de armazenamento e as mesmas cinco larguras.
- `scripts/qa-a11y.mjs`: axe WCAG 2/2.1 A/AA em 29 rotas, dois temas e duas larguras, incluindo exercícios e simulações preenchidas.
- `scripts/qa-auth.mjs`: OAuth/PKCE, retorno, segundo acesso, cancelamento, erros, sessão por aba, saída e preservação de dados locais com respostas simuladas; acessibilidade em dois temas e duas larguras, e overflow em cinco larguras. Nenhum usuário real é criado. Testes automatizados não substituem avaliação humana de acessibilidade, conteúdo ou segurança.

Para reproduzir os testes opcionais, tenha um Chromium compatível e instale somente as dependências de teste, sem alterar o manifesto:

```bash
npm install --no-save --package-lock=false playwright-core @axe-core/playwright
npm run dev
# em outro terminal:
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-browser.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-admin.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-a11y.mjs
# Em outro terminal, inicie um servidor separado com URL e chave fictícias:
VITE_SUPABASE_URL=https://qa.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_mock npm run dev -- --port 5174 --strictPort
# Em outro terminal, rode o teste contra essa instância simulada:
APP_URL=http://127.0.0.1:5174/ CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-auth.mjs
```

## Próximos passos e créditos

Validar conteúdo, identidade e eventual alinhamento à grade real com os responsáveis, sem atribuir caráter oficial sem autorização. Antes de sincronização ou colaboração, definir governança, retenção, autenticação, proteção de arquivos, revisão de uploads e autorização real no servidor e no banco; avaliar custos e fontes antes de integrar IA ou conteúdo externo.

**Programação — Ytalo Lima:** desenvolvimento e implementação técnica, arquitetura e navegação, integração visual, responsividade, acessibilidade, testes e manutenção.

**Equipe de design — Pedro Miranda e Matheus Gama:** direção visual, identidade, cores, tipografia, linguagem gráfica, layouts, componentes e orientações de UX/UI. As contribuições individuais não são subdivididas. A proposta visual e as ilustrações geradas não são apresentadas como materiais aprovados pela equipe ou pela escola; veja [`docs/design-handoff.md`](docs/design-handoff.md).
