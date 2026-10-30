// Medição de audiência agregada, sem cookies e opcional.
//
// O que é enviado: uma visita por carregamento e o nome da seção aberta.
// O que nunca é enviado: registros de estudo, identificadores locais,
// parâmetros de URL (inclusive o `code` do retorno do Google), e-mail ou
// qualquer dado da conta. O pacote só é carregado sob demanda, na publicação
// real no Vercel, e nunca no desenvolvimento, em prévias ou por quem recusou.

const LOCAL_HOST = /(?:^|\.)(?:localhost|local|test|invalid|example)$/;
const SLUG = /^[a-z]{2,30}(?:-[a-z]{2,30}){0,3}$/;

const isLocalHost = host => host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]' || LOCAL_HOST.test(host);

// `VERCEL_ENV` é trocado no build; fora do Vercel o valor é 'local'.
export const deployEnvironment = () => (typeof __HELP_RDS_ENV__ === 'string' ? __HELP_RDS_ENV__ : 'local');

export function analyticsAllowed({ environment, protocol, hostname, allowedHosts = [], enabled = true, doNotTrack, globalPrivacyControl } = {}) {
  if (!enabled) return false;
  if (String(environment) !== 'production') return false;
  if (String(protocol) !== 'https:') return false;
  const host = String(hostname || '').toLowerCase();
  if (!host || isLocalHost(host)) return false;
  const list = allowedHosts.map(item => String(item ?? '').trim().toLowerCase()).filter(Boolean);
  if (list.length && !list.includes(host)) return false;
  const dnt = String(doNotTrack ?? '').toLowerCase();
  if (dnt === '1' || dnt === 'yes') return false;
  if (globalPrivacyControl === true) return false;
  return true;
}

// A navegação usa o fragmento (`#/tool/anotacoes?item=<id>`). Somente o nome da
// seção sai do navegador: o identificador do registro local é descartado e o
// segundo trecho só é aceito para o slug fixo de uma ferramenta.
export function publicRoute(hash) {
  const clean = String(hash ?? '').replace(/^#\/?/, '').split('?')[0].replace(/\/+$/, '');
  const segments = clean.split('/').filter(Boolean);
  if (!segments.length) return 'home';
  const [page, detail] = segments;
  if (!SLUG.test(page)) return 'outros';
  if (segments.length === 2 && page === 'tool' && SLUG.test(detail)) return `${page}/${detail}`;
  return page;
}

export function createMeasurement(options = {}) {
  const settings = { enabled: true, load: () => import('@vercel/analytics'), ...options };
  let client = null;
  let loading = null;
  let active = false;
  let lastRoute = '';

  async function start() {
    if (!analyticsAllowed(settings)) return false;
    if (!client) {
      if (!loading) {
        loading = Promise.resolve()
          .then(() => settings.load())
          .then(module => { client = module; module.inject(); return true; })
          .catch(() => { loading = null; return false; });
      }
      await loading;
    }
    active = Boolean(client);
    return active;
  }

  function route(hash) {
    if (!active || typeof client?.track !== 'function') return false;
    const name = publicRoute(hash);
    if (!name || name === lastRoute) return false;
    lastRoute = name;
    try { client.track('rota', { rota: name }); return true; } catch { return false; }
  }

  function stop() {
    // O script já carregado não é removido; apenas paramos de enviar rotas.
    // O carregamento atual pode ter sido contabilizado antes da recusa.
    active = false;
    lastRoute = '';
  }

  function setEnabled(value) {
    settings.enabled = Boolean(value);
    if (!settings.enabled) stop();
    return settings.enabled;
  }

  return { start, route, stop, setEnabled, allowed: () => analyticsAllowed(settings) };
}
