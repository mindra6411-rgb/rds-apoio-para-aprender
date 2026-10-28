import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

function worker(scope = 'https://example.test/help-rds/') {
  const handlers = {};
  const cachedAsset = { value: 'arquivo público' };
  const cachedPage = { value: 'página pública' };
  const assetUrl = new URL('assets/app.js', scope).href;
  const cache = {
    async match(request, options = {}) {
      const url = typeof request === 'string' ? request : request.url;
      if (url === scope) return cachedPage;
      if (url !== assetUrl) return undefined;
      // O precache não tem Origin, enquanto a requisição do módulo tem.
      // Uma resposta Vary: Origin não coincide sem ignorar Vary.
      const origin = typeof request === 'string' ? null : request.headers?.get('origin');
      return origin && !options.ignoreVary ? undefined : cachedAsset;
    },
  };
  const self = { registration: { scope }, addEventListener: (name, handler) => { handlers[name] = handler; } };
  const source = readFileSync(new URL('../src/offline-sw.js', import.meta.url), 'utf8')
    .replace('__OFFLINE_ASSETS__', JSON.stringify(['./assets/app.js']))
    .replace('__OFFLINE_VERSION__', 'teste');
  runInNewContext(source, {
    self, URL,
    caches: { open: async () => cache },
    fetch: async () => { throw new Error('Sem conexão'); },
  });
  const dispatch = request => {
    let response;
    handlers.fetch({ request, respondWith: promise => { response = promise; } });
    return response;
  };
  return { assetUrl, cachedAsset, cachedPage, dispatch };
}

test('cache offline serve arquivos públicos com Vary: Origin mesmo com Origin no pedido', async () => {
  const { assetUrl, cachedAsset, dispatch } = worker();
  const request = { url: assetUrl, method: 'GET', mode: 'cors', headers: { get: () => 'https://example.test' } };
  assert.equal(await dispatch(request), cachedAsset);
});

test('a entrada pública tem fallback offline; URLs externas, parametrizadas e POST não são interceptadas', async () => {
  const { assetUrl, cachedPage, dispatch } = worker();
  const scope = 'https://example.test/help-rds/';
  assert.equal(await dispatch({ url: scope, method: 'GET', mode: 'navigate' }), cachedPage);
  for (const request of [
    { url: `${assetUrl}?token=ficticio`, method: 'GET', mode: 'cors' },
    { url: 'https://outro.example/assets/app.js', method: 'GET', mode: 'cors' },
    { url: assetUrl, method: 'POST', mode: 'cors' },
    { url: 'https://example.test/help-rds/auth', method: 'GET', mode: 'cors' },
  ]) assert.equal(dispatch(request), undefined);
});
