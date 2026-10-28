import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcileSteps } from '../src/tasks.js';

test('subtarefas mantêm marcações ao editar ou reordenar textos', () => {
  let n = 0; const id = () => `new-${++n}`;
  const old = [{ id:'a', text:'Ler', done:true }, { id:'b', text:'Revisar', done:false }];
  const result = reconcileSteps('Revisar\nLer\nAnotar', old, id);
  assert.deepEqual(result, [old[1], old[0], { id:'new-1', text:'Anotar', done:false }]);
  assert.deepEqual(old.map(item => item.id), ['a','b']);
  assert.throws(() => reconcileSteps(Array(31).fill('item').join('\n'), [], id), /30 subtarefas/);
});
