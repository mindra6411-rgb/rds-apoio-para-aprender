import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');

test('créditos e papéis da equipe aparecem sem subdivisão individual do design', async () => {
  const app = await read('../src/main.js');
  const handoff = await read('../docs/design-handoff.md');
  assert.match(app, /PROGRAMAÇÃO/);
  assert.match(app, /Ytalo Lima/);
  assert.match(app, /EQUIPE DE DESIGN/);
  assert.match(app, /Pedro Miranda · Matheus Gama/);
  assert.match(handoff, /As contribuições individuais de Pedro Miranda e Matheus Gama não são subdivididas/);
});

test('tokens provisórios e componentes visuais básicos estão documentados no código', async () => {
  const css = await read('../src/styles.css');
  const components = await read('../src/design-components.css');
  const handoff = await read('../docs/design-handoff.md');
  for (const token of ['--font-body','--font-display','--font-mono','--space-1','--radius-sm','--focus-color','--accent']) assert.ok(css.includes(token), `token ausente: ${token}`);
  for (const component of ['.data-table','.table-wrap','.confirm-dialog','.alert','.continuity-card']) assert.ok(components.includes(component), `componente ausente: ${component}`);
  assert.match(handoff, /tokens CSS provisórios/);
  assert.match(handoff, /Não há, neste momento, arquivos oficiais de marca/);
});
