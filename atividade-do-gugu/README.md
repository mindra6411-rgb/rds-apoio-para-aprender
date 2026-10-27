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

### Premissas e limites do laboratório

- Valores monetários aceitam vírgula ou ponto e até duas casas decimais, **sem separador de milhar**. Preço e custo variável: de R$ 0,00 a R$ 1.000.000,00 por unidade; custo fixo: de R$ 0,00 a R$ 1.000.000.000,00; quantidade inteira de 0 a 1.000.000 unidades. Os cálculos monetários usam centavos inteiros.
- Receita = preço × quantidade; contribuição unitária = preço − custo variável unitário; resultado = receita − custos variáveis totais − custos fixos. Resultado/receita não é calculado se a receita for zero.
- Com contribuição unitária positiva, o equilíbrio é o custo fixo dividido pela contribuição, arredondado para cima. Se o custo fixo for zero, zero unidades já dão resultado zero; com contribuição negativa, cada unidade vendida piora o resultado. Se houver custo fixo positivo e contribuição não positiva, o modelo não atinge o equilíbrio.
- O modelo **não prevê demanda nem calcula automaticamente** tributos, despesas, perdas, estoque, inadimplência ou outros fatores. Só considera valores incluídos nas premissas. Não é lucro contábil ou aconselhamento fiscal, contábil, jurídico ou financeiro. Use dados fictícios para aprender e consulte profissionais para decisões reais.

## Limitações e privacidade

**Os registros são locais, não privados por autenticação.** Qualquer pessoa com acesso ao mesmo perfil do navegador pode lê-los ou alterá-los. Não há sincronização entre dispositivos, recuperação automática, criptografia, permissões por usuário ou proteção em servidor. O navegador pode bloquear ou apagar o armazenamento; quando uma gravação falha, a interface avisa. Não inclua senhas, dados pessoais sensíveis, links privados ou dados de colegas ou empresas. Em dispositivo compartilhado, exporte o necessário e apague os dados em Configurações.

A exportação JSON é uma cópia sob responsabilidade de quem a baixar; **não há importador integrado**. Links externos podem coletar dados segundo a política do site de destino; origem e disponibilidade não são verificadas automaticamente. O temporizador funciona somente enquanto a aplicação está aberta, sem serviço em segundo plano.

Não foram implementados contas, perfil sincronizado, controle real de acesso, uploads/arquivos privados, biblioteca compartilhada, painel administrativo, avisos oficiais, moderação, comunidade, colaboração, assistente de IA, leitura de PDFs, geração automática de conteúdos, simulados completos, área ENEM, notificações ou funcionamento offline/PWA. Há seis questões simples nas trilhas, não uma plataforma de avaliações. Recursos compartilhados exigiriam autorização no servidor e no banco, infraestrutura adequada, conteúdo autorizado, avaliação de custos e requisitos de privacidade/LGPD para menores. Não há testes de isolamento entre contas porque contas e servidor não existem.

## Tecnologias e arquivos

- HTML semântico, CSS responsivo, JavaScript ES modules e Vite 6. A aplicação não chama serviços externos em tempo de execução.
- `src/admin.js`: conteúdo complementar e regras puras das trilhas, progresso e simulação. `src/admin-pages.js` e `src/admin.css`: páginas e estilos da V3.
- `src/tools.js`, `src/calculations.js`: catálogo e fórmulas das ferramentas anteriores. `src/study.js`: calendário, URLs, flashcards, iCalendar e guias extras.
- `src/main.js`, `src/study-pages.js`, `src/subject-pages.js`: shell, navegação, pesquisa e interfaces. `src/storage.js`: persistência tolerante a falhas com o prefixo anterior `help-rds:`.
- Novas coleções V3: `records:admin-progress`, `records:admin-attempts`, `records:business-scenarios`, `records:career-progress` e rascunho `calculator:admin-lab`. Coleções anteriores, incluindo `records:subjects`, `records:library` e `records:flashcards`, continuam legíveis. Não houve migração de banco.
- `src/styles.css`, `src/design-components.css`, `src/visual.css` e `src/admin.css` compartilham estilos; `src/icons.js` e `src/assets/` contêm ícones e imagens locais. As nove WebPs somam aproximadamente 504 KiB e têm dimensões explícitas; imagens fora da área inicial usam carregamento tardio. Confira os termos aplicáveis às imagens geradas antes de distribuição que exija autorização ou licença específica.

