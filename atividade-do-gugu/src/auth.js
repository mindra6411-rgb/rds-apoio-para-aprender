// As variáveis VITE_ são públicas. Nunca aceite uma chave de serviço no navegador.
export function validAuthConfig(url, key) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
      parsed.pathname === '/' && !parsed.search && !parsed.hash &&
      typeof key === 'string' && key.startsWith('sb_publishable_');
  } catch { return false; }
}

// Não reutiliza a chave da sessão antiga de e-mail/senha. Os dados de estudo
// usam outro prefixo e não são alterados pelo login ou logout.
export const AUTH_STORAGE_KEY = 'help-rds-google-auth-session';

export function authStorage(browser = globalThis.window) {
  try {
    const storage = browser?.sessionStorage;
    if (!storage) return null;
    const probe = `help-rds-auth-probe-${Math.random().toString(36).slice(2)}`;
    storage.setItem(probe, '1');
    const works = storage.getItem(probe) === '1';
    storage.removeItem(probe);
    return works ? storage : null;
  } catch { return null; }
}

export function hasSavedAuthSession(browser = globalThis.window) {
  try { return Boolean(browser?.sessionStorage?.getItem(AUTH_STORAGE_KEY)); }
  catch { return false; }
}

export async function createBrowserAuthClient(url, key) {
  if (!validAuthConfig(url, key)) return { client: null, problem: 'configuration' };
  // Evite a alternativa PKCE "plain" quando Web Crypto não estiver disponível.
  if (!globalThis.isSecureContext || !globalThis.crypto?.subtle ||
      typeof globalThis.crypto?.getRandomValues !== 'function' ||
      typeof globalThis.TextEncoder !== 'function' || typeof globalThis.btoa !== 'function') {
    return { client: null, problem: 'secure' };
  }
  const storage = authStorage();
  // O verificador PKCE precisa sobreviver ao redirecionamento na mesma aba.
  // Uma sessão somente em memória faria o retorno do Google falhar.
  if (!storage) return { client: null, problem: 'storage' };
  try {
    // O SDK só é baixado quando a conta ou uma sessão existente precisa dele.
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, key, {
      auth: {
        storage, storageKey: AUTH_STORAGE_KEY, persistSession: true,
        autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce',
      },
    });
    return { client, problem: null };
  } catch { return { client: null, problem: 'unavailable' }; }
}

// Retém somente metadados: códigos, tokens e mensagens externas não entram no estado da UI.
export function inspectAuthCallback(href) {
  try {
    const url = new URL(href);
    const query = url.searchParams;
    const fragment = !url.hash.startsWith('#/') ? new URLSearchParams(url.hash.slice(1)) : new URLSearchParams();
    const sources = [query, fragment];
    const hasCode = query.has('code');
    const hasError = sources.some(params => ['error', 'error_code', 'error_description'].some(key => params.has(key)));
    const hasLegacyToken = sources.some(params => params.has('access_token') || params.has('refresh_token'));
    if (!hasCode && !hasError && !hasLegacyToken) return null;
    const cancelled = sources.some(params => params.get('error') === 'access_denied' || params.get('error_code') === 'access_denied');
    return { hasCode, hasError, hasLegacyToken, cancelled };
  } catch { return null; }
}

export function redirectUrl(href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  return url.toString();
}

// Não conserva o código nem outros parâmetros de um retorno de autenticação.
export function callbackDestination(href, route = 'conta') {
  const url = new URL(href);
  url.hash = `/${route}`;
  return `${url.pathname}${url.hash}`;
}

export function accountError(error) {
  const code = String(error?.code || '').toLowerCase();
  if (code.includes('rate_limit') || error?.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  return 'Não foi possível entrar com Google agora. Confira sua conexão e tente novamente.';
}

// O SDK executa OAuth, troca o código PKCE e gerencia a sessão. O aplicativo
// não recolhe senhas nem implementa associação de identidades por e-mail.
export function accountApi(client, callbackUrl) {
  return {
    async signInWithGoogle() {
      return client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl, queryParams: { prompt: 'select_account' } },
      });
    },
    async exchangeCode(code) {
      return client.auth.exchangeCodeForSession(code);
    },
    async signOut() {
      return client.auth.signOut({ scope: 'local' });
    },
  };
}
