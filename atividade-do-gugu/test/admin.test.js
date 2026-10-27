import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons, findLesson, gradeLesson, lessonProgress, careerSteps, careerProgress, simulateBusiness, isUsableScenario } from '../src/admin.js';
import { findTool } from '../src/tools.js';

test('trilhas têm IDs únicos, atividade corrigível e conexões existentes', () => {
  assert.equal(lessons.length, 6);
  assert.equal(new Set(lessons.map(item => item.id)).size, lessons.length);
  for (const lesson of lessons) {
    assert.equal(findLesson(lesson.id), lesson);
    assert.ok(lesson.question.options.length >= 2);
    assert.equal(new Set(lesson.question.options.map(option => option.id)).size, lesson.question.options.length);
    const correct = lesson.question.options.filter(option => gradeLesson(lesson.id, option.id).correct);
    assert.deepEqual(correct.map(item => item.id), [lesson.question.correct]);
    for (const option of lesson.question.options) assert.ok(gradeLesson(lesson.id, option.id).feedback);
    if (lesson.tool.href.startsWith('tool/')) assert.ok(findTool(lesson.tool.href.slice(5)), `ferramenta não encontrada: ${lesson.tool.href}`);
    else assert.equal(lesson.tool.href, 'laboratorio');
  }
  assert.throws(() => gradeLesson('desconhecida','a'), /alternativa válida/);
  assert.throws(() => gradeLesson('fundamentos','desconhecida'), /alternativa válida/);
});

test('progresso representa apenas marcações existentes, sem duplicatas', () => {
  assert.equal(lessonProgress([]).count, 0);
  const progress = lessonProgress([{id:'fundamentos',done:true},{id:'fundamentos',done:true},{id:'financas',done:false},{id:'desconhecida',done:true}]);
  assert.equal(progress.total, 6);
  assert.equal(progress.count, 1);
  assert.ok(progress.ids.has('fundamentos'));
  assert.ok(!progress.ids.has('financas'));
  assert.equal(careerProgress([]).total, careerSteps.length);
  const career = careerProgress([{id:careerSteps[0].id,done:true},{id:careerSteps[0].id,done:true},{id:'fake',done:true}]);
  assert.equal(career.count, 1);
});

test('simulação calcula receita, custos, contribuição, resultado e equilíbrio', () => {
  const value = simulateBusiness({price:'20',variable:'12',fixed:'800',quantity:'120'});
  assert.deepEqual(value, {
    price:20, variable:12, fixed:800, quantity:120,
    revenue:2400, totalVariable:1440, unitContribution:8, totalContribution:960,
    result:160, breakEven:100, resultPercent:160 / 2400 * 100,
  });
  assert.equal(simulateBusiness({price:20,variable:12,fixed:801,quantity:1}).breakEven, 101);
  const brazilian = simulateBusiness({price:'20,50',variable:'12,25',fixed:'8,00',quantity:'2'});
  assert.equal(brazilian.revenue, 41);
  assert.equal(brazilian.result, 8.5);
  const negative = simulateBusiness({price:5,variable:8,fixed:100,quantity:20});
  assert.equal(negative.result, -160);
  assert.equal(negative.breakEven, null);
  assert.equal(negative.resultPercent, -160);
});

test('o equilíbrio usa centavos inteiros e lida com zero e contribuição não positiva', () => {
  const exact = simulateBusiness({price:0.3,variable:0.2,fixed:0.3,quantity:3});
  assert.equal(exact.breakEven, 3);
  assert.equal(exact.result, 0);
  const zero = simulateBusiness({price:0,variable:0,fixed:0,quantity:0});
  assert.equal(zero.breakEven, 0);
  assert.equal(zero.resultPercent, null);
  assert.equal(simulateBusiness({price:10,variable:10,fixed:10,quantity:5}).breakEven, null);
  assert.equal(simulateBusiness({price:1,variable:2,fixed:0,quantity:0}).breakEven, 0);
});

test('simulação recusa valores ausentes, negativos, imprecisos, fora do limite ou quantidades fracionárias', () => {
  const valid = {price:'10',variable:'2',fixed:'50',quantity:'5'};
  for (const patch of [
    {price:''},{price:' '},{price:-1},{price:Infinity},{price:1000001},{price:1.001},{price:'1.234,56'},{price:'abc'},
    {variable:null},{variable:-0.01},{fixed:1000000001},{quantity:''},{quantity:2.5},
    {quantity:-1},{quantity:1000001},{quantity:false},
  ]) assert.throws(() => simulateBusiness({...valid,...patch}), Error, JSON.stringify(patch));
  assert.throws(() => simulateBusiness(null), /cenário/);
  const largest = simulateBusiness({price:1000000,variable:0,fixed:1000000000,quantity:1000000});
  assert.equal(largest.revenue, 1000000000000);
  assert.equal(largest.result, 999000000000);
});

test('cenários corrompidos são identificados sem descartar os válidos', () => {
  const valid = {id:'a',name:'Exemplo',values:{price:'20,00',variable:12,fixed:100,quantity:10}};
  assert.equal(isUsableScenario(valid),true);
  for (const item of [null,{}, {...valid,id:''}, {...valid,name:42}, {...valid,values:{...valid.values,price:'não informado'}}]) assert.equal(isUsableScenario(item),false);
  assert.deepEqual([valid,{...valid,id:'b',values:null}].filter(isUsableScenario),[valid]);
});
