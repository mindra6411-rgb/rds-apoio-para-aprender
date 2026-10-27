# Help RDS

Plataforma web de apoio educacional para estudantes do Colégio Raphael Di Santo. O repositório original continha apenas um README, sem aplicação, framework, rotas, testes ou materiais visuais; a implementação foi iniciada de forma enxuta, preservando esse contexto e sem criar uma identidade visual definitiva.

## Tecnologias e arquitetura

- JavaScript ES modules, HTML semântico e CSS responsivo.
- Vite 6 para desenvolvimento e build estático; não há backend, conta ou dependência de serviço externo.
- Navegação por hash (`#/tool/juros-compostos`, `#/category/estudos`), compartilhável por URL.
- `src/tools.js`: catálogo centralizado, categorias e metadados das ferramentas.
- `src/calculations.js`: fórmulas independentes da interface, validações e etapas de cálculo.
- `src/storage.js`: preferências e registros no `localStorage`, com tolerância a dados ausentes/corrompidos.
- `src/main.js`: shell, páginas, busca, formulários e fluxos de uso.
- `src/styles.css`: tokens CSS provisórios, layouts, tema claro/escuro e responsividade.
- `src/design-components.css`: estilos-base reutilizáveis para cards de continuidade, tabelas responsivas, alertas e confirmação acessível.
- `docs/design-handoff.md`: responsabilidades, fluxo de colaboração, estado da identidade visual e integração futura.
- `public/design/README.md`: ponto de entrega e organização dos materiais oficiais ainda não fornecidos.
- `test/calculations.test.js`, `test/storage.test.js` e `test/design-handoff.test.js`: testes de cálculos, persistência local e requisitos de créditos/design com o runner nativo do Node.

Não foram encontrados arquivos de marca no projeto. O Help RDS é apresentado como texto, sem logotipo, mascote, imagens ou identidade definitiva. As imagens de referência fornecidas orientaram provisoriamente o clima creme/navy/laranja e a apresentação em cards, sem copiar suas marcas, ilustrações ou dados fictícios. Cores e tipografia são tokens temporários configuráveis pela equipe de design.

## Ferramentas implementadas

O catálogo contém 38 ferramentas, cada uma com rota, descrição, palavras-chave, categoria, tipo e campos próprios:

- **Impostos e tributação:** porcentagem tributária, acréscimos e descontos, preço com tributos, conversor bruto/líquido didático, composição de preço, comparador de cenários tributários.
- **Matemática financeira:** juros simples, juros compostos, variação percentual, regra de três direta, parcelamento, valor presente/futuro, ponto de equilíbrio, orçamento, investimento hipotético.
- **Marketing:** ROI, taxa de conversão, engajamento, custo por lead e simulador de funil.
- **Gestão empresarial:** margem de lucro, formador de preço, fluxo de caixa, capital de giro didático, estoque, planejador de projetos.
- **Recursos humanos:** calculadora de horas, absenteísmo e folha didática com descontos informados.
- **Estudos e rotina:** lista de tarefas (concluir/reabrir), anotações categorizadas, agenda semanal, calendário de provas/trabalhos, temporizador de foco, rastreador de hábitos.
- **Planejamento e marketing:** briefing de campanha, planejador editorial, matriz SWOT.

Calculadoras exibem resultado, fórmula/etapas e orientações. Os espaços organizadores permitem adicionar, editar, excluir com confirmação acessível, marcar tarefas concluídas quando aplicável e exportar registros em JSON. Favoritos, histórico, tema, rascunhos das calculadoras e conteúdo dos organizadores ficam localmente no navegador. A página inicial também traz convites funcionais para retomar o histórico, guardar favoritos e abrir o temporizador — sem cadastro, pontos fictícios, newsletter não implementada, ofertas ou compras.

A busca global consulta nome, descrição, categoria e palavras-chave. O catálogo oferece filtros por categoria e tipo e ordenação por nome ou uso recente. Há tema claro/escuro, atalhos `/` e `Ctrl/Cmd + K` para busca, impressão de resultados e exportação/limpeza de dados locais.

## Limitações e confiabilidade

- Os recursos são locais ao navegador/dispositivo; não há sincronização, conta, backup automático ou colaboração multiusuário. Exportar JSON é a forma de levar uma cópia.
- As ferramentas de tributação, folha, investimento e RH são explicitamente simulações educacionais. Nenhuma alíquota legal é pré-preenchida e nenhuma fonte de legislação vigente é apresentada como regra oficial.
- Não há fontes oficiais incorporadas: as operações tributárias usam somente alíquotas/base fornecidas pelo estudante e não constituem cálculo fiscal. Para aplicações reais, consulte legislação e fontes governamentais vigentes, além de profissional qualificado.
- Horas considera término no dia seguinte quando o horário final é anterior ao inicial; o cálculo não interpreta regras trabalhistas.
- O temporizador funciona enquanto a página permanece aberta; não há notificação sonora ou serviço em segundo plano.
- A implementação cobre os recursos descritos acima. Itens do escopo ampliado que não aparecem no catálogo (por exemplo, Canvas, Kanban, simulador de amortização e escala multiusuário) não são anunciados como concluídos.
- Os dados dos organizadores são texto local, escapado antes de renderização; ainda assim, não inclua informações pessoais sensíveis, especialmente dados de funcionários ou candidatos.

## Responsabilidades e créditos

**Programação — Ytalo Lima:** desenvolvimento e implementação técnica, arquitetura e navegação, integração de materiais visuais, responsividade técnica, acessibilidade, desempenho, testes e manutenção.

**Equipe de design — Pedro Miranda e Matheus Gama:** direção visual e identidade, cores, tipografia, linguagem gráfica, logotipo, ícones, ilustrações, hierarquia, layouts, componentes e orientações de UX/UI.

Não foi inventada uma divisão individual de tarefas entre Pedro Miranda e Matheus Gama. A identidade visual definitiva será aplicada após a entrega e aprovação dos materiais pela equipe de design. O processo está detalhado em `docs/design-handoff.md`.

## Instalação e execução

Requer Node.js 20.19+ ou 22.12+ (compatibilidade do Vite 6) e npm.

```bash
npm install
npm run dev
```

O Vite informa o endereço local para desenvolvimento. Para gerar e conferir a versão de produção:

```bash
npm test
npm run build
npm run preview
```

O conteúdo gerado em `dist/` é estático e pode ser publicado em hospedagem estática. Como a navegação usa hash routes, não é necessário configurar fallback de rotas no servidor.

## Validação

`npm test` executa testes automatizados das fórmulas financeiras e percentuais, casos de zero e entradas inválidas, limites de taxas, composição de preço, arredondamentos apresentados, virada de dia e presença/metadados do catálogo. `npm run build` valida a compilação de produção.