**Variáveis de ambiente da aplicação:** nenhuma. Não são necessárias chaves de API ou credenciais. `APP_URL` e `CHROMIUM_PATH` são usados apenas nos testes opcionais de navegador.

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

O servidor de desenvolvimento/preview aceita hosts externos para pré-visualização; não o use como servidor de produção exposto. Para publicação estática, execute o build e publique **o conteúdo de `atividade-do-gugu/dist/`**, incluindo `assets/`. Os caminhos são relativos e as rotas usam `#`, funcionando também em subdiretórios sem fallback de rotas. Verifique início, trilha, laboratório, dados locais e tema após publicar. Use HTTPS e configure cache e cabeçalhos de segurança conforme a hospedagem existente. Não há um deploy automático configurado no repositório nem um novo serviço pago. O custo de hospedagem depende do plano contratado; serviços futuros precisam de avaliação separada.

## Testes e qualidade

- `npm test`: 29 testes unitários cobrindo catálogo, cálculos, simulação em centavos e limites, cenários inválidos, correção e progresso das trilhas, armazenamento, datas, URLs, flashcards e exportação `.ics`.
- `npm run build`: compilação de produção. Os dois testes de navegador também passaram no build servido a partir de um subdiretório estático; confira novamente na hospedagem de destino.
- `scripts/qa-browser.mjs`: fluxos anteriores, 38 rotas de ferramentas, dados locais, exclusões, busca, exportações e larguras de 320, 390, 768, 1024 e 1440 px.
- `scripts/qa-admin.mjs`: trilhas e correção, simulação com vírgula, comparação, persistência, recuperação de dados inválidos, confirmações, carreira, compatibilidade com dados anteriores, busca, exportação, falha de armazenamento e as mesmas cinco larguras.
- `scripts/qa-a11y.mjs`: axe WCAG 2/2.1 A/AA em 29 rotas, dois temas e duas larguras, incluindo exercícios e simulações preenchidas; não foram detectadas violações nas regras executadas. Testes automatizados não substituem avaliação humana de acessibilidade, conteúdo ou segurança.

Para reproduzir os testes opcionais, tenha um Chromium compatível e instale somente as dependências de teste, sem alterar o manifesto:

```bash
npm install --no-save --package-lock=false playwright-core @axe-core/playwright
npm run dev
# em outro terminal:
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-browser.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-admin.mjs
CHROMIUM_PATH=/caminho/para/chromium node scripts/qa-a11y.mjs
# APP_URL pode apontar para outra instância da aplicação
```

## Próximos passos e créditos

Validar conteúdo, identidade e eventual alinhamento à grade real com os responsáveis, sem atribuir caráter oficial sem autorização. Antes de sincronização ou colaboração, definir governança, retenção, autenticação, proteção de arquivos, revisão de uploads e autorização real no servidor e no banco; avaliar custos e fontes antes de integrar IA ou conteúdo externo.

**Programação — Ytalo Lima:** desenvolvimento e implementação técnica, arquitetura e navegação, integração visual, responsividade, acessibilidade, testes e manutenção.

**Equipe de design — Pedro Miranda e Matheus Gama:** direção visual, identidade, cores, tipografia, linguagem gráfica, layouts, componentes e orientações de UX/UI. As contribuições individuais não são subdivididas. A proposta visual e as ilustrações geradas não são apresentadas como materiais aprovados pela equipe ou pela escola; veja [`docs/design-handoff.md`](docs/design-handoff.md).
