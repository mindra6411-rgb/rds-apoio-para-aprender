// Google OAuth e PKCE com respostas simuladas do Supabase. Não usa contas reais.
// Requer playwright-core, @axe-core/playwright, CHROMIUM_PATH e um servidor de
// teste com VITE_SUPABASE_URL=https://qa.supabase.co e chave publicável fictícia.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
const authOrigin = process.env.MOCK_SUPABASE_URL || 'https://qa.supabase.co';
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
const requests = [];
const user = { id: 'mock-google-user', email: 'student@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'google', providers: ['google'] }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const session = () => ({ access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user });
const headers = { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
let behavior = 'success';
let lastChallenge = '';
const mockAuth = async route => {
  const req = route.request();
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers, body: '{}' });
  const url = new URL(req.url());
  let data = {}; try { data = req.postDataJSON() || {}; } catch {}
  requests.push({ path: url.pathname, method: req.method(), search: url.search, data });
  if (url.pathname.endsWith('/authorize')) {
    const target = new URL(url.searchParams.get('redirect_to'));
    lastChallenge = url.searchParams.get('code_challenge');
    if (behavior === 'cancel') {
      target.searchParams.set('error', 'access_denied');
      target.searchParams.set('error_description', '<script>mensagem externa</script>');
    } else {
      target.searchParams.set('code', behavior === 'invalid' ? 'invalid-code' : 'valid-code');
    }
    return route.fulfill({ status: 302, headers: { location: target.toString() }, body: '' });
  }
  if (url.pathname.endsWith('/token')) {
    const actualChallenge = createHash('sha256').update(data.code_verifier || '').digest('base64url');
    if (url.searchParams.get('grant_type') !== 'pkce' || data.auth_code !== 'valid-code' || actualChallenge !== lastChallenge) {
      return route.fulfill({ status: 400, headers, body: JSON.stringify({ code: 'bad_code_verifier', error_description: '<script>erro externo</script>' }) });
    }
    return route.fulfill({ status: 200, headers, body: JSON.stringify(session()) });
  }
  if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204, headers, body: '' });
  if (url.pathname.endsWith('/user')) return route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
  return route.fulfill({ status: 404, headers, body: '{}' });
};
await context.route(`${authOrigin}/auth/v1/**`, mockAuth);
const go = async route => { await page.goto(`${base}#/${route}`, { waitUntil: 'domcontentloaded' }); await page.locator('#main-content').waitFor(); };
const googleButton = () => page.getByRole('button', { name: 'Entrar com Google' });
const assertGooglePage = async () => {
  await googleButton().waitFor();
  assert.equal(await page.locator('#account-form input').count(), 0);
  assert.equal(await page.locator('#account-form button').count(), 1);
  assert.equal(await page.locator('a[href^="#/conta/"]').count(), 0);
};
const assertCleanUrl = () => {
  const url = new URL(page.url());
  assert.equal(url.search, '');
  assert.ok(!url.hash.includes('token'));
};

