import { extraExercises } from './exercises.js';

// Conteúdo complementar e regras puras do espaço de Administração.
// Nenhum texto abaixo representa uma grade oficial ou aconselhamento profissional.
export const lessons = [
  {
    id:'fundamentos', number:'01', tag:'COMECE POR AQUI', title:'Fundamentos da administração',
    description:'Entenda como planejar, organizar, liderar e acompanhar uma atividade.',
    intro:'Administrar é coordenar recursos e pessoas para atingir objetivos, observando o contexto e ajustando o caminho.',
    concept:'Planejar é decidir o objetivo e o caminho; organizar é distribuir recursos e tarefas; liderar envolve orientar e ouvir as pessoas; controlar é acompanhar resultados e corrigir desvios. Na prática, essas ações se conectam e podem acontecer ao mesmo tempo.',
    example:'Em uma feira fictícia, uma equipe define o que quer vender, lista materiais, distribui responsabilidades e compara o resultado com o plano. Se faltar embalagem, ela ajusta a próxima compra.',
    takeaway:'Antes de agir, pergunte: qual é o objetivo, quem fará o quê e como saberemos se avançamos?',
    question:{ prompt:'A equipe definiu um objetivo e decidiu quais atividades serão feitas para alcançá-lo. Qual ação está em destaque?',
      options:[
        { id:'a', text:'Planejar', feedback:'Isso. Planejar ajuda a definir objetivos e os caminhos para alcançá-los.' },
        { id:'b', text:'Apenas registrar vendas', feedback:'Registrar vendas pode ajudar no acompanhamento, mas a pergunta fala de definir objetivo e caminho.' },
        { id:'c', text:'Ignorar os recursos disponíveis', feedback:'Uma decisão de planejamento deve considerar os recursos, não ignorá-los.' },
      ], correct:'a' },
    tool:{ href:'tool/projetos', label:'Organizar um projeto' }, keywords:'planejamento organização liderança controle gestão equipe projeto'
  },
  {
    id:'custos-preco', number:'02', tag:'NÚMEROS COM SENTIDO', title:'Custos e formação de preço',
    description:'Diferencie custos fixos e variáveis e conheça a contribuição por unidade.',
    intro:'Um preço precisa ser analisado junto dos custos, da procura, do contexto e de outros fatores. Aqui usamos um modelo intencionalmente simples.',
    concept:'Neste modelo, custo variável por unidade acompanha a quantidade produzida ou vendida; custo fixo é informado como valor total do período. A contribuição unitária é o preço de venda menos o custo variável unitário. Ela ajuda a cobrir os custos fixos, mas não é sinônimo de lucro líquido.',
    example:'Uma loja fictícia vende cada produto por R$ 20,00 e informa custo variável de R$ 12,00 por unidade. Cada unidade contribui com R$ 8,00 para cobrir os custos fixos e o resultado do cenário.',
    takeaway:'No laboratório você decide os valores; impostos, perdas e outros custos só aparecem se estiverem incluídos nas suas premissas.',
    question:{ prompt:'No exemplo, qual é a contribuição unitária antes dos custos fixos?',
      options:[
        { id:'a', text:'R$ 12,00', feedback:'R$ 12,00 é o custo variável informado. Subtraia esse valor do preço.' },
        { id:'b', text:'R$ 8,00', feedback:'Correto: R$ 20,00 − R$ 12,00 = R$ 8,00 por unidade.' },
        { id:'c', text:'R$ 20,00', feedback:'R$ 20,00 é o preço; ainda precisamos descontar o custo variável unitário.' },
      ], correct:'b' },
    tool:{ href:'laboratorio', label:'Simular custos e preço' }, keywords:'custo fixo variável preço venda contribuição margem equilíbrio'
  },
  {
    id:'financas', number:'03', tag:'OLHO NO CAIXA', title:'Finanças e fluxo de caixa',
    description:'Acompanhe entradas e saídas sem confundir caixa com lucro.',
    intro:'O fluxo de caixa ajuda a observar quando o dinheiro entra e sai de uma atividade.',
    concept:'Um controle simples parte do saldo inicial, soma as entradas recebidas e subtrai as saídas pagas no período. Ter dinheiro em caixa não garante lucro, e uma venda registrada não significa necessariamente que o pagamento já foi recebido.',
    example:'Uma atividade fictícia começa o período com R$ 500,00, recebe R$ 200,00 e paga R$ 350,00. Seu saldo final de caixa no exemplo é R$ 350,00.',
    takeaway:'Registre datas e valores reais apenas quando tiver autorização; na dúvida, use números fictícios para praticar.',
    question:{ prompt:'No exemplo, quanto resta no caixa ao final do período?',
      options:[
        { id:'a', text:'R$ 850,00', feedback:'As saídas precisam ser subtraídas do saldo inicial mais as entradas.' },
        { id:'b', text:'R$ 350,00', feedback:'Isso: R$ 500,00 + R$ 200,00 − R$ 350,00 = R$ 350,00.' },
        { id:'c', text:'R$ 150,00', feedback:'Considere também o saldo que já existia no início do período.' },
      ], correct:'b' },
    tool:{ href:'tool/fluxo-caixa', label:'Abrir fluxo de caixa' }, keywords:'finanças caixa saldo entradas saídas recebimentos pagamentos'
  },
  {
    id:'marketing', number:'04', tag:'ENTENDER PARA COMUNICAR', title:'Marketing e público',
    description:'Conecte produto, preço, praça e promoção às necessidades do público.',
    intro:'Marketing vai além da propaganda: começa por entender necessidades e propor valor de maneira responsável.',
    concept:'Os quatro Ps são uma forma de organizar decisões sobre produto, preço, praça (distribuição) e promoção (comunicação). Eles devem ser analisados em conjunto, levando em conta o público e o contexto.',
    example:'Uma equipe fictícia escolhe vender marcadores de página, define um preço, decide onde disponibilizá-los e prepara uma mensagem simples para divulgar a ideia.',
    takeaway:'Para exercícios, crie públicos hipotéticos; não colete nem exponha informações pessoais de colegas.',
    question:{ prompt:'Decidir onde um produto estará disponível está mais diretamente ligado a qual P?',
      options:[
        { id:'a', text:'Promoção', feedback:'Promoção trata da comunicação. Pense no caminho de distribuição do produto.' },
        { id:'b', text:'Praça', feedback:'Correto. Praça trata dos canais e locais de distribuição ou disponibilidade.' },
        { id:'c', text:'Preço', feedback:'Preço é o valor cobrado; a pergunta é sobre disponibilidade e distribuição.' },
      ], correct:'b' },
    tool:{ href:'tool/briefing-campanha', label:'Planejar uma campanha' }, keywords:'marketing quatro ps produto preço praça promoção público distribuição'
  },
  {
    id:'pessoas', number:'05', tag:'TRABALHO EM EQUIPE', title:'Pessoas e comunicação',
    description:'Explore responsabilidades, escuta e feedback para colaborar melhor.',
    intro:'Trabalhar com pessoas envolve esclarecer responsabilidades, respeitar diferenças e construir acordos.',
    concept:'Uma equipe funciona melhor quando sabe o objetivo, compreende suas tarefas e tem espaço para pedir ajuda. Um feedback útil descreve uma situação e seu impacto, escuta a outra pessoa e propõe um próximo passo, sem ataques pessoais.',
    example:'Em uma apresentação fictícia, a equipe combina quem pesquisa, quem organiza os slides e quem apresenta. Após o ensaio, conversa sobre o que ficou claro e o que pode melhorar.',
    takeaway:'Respeito, privacidade e regras da escola vêm antes de qualquer dinâmica. Esta trilha não substitui orientações trabalhistas.',
    question:{ prompt:'Qual frase é um exemplo de feedback mais construtivo?',
      options:[
        { id:'a', text:'Você sempre faz tudo errado.', feedback:'Ataques gerais não explicam o que pode ser melhorado e dificultam a conversa.' },
        { id:'b', text:'No ensaio, a conclusão ficou rápida; podemos praticá-la juntos?', feedback:'Isso. A frase aponta uma situação específica e convida a construir um próximo passo.' },
        { id:'c', text:'Não vou ouvir sua opinião.', feedback:'Ouvir a outra pessoa faz parte de uma conversa respeitosa e produtiva.' },
      ], correct:'b' },
    tool:{ href:'tool/projetos', label:'Distribuir etapas de projeto' }, keywords:'recursos humanos rh equipe feedback comunicação liderança colaboração'
  },
  {
    id:'estrategia', number:'06', tag:'DA IDEIA À AÇÃO', title:'Estratégia e projetos',
    description:'Investigue o contexto e transforme uma ideia em etapas observáveis.',
    intro:'Estratégia ajuda a escolher prioridades; um projeto traduz uma ideia em entregas e ações.',
    concept:'Na matriz SWOT, forças e fraquezas são fatores internos; oportunidades e ameaças são fatores externos. No ciclo PDCA, planejar, executar, verificar e agir sobre os aprendizados ajuda a experimentar e melhorar continuamente.',
    example:'Uma equipe fictícia percebe que tem facilidade para criar ilustrações (força) e que haverá uma feira na comunidade (oportunidade). Ela planeja um teste pequeno e depois revisa o que aprendeu.',
    takeaway:'Uma boa hipótese não é uma garantia. Teste em pequena escala, observe o resultado e reveja seu plano.',
    question:{ prompt:'Na matriz SWOT, uma feira que ocorrerá na comunidade é, para o projeto fictício, um exemplo de:',
      options:[
        { id:'a', text:'Força interna', feedback:'A feira acontece fora da equipe; procure a alternativa de fator externo favorável.' },
        { id:'b', text:'Oportunidade externa', feedback:'Correto. A feira é uma condição externa que pode favorecer o projeto.' },
        { id:'c', text:'Fraqueza interna', feedback:'Uma fraqueza seria uma limitação interna da equipe; a feira é externa.' },
      ], correct:'b' },
    tool:{ href:'tool/matriz-swot', label:'Montar uma matriz SWOT' }, keywords:'estratégia swot pdca forças fraquezas oportunidades ameaças projetos empreendedorismo'
  },
];

