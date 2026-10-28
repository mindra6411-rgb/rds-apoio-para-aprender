// Fluxos de conta com respostas simuladas do provedor. Não cria usuários reais.
// Requer playwright-core, @axe-core/playwright, CHROMIUM_PATH e VITE_SUPABASE_* configuradas.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
const requests = [];
const user = { id: 'test-user', email: 'student@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const session = () => ({ access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now()/1000) + 3600, user });
const headers = { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const mockAuth = async route => {
  const req = route.request();
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers, body: '{}' });
  const url = new URL(req.url());
  let data = {}; try { data = req.postDataJSON() || {}; } catch {}
  requests.push({ path: url.pathname, method: req.method(), data });
  if (url.pathname.endsWith('/token') && data.password === 'wrong') return route.fulfill({ status: 400, headers, body: JSON.stringify({ code: 'invalid_credentials', error_description: 'Invalid login credentials' }) });
  if (url.pathname.endsWith('/token')) return route.fulfill({ status: 200, headers, body: JSON.stringify(session()) });
  if (url.pathname.endsWith('/signup')) return route.fulfill({ status: 200, headers, body: JSON.stringify({ ...user, identities: [] }) });
  if (url.pathname.endsWith('/recover')) return route.fulfill({ status: 200, headers, body: '{}' });
  if (url.pathname.endsWith('/logout')) return route.fulfill({ status: 204, headers, body: '' });
  if (url.pathname.endsWith('/user')) return route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
  return route.fulfill({ status: 404, headers, body: '{}' });
};
await context.route('https://*.supabase.co/auth/v1/**', mockAuth);
const go = async route => { await page.goto(`${base}#/${route}`, { waitUntil: 'domcontentloaded' }); await page.locator('#main-content').waitFor(); };
const fill = async (field, value) => page.locator(`#account-form [name="${field}"]`).fill(value);
const submit = async () => page.locator('#account-form button[type="submit"]').click();
const feedback = () => page.locator('#auth-feedback');

