// Apenas arquivos públicos da aplicação são armazenados. Dados de estudo,
// chamadas de autenticação e quaisquer URLs com parâmetros não entram no cache.
const assetFiles = __OFFLINE_ASSETS__;
const version = '__OFFLINE_VERSION__';
const scopeUrl = new URL(self.registration.scope);
const prefix = `help-rds-static:${encodeURIComponent(scopeUrl.pathname)}:`;
const cacheName = prefix + version;
const publicFiles = new Set(assetFiles.map(file => new URL(file, scopeUrl).href));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    try {
      await cache.addAll([scopeUrl.href, ...publicFiles]);
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(cacheName);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)));
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scopeUrl.origin || url.search) return;
  const isAppEntry = request.mode === 'navigate' && (url.pathname === scopeUrl.pathname || url.pathname === `${scopeUrl.pathname}index.html`);
  if (isAppEntry) {
    event.respondWith(fetch(request).catch(async () => (await caches.open(cacheName)).match(scopeUrl.href)));
  } else if (publicFiles.has(url.href)) {
    event.respondWith((async () => (await (await caches.open(cacheName)).match(request)) || fetch(request))());
  }
});
