import { icon } from './icons.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));

export function accountLink(user) {
  return `<a class="account-link" id="account-link" href="#/conta" aria-label="${user ? 'Abrir minha conta' : 'Entrar ou criar conta'}">${icon('users')}<span>${user ? 'Minha conta' : 'Entrar'}</span></a>`;
}

const emailField = `<label class="auth-field"><span>E-mail</span><input name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email"></label>`;
const passwordField = (confirm = false, current = false) => `<label class="auth-field"><span>${confirm ? 'Confirme a senha' : 'Senha'}</span><input name="${confirm ? 'confirmPassword' : 'password'}" type="password" required ${current ? '' : 'minlength="8"'} maxlength="128" autocomplete="${current ? 'current-password' : 'new-password'}"></label>`;

function message(notice) {
  return `<p class="auth-feedback ${notice?.kind === 'error' ? 'is-error' : ''}" id="auth-feedback" role="status" aria-live="polite">${esc(notice?.text || '')}</p>`;
}

function guestForm(mode, notice) {
  if (mode === 'cadastro') return `<span class="overline">CRIAR CONTA</span><h2>Vamos começar.</h2><p>Use um e-mail ao qual você tenha acesso. Depois confirme a mensagem enviada para ele.</p><form id="account-form" data-mode="sign-up">${emailField}${passwordField()}${passwordField(true)}<p class="auth-hint">Escolha uma senha com pelo menos 8 caracteres e não a compartilhe.</p>${message(notice)}<button class="button button-primary" type="submit">Criar conta ${icon('arrow')}</button></form><p class="auth-switch">Já tem uma conta? <a href="#/conta/entrar">Entrar</a></p>`;
  if (mode === 'recuperar') return `<span class="overline">RECUPERAR ACESSO</span><h2>Esqueceu a senha?</h2><p>Informe seu e-mail. Se for possível enviar uma mensagem para ele, você receberá um link para escolher outra senha.</p><form id="account-form" data-mode="recovery">${emailField}${message(notice)}<button class="button button-primary" type="submit">Enviar link ${icon('arrow')}</button></form><p class="auth-switch"><a href="#/conta/entrar">Voltar para entrar</a></p>`;
  return `<span class="overline">BOM TER VOCÊ AQUI</span><h2>Entre na sua conta.</h2><p>Use o e-mail e a senha cadastrados.</p><form id="account-form" data-mode="sign-in">${emailField}${passwordField(false, true)}${message(notice)}<button class="button button-primary" type="submit">Entrar ${icon('arrow')}</button></form><div class="auth-secondary"><a href="#/conta/recuperar">Esqueci minha senha</a><a href="#/conta/cadastro">Criar conta</a></div>`;
}

export function accountPage({ configured, ready, user, recovery, mode = '', notice = null }) {
  let panel;
  if (!configured) panel = `<span class="overline">CONTA</span><h2>Conta indisponível.</h2><p>O acesso por conta ainda não foi configurado neste ambiente. As ferramentas continuam disponíveis sem login.</p>${message(notice)}`;
  else if (!ready) panel = `<span class="overline">CONTA</span><h2>Um momento.</h2><p>Estamos verificando sua sessão.</p>${message(notice)}`;
  else if (mode === 'redefinir' && !recovery) panel = `<span class="overline">RECUPERAR ACESSO</span><h2>O link não está ativo.</h2><p>Solicite outro link de recuperação e abra a mensagem recebida.</p>${message(notice)}<a href="#/conta/recuperar" class="button button-primary">Solicitar novo link ${icon('arrow')}</a>`;
  else if (mode === 'redefinir' && recovery) panel = `<span class="overline">NOVA SENHA</span><h2>Escolha uma senha.</h2><p>Defina uma nova senha para sua conta.</p><form id="account-form" data-mode="new-password">${passwordField()}${passwordField(true)}<p class="auth-hint">Use pelo menos 8 caracteres.</p>${message(notice)}<button class="button button-primary" type="submit">Salvar nova senha ${icon('arrow')}</button></form>`;
  else if (user) panel = `<span class="overline">SUA CONTA</span><h2>Você está conectado.</h2><p class="auth-email">${esc(user.email || 'Conta autenticada')}</p>${message(notice)}<button type="button" class="button button-quiet" data-action="account-signout">Sair desta aba</button><p class="auth-hint">Em um dispositivo compartilhado, saia da conta ao terminar.</p>`;
  else panel = guestForm(mode, notice);
  return `<section class="auth-heading"><span class="eyebrow">UM ESPAÇO PARA APRENDER</span><h1>Seu acesso, <em>do seu jeito.</em></h1><p>Entre ou continue usando as ferramentas sem uma conta.</p></section><div class="auth-layout"><section class="auth-panel" aria-label="Acesso à conta">${panel}</section><aside class="auth-aside"><span class="auth-aside-icon">${icon('book')}</span><span class="overline">IMPORTANTE SABER</span><h2>Conta e dados locais são diferentes.</h2><p>Seu e-mail é usado para autenticação. As anotações, tarefas e demais registros continuam somente neste navegador: não são sincronizados nem protegidos pelo login.</p><p>Quem usa o mesmo perfil do navegador pode vê-los. Evite incluir dados sensíveis e limpe os registros locais em dispositivos compartilhados.</p><a href="#/settings" class="text-link">Ver configurações ${icon('arrow')}</a></aside></div>`;
}
