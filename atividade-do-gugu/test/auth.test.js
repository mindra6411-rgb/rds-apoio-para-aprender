import test from 'node:test';
import assert from 'node:assert/strict';
import { validAuthConfig, inspectAuthCallback, redirectUrl, callbackDestination, validateAccountForm, accountError, accountApi } from '../src/auth.js';
import { accountPage, accountLink } from '../src/auth-pages.js';

test('autenticação aceita somente URL HTTPS limpa e chave publicável', () => {
  assert.equal(validAuthConfig('https://example.supabase.co', 'sb_publishable_example'), true);
  assert.equal(validAuthConfig('http://example.supabase.co', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://user:password@example.supabase.co', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://example.supabase.co/path', 'sb_publishable_example'), false);
  assert.equal(validAuthConfig('https://example.supabase.co', 'sb_secret_example'), false);
  assert.equal(validAuthConfig('', ''), false);
});

test('retornos da autenticação são separados das rotas e não preservam tokens', () => {
  assert.equal(inspectAuthCallback('https://example.test/#/conta'), null);
  const callback = inspectAuthCallback('https://example.test/#access_token=private&refresh_token=private&type=recovery');
  assert.deepEqual(callback, { hasError: false, hasToken: true, purpose: 'recovery' });
  assert.equal(JSON.stringify(callback).includes('private'), false);
  assert.deepEqual(inspectAuthCallback('https://example.test/#error=access_denied&error_code=otp_expired'), { hasError: true, hasToken: false, purpose: 'confirmation' });
  assert.equal(redirectUrl('https://example.test/subdir/?a=b#/conta'), 'https://example.test/subdir/');
  assert.equal(callbackDestination('https://example.test/subdir/#access_token=private', 'conta/redefinir'), '/subdir/#/conta/redefinir');
});

test('formulários validam e-mail, senha e confirmação sem impedir senhas antigas no login', () => {
  assert.match(validateAccountForm('sign-in', { email: 'inválido', password: 'a' }), /e-mail/i);
  assert.equal(validateAccountForm('sign-in', { email: 'test@example.test', password: 'short' }), '');
  assert.match(validateAccountForm('sign-up', { email: 'test@example.test', password: '123', confirmPassword: '123' }), /8 caracteres/);
  assert.match(validateAccountForm('new-password', { password: '12345678', confirmPassword: 'diferente' }), /não coincidem/);
  assert.equal(validateAccountForm('new-password', { password: '12345678', confirmPassword: '12345678' }), '');
  assert.equal(validateAccountForm('recovery', { email: ' test@example.test ' }), '');
});

test('erros do provedor são traduzidos sem expor texto arbitrário', () => {
  assert.match(accountError({ code: 'invalid_credentials' }), /inválidos/);
  assert.match(accountError({ code: 'email_not_confirmed' }), /Confirme/);
  assert.match(accountError({ status: 429 }), /Aguarde/);
  assert.equal(accountError({ message: '<script>privado</script>' }).includes('script'), false);
});

test('adaptador chama o serviço de autenticação e não envia outras informações', async () => {
  const calls = [];
  const fake = { auth: {
    signInWithPassword: async value => { calls.push(['sign-in', value]); return { data: {}, error: null }; },
    signUp: async value => { calls.push(['sign-up', value]); return { data: {}, error: null }; },
    resetPasswordForEmail: async (...args) => { calls.push(['recovery', ...args]); return { error: null }; },
    updateUser: async value => { calls.push(['update', value]); return { error: null }; },
    signOut: async value => { calls.push(['sign-out', value]); return { error: null }; },
  } };
  const api = accountApi(fake, 'https://example.test/');
  await api.signIn({ email: ' test@example.test ', password: 'password', unused: 'não enviar' });
  await api.signUp({ email: 'test@example.test', password: 'password', confirmPassword: 'password' });
  await api.requestRecovery({ email: ' test@example.test ' });
  await api.changePassword({ password: 'new-password' });
  await api.signOut();
  assert.deepEqual(calls, [
    ['sign-in', { email: 'test@example.test', password: 'password' }],
    ['sign-up', { email: 'test@example.test', password: 'password', options: { emailRedirectTo: 'https://example.test/' } }],
    ['recovery', 'test@example.test', { redirectTo: 'https://example.test/' }],
    ['update', { password: 'new-password' }],
    ['sign-out', { scope: 'local' }],
  ]);
});

test('páginas avisam sobre dados locais e escapam e-mail retornado pelo serviço', () => {
  const signedIn = accountPage({ configured: true, ready: true, user: { email: '<img src=x onerror=alert(1)>' } });
  assert.doesNotMatch(signedIn, /<img/);
  assert.match(signedIn, /&lt;img/);
  assert.match(signedIn, /não são sincronizados nem protegidos pelo login/);
  assert.match(accountPage({ configured: false, ready: true }), /indisponível/);
  assert.match(accountPage({ configured: true, ready: true, mode: 'redefinir', recovery: false }), /link não está ativo/);
  assert.match(accountLink(null), /Entrar/);
});
