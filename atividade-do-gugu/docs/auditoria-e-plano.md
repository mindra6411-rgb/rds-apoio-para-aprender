# Auditoria e plano de evolução — Help RDS

Este documento registra a etapa anterior. Para o diagnóstico e resultado posteriores de Administração, veja `docs/auditoria-admin-v3.md`; as referências abaixo a recursos pendentes descrevem o estado daquela etapa.

## Base auditada

- Aplicação estática em Vite 6, HTML, CSS e JavaScript ES modules. Rotas por hash: início, catálogo, categorias, ferramentas, favoritos, recentes, configurações e sobre.
- Catálogo com 38 calculadoras e organizadores; fórmulas isoladas em `calculations.js`. Registros, rascunhos, favoritos, histórico e tema usam o prefixo `help-rds:` no `localStorage`.
- Não há backend, banco de dados, autenticação, servidor de arquivos, serviço de IA, contas, comunidade ou integrações externas. A hospedagem original é compatível com arquivos estáticos.
- Já existem formulários, busca por ferramentas, modo claro/escuro, confirmação de exclusão, exportação JSON e componentes básicos. Eles devem ser preservados.
- Antes das alterações, `npm test` passou em 13 testes e `npm run build` compilou. Os testes eram sobretudo unitários; não havia teste automatizado de navegação no navegador.

## Problemas e riscos identificados

1. Identidade provisória, sem imagens próprias e com hierarquia repetitiva; navegação e início priorizavam o catálogo, sem uma central de estudos ou prazos visíveis.
2. Só havia busca de ferramentas; conteúdos pessoais e outras áreas não eram pesquisáveis globalmente.
3. Agenda, notas e tarefas existiam como formulários de registros, mas sem calendário mensal nem visão de compromissos no início.
4. Não existiam flashcards, materiais, programação ou recursos de revisão no produto. Não há dados confiáveis de disciplinas, professores, arquivos ou horários oficiais da escola.
5. `localStorage` não é uma área privada com controle de acesso: qualquer pessoa com acesso ao mesmo perfil de navegador pode consultar os registros. Não há sincronização nem recuperação automática. Pode falhar ou ser apagado pelo navegador.
6. A gravação dos organizadores não verificava falhas de armazenamento; registros exibiam metadados técnicos desnecessários. Preferências em formatos inválidos podiam quebrar a interface.
7. Alguns textos e controles tinham tamanho reduzido, a iconografia era inconsistente e não havia avaliação automatizada de fluxos móveis.
8. O design anterior era provisório e não havia arquivos de marca oficial confirmados; não se deve atribuir a nova proposta à escola ou apresentá-la como aprovada pela equipe de design.

## Prioridades

1. **Fundação e experiência:** preservar URLs e registros; criar identidade independente, componentes compartilhados, navegação responsiva, estados vazios, foco, movimento reduzido e ilustrações otimizadas.
2. **Rotina de estudos:** painel com compromissos efetivamente cadastrados, calendário mensal e acesso rápido às ferramentas existentes; corrigir persistência e apresentação dos dados.
3. **Estudo individual local:** referências por link, flashcards manuais e guias técnicos complementares; pesquisa abrangendo somente dados disponíveis neste navegador.
4. **Verificação:** testes unitários e de navegador em desktop/celular, build e documentação de implantação e limites.
5. **Futuro, condicionado a decisões e infraestrutura:** autenticação, banco com políticas no servidor, armazenamento seguro de arquivos, sincronização, biblioteca compartilhada, IA com custos/limites, moderação, administração, simulados e currículo oficial. Não inventar integrações nem dados escolares.

## Conceito visual

“Caderno em movimento”: papel creme, azul-cobalto, laranja, amarelo e lavanda; ilustrações editoriais de objetos de estudo, formas geométricas e detalhes inspirados em anotações. As imagens são ilustrações geradas para este projeto, não fotografias da escola ou de alunos. A proposta é independente e deve passar pela revisão da equipe responsável antes de ser tratada como identidade aprovada. Tipografia usa fontes de sistema para evitar requisições externas e melhorar o carregamento; ícones são SVGs locais.

## Resultado desta etapa

Foram integrados o novo sistema visual, painel com dados efetivamente cadastrados, matérias pessoais, biblioteca de links, flashcards manuais com repetição simples, calendário mensal/exportação iCalendar, guias técnicos complementares e busca local ampliada. As 38 ferramentas e os registros anteriores foram mantidos. A descrição exata dos recursos e das limitações está no README.

Servidor, contas, sincronização, permissões entre usuários, arquivos privados/compartilhados, IA, comunidade, administração, simulados e conteúdos oficiais permanecem pendentes e dependem de decisões e infraestrutura. O armazenamento local não equivale a privacidade por usuário. A identidade visual deve ser revisada e aprovada pelos responsáveis.
