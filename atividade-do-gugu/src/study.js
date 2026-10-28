// Regras puras para os recursos de estudo. Nenhum dado é enviado a um servidor.
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export function localDate(date = new Date()) {
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isValidDate(value) {
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return year >= 1000 && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function addDays(value, days) {
  if (!isValidDate(value)) return '';
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

export function deadlines(tasks, schoolDates) {
  return [
    ...tasks.filter(item => !item.done && isValidDate(item.prazo)).map(item => ({
      id: item.id, title: item.titulo || 'Tarefa', date: item.prazo, kind: 'Tarefa', href: `#/tool/lista-tarefas${typeof item.id === 'string' && item.id ? `?item=${encodeURIComponent(item.id)}` : ''}`,
    })),
    ...schoolDates.filter(item => isValidDate(item.data)).map(item => ({
      id: item.id, title: item.titulo || 'Compromisso', date: item.data, kind: 'Avaliação ou entrega', subject: item.materia || '', href: `#/tool/provas-trabalhos${typeof item.id === 'string' && item.id ? `?item=${encodeURIComponent(item.id)}` : ''}`,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date) || String(a.title).localeCompare(String(b.title), 'pt-BR'));
}

export function upcomingDeadlines(items, today = localDate()) {
  // Tarefas em atraso continuam visíveis; eventos passados não são apresentados como próximos.
  return items.filter(item => item.kind === 'Tarefa' || item.date >= today);
}

export function calendarDays(year, month) {
  const first = new Date(year, month, 1, 12);
  const count = new Date(year, month + 1, 0, 12).getDate();
  const leading = (first.getDay() + 6) % 7; // Semana começa na segunda-feira.
  const days = Array(leading).fill(null);
  for (let day = 1; day <= count; day++) days.push(localDate(new Date(year, month, day, 12)));
  while (days.length % 7) days.push(null);
  return days;
}

export function safeHttpUrl(value) {
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    return url.href;
  } catch { return ''; }
}

export function canonicalUrl(value) {
  const safe = safeHttpUrl(value);
  if (!safe) return '';
  const url = new URL(safe);
  url.hash = '';
  return url.href;
}

export const reviewIntervals = { dificil: 1, medio: 3, facil: 7 };
export function rateFlashcard(card, rating, today = localDate(), intervals = reviewIntervals) {
  const days = intervals?.[rating];
  if (!Object.hasOwn(reviewIntervals, rating) || !isValidDate(today) || !Number.isInteger(days) || days < 1 || days > 365) throw new Error('Avaliação inválida.');
  return {
    ...card,
    lastRating: rating,
    nextReview: addDays(today, days),
    reviews: (Number(card.reviews) || 0) + 1,
    difficultReviews: (Number(card.difficultReviews) || 0) + (rating === 'dificil' ? 1 : 0),
    lastReviewed: today,
  };
}

export function flashcardQueue(cards, mode = 'due', today = localDate(), completed = []) {
  return cards.filter(card => {
    if (completed.includes(card.id)) return false;
    if (mode === 'difficult') return card.lastRating === 'dificil' || (!card.lastRating && card.difficulty === 'dificil');
    if (mode === 'all') return true;
    return !isValidDate(card.nextReview) || card.nextReview <= today;
  }).sort((a, b) => String(a.nextReview || '').localeCompare(String(b.nextReview || '')) || Number(a.created || 0) - Number(b.created || 0));
}

const icsEscape = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
export function calendarIcs(items, now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Help RDS//Agenda pessoal//PT-BR', 'CALSCALE:GREGORIAN'];
  for (const item of items.filter(item => isValidDate(item.date))) {
    const uid = encodeURIComponent(String(item.id || `${item.date}-${item.title}`));
    lines.push('BEGIN:VEVENT', `UID:${uid}@help-rds.local`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${item.date.replaceAll('-', '')}`,
      `DTEND;VALUE=DATE:${addDays(item.date, 1).replaceAll('-', '')}`, `SUMMARY:${icsEscape(item.title)}`,
      `DESCRIPTION:${icsEscape([item.kind, item.subject].filter(Boolean).join(' · '))}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // Dobra linhas em até 75 octetos sem dividir caracteres UTF-8, conforme iCalendar.
  const encoder = new TextEncoder();
  return lines.map(line => {
    const chunks = []; let chunk = ''; let bytes = 0;
    for (const character of line) {
      const size = encoder.encode(character).length;
      if (bytes + size > (chunks.length ? 74 : 75)) { chunks.push(chunk); chunk = ''; bytes = 0; }
      chunk += character; bytes += size;
    }
    chunks.push(chunk);
    return chunks.join('\r\n ');
  }).join('\r\n') + '\r\n';
}

// Conteúdo autoral complementar, não associado ao currículo ou aos professores da turma.
export const guides = [
  {
    id: 'logica', number: '01', title: 'Lógica de programação', tag: 'COMECE POR AQUI',
    description: 'Transforme um problema em passos que o computador pode seguir.',
    intro: 'Antes de escolher uma linguagem, vale organizar o raciocínio: quais dados entram, o que precisa acontecer com eles e qual resultado deve sair?',
    concept: 'Um algoritmo é uma sequência finita de instruções. Quebre o problema em etapas pequenas e teste o caminho com valores simples.',
    exampleLabel: 'Pseudocódigo · uma ideia, não um programa executável',
    code: 'INÍCIO\n  LEIA nota1, nota2\n  média ← (nota1 + nota2) / 2\n  ESCREVA média\nFIM',
    exercise: 'Descreva em passos como calcular a média de três valores. Quais são as entradas e qual é a saída?',
    answer: 'Uma possibilidade: ler os três valores, somá-los, dividir a soma por três e mostrar o resultado. As entradas são os valores; a saída é a média.',
    project: 'Desenhe um algoritmo para organizar uma lista de tarefas por prioridade. Primeiro escreva as etapas em português; depois teste com três tarefas fictícias.',
  },
  {
    id: 'html-css', number: '02', title: 'HTML e CSS', tag: 'PARA CRIAR NA WEB',
    description: 'Dê estrutura e estilo a uma página simples.',
    intro: 'HTML organiza o conteúdo de uma página; CSS descreve sua apresentação. Os dois trabalham juntos, mas têm responsabilidades diferentes.',
    concept: 'Use elementos semânticos para dar significado ao conteúdo. Uma regra CSS seleciona um elemento e define propriedades como cor e espaçamento.',
    exampleLabel: 'HTML com um pequeno trecho de CSS',
    code: '<style>\n  h1 { color: #3553c7; }\n</style>\n<main>\n  <h1>Meu primeiro projeto</h1>\n  <p>Uma ideia de cada vez.</p>\n</main>',
    exercise: 'Acrescente um segundo parágrafo ao exemplo. Depois escolha outra cor para o título e confira o resultado em um arquivo HTML local.',
    answer: 'Crie outro elemento <p> com seu texto e altere a propriedade color da regra h1. Feche cada elemento corretamente.',
    project: 'Monte uma página de apresentação de um projeto fictício, com título, descrição e uma lista de etapas. Teste a leitura também em uma tela pequena.',
  },
  {
    id: 'javascript', number: '03', title: 'Primeiros passos em JavaScript', tag: 'LÓGICA EM AÇÃO',
    description: 'Use variáveis e listas para representar informações.',
    intro: 'JavaScript permite descrever comportamentos em páginas e outras aplicações. Uma variável guarda um valor; uma lista reúne vários valores relacionados.',
    concept: 'No exemplo, a lista contém três etapas fictícias. O método forEach visita cada item e executa a função indicada para ele.',
    exampleLabel: 'JavaScript · exemplo para testar em ambiente local',
    code: "const etapas = ['Pesquisar', 'Escrever', 'Revisar'];\n\netapas.forEach((etapa) => {\n  console.log(etapa);\n});",
    exercise: 'Adicione uma quarta etapa à lista. O que será mostrado no console quando o código executar?',
    answer: 'O console mostrará as quatro etapas, uma por linha, na ordem em que aparecem na lista.',
    project: 'Crie uma lista de tarefas fictícias e experimente mostrar cada item no console. Como próximo passo, estude como exibi-los na página com segurança.',
  },
];

export const findGuide = id => guides.find(guide => guide.id === id);
