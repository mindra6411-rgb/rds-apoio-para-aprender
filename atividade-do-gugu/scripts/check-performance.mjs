// Orçamento de transferência gzip do carregamento inicial, sem prometer velocidade real.
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const html = await readFile(path.join(root, 'index.html'));
const content = html.toString('utf8');
const urls = [...content.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+\.(?:js|css))"/g)].map(match => match[1]);
assert.ok(urls.some(url => url.endsWith('.js')), 'Arquivo JS inicial não encontrado.');
assert.ok(urls.some(url => url.endsWith('.css')), 'Arquivo CSS inicial não encontrado.');
const budgets = { html:4 * 1024, js:100 * 1024, css:35 * 1024, total:150 * 1024 };
const sizes = { html:gzipSync(html).length, js:0, css:0 };
for (const url of urls) {
  const asset = path.resolve(root, url);
  assert.ok(asset.startsWith(root + path.sep), 'Caminho de asset inválido.');
  const compressed = gzipSync(await readFile(asset)).length;
  sizes[url.endsWith('.js') ? 'js' : 'css'] += compressed;
}
const total = sizes.html + sizes.js + sizes.css;
for (const [key,value] of Object.entries({...sizes,total})) {
  const kb = (value / 1024).toFixed(1);
  console.log(`${key}: ${kb} KiB gzip (limite ${(budgets[key]/1024).toFixed(0)} KiB)`);
  assert.ok(value <= budgets[key], `Orçamento ${key} excedido.`);
}
console.log('Medição local de tamanho comprimido; não substitui métricas em redes e dispositivos reais.');
