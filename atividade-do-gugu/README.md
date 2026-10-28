# Help RDS — estudos e Administração

Plataforma **independente** de apoio a estudantes do Ensino Médio Técnico em Administração da Escola Raphael Di Santo — Unidade Garcia. Não é um canal oficial da escola: não fornece grade, horários, notas, provas, comunicados ou materiais oficiais pré-cadastrados. A identidade visual é uma proposta independente, ainda sujeita à revisão dos responsáveis.

## Diagnóstico e transformação V3

A base já era uma aplicação estática Vite/JavaScript com 38 ferramentas, rotas por hash, calculadoras, organizadores, favoritos e registros locais. Não havia servidor, contas, banco, integrações externas ou IA. A primeira etapa acrescentou matérias pessoais, biblioteca de links, agenda, flashcards e uma identidade visual independente.

Antes da V3, a navegação ainda não conectava os conteúdos de Administração a uma jornada de estudo e prática. A auditoria de páginas, dados, tecnologias, integrações, identidade, lacunas e plano está em [`docs/auditoria-admin-v3.md`](docs/auditoria-admin-v3.md); o diagnóstico da etapa anterior está em [`docs/auditoria-e-plano.md`](docs/auditoria-e-plano.md). O aplicativo continua sendo o mesmo: rotas, ferramentas e chaves locais anteriores foram preservadas.

## O que funciona