export const findLesson = id => lessons.find(lesson => lesson.id === id);
export function gradeLesson(lessonId, optionId, exercise = 'principal') {
  const lesson = findLesson(lessonId);
  const question = exercise === 'principal' ? lesson?.question : exercise === 'extra' ? extraExercises[lessonId] : null;
  const option = question?.options.find(item => item.id === optionId);
  if (!lesson || !option) throw new Error('Escolha uma alternativa válida.');
  return { correct:option.id === question.correct, feedback:option.feedback };
}
export function lessonProgress(records) {
  const done = new Set(records.filter(record => record?.done === true && findLesson(record.id)).map(record => record.id));
  return { count:done.size, total:lessons.length, ids:done };
}

export const careerSteps = [
  { id:'interesses', title:'Mapear interesses', text:'Anote, para você, assuntos e atividades que gostaria de conhecer melhor.' },
  { id:'competencias', title:'Reconhecer competências', text:'Observe como você organiza tarefas, se comunica, pesquisa e resolve problemas.' },
  { id:'projeto', title:'Escolher uma experiência', text:'Planeje uma atividade fictícia ou autorizada que demonstre um aprendizado.' },
  { id:'apresentacao', title:'Preparar uma apresentação', text:'Descreva o desafio, o que você fez e o que aprendeu, sem expor dados de terceiros.' },
  { id:'proximo-passo', title:'Definir o próximo passo', text:'Peça orientação a alguém de confiança e escolha uma habilidade para praticar.' },
];
export function careerProgress(records) {
  const done = new Set(records.filter(record => record?.done === true && careerSteps.some(step => step.id === record.id)).map(record => record.id));
  return { count:done.size, total:careerSteps.length, ids:done };
}

