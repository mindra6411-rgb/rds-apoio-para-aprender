// O cache é opt-in, isolado pelo caminho do aplicativo e limitado a arquivos públicos.
const appScope = () => new URL('./', document.baseURI);
const cachePrefix = () => `help-rds-static:${encodeURIComponent(appScope().pathname)}:`;
const workerUrl = () => new URL('sw.js', appScope()).href;
const supported = () => 'serviceWorker' in navigator && 'caches' in window && window.isSecureContext;

async function ownRegistration() {
  const registration = await navigator.serviceWorker.getRegistration(appScope().href);
  const script = registration?.active?.scriptURL || registration?.waiting?.scriptURL || registration?.installing?.scriptURL;
  return script === workerUrl() ? registration : null;
}
async function hasPreparedCache() {
  const names = (await caches.keys()).filter(name => name.startsWith(cachePrefix()));
  for (const name of names) if (await (await caches.open(name)).match(appScope().href)) return true;
  return false;
}
function waitForWorker(worker) {
  return new Promise((resolve, reject) => {
    if (!worker) { reject(new Error('O navegador não iniciou o acesso offline.')); return; }
    const timer = setTimeout(() => { worker.removeEventListener('statechange', check); reject(new Error('O preparo demorou demais. Confira a conexão e tente novamente.')); }, 45000);
    function check() {
      if (worker.state !== 'activated' && worker.state !== 'redundant') return;
      clearTimeout(timer); worker.removeEventListener('statechange', check);
      if (worker.state === 'activated') resolve();
      else reject(new Error('Não foi possível preparar a cópia offline. Confira sua conexão.'));
    }
    worker.addEventListener('statechange', check); check();
  });
}
function waitForController() {
  return new Promise((resolve, reject) => {
    const worker = navigator.serviceWorker;
    if (worker.controller?.scriptURL === workerUrl()) { resolve(); return; }
    const timer = setTimeout(() => { worker.removeEventListener('controllerchange', check); reject(new Error('A cópia foi preparada, mas ainda não controla esta aba. Recarregue conectado e tente novamente.')); }, 15000);
    function check() {
      if (worker.controller?.scriptURL !== workerUrl()) return;
      clearTimeout(timer); worker.removeEventListener('controllerchange', check); resolve();
    }
    worker.addEventListener('controllerchange', check); check();
  });
}
export async function offlineStatus() {
  if (!supported()) return 'unsupported';
  return await ownRegistration() && await hasPreparedCache() ? 'ready' : 'disabled';
}
export async function enableOffline() {
  if (!supported()) throw new Error('Este navegador não oferece o acesso offline seguro.');
  if (!navigator.onLine) throw new Error('Conecte-se à internet para preparar a cópia offline.');
  let registration = await ownRegistration();
  const current = await navigator.serviceWorker.getRegistration(appScope().href);
  if (current && current.scope === appScope().href && !registration) throw new Error('Já existe outro serviço offline neste caminho; a configuração não foi alterada.');
  // Um cache apagado manualmente não pode ser reconstruído por um worker já ativo.
  if (registration && !await hasPreparedCache()) { await registration.unregister(); registration = null; }
  if (!registration) registration = await navigator.serviceWorker.register(workerUrl(), { scope:appScope().pathname });
  await waitForWorker(registration.installing || registration.waiting || registration.active);
  await waitForController();
  if (!await hasPreparedCache()) throw new Error('A cópia offline não ficou disponível. Tente novamente conectado.');
}
export async function disableOffline() {
  if (!supported()) throw new Error('Este navegador não oferece o acesso offline seguro.');
  const registration = await ownRegistration();
  if (registration) await registration.unregister();
  await Promise.all((await caches.keys()).filter(name => name.startsWith(cachePrefix())).map(name => caches.delete(name)));
}