try {
  await go('home');
  const oldNotes = JSON.stringify([{ id: 'old', titulo: 'Dado anterior' }]);
  await page.evaluate(value => {
    localStorage.setItem('help-rds:records:notes', value);
    sessionStorage.setItem('help-rds-auth-session', 'sessão-antiga-preservada');
  }, oldNotes);
  await page.locator('#account-link').click();
  await assertGooglePage();
  assert.match(await page.locator('.auth-aside').innerText(), /não são sincronizados nem protegidos pelo login/);
  // Favoritos/endereço antigos de conta levam à mesma interface, sem reativar formulários.
  for (const route of ['conta/entrar', 'conta/cadastro', 'conta/recuperar', 'conta/redefinir']) {
    await go(route); await assertGooglePage();
  }

  await go('conta'); await assertGooglePage();
  // Ativação por teclado, como também ocorreria ao clicar.
  await googleButton().focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(url => url.hash === '#/home');
  await page.getByText('Você entrou com Google.').waitFor();
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content');
  assertCleanUrl();
  const authorize = requests.find(item => item.path.endsWith('/authorize'));
  assert.ok(authorize);
  const authorizeUrl = new URL(`${authOrigin}${authorize.path}${authorize.search}`);
  assert.equal(authorizeUrl.searchParams.get('provider'), 'google');
  assert.equal(authorizeUrl.searchParams.get('prompt'), 'select_account');
  assert.equal(authorizeUrl.searchParams.get('redirect_to'), base);
  assert.equal(authorizeUrl.searchParams.get('code_challenge_method'), 's256');
  assert.ok(authorizeUrl.searchParams.get('code_challenge'));
  assert.equal(requests.filter(item => item.path.endsWith('/token')).length, 1);
  const stored = await page.evaluate(() => ({
    session: JSON.parse(sessionStorage.getItem('help-rds-google-auth-session')),
    oldSession: sessionStorage.getItem('help-rds-auth-session'),
    notes: localStorage.getItem('help-rds:records:notes'),
    authInLocalStorage: localStorage.getItem('help-rds-google-auth-session'),
  }));
  assert.equal(stored.session.user.id, user.id);
  assert.equal(stored.oldSession, 'sessão-antiga-preservada');
  assert.equal(stored.notes, oldNotes);
  assert.equal(stored.authInLocalStorage, null);

  // A sessão é mantida ao recarregar a aba, mas não é compartilhada com outra aba.
  await go('conta'); await page.getByText('Você está conectado.').waitFor();
  assert.equal(await page.locator('.auth-email').innerText(), user.email);
  await page.reload(); await page.getByText('Você está conectado.').waitFor();
  const anotherTab = await context.newPage();
  await anotherTab.goto(`${base}#/conta`);
  await anotherTab.getByRole('button', { name: 'Entrar com Google' }).waitFor();
  await anotherTab.close();

  // Um código sem verificador não deve ser confundido com a sessão já existente.
  const countBeforeReplay = requests.filter(item => item.path.endsWith('/token')).length;
  await page.goto(`${base}?code=without-verifier&state=privado#/home`);
  await page.getByText(/O retorno pode ter expirado/).waitFor();
  assert.equal(new URL(page.url()).hash, '#/conta'); assertCleanUrl();
  assert.equal(requests.filter(item => item.path.endsWith('/token')).length, countBeforeReplay);
  assert.equal(await page.locator('.auth-email').innerText(), user.email);

  await page.locator('[data-action="account-signout"]').click(); await assertGooglePage();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('help-rds-google-auth-session')), null);
  assert.equal(await page.evaluate(() => localStorage.getItem('help-rds:records:notes')), oldNotes);

  // Segundo acesso simulado devolve o mesmo ID. A criação/vinculação real cabe ao Supabase.
  await googleButton().click(); await page.waitForURL(url => url.hash === '#/home');
  await go('conta'); await page.getByText('Você está conectado.').waitFor();
  const secondId = await page.evaluate(() => JSON.parse(sessionStorage.getItem('help-rds-google-auth-session')).user.id);
  assert.equal(secondId, user.id);
  await page.locator('[data-action="account-signout"]').click(); await assertGooglePage();

  behavior = 'cancel';
  await googleButton().click();
  await page.getByText('A entrada com Google foi cancelada. Você pode tentar novamente.').waitFor();
  assertCleanUrl();
  assert.doesNotMatch(await page.locator('#auth-feedback').innerText(), /script|mensagem externa/);

  behavior = 'invalid';
  await googleButton().click();
  await page.getByText(/O retorno pode ter expirado/).waitFor();
  assert.equal(new URL(page.url()).hash, '#/conta'); assertCleanUrl();
  assert.doesNotMatch(await page.locator('#auth-feedback').innerText(), /script|erro externo/);
  assert.equal(await page.locator('.auth-email').count(), 0);

  await page.goto(`${base}#access_token=antigo&refresh_token=antigo&type=recovery`);
  await page.getByText('Este link de acesso antigo não é mais aceito. Entre com Google.').waitFor();
  assertCleanUrl(); await assertGooglePage();

  // Sem armazenamento de aba, não prometa um fluxo PKCE que não sobreviveria ao redirecionamento.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }));
  await blocked.route(`${authOrigin}/auth/v1/**`, mockAuth);
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(`${base}#/conta`);
  await blockedPage.getByText(/bloqueou o armazenamento da sessão/).waitFor();
  assert.equal(await blockedPage.getByRole('button', { name: 'Entrar com Google' }).count(), 0);
  await blockedPage.goto(`${base}?code=lost-verifier#/home`);
  await blockedPage.getByText(/bloqueou o armazenamento da sessão/).waitFor();
  assert.equal(new URL(blockedPage.url()).search, '');
  await blockedPage.goto(`${base}#/home`);
  await blockedPage.locator('#main-content').waitFor();
  await blocked.close();

  // Não permita o fallback PKCE sem SHA-256 quando Web Crypto estiver ausente.
  const noCrypto = await browser.newContext();
  await noCrypto.addInitScript(() => Object.defineProperty(window.crypto, 'subtle', { value: undefined, configurable: true }));
  const noCryptoPage = await noCrypto.newPage();
  await noCryptoPage.goto(`${base}#/conta`);
  await noCryptoPage.getByText(/precisa de uma conexão segura/).waitFor();
  assert.equal(await noCryptoPage.getByRole('button', { name: 'Entrar com Google' }).count(), 0);
  await noCrypto.close();

  assert.ok(requests.every(item => !['/signup', '/recover', '/verify'].some(endpoint => item.path.endsWith(endpoint))));
  assert.ok(requests.filter(item => item.path.endsWith('/token')).every(item => new URLSearchParams(item.search).get('grant_type') === 'pkce'));

  const violations = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => localStorage.setItem('help-rds:preferences', JSON.stringify({ theme, favorites: [], recent: [] })), theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['conta', 'conta/entrar', 'conta/cadastro', 'conta/recuperar', 'conta/redefinir']) {
        await go(route); await assertGooglePage();
        const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(size.scroll <= size.client + 1, `${route}, ${theme}, ${width}px: overflow ${JSON.stringify(size)}`);
        if (route === 'conta' && (width === 390 || width === 1440)) {
          const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          violations.push(...result.violations.map(item => `${route} ${theme} ${width}: ${item.id} ${item.nodes.map(n => n.target.join(' ')).join(', ')}`));
        }
      }
    }
  }
  assert.deepEqual(violations, []);
  assert.deepEqual(pageErrors, []);
  console.log('Conta: OAuth/PKCE simulado, retorno, repetição, cancelamento, erros, sessão, saída, dados locais, acessibilidade e larguras verificados. Nenhuma conta real criada.');
} finally { await browser.close(); }
