import test from 'node:test';
import assert from 'node:assert/strict';
import { rateFlashcard, deadlines } from '../src/study.js';
import { getReviewSettings, saveReviewSettings, getOnboarding, saveOnboarding } from '../src/storage.js';
import { extraExercises } from '../src/exercises.js';
import { gradeLesson, lessons } from '../src/admin.js';
import { privacyPage } from '../src/privacy.js';

function memory() {
  const map = new Map();
  return { getItem:key => map.get(key) ?? null, setItem:(key,value) => map.set(key,String(value)), removeItem:key => map.delete(key) };
}

test('intervalos são ajustáveis, validados e aplicados sem modificar o padrão', () => {
  globalThis.localStorage = memory();
  assert.deepEqual(getReviewSettings(), {dificil:1,medio:3,facil:7});
  assert.equal(saveReviewSettings({dificil:2,medio:5,facil:30}), true);
  assert.deepEqual(getReviewSettings(), {dificil:2,medio:5,facil:30});
  assert.equal(rateFlashcard({id:'a'}, 'medio', '2026-12-30', getReviewSettings()).nextReview, '2027-01-04');
  assert.equal(rateFlashcard({id:'a'}, 'medio', '2026-12-30').nextReview, '2027-01-02');
  for (const value of [0, 366, 1.5, NaN, '3']) assert.equal(saveReviewSettings({dificil:value,medio:3,facil:7}), false);
  assert.throws(() => rateFlashcard({id:'a'}, 'medio', '2026-12-30', {medio:0}), /inválida/);
  localStorage.setItem('help-rds:review-settings', JSON.stringify({dificil:'incorreto',medio:365,facil:9999}));
  assert.deepEqual(getReviewSettings(), {dificil:1,medio:365,facil:7});
  assert.equal(getOnboarding(), false); assert.equal(saveOnboarding(), true); assert.equal(getOnboarding(), true);
  delete globalThis.localStorage;
});

test('atividades extras têm retorno para cada alternativa', () => {
  for (const lesson of lessons) {
    const exercise = extraExercises[lesson.id];
    assert.ok(exercise && exercise.options.length >= 2);
    assert.equal(exercise.options.filter(option => gradeLesson(lesson.id, option.id, 'extra').correct).length, 1);
    for (const option of exercise.options) assert.ok(gradeLesson(lesson.id, option.id, 'extra').feedback);
  }
  assert.throws(() => gradeLesson('fundamentos', 'a', 'qualquer'), /alternativa válida/);
});

test('endereços de agenda apontam para os registros exatos', () => {
  const items = deadlines([{id:'a / b',titulo:'Tarefa',prazo:'2026-10-28'}], []);
  assert.match(items[0].href, /\?item=a%20%2F%20b/);
});

test('privacidade não inventa contato e aceita somente e-mail público configurado', () => {
  assert.match(privacyPage(), /canal de atendimento ainda não foi configurado/);
  assert.doesNotMatch(privacyPage('javascript:alert(1)'), /mailto:/);
  assert.match(privacyPage('responsavel@example.org'), /mailto:responsavel@example.org/);
  assert.doesNotMatch(privacyPage('x@example.org\nBcc:outra@example.org'), /mailto:/);
  assert.match(privacyPage('nome+privacidade@example.org'), /nome%2Bprivacidade@example.org/);
});
