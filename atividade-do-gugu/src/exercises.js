// Rascunhos complementares: ainda precisam de revisão humana antes da publicação.
// Exemplos fictícios e sem relação com uma avaliação escolar.
export const extraExercises = {
  fundamentos: {
    prompt:'Uma equipe reparte tarefas e materiais entre as pessoas. Qual ação aparece mais diretamente nessa situação?',
    options:[
      {id:'a',text:'Organizar',feedback:'Organizar inclui distribuir tarefas e recursos para realizar o plano.'},
      {id:'b',text:'Ignorar o objetivo',feedback:'A equipe está distribuindo recursos; isso não significa ignorar o objetivo.'},
      {id:'c',text:'Excluir o planejamento',feedback:'Organização e planejamento se complementam; uma ação não elimina a outra.'},
    ],correct:'a',
  },
  'custos-preco': {
    prompt:'Um produto fictício custa R$ 10,00 por unidade em custos variáveis e é vendido por R$ 25,00. Qual é a contribuição por unidade?',
    options:[
      {id:'a',text:'R$ 15,00',feedback:'R$ 25,00 menos R$ 10,00 resulta em R$ 15,00 por unidade. Ainda faltam os custos fixos.'},
      {id:'b',text:'R$ 25,00',feedback:'Esse é o preço. Subtraia dele o custo variável unitário.'},
      {id:'c',text:'R$ 35,00',feedback:'Neste cálculo, o custo variável é subtraído do preço, não somado.'},
    ],correct:'a',
  },
  financas: {
    prompt:'Um caixa fictício começa em zero, recebe R$ 120,00 e paga R$ 50,00. Qual é seu saldo final?',
    options:[
      {id:'a',text:'R$ 170,00',feedback:'O pagamento é uma saída, portanto deve ser subtraído.'},
      {id:'b',text:'R$ 70,00',feedback:'Correto: zero mais R$ 120,00 menos R$ 50,00 é R$ 70,00. Saldo de caixa não é sinônimo de lucro.'},
      {id:'c',text:'R$ 50,00',feedback:'R$ 50,00 é a saída. Considere também o valor recebido.'},
    ],correct:'b',
  },
  marketing: {
    prompt:'Uma equipe decide como comunicar um produto ao público. A decisão está ligada mais diretamente a qual P?',
    options:[
      {id:'a',text:'Promoção',feedback:'Promoção organiza ações de comunicação e divulgação.'},
      {id:'b',text:'Praça',feedback:'Praça se relaciona aos canais e locais de distribuição.'},
      {id:'c',text:'Preço',feedback:'Preço trata do valor cobrado; aqui a decisão é sobre comunicação.'},
    ],correct:'a',
  },
  pessoas: {
    prompt:'Uma pessoa discorda de uma decisão em um projeto fictício. Que atitude favorece uma conversa respeitosa?',
    options:[
      {id:'a',text:'Explicar a discordância e ouvir o outro ponto de vista.',feedback:'Descrever a questão e ouvir a outra pessoa ajuda a construir um próximo passo.'},
      {id:'b',text:'Expor dados pessoais da outra pessoa.',feedback:'Dados pessoais não devem ser expostos para resolver uma discordância.'},
      {id:'c',text:'Fazer um ataque pessoal.',feedback:'Um ataque pessoal dificulta a conversa e não esclarece a questão.'},
    ],correct:'a',
  },
  estrategia: {
    prompt:'Em uma SWOT de projeto fictício, qual é um possível fator interno?',
    options:[
      {id:'a',text:'A equipe conhece bem as ferramentas que utilizará.',feedback:'Conhecimento da equipe é um fator interno; dependendo do contexto pode ser uma força.'},
      {id:'b',text:'Uma nova regra externa ao projeto.',feedback:'Uma regra externa acontece fora da equipe e precisa ser analisada no contexto.'},
      {id:'c',text:'Uma feira organizada por outra instituição.',feedback:'A feira é uma condição externa, não uma capacidade da equipe.'},
    ],correct:'a',
  },
};
