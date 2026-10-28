import test from 'node:test';
import assert from 'node:assert/strict';
import { AUTH_STORAGE_KEY, validAuthConfig, authStorage, hasSavedAuthSession, createBrowserAuthClient, inspectAuthCallback, redirectUrl, callbackDestination, accountError, accountApi } from '../src/auth.js';
import { accountPage, accountLink } from '../src/auth-pages.js';

function fakeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('autenticação aceita somente URL HTTPS limpa e chave publicável', () => {
  assert.equal(validAuthConfig('https://example.supabase.co', 'sb_publishable_example'), true);
  assert.equal(validAuthConfig('http://example.supabase.co', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://user:password@example.supabase.co', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://example.supabase.co/path', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://example.supabase.co?x=1', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://example.supabase.co', 'sb_secret_example'), false);
  assert.equal(validAuthConfig('', ''), false);
});

test('código PKCE é reconhecido sem ser incluído nos metadados e é removido da URL', () => {
  assert.equal(inspectAuthCallback('https://example.test/?campaign=1#/conta'), null);
  const href = 'https://example.test/subdir/?code=valor-privado&state=outro#/conta';
  const callback = inspectAuthCallback(href);
  assert.deepEqual(callback, { hasCode: true, hasError: false, hasLegacyToken: false, cancelled: false });
  assert.equal(JSON.stringify(callback).includes('valor-privado'), false);
  assert.equal(callbackDestination(href, 'home'), '/subdir/#/home');
  assert.equal(redirectUrl('https://example.test/subdir/?a=b#/conta'), 'https://example.test/subdir/');
  assert.equal(inspectAuthCallback('não é uma URL'), null);
});

test('retornos negados e links antigos são reconhecidos sem expor mensagens ou tokens', () => {
  assert.deepEqual(inspectAuthCallback('https://example.test/?error=access_denied&error_description=texto-privado'),
    { hasCode: false, hasError: true, hasLegacyToken: false, cancelled: true });
  assert.deepEqual(inspectAuthCallback('https://example.test/#error=access_denied&error_code=outro'),
    { hasCode: false, hasError: true, hasLegacyToken: false, cancelled: true });
  const legacy = inspectAuthCallback('https://example.test/#access_token=privado&refresh_token=privado&type=recovery');
  assert.deepEqual(legacy, { hasCode: false, hasError: false, hasLegacyToken: true, cancelled: false });
  assert.equal(JSON.stringify(legacy).includes('privado'), false);
  assert.equal(callbackDestination('https://example.test/subdir/?code=privado#access_token=privado'), '/subdir/#/conta');
});

test('armazenamento da aba preserva dados existentes e reconhece apenas a sessão Google', () => {
  const storage = fakeStorage({ 'help-rds-auth-session': 'sessão-antiga', 'outro-dado': 'mantido' });
  const browser = { sessionStorage: storage };
  assert.equal(authStorage(browser), storage);
  assert.deepEqual([...storage.values.entries()], [['help-rds-auth-session', 'sessão-antiga'], ['outro-dado', 'mantido']]);
  assert.equal(hasSavedAuthSession(browser), false);
  storage.setItem(AUTH_STORAGE_KEY, 'sessão-do-sdk');
  assert.equal(hasSavedAuthSession(browser), true);
  assert.notEqual(AUTH_STORAGE_KEY, 'help-rds-auth-session');
});

test('armazenamento bloqueado não é tratado como se sobrevivesse ao redirecionamento', () => {
  const browser = { get sessionStorage() { throw new Error('bloqueado'); } };
  assert.equal(authStorage(browser), null);
  assert.equal(hasSavedAuthSession(browser), false);
  const fullStorage = { setItem() { throw new Error('sem espaço'); } };
  assert.equal(authStorage({ sessionStorage: fullStorage }), null);
  assert.equal(authStorage({}), null);
});

test('cliente não é criado com configuração inválida', async () => {
  assert.deepEqual(await createBrowserAuthClient('https://example.supabase.co', 'sb_secret_example'), { client: null, problem: 'configuration' });
});

test('cliente recusa contexto inseguro e armazenamento bloqueado antes de iniciar OAuth', async () => {
  const originalSecure = Object.getOwnPropertyDescriptor(globalThis, 'isSecureContext');
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    Object.defineProperty(globalThis, 'isSecureContext', { value: false, configurable: true });
    assert.deepEqual(await createBrowserAuthClient('https://example.supabase.co', 'sb_publishable_example'), { client: null, problem: 'secure' });
    Object.defineProperty(globalThis, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(globalThis, 'window', { value: { get sessionStorage() { throw new Error('bloqueado'); } }, configurable: true });
    assert.deepEqual(await createBrowserAuthClient('https://example.supabase.co', 'sb_publishable_example'), { client: null, problem: 'storage' });
  } finally {
    if (originalSecure) Object.defineProperty(globalThis, 'isSecureContext', originalSecure); else delete globalThis.isSecureContext;
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete globalThis.window;
  }
});

test('erros são traduzidos sem expor texto arbitrário do provedor', () => {
  assert.match(accountError({ status: 429 }), /Aguarde/);
  assert.match(accountError({ code: 'over_email_send_rate_limit' }), /Aguarde/);
  assert.match(accountError({ message: '<script>privado</script>' }), /Google/);
  assert.doesNotMatch(accountError({ message: '<script>privado</script>' }), /script|privado/);
});

test('adaptador usa apenas Google OAuth, troca PKCE pelo SDK e sai da sessão local', async () => {
  const calls = [];
  const fake = { auth: {
    signInWithOAuth: async value => { calls.push(['oauth', value]); return { data: { url: 'https://example.test' }, error: null }; },
    exchangeCodeForSession: async code => { calls.push(['exchange', code]); return { data: {}, error: null }; },
    signOut: async value => { calls.push(['sign-out', value]); return { error: null }; },
  } };
  const api = accountApi(fake, 'https://example.test/subdir/');
  await api.signInWithGoogle();
  await api.exchangeCode('código-de-teste');
  await api.signOut();
  assert.deepEqual(calls, [
    ['oauth', { provider: 'google', options: { redirectTo: 'https://example.test/subdir/', queryParams: { prompt: 'select_account' } } }],
    ['exchange', 'código-de-teste'],
    ['sign-out', { scope: 'local' }],
  ]);
  assert.deepEqual(Object.keys(api).sort(), ['exchangeCode', 'signInWithGoogle', 'signOut']);
});

test('página de visitante oferece somente Google e explica os limites dos dados locais', () => {
  const guest = accountPage({ configured: true, ready: true, user: null });
  assert.match(guest, /Entrar com Google/);
  assert.doesNotMatch(guest, /<input|type="password"|conta\/(cadastro|recuperar|redefinir)/);
  assert.match(guest, /não são sincronizados nem protegidos pelo login/);
  assert.match(accountLink(null), /Entrar com Google/);
});

test('páginas escapam dados do usuário e apresentam erros de configuração ou armazenamento', () => {
  const signedIn = accountPage({ configured: true, ready: true, user: { email: '<img src=x onerror=alert(1)>' }, notice: { text: '<script>não</script>' } });
  assert.doesNotMatch(signedIn, /<img|<script>/);
  assert.match(signedIn, /&lt;img/);
  assert.match(signedIn, /&lt;script&gt;/);
  assert.match(accountPage({ configured: false, ready: true }), /indisponível/);
  assert.match(accountPage({ configured: true, ready: true, problem: 'storage' }), /bloqueou o armazenamento/);
  assert.match(accountPage({ configured: true, ready: true, problem: 'secure' }), /conexão segura/);
});
