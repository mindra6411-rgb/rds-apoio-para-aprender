# Pendências de segurança, conta e sincronização

Este documento não representa aprovação jurídica, pedagógica ou de segurança. A versão atual mantém os registros de estudo no navegador. Não foram criadas tabelas, alteradas políticas, removidas contas ou habilitados serviços de sincronização nesta etapa.

## Google e contas antigas

1. Testar o primeiro acesso e a repetição do login em uma origem controlada, com a URL exata adicionada à allowlist de redirecionamentos do Supabase. O fluxo PKCE deve iniciar e retornar na **mesma aba**. Testar também cancelamento, saída e falhas. A origem de prévia pode mudar e não deve ser adicionada com curingas amplos.
2. Usar inicialmente uma conta Google de teste autorizada que **não compartilhe endereço com uma identidade antiga não confirmada**. Não compartilhar senhas ou códigos na conversa. Verificar de forma autorizada a identidade criada e que registros locais não foram alterados.
3. Antes de desativar Email, inventariar contas afetadas, estado de confirmação e métodos de acesso; definir suporte, prova de titularidade, comunicação, reversão e eventual exportação. O Supabase pode vincular automaticamente contas com mesmo endereço sob suas regras e remover identidades não confirmadas. Não associar identidades manualmente só pela semelhança de e-mail e não rodar migrações em lote sem testar e obter autorização apropriada.
4. Apenas depois de validar o Google e apoiar a migração de quem usa o método antigo, considerar desativar o provedor Email. A mudança de interface, por si só, não desativa a API do provedor. Não desabilitar cadastro global: isso também impediria primeiro acesso Google. As instruções específicas estão no README.

## Exclusão e atendimento

A página de privacidade não promete exclusão automática. Sem contato configurado, informa que o atendimento ainda não está disponível. Quando houver um responsável e um canal efetivo, público e autorizado, `VITE_PRIVACY_CONTACT_EMAIL` pode ser configurado no ambiente de build. O link `mailto:` abre o aplicativo de e-mail da pessoa; ele não recebe, processa ou confirma a exclusão por conta própria.

Antes do uso público, o responsável deve definir e publicar sua identificação, contato, finalidade, bases e medidas aplicáveis, verificação de titularidade, prazos de resposta e retenção, tratamento de dados de menores, terceiros e processo de remoção de contas e dados relacionados. Apagar os dados locais é uma ação separada da exclusão da conta e não encerra a sessão. Não introduzir uma chave privilegiada no navegador nem um endpoint de exclusão sem autenticação, autorização, proteção contra abuso, auditoria e testes.

## Sincronização opcional — não implementada

Sincronização não deve ser anunciada ou habilitada apenas pela interface. Pré-requisitos mínimos antes de qualquer implantação:

- Definir finalidade, dados necessários, consentimento e medidas adequadas a estudantes menores, retenção, exclusão e custos; explicar claramente que dados locais no perfil compartilhado não são protegidos pelo login.
- Projetar tabelas por usuário com `user_id` derivado da identidade autenticada, RLS ativa, permissões mínimas e políticas para SELECT/INSERT/UPDATE/DELETE; negar acesso anônimo e entre contas. Não expor chaves privilegiadas nem confiar apenas em filtros do cliente.
- Planejar opt-in explícito, desligamento, exportação, resolução de conflitos e falhas de rede/quota; não sobrescrever automaticamente dados locais e remotos nem usar apenas o e-mail como identificador. Definir limites de tamanho e versões do esquema.
- Testar com pelo menos duas contas reais controladas: criar, ler, alterar e apagar os próprios dados; tentar ler/alterar/apagar os dados da outra conta e acessar sem sessão; testar consentimento, revogação e exclusão, inclusive fora da interface, diretamente na API permitida.
- Revisar as políticas no banco, a documentação e o resultado dos testes antes de ativar o recurso para estudantes. Só criar ou alterar infraestrutura no projeto Help RDS autorizado.

## Revisão humana e dispositivos

Os exercícios extras são rascunhos sinalizados no aplicativo: um responsável precisa revisar conteúdo, explicações e adequação antes de publicação ampla. A seleção de links externos tem origem e data de consulta, mas deve ser reavaliada periodicamente. Os testes automatizados de acessibilidade, dimensões e desempenho não substituem avaliação humana com leitores de tela, teclado, usuários, dispositivos físicos e conexões reais. O canal de exclusão, a revisão e os testes de login não foram simulados como concluídos.
