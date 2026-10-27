# Integração de design — Help RDS

## Responsabilidades

### Programação — Ytalo Lima

Responsável pelo frontend e backend quando necessário, arquitetura e navegação, implementação e integração dos recursos visuais entregues, responsividade técnica, acessibilidade, desempenho, testes, correções e manutenção.

### Equipe de design — Pedro Miranda e Matheus Gama

Responsável pela direção visual, identidade de marca, cores, tipografia, linguagem gráfica, criação ou seleção de logotipo, ícones e ilustrações, hierarquia visual, layouts, componentes, padrões de interface e orientações de UX/UI.

As contribuições individuais de Pedro Miranda e Matheus Gama não são subdivididas neste documento: essa divisão cabe à própria equipe.

## Processo acordado para o repositório

1. A equipe de design define e entrega materiais aprovados, acompanhados de especificações necessárias (formatos, fontes/licenças, variações, tamanhos e orientações de uso).
2. Ytalo Lima organiza os arquivos nos diretórios abaixo e os conecta aos tokens ou componentes correspondentes.
3. Ytalo Lima implementa os layouts, estados, navegação e comportamento responsivo no código existente.
4. Pedro Miranda e Matheus Gama podem revisar a fidelidade visual dos materiais integrados.
5. Ytalo Lima corrige problemas técnicos, funcionais, de acessibilidade e de apresentação identificados.
6. A equipe de design valida as decisões visuais sob sua responsabilidade; a validação de design não substitui testes técnicos.
7. As decisões e alterações aprovadas são registradas neste documento e no README conforme necessário.

A revisão técnica e a validação visual são etapas distintas. O fluxo não atribui tarefas específicas individualmente a nenhum dos dois designers.

## Ponto de entrega de materiais

Não há, neste momento, arquivos oficiais de marca confirmados no projeto. Quando aprovados, organizar os originais em:

```text
public/design/
├── brand/          # Logotipo oficial e variações aprovadas
├── fonts/          # Arquivos autorizados e informação de licença
├── icons/          # Ícones aprovados (preferir SVG otimizado)
├── illustrations/  # Ilustrações e recursos gráficos aprovados
└── references/     # Especificações visuais e layouts de referência
```

Os diretórios são uma proposta de organização, não uma indicação de que esses materiais já foram entregues. Não substituir, redesenhar ou otimizar destrutivamente os originais aprovados. Registrar licenças de fontes e recursos. Não adicionar credenciais ou arquivos não autorizados.

## Referências recebidas nesta atualização

Foram inspecionadas quatro imagens conceituais anexadas à conversa. Elas incluem marcas de exemplo e telas fictícias em inglês, além de perfis e indicadores demonstrativos. A composição geral e o clima cromático (fundo creme, navy, chamadas laranja e cards de aprendizagem) serviram de base para os tokens provisórios e os atalhos funcionais da página inicial, conforme solicitado. As imagens não são identidade aprovada do Help RDS nem materiais oficiais de Pedro Miranda e Matheus Gama: não foram copiadas para o repositório ou usadas como ativos do site. Não foram reproduzidos logotipos, ilustrações, nomes de outras plataformas, perfis ou indicadores demonstrativos.

## Estado temporário do sistema visual

- `src/styles.css` centraliza tokens CSS provisórios de cor, tipografia, espaços, bordas, sombras, foco e breakpoints.
- O layout atual usa apenas texto para “Help RDS”; não contém logotipo, avatar, fotografia, mascote ou ilustração oficial.
- Botões, campos, busca, cards, mensagens de resultado, alertas, navegação e grupos de créditos usam classes/componentes compartilhados já existentes.
- Nenhum token ou estilo atual deve ser interpretado como decisão definitiva de marca. A substituição deve ocorrer após aprovação da equipe de design, preservando os estados de acessibilidade e os temas claro/escuro.

## Comunicação de continuidade na página inicial

As ideias comerciais de retenção (pontos, newsletter premium, venda cruzada e descontos) não correspondem às funcionalidades reais da plataforma escolar: não há loja, ofertas, cadastro, newsletter ou programa de pontos. Para não inventar serviço ou coletar e-mails, a página inicial usa três convites não comerciais e funcionais: retomar o histórico local, explorar/guardar favoritos e abrir o temporizador de estudo. Nenhum indicador de uso, recompensa ou depoimento é fabricado.

## Requisitos para a integração

Ao integrar materiais, manter proporções e áreas de proteção oficiais; usar variantes apropriadas por fundo e breakpoint; fornecer texto alternativo apenas quando a imagem transmitir informação; manter decoração não informativa fora da árvore acessível; preservar foco visível, contraste, movimento reduzido, navegação por teclado e layouts móveis. Conferir build, testes, links, estados interativos e visualização em larguras móveis e desktop após cada integração.
