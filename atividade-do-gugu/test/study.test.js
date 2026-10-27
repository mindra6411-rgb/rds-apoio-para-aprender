import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, localDate, isValidDate, addDays, deadlines, upcomingDeadlines, calendarDays, safeHttpUrl, canonicalUrl, rateFlashcard, flashcardQueue, calendarIcs, guides } from '../src/study.js';
import { tools } from '../src/tools.js';

test('busca normaliza maiúsculas e acentos sem alterar o conteúdo original', () => {
  assert.equal(normalize('  Matemática E PROGRAMAÇÃO '), 'matematica e programacao');
  assert.equal(normalize(null), '');
});

test('datas locais são validadas e atravessam mês e ano corretamente', () => {
  assert.equal(isValidDate('2024-02-29'), true);
  assert.equal(isValidDate('2025-02-29'), false);
  assert.equal(isValidDate('2026-13-01'), false);
  assert.equal(isValidDate({}), false);
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('inválida', 1), '');
  assert.equal(localDate(new Date(2026, 0, 2, 12)), '2026-01-02');
});

test('calendário começa na segunda e contém cada dia uma vez, inclusive ano bissexto', () => {
  const days = calendarDays(2024, 1);
  assert.equal(days.length % 7, 0);
  assert.deepEqual(days.slice(0, 4), [null, null, null, '2024-02-01']);
  assert.equal(days.filter(Boolean).length, 29);
  assert.equal(days.filter(Boolean).at(-1), '2024-02-29');
});

test('painel combina somente datas válidas e não anuncia eventos passados como próximos', () => {
  const items = deadlines([
    { id:'a', titulo:'Tarefa atrasada', prazo:'2026-01-01' },
    { id:'b', titulo:'Concluída', prazo:'2026-01-05', done:true },
    { id:'c', titulo:'Sem data', prazo:'não é data' },
  ], [
    { id:'d', titulo:'Data antiga', data:'2026-01-01' },
    { id:'e', titulo:'Entrega', data:'2026-01-10', materia:'Matemática' },
  ]);
  assert.equal(items.length, 3);
  assert.deepEqual(upcomingDeadlines(items, '2026-01-03').map(item=>item.title), ['Tarefa atrasada', 'Entrega']);
});

test('referências aceitam apenas URLs http(s) sem credenciais e identificam duplicatas por fragmento', () => {
  assert.equal(safeHttpUrl('javascript:alert(1)'), '');
  assert.equal(safeHttpUrl('data:text/html,ola'), '');
  assert.equal(safeHttpUrl('https://usuario:senha@example.com/'), '');
  assert.equal(safeHttpUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(canonicalUrl('https://example.com/a#pagina1'), canonicalUrl('https://example.com/a#pagina2'));
});

test('repetição espaçada usa autoavaliação e mantém histórico sem prometer acertos', () => {
  const initial = { id:'1', question:'Pergunta', reviews:0, difficulty:'dificil' };
  assert.equal(flashcardQueue([initial], 'difficult', '2026-12-31').length, 1);
  const hard = rateFlashcard(initial, 'dificil', '2026-12-31');
  assert.equal(hard.nextReview, '2027-01-01');
  assert.equal(hard.reviews, 1);
  assert.equal(hard.difficultReviews, 1);
  assert.equal(flashcardQueue([hard], 'due', '2026-12-31').length, 0);
  assert.equal(flashcardQueue([hard], 'due', '2027-01-01').length, 1);
  assert.equal(flashcardQueue([hard], 'all', '2027-01-01', ['1']).length, 0);
  assert.equal(rateFlashcard(hard, 'facil', '2027-01-01').nextReview, '2027-01-08');
  assert.throws(() => rateFlashcard(hard, 'toString', '2027-01-01'), /inválida/);
});

test('exportação iCalendar protege quebras de linha e inclui dia inteiro', () => {
  const result = calendarIcs([{ id:'1', title:'Tarefa, com; texto\nBEGIN:VEVENT', date:'2026-12-31', kind:'Tarefa' }, { id:'2', title:'Ignorada', date:'inválida' }], new Date('2026-01-01T12:00:00Z'));
  assert.match(result, /DTSTART;VALUE=DATE:20261231/);
  assert.match(result, /DTEND;VALUE=DATE:20270101/);
  assert.match(result, /SUMMARY:Tarefa\\, com\\; texto\\nBEGIN:VEVENT/);
  assert.equal(result.split('\r\n').filter(line => line === 'BEGIN:VEVENT').length, 1); // Quebras de linha do título não criam outro evento.
  assert.ok(result.split('\r\n').every(line => Buffer.byteLength(line, 'utf8') <= 75));
  assert.doesNotMatch(result, /Ignorada/);
});

test('guias são complementares e anotação aceita matéria opcional sem quebrar registros antigos', () => {
  assert.equal(guides.length, 3);
  for (const guide of guides) for (const key of ['title','concept','code','exercise','answer','project']) assert.ok(guide[key]);
  const notes = tools.find(tool=>tool.id==='anotacoes');
  assert.equal(notes.fields.find(field=>field.name==='materia').required, false);
});