// Cenários incompletos/corrompidos não devem derrubar a interface nem ser exibidos como válidos.
export function isUsableScenario(item) {
  if (!item || typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || !item.values) return false;
  try { simulateBusiness(item.values); return true; } catch { return false; }
}

// Centavos inteiros evitam erros de ponto flutuante no ponto de equilíbrio.
// Não incluímos tributos, despesas, estoque, inadimplência ou outros fatores não informados.
function readMoney(value, label, max) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) throw new Error(`Informe ${label}.`);
  if (typeof value === 'string' && !/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) throw new Error(`${label}: use números com até duas casas decimais, vírgula ou ponto, sem separador de milhar.`);
  const number = typeof value === 'string' ? Number(value.trim().replace(',', '.')) : value;
  if (!Number.isFinite(number) || number < 0 || number > max) throw new Error(`${label} deve estar entre zero e ${max.toLocaleString('pt-BR')}.`);
  const cents = Math.round(number * 100);
  if (Math.abs(number * 100 - cents) > 0.000001) throw new Error(`${label} aceita no máximo duas casas decimais.`);
  return cents;
}
export function simulateBusiness(values) {
  if (!values || typeof values !== 'object') throw new Error('Informe os dados do cenário.');
  const price = readMoney(values.price, 'o preço por unidade', 1000000);
  const variable = readMoney(values.variable, 'o custo variável por unidade', 1000000);
  const fixed = readMoney(values.fixed, 'os custos fixos do período', 1000000000);
  if ((typeof values.quantity !== 'number' && typeof values.quantity !== 'string') || (typeof values.quantity === 'string' && !values.quantity.trim())) throw new Error('Informe a quantidade de unidades.');
  const quantity = Number(values.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000) throw new Error('A quantidade deve ser um número inteiro entre 0 e 1.000.000.');
  const revenueCents = price * quantity;
  const variableCents = variable * quantity;
  const unitContributionCents = price - variable;
  const totalContributionCents = unitContributionCents * quantity;
  const resultCents = totalContributionCents - fixed;
  return {
    price:price / 100, variable:variable / 100, fixed:fixed / 100, quantity,
    revenue:revenueCents / 100, totalVariable:variableCents / 100,
    unitContribution:unitContributionCents / 100, totalContribution:totalContributionCents / 100,
    result:resultCents / 100,
    breakEven:fixed === 0 ? 0 : unitContributionCents > 0 ? Math.ceil(fixed / unitContributionCents) : null,
    resultPercent:revenueCents > 0 ? resultCents / revenueCents * 100 : null,
  };
}
