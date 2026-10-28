import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBackup, parseBackup, prepareRestore, applyRestore, MAX_BACKUP_BYTES } from '../src/backup.js';

function memory(initial = {}, failOnWrite = Infinity) {
  const data = new Map(Object.entries(initial)); let writes = 0;
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem(key, value) { if (++writes === failOnWrite) throw new Error('quota'); data.set(key, String(value)); },
    removeItem: key => data.delete(key),
    data,
  };
}
const enc = data => JSON.stringify(data);

test('backup versionado e formato anterior são reconhecidos sem importar chaves desconhecidas', () => {
  const original = { 'records:tasks': [{ id: 'a', titulo: 'Estudar' }], desconhecido: { dado: 'ignorado' } };
  const versioned = parseBackup(enc(makeBackup(original, new Date('2026-01-01T00:00:00Z'))));
  assert.equal(versioned.legacy, false);
  assert.deepEqual(versioned.skipped, ['desconhecido']);
  assert.equal(versioned.data['records:tasks'][0].id, 'a');
  assert.equal(parseBackup(enc(original)).legacy, true);
  assert.throws(() => parseBackup(enc({ format: 'help-rds-local-backup', version: 999, data: original })), /versão/);
});

test('importação recusa IDs duplicados, chaves inseguras, JSON inválido e arquivos grandes', () => {
  assert.throws(() => parseBackup('{'), /JSON válido/);
  assert.throws(() => parseBackup(enc({ 'records:tasks': [{ id: 'a' }, { id: 'a' }] })), /duplicados/);
  assert.throws(() => parseBackup('{"records:tasks":[{"id":"a","__proto__":{"x":1}}]}'), /não permitida/);
  assert.throws(() => parseBackup('{"records:tasks":[{"id":"\\ud800"}]}'), /identificador/);
  assert.throws(() => parseBackup(enc({'records:tasks':[{id:'a\nb'}]})), /identificador/);
  assert.throws(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1)), /10 MB/);
  assert.throws(() => parseBackup(enc({ 'records:tasks': 'inválido' })), /inválida/);
});

test('mesclar mantém IDs existentes e preferências locais, sem apagar outros dados', () => {
  const storage = memory({
    'help-rds:records:tasks': enc([{ id: 'a', titulo: 'Atual' }]),
    'help-rds:preferences': enc({ theme: 'dark' }),
    'help-rds:records:notes': enc([{ id: 'n', titulo: 'Preservada' }]),
  });
  const parsed = parseBackup(enc({ 'records:tasks': [{ id: 'a', titulo: 'Antiga' }, { id: 'b', titulo: 'Nova' }], preferences: { theme: 'light' } }));
  const plan = prepareRestore(parsed, storage);
  assert.equal(plan.added, 1); assert.equal(plan.kept, 2);
  assert.equal(applyRestore(plan, storage), 1);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:tasks')), [{ id: 'a', titulo: 'Atual' }, { id: 'b', titulo: 'Nova' }]);
  assert.equal(JSON.parse(storage.getItem('help-rds:preferences')).theme, 'dark');
  assert.equal(JSON.parse(storage.getItem('help-rds:records:notes'))[0].titulo, 'Preservada');
});

test('substituição altera somente grupos presentes e prévia antiga é recusada', () => {
  const storage = memory({ 'help-rds:records:tasks': enc([{ id: 'a' }]), 'help-rds:records:notes': enc([{ id: 'n' }]) });
  const parsed = parseBackup(enc({ 'records:tasks': [{ id: 'b' }] }));
  const stale = prepareRestore(parsed, storage, 'replace');
  storage.setItem('help-rds:records:tasks', enc([{ id: 'c' }]));
  assert.throws(() => applyRestore(stale, storage), /mudaram/);
  const plan = prepareRestore(parsed, storage, 'replace');
  applyRestore(plan, storage);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:tasks')), [{ id: 'b' }]);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:notes')), [{ id: 'n' }]);
});

test('falha de gravação desfaz alterações já aplicadas', () => {
  const storage = memory({ 'help-rds:records:tasks': enc([{ id: 'a' }]) }, 2);
  const parsed = parseBackup(enc({ 'records:tasks': [{ id: 'b' }], 'records:notes': [{ id: 'n' }] }));
  assert.throws(() => applyRestore(prepareRestore(parsed, storage), storage), /desfeitas/);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:tasks')), [{ id: 'a' }]);
  assert.equal(storage.getItem('help-rds:records:notes'), null);
});

test('rollback não sobrescreve alterações feitas por outra aba durante uma falha', () => {
  const values = new Map([['help-rds:records:tasks', enc([{id:'a'}])]]);
  let writes = 0;
  const storage = {
    getItem:key => values.get(key) ?? null,
    removeItem:key => values.delete(key),
    setItem(key,value) {
      writes++;
      if (writes === 2) {
        values.set('help-rds:records:tasks',enc([{id:'concurrent'}]));
        throw new Error('quota');
      }
      values.set(key,String(value));
    },
  };
  const parsed = parseBackup(enc({'records:tasks':[{id:'b'}],'records:notes':[{id:'n'}]}));
  assert.throws(() => applyRestore(prepareRestore(parsed,storage),storage), /não foi possível desfazer toda/);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:tasks')), [{id:'concurrent'}]);
});

test('exportações individuais antigas exigem escolha explícita da ferramenta', () => {
  const oldTasks = enc([{id:'a',titulo:'Estudar'}]);
  assert.throws(() => parseBackup(oldTasks), /escolha a ferramenta/i);
  assert.throws(() => parseBackup(oldTasks, 'records:qualquer'), /escolha a ferramenta/i);
  assert.throws(() => parseBackup(enc({'records:tasks':[]}), 'records:tasks'), /backup completo/i);
  const parsed = parseBackup(oldTasks, 'records:tasks');
  assert.equal(parsed.individual,true); assert.equal(parsed.legacy,true);
  const storage = memory();
  applyRestore(prepareRestore(parsed,storage),storage);
  assert.deepEqual(JSON.parse(storage.getItem('help-rds:records:tasks')),[{id:'a',titulo:'Estudar'}]);
  assert.equal(storage.getItem('help-rds:records:notes'),null);
});