try {
  await go('home');
  await page.evaluate(() => localStorage.setItem('help-rds:records:notes', JSON.stringify([{ id: 'old', titulo: 'Dado anterior' }])));
  await page.locator('#account-link').click();
  await page.locator('#account-form[data-mode="sign-in"]').waitFor();
  assert.match(await page.locator('.auth-aside').innerText(), /não são sincronizados nem protegidos pelo login/);

  await page.locator('a[href="#/conta/cadastro"]').last().click();
  await page.locator('#account-form[data-mode="sign-up"]').waitFor();
  await fill('email', 'student@example.test'); await fill('password', 'password123'); await fill('confirmPassword', 'different123'); await submit();
  assert.match(await feedback().innerText(), /não coincidem/);
  assert.equal(requests.filter(r => r.path.endsWith('/signup')).length, 0);
  await fill('confirmPassword', 'password123'); await submit();
  await page.waitForFunction(() => document.querySelector('#auth-feedback')?.textContent.includes('confira seu e-mail'));
  const signup = requests.find(r => r.path.endsWith('/signup'));
  assert.equal(signup.data.email, user.email);
  assert.equal(await page.locator('[name="password"]').inputValue(), '');

  await go('conta/recuperar'); await page.locator('#account-form[data-mode="recovery"]').waitFor();
  await fill('email', 'student@example.test'); await submit();
  await page.waitForFunction(() => document.querySelector('#auth-feedback')?.textContent.includes('Se for possível'));
  assert.equal(requests.filter(r => r.path.endsWith('/recover')).length, 1);

  await go('conta/entrar'); await page.locator('#account-form[data-mode="sign-in"]').waitFor();
  await fill('email', 'student@example.test'); await fill('password', 'wrong'); await submit();
  await page.waitForFunction(() => document.querySelector('#auth-feedback')?.textContent.includes('inválidos'));
  await fill('password', 'password123'); await submit();
  await page.getByText('Você está conectado.').waitFor();
  assert.equal(await page.locator('.auth-email').innerText(), user.email);
  assert.equal(await page.evaluate(() => localStorage.getItem('help-rds:records:notes')), JSON.stringify([{ id: 'old', titulo: 'Dado anterior' }]));
  assert.equal(await page.evaluate(() => Object.keys(localStorage).some(k => k.includes('auth-session'))), false);
  await page.reload(); await page.getByText('Você está conectado.').waitFor();
  await page.locator('[data-action="account-signout"]').click();
  await page.locator('#account-form[data-mode="sign-in"]').waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('help-rds-auth-session')), null);

  await page.goto(`${base}#access_token=mock-access-token&refresh_token=mock-refresh-token&expires_in=3600&token_type=bearer&type=recovery`, { waitUntil: 'domcontentloaded' });
  await page.locator('#account-form[data-mode="new-password"]').waitFor();
  assert.equal(new URL(page.url()).hash, '#/conta/redefinir');
  await fill('password', 'newpassword123'); await fill('confirmPassword', 'newpassword123'); await submit();
  await page.getByText('Senha atualizada.').waitFor();
  assert.ok(requests.some(r => r.path.endsWith('/user') && r.method === 'PUT' && r.data.password === 'newpassword123'));
  assert.ok(!page.url().includes('access_token'));

  await page.locator('[data-action="account-signout"]').click();
  await page.locator('#account-form[data-mode="sign-in"]').waitFor();
  await page.goto(`${base}#access_token=mock-access-token&refresh_token=mock-refresh-token&expires_in=3600&token_type=bearer&type=signup`, { waitUntil: 'domcontentloaded' });
  await page.getByText('E-mail confirmado. Você está conectado.').waitFor();
  assert.equal(new URL(page.url()).hash, '#/conta');
  await page.locator('[data-action="account-signout"]').click();
  await page.locator('#account-form[data-mode="sign-in"]').waitFor();
  await page.goto(`${base}#error=access_denied&error_code=otp_expired`, { waitUntil: 'domcontentloaded' });
  await page.getByText('O link é inválido ou expirou. Solicite outro link.').waitFor();
  assert.ok(!page.url().includes('error_code'));

  // Se a sessão da aba estiver bloqueada, a conta usa apenas memória e não quebra o site.
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }));
  await blocked.route('https://*.supabase.co/auth/v1/**', mockAuth);
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(`${base}#/conta/entrar`);
  await blockedPage.locator('#account-form[data-mode="sign-in"]').waitFor();
  await blockedPage.locator('[name="email"]').fill('student@example.test');
  await blockedPage.locator('[name="password"]').fill('password123');
  await blockedPage.locator('#account-form button[type="submit"]').click();
  await blockedPage.getByText('Você está conectado.').waitFor();
  await blockedPage.reload();
  await blockedPage.locator('#account-form[data-mode="sign-in"]').waitFor();
  await blocked.close();

  const violations = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => localStorage.setItem('help-rds:preferences', JSON.stringify({ theme, favorites: [], recent: [] })), theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['conta/entrar', 'conta/cadastro', 'conta/recuperar', 'conta/redefinir']) {
        await go(route);
        await page.locator('.auth-panel').waitFor();
        const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(size.scroll <= size.client + 1, `${route}, ${theme}, ${width}px: overflow ${JSON.stringify(size)}`);
        if (width === 390 || width === 1440) {
          const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          violations.push(...result.violations.map(item => `${route} ${theme} ${width}: ${item.id} ${item.nodes.map(n => n.target.join(' ')).join(', ')}`));
        }
      }
    }
  }
  assert.deepEqual(violations, []);
  assert.deepEqual(pageErrors, []);
  console.log('Conta: cadastro, entrada, sessão, saída e recuperação simulados; acessibilidade e larguras verificadas.');
} finally { await browser.close(); }
