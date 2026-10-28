// As variáveis VITE_ são públicas. Nunca aceite uma chave de serviço no navegador.
export function validAuthConfig(url, key) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password &&
      parsed.pathname === '/' && !parsed.search && !parsed.hash &&
      typeof key === 'string' && key.startsWith('sb_publishable_');
  } catch { return false; }
}

export async function createBrowserAuthClient(url, key) {
  if (!validAuthConfig(url, key)) return null;
  let storage;
  try {
    storage = window.sessionStorage;
    const probe = 'help-rds-auth-probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch { storage = undefined; }
  try {
    // O SDK só é baixado quando a conta ou uma sessão existente precisa dele.
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key, {
      auth: {
        // A sessão fica na aba; se o armazenamento estiver bloqueado, usa memória.
        storage, storageKey: 'help-rds-auth-session', persistSession: Boolean(storage),
        autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit',
      },
    });
  } catch { return null; }
}

// Captura apenas metadados do retorno; nunca guarda tokens nem mensagens remotas.
export function inspectAuthCallback(href) {
  try {
    const url = new URL(href);
    if (!url.hash || url.hash.startsWith('#/')) return null;
    const params = new URLSearchParams(url.hash.slice(1));
    const hasError = ['error', 'error_code', 'error_description'].some(k => params.has(k));
    const hasToken = params.has('access_token') || params.has('refresh_token');
    if (!hasError && !hasToken) return null;
    return { hasError, hasToken, purpose: params.get('type') === 'recovery' ? 'recovery' : 'confirmation' };
  } catch { return null; }
}

export function redirectUrl(href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function callbackDestination(href, route = 'conta') {
  const url = new URL(href);
  url.hash = `/${route}`;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function validateAccountForm(kind, values) {
  if (kind !== 'new-password') {
    const email = String(values.email || '').trim();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Informe um e-mail válido.';
  }
  if (kind === 'sign-in' && !values.password) return 'Informe sua senha.';
  if (kind === 'sign-up' || kind === 'new-password') {
    if (String(values.password || '').length < 8) return 'Use uma senha com pelo menos 8 caracteres.';
    if (values.password !== values.confirmPassword) return 'As senhas não coincidem.';
  }
  return '';
}

export function accountError(error) {
  const code = String(error?.code || '').toLowerCase();
  if (code === 'invalid_credentials' || code === 'invalid_grant' || String(error?.message || '').toLowerCase().includes('invalid login credentials')) return 'E-mail ou senha inválidos.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (code === 'weak_password') return 'Escolha uma senha mais forte.';
  if (code.includes('rate_limit') || error?.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (code === 'signup_disabled') return 'O cadastro está temporariamente indisponível.';
  if (code === 'email_address_not_authorized' || code === 'email_address_invalid') return 'Não foi possível enviar o e-mail. Confira o endereço ou procure o responsável pela plataforma.';
  return 'Não foi possível concluir agora. Confira sua conexão e tente novamente.';
}

// O servidor de autenticação valida credenciais e tokens. Nenhuma senha é guardada aqui.
export function accountApi(client, callbackUrl) {
  return {
    async signIn({ email, password }) {
      return client.auth.signInWithPassword({ email: email.trim(), password });
    },
    async signUp({ email, password }) {
      return client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: callbackUrl } });
    },
    async requestRecovery({ email }) {
      return client.auth.resetPasswordForEmail(email.trim(), { redirectTo: callbackUrl });
    },
    async changePassword({ password }) {
      return client.auth.updateUser({ password });
    },
    async signOut() {
      return client.auth.signOut({ scope: 'local' });
    },
  };
}