- **Início e vida escolar:** o resumo mostra as próximas tarefas e datas, tarefas atrasadas e cartões devidos, somente a partir deste navegador. Um guia inicial opcional pode ser dispensado. Anotações, tarefas, datas, referências e cartões podem ser vinculados ao identificador de uma matéria; renomeá-la preserva esses vínculos. Registros antigos continuam associados por nome quando possível; nomes repetidos são ambíguos e não são convertidos automaticamente.
- **Trilhas de Administração:** seis percursos com conceito, caso fictício e atividade comentada. Cada trilha recebeu um exercício extra com explicação, explicitamente marcado como **rascunho ainda não revisado pelos responsáveis**. Tentativas e marcações são locais; não são notas oficiais nem certificação. Os textos são complementares e não representam o currículo da escola.
- **Laboratório empresarial:** informe preço, custos e quantidade de um período. A simulação oferece resultados, barras e uma tabela textual acessível, além de salvar e comparar até 100 cenários fictícios. Limpar ou substituir rascunhos e excluir cenários exige confirmação. Os números são calculados apenas a partir das premissas informadas; veja os limites abaixo.
- **Meu futuro:** um mapa visual de cinco passos reversíveis para interesses, competências, projetos, apresentação e próximos passos, com acesso a ferramentas de projetos e anotações. As marcações são autodeclarações locais, não qualificações comprovadas.
- **Rotina pessoal preservada:** calendário mensal interativo, acesso a todos os compromissos do dia e exportação `.ics`; tarefas aceitam matéria, prioridade e até 30 subtarefas opcionais. Agenda semanal, anotações, projetos, favoritos, histórico, rascunhos, temporizador e as 38 ferramentas originais continuam disponíveis. Não há datas oficiais ou notificações automáticas.
- **Biblioteca pessoal:** links HTTP/HTTPS cadastrados pelo estudante, com filtros, origem informada e detecção de duplicatas; não hospeda arquivos. Há também uma seleção externa do [Banco Central](https://www.bcb.gov.br/cidadaniafinanceira) e do [Sebrae](https://sebrae.com.br/educacao-empreendedora), consultada em 28/10/2026 e identificada como conteúdo externo, não material oficial da escola. Disponibilidade e conteúdo podem mudar.
- **Flashcards manuais:** pergunta e resposta escritas pelo estudante, matéria, tema, dificuldade e fonte opcionais. Uma anotação pode preencher um **rascunho** de resposta: o estudante escreve a pergunta e revisa o texto antes de salvar. A revisão pode ser filtrada por matéria e tema; intervalos difícil/médio/fácil começam em 1/3/7 dias e podem ser ajustados entre 1 e 365 dias. Contadores registram atividade, não aprendizagem comprovada.
- **Pesquisa global local:** encontra ferramentas, áreas, trilhas, guias, cenários e conteúdos pessoais, com filtro por tipo e links que abrem o registro exato neste navegador. Não indexa PDFs. Os guias de lógica, HTML/CSS e JavaScript são complementares e não executam código.
- **Experiência:** nove ilustrações originais geradas, otimizadas em WebP, ícones SVG locais, layout responsivo, modos claro/escuro, foco visível, navegação por teclado e respeito a movimento reduzido. As ilustrações representam objetos e ideias, não fotografias da escola ou de estudantes.
- **Conta (em implantação):** entrada somente pelo Google usando Supabase Auth. O serviço cria a conta no primeiro acesso e reconhece o usuário nos seguintes, conforme sua configuração; é possível sair da sessão. As ferramentas continuam disponíveis sem conta. A configuração do Google OAuth precisa ser confirmada e testada de verdade; os testes automatizados usam respostas simuladas.

### Premissas e limites do laboratório

- Valores monetários aceitam vírgula ou ponto e até duas casas decimais, **sem separador de milhar**. Preço e custo variável: de R$ 0,00 a R$ 1.000.000,00 por unidade; custo fixo: de R$ 0,00 a R$ 1.000.000.000,00; quantidade inteira de 0 a 1.000.000 unidades. Os cálculos monetários usam centavos inteiros.
- Receita = preço × quantidade; contribuição unitária = preço − custo variável unitário; resultado = receita − custos variáveis totais − custos fixos. Resultado/receita não é calculado se a receita for zero.
- Com contribuição unitária positiva, o equilíbrio é o custo fixo dividido pela contribuição, arredondado para cima. Se o custo fixo for zero, zero unidades já dão resultado zero; com contribuição negativa, cada unidade vendida piora o resultado. Se houver custo fixo positivo e contribuição não positiva, o modelo não atinge o equilíbrio.
- O modelo **não prevê demanda nem calcula automaticamente** tributos, despesas, perdas, estoque, inadimplência ou outros fatores. Só considera valores incluídos nas premissas. Não é lucro contábil ou aconselhamento fiscal, contábil, jurídico ou financeiro. Use dados fictícios para aprender e consulte profissionais para decisões reais.

## Limitações e privacidade

**Os registros de estudo são locais, não privados por autenticação.** Entrar na conta não protege nem sincroniza as anotações, tarefas, favoritos ou quaisquer outros dados de estudo. Qualquer pessoa com acesso ao mesmo perfil do navegador pode lê-los ou alterá-los; não há backup automático. O navegador pode bloquear ou apagar o armazenamento; quando uma gravação falha, a interface avisa. Não inclua senhas, dados pessoais sensíveis, links privados ou dados de colegas ou empresas. Em dispositivo compartilhado, saia da conta, exporte o necessário e apague os dados em Configurações. Apagar os dados locais não encerra a sessão.

A autenticação ocorre pelo Google e Supabase Auth com OAuth/PKCE por HTTPS; o aplicativo não recebe senha Google e deixa o SDK gerenciar a sessão em `sessionStorage` da aba. Recarregar mantém a sessão enquanto a aba durar; ela não é sincronizada entre abas e uma aba sem cópia dessa sessão exige nova entrada. O código PKCE precisa voltar na mesma aba; se o armazenamento da aba ou Web Crypto estiverem indisponíveis, o acesso é interrompido com aviso, sem tentar um fluxo de memória que não sobreviveria ao redirecionamento. A sessão não é exportada junto aos registros locais. A página de privacidade informa que a exclusão da conta não está disponível sem um canal real. `VITE_PRIVACY_CONTACT_EMAIL` só deve ser configurada com um e-mail público, previamente autorizado e atendido pelo responsável; ela cria um link de solicitação, não apaga a conta automaticamente. É preciso definir política de retenção e medidas para menores antes do uso real.

### Backup e restauração local

Em **Configurações**, exporte uma cópia JSON versionada. A sessão da conta não é incluída. Também é possível importar backups completos antigos (objeto de grupos) e novos, além de exportações individuais antigas de ferramentas (listas): neste caso, escolha explicitamente a ferramenta de origem, pois o arquivo sozinho não a identifica. O limite é 10 MiB; JSON inválido, estruturas profundas, IDs ausentes/duplicados ou perigosos e versões não reconhecidas são recusados. Grupos desconhecidos são ignorados e informados na prévia.

A opção padrão **mesclar** mantém registros locais com o mesmo ID e preferências existentes; IDs novos são adicionados. **Substituir** altera somente os grupos presentes no arquivo, com confirmação, e não apaga outros grupos. Antes de qualquer importação, exporte outra cópia e feche as demais abas. A leitura e a gravação são locais, com verificação de alterações desde a prévia e tentativa de rollback; `localStorage` não oferece uma transação entre grupos, e uma falha ou concorrência pode impedir a recuperação integral. Arquivos baixados são responsabilidade de quem os guarda.

### Acesso offline opcional

Depois de preparar a cópia em **Configurações** enquanto estiver online, o service worker armazena apenas a página e os arquivos públicos do build no cache do navegador. Ele não guarda chamadas ao Supabase, respostas de autenticação, URLs com parâmetros ou registros de estudo. É possível remover essa cópia sem apagar os dados locais. Navegadores podem limpar o cache; atualizações e a primeira preparação dependem de conexão. Login Google e links externos exigem internet. O recurso exige HTTPS (ou localhost), um navegador compatível e o build de produção com `sw.js`; não está disponível no servidor Vite de desenvolvimento.

Links externos podem coletar dados segundo a política de seus destinos; origem e disponibilidade dos links cadastrados por estudantes não são verificadas automaticamente. O temporizador funciona somente enquanto a aplicação está aberta.

Não foram implementados sincronização de dados de estudo, exclusão automática de conta, uploads privados, biblioteca compartilhada, painel administrativo, avisos oficiais, moderação, comunidade, colaboração, assistente de IA, leitura de PDFs, simulados completos ou notificações. Os seis exercícios extras são rascunhos aguardando revisão dos responsáveis. Antes de armazenar dados privados no banco, é necessário definir consentimento e governança para menores, criar tabelas com RLS e testar isolamento entre usuários. Não há tabelas de registros de estudo nem testes reais de isolamento nesta etapa. Consulte o [plano de segurança e pendências](docs/plano-privacidade-sincronizacao.md).

## Tecnologias e arquivos

- HTML semântico, CSS responsivo, JavaScript ES modules, Vite 6 e `@supabase/supabase-js`. O SDK é carregado sob demanda ao abrir a conta ou retomar uma sessão; registros de estudo continuam locais.
- `src/admin.js` e `src/exercises.js`: regras das trilhas e exercícios extras não revisados. `src/admin-pages.js` e `src/admin.css`: páginas, gráfico e tabela do laboratório.
- `src/tools.js`, `src/calculations.js`: catálogo e fórmulas das ferramentas anteriores. `src/study.js`: calendário, URLs, flashcards, iCalendar e guias extras.
- `src/main.js`, `src/study-pages.js`, `src/subject-pages.js`: shell, navegação e interfaces. `src/storage.js`, `src/backup.js`, `src/subject-links.js` e `src/tasks.js`: persistência local, importação, vínculos e subtarefas. `src/offline.js` e `src/offline-sw.js`: acesso offline opcional. `src/privacy.js`: informações de privacidade. `src/auth.js`, `src/auth-pages.js`, `src/auth.css`: conta.
- Novas coleções V3: `records:admin-progress`, `records:admin-attempts`, `records:business-scenarios`, `records:career-progress` e rascunho `calculator:admin-lab`. Coleções anteriores, incluindo `records:subjects`, `records:library` e `records:flashcards`, continuam legíveis. Não houve migração de banco.
- `src/styles.css`, `src/design-components.css`, `src/visual.css` e `src/admin.css` compartilham estilos; `src/icons.js` e `src/assets/` contêm ícones e imagens locais. As nove WebPs somam aproximadamente 504 KiB e têm dimensões explícitas; imagens fora da área inicial usam carregamento tardio. Confira os termos aplicáveis às imagens geradas antes de distribuição que exija autorização ou licença específica.

**Variáveis de ambiente:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` configuram o acesso ao Supabase; `VITE_PRIVACY_CONTACT_EMAIL` é um contato público opcional e real, definido apenas após autorização do responsável. Veja `.env.example`. As variáveis `VITE_` são públicas no navegador: use somente uma chave `sb_publishable_`, nunca `service_role`, `sb_secret_`, senha do banco ou credenciais SMTP. Sem essas variáveis, a conta fica indisponível e as demais ferramentas continuam utilizáveis. Arquivos `.env.local` ficam fora do Git. `APP_URL` e `CHROMIUM_PATH` são usados apenas nos testes opcionais de navegador.

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

O servidor de desenvolvimento/preview aceita hosts externos para pré-visualização; não o use como servidor de produção exposto. Para publicação estática, execute o build e publique **o conteúdo de `atividade-do-gugu/dist/`**, incluindo `assets/` e `sw.js`. Os caminhos são relativos e as rotas usam `#`, funcionando também em subdiretórios sem fallback de rotas. Verifique início, trilha, laboratório, dados locais e tema após publicar. Use HTTPS e configure cache e cabeçalhos de segurança conforme a hospedagem existente. O custo de hospedagem depende do plano contratado; serviços futuros precisam de avaliação separada.

### Configuração do projeto no Vercel

O projeto conectado ao GitHub usa **Root Directory: `atividade-do-gugu`** e o preset **Vite**. Com isso, o Vercel encontra `package.json` e `package-lock.json`, instala as dependências, executa `npm run build` e publica `dist`. A configuração é feita no projeto do Vercel, não em um arquivo versionado neste repositório. A branch `main` é a origem de produção.

Se o log mostrar `vite: command not found`, confira primeiro o Root Directory: se ele apontar para a raiz do repositório, o Vercel não encontrará as dependências do aplicativo, que fica na subpasta. Após ajustar, faça um novo deploy e confirme a versão publicada; o erro de um deploy antigo não é alterado retroativamente.

### Autenticação Google: configuração e pendências

O frontend foi preparado para `signInWithOAuth` com `provider: google` e PKCE. A volta usa um código de uso único na query, que é retirado da URL e trocado pelo SDK antes da navegação para `#/home`. Cancelamento, erro e links antigos não são tratados como autenticação bem-sucedida. Rotas antigas de conta mostram a tela Google, sem formulários anteriores. Não há confirmação, senha, códigos OTP, magic links nem recuperação por e-mail implementados no aplicativo.

**O provedor Google foi ativado e uma verificação sem login chegou à tela do Google, mas o acesso real ainda não foi testado.** Isso não confirma o Client Secret nem a criação ou vinculação de contas. O projeto Supabase é `help-rds-auth`; a publicação de produção não muda até que este código seja publicado. Antes de retirar o método anterior, preserve o acesso existente e siga esta ordem:

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

- `npm test`: testes unitários das regras existentes e novas, incluindo backup legado e versionado, conflitos, rollback, vínculos, subtarefas, intervalos, atividades e privacidade.
- `npm run build` e `npm run check:performance`: build e orçamento gzip do HTML, JS e CSS iniciais. Na medição local de 28/10/2026, estes três arquivos somaram aproximadamente **85 KiB gzip**; não inclui imagens e SDK carregados depois e não é uma garantia de velocidade.
- `npm run qa:ci`: navegação e persistência nas 38 ferramentas, Administração, fluxos novos, exportação/importação, funcionamento offline, subdiretório, desempenho simulado, axe e OAuth/PKCE **simulado**. Os scripts usam dados fictícios. Na execução local, o axe cobriu 32 rotas, dois temas e larguras de 320, 390, 768 e 1440 px; os fluxos também verificam 1024 px.
- `npm run qa:performance`: mede DOM, carregamento e primeira pintura em Chromium com CPU e rede simuladas; não substitui medições reais com consentimento em conexões e dispositivos variados.
- `.github/workflows/ci.yml`: instala dependências, executa testes, build, orçamento, auditoria das dependências de produção e os QAs de navegador no GitHub. O workflow só poderá ser confirmado após ser enviado ao GitHub e executado lá.

Para reproduzir localmente com Node 22 e Chromium:

```bash
npm ci
npm run build
npm run check:performance
# Se necessário, instale um Chromium de teste com o Playwright:
npx playwright install chromium
# Com CHROMIUM_PATH ausente, o orquestrador usa o navegador instalado pelo Playwright.
npm run qa:ci
# Alternativamente, use CHROMIUM_PATH=/caminho/para/chromium npm run qa:ci
```

A verificação automatizada de acessibilidade e as dimensões simuladas **não substituem** testes humanos, leitores de tela e dispositivos físicos. O fluxo de autenticação dos QAs não valida credenciais reais, criação de conta ou vinculação de identidades.

## Próximos passos e créditos

Validar conteúdo, identidade e eventual alinhamento à grade real com os responsáveis, sem atribuir caráter oficial sem autorização. Antes de sincronização ou colaboração, definir governança, retenção, autenticação, proteção de arquivos, revisão de uploads e autorização real no servidor e no banco; avaliar custos e fontes antes de integrar IA ou conteúdo externo.

**Programação — Ytalo Lima:** desenvolvimento e implementação técnica, arquitetura e navegação, integração visual, responsividade, acessibilidade, testes e manutenção.

**Equipe de design — Pedro Miranda e Matheus Gama:** direção visual, identidade, cores, tipografia, linguagem gráfica, layouts, componentes e orientações de UX/UI. As contribuições individuais não são subdivididas. A proposta visual e as ilustrações geradas não são apresentadas como materiais aprovados pela equipe ou pela escola; veja [`docs/design-handoff.md`](docs/design-handoff.md).
