// Importação local, sem rede. O formato antigo (objeto de chaves) continua aceito.
import { tools } from './tools.js';

export const BACKUP_FORMAT = 'help-rds-local-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const PREFIX = 'help-rds:';
const allowed = new Set([
  'preferences', 'review-settings', 'onboarding',
  ...tools.filter(tool => tool.storage).map(tool => `records:${tool.storage}`),
  ...tools.filter(tool => tool.type === 'calculator').map(tool => `calculator:${tool.id}`),
  'calculator:admin-lab', 'records:subjects', 'records:library', 'records:flashcards',
  'records:admin-progress', 'records:admin-attempts', 'records:business-scenarios', 'records:career-progress',
]);
const individualCollections = new Set(tools.filter(tool => tool.storage && tool.type !== 'timer').map(tool => `records:${tool.storage}`));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validId = value => {
  if (typeof value !== 'string' || !value || value.length > 200 || /[\u0000-\u001f\u007f]/.test(value)) return false;
  try { encodeURIComponent(value); return true; } catch { return false; }
};

function inspectValue(value, level, budget) {
  if (++budget.count > 80000 || level > 25) throw new Error('O arquivo contém dados excessivos ou muito profundos.');
  if (typeof value === 'string' && value.length > 100000) throw new Error('Um texto do arquivo ultrapassa o limite permitido.');
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('O arquivo contém um número inválido.');
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return;
  if (Array.isArray(value)) { value.forEach(item => inspectValue(item, level + 1, budget)); return; }
  if (!object(value)) throw new Error('O arquivo contém um valor inválido.');
  for (const [key, item] of Object.entries(value)) {
    if (['__proto__', 'prototype', 'constructor', 'toString', 'valueOf', 'toLocaleString', '__defineGetter__', '__defineSetter__'].includes(key)) throw new Error('O arquivo contém uma chave não permitida.');
    inspectValue(item, level + 1, budget);
  }
}

export function makeBackup(data, date = new Date()) {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: date.toISOString(), data };
}

export function parseBackup(text, collection = '') {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('O arquivo deve ter no máximo 10 MB.');
  let document;
  try { document = JSON.parse(text); } catch { throw new Error('O arquivo não é um JSON válido.'); }
  const individual = Array.isArray(document);
  if (individual && !individualCollections.has(collection)) throw new Error('Esta é uma exportação individual. Escolha a ferramenta correspondente antes de importar.');
  if (!individual && collection) throw new Error('Para um backup completo, escolha a opção Backup completo.');
  if (!individual && !object(document)) throw new Error('Este arquivo não contém um backup válido.');
  const envelope = !individual && Object.hasOwn(document, 'format');
  if (envelope && (document.format !== BACKUP_FORMAT || document.version !== BACKUP_VERSION || !object(document.data))) {
    throw new Error('Formato ou versão de backup não reconhecidos.');
  }
  const data = individual ? { [collection]:document } : envelope ? document.data : document;
  const accepted = Object.create(null);
  const skipped = [];
  for (const [key, value] of Object.entries(data)) {
    if (!allowed.has(key)) { skipped.push(key); continue; }
    inspectValue(value, 0, { count: 0 });
    if (key.startsWith('records:')) {
      if (!Array.isArray(value) || value.length > 20000) throw new Error(`A coleção ${key} é inválida ou muito grande.`);
      const ids = new Set();
      for (const item of value) {
        if (!object(item) || !validId(item.id) || ids.has(item.id)) {
          throw new Error(`A coleção ${key} contém registros sem identificador válido ou duplicados.`);
        }
        ids.add(item.id);
      }
    } else if (!object(value)) throw new Error(`Os dados de ${key} são inválidos.`);
    accepted[key] = value;
  }
  if (!Object.keys(accepted).length) throw new Error('Nenhum dado reconhecido foi encontrado no arquivo.');
  return { data: accepted, skipped, legacy: !envelope, individual };
}

// A mesclagem nunca sobrescreve registros com o mesmo ID. A substituição afeta
// somente as coleções presentes no arquivo e sempre depende de confirmação.
export function prepareRestore(parsed, storage, mode = 'merge') {
  if (!['merge', 'replace'].includes(mode)) throw new Error('Escolha um modo de importação válido.');
  if (!storage?.getItem || !storage?.setItem) throw new Error('O armazenamento deste navegador está indisponível.');
  const changes = [];
  let added = 0, kept = 0;
  for (const [key, incoming] of Object.entries(parsed.data)) {
    const fullKey = PREFIX + key;
    const before = storage.getItem(fullKey);
    let existing = null;
    if (before !== null) {
      try { existing = JSON.parse(before); } catch { throw new Error(`Não foi possível ler os dados locais de ${key}. Exporte uma cópia antes de continuar.`); }
    }
    let next = incoming;
    if (key.startsWith('records:')) {
      if (before !== null && !Array.isArray(existing)) throw new Error(`Os dados locais de ${key} não são uma lista válida.`);
      if (mode === 'merge' && existing) {
        const ids = new Set(existing.map(item => item?.id).filter(id => typeof id === 'string'));
        const fresh = incoming.filter(item => !ids.has(item.id));
        added += fresh.length;
        kept += incoming.length - fresh.length;
        next = [...existing, ...fresh];
      } else added += incoming.length;
    } else if (mode === 'merge' && before !== null) {
      kept++;
      next = existing;
    } else added++;
    const after = JSON.stringify(next);
    if (after !== before) changes.push({ key: fullKey, before, after });
  }
  return { mode, changes, added, kept, skipped: parsed.skipped };
}

export function applyRestore(plan, storage) {
  // A API localStorage não oferece transações entre grupos. Faça uma prévia
  // e releia cada chave imediatamente antes de gravar; feche outras abas.
  for (const change of plan.changes) {
    if (storage.getItem(change.key) !== change.before) throw new Error('Os dados mudaram depois da prévia. Selecione o arquivo novamente.');
  }
  const applied = [];
  let stale = false;
  try {
    for (const change of plan.changes) {
      if (storage.getItem(change.key) !== change.before) { stale = true; throw new Error('stale'); }
      storage.setItem(change.key, change.after);
      applied.push(change);
    }
  } catch {
    let rollbackFailed = false;
    for (const change of applied.reverse()) {
      try {
        // Não sobrescreva alterações de outra aba durante uma tentativa de rollback.
        if (storage.getItem(change.key) !== change.after) { rollbackFailed = true; continue; }
        if (change.before === null) storage.removeItem(change.key); else storage.setItem(change.key, change.before);
      } catch { rollbackFailed = true; }
    }
    throw new Error(rollbackFailed
      ? 'A importação foi interrompida e não foi possível desfazer toda a tentativa sem sobrescrever outra alteração. Confira os dados e use a cópia de segurança se necessário.'
      : stale ? 'Os dados mudaram durante a importação; as alterações desta tentativa foram desfeitas. Selecione o arquivo novamente.'
        : 'Não foi possível importar; as alterações desta tentativa foram desfeitas.');
  }
  return plan.changes.length;
}
