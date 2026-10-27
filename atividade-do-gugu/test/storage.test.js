import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrefs, savePrefs, getRecords, saveRecords, getDraft, saveDraft, clearDraft, clearAllLocalData, exportLocalData } from '../src/storage.js';

class MemoryStorage {
  get length() { return Object.keys(this).length; }
  key(index) { return Object.keys(this)[index] ?? null; }
  getItem(key) { return Object.hasOwn(this, key) ? this[key] : null; }
  setItem(key, value) { Object.defineProperty(this, String(key), { value:String(value), writable:true, configurable:true, enumerable:true }); }
  removeItem(key) { delete this[key]; }
}

test('preferências, registros e rascunhos são locais, recuperáveis e exportáveis', () => {
  globalThis.localStorage = new MemoryStorage();
  assert.deepEqual(getPrefs(), { theme:'light', favorites:[], recent:[] });
  savePrefs({ theme:'dark', favorites:['roi'], recent:['roi'] });
  assert.equal(getPrefs().theme, 'dark');
  saveRecords('tasks', [{ id:'task-1', title:'Revisar' }]);
  assert.equal(getRecords('tasks')[0].title, 'Revisar');
  saveDraft('juros', { capital:'250' });
  assert.equal(getDraft('juros').capital, '250');
  assert.ok(exportLocalData()['records:tasks']);
  clearDraft('juros');
  assert.deepEqual(getDraft('juros'), {});
  clearAllLocalData();
  assert.deepEqual(getRecords('tasks'), []);
  assert.deepEqual(getPrefs(), { theme:'light', favorites:[], recent:[] });
  delete globalThis.localStorage;
});
