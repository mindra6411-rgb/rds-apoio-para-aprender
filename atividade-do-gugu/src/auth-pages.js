import { icon } from './icons.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));

export function accountLink(user) {
  return `<a class="account-link" id="account-link" href="#/conta" aria-label="${user ? 'Abrir minha conta' : 'Entrar com Google'}">${icon('users')}<span>${user ? 'Minha conta' : 'Entrar'}</span></a>`;
}

function message(notice) {
  return `<p class="auth-feedback ${notice?.kind === 'error' ? 'is-error' : ''}" id="auth-feedback" role="status" aria-live="polite">${esc(notice?.text || '')}</p>`;
}

const googleMark = `<svg class="google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#4285f4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.7h11c-.5 2.5-2 4.6-4.2 6v5h6.6c3.9-3.6 6.2-9 6.2-14.6z"/><path fill="#34a853" d="M24 44c5.5 0 10.2-1.8 13.5-4.9l-6.6-5c-1.8 1.2-4.2 2-6.9 2-5.3 0-9.7-3.6-11.3-8.4H6v5.2C9.3 39.4 16.1 44 24 44z"/><path fill="#fbbc05" d="M12.7 27.7c-.4-1.2-.6-2.4-.6-3.7s.2-2.5.6-3.7v-5.2H6C4.7 17.8 4 20.8 4 24s.7 6.2 2 8.9l6.7-5.2z"/><path fill="#ea4335" d="M24 11.9c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.8 29.5 4 24 4 16.1 4 9.3 8.6 6 15.1l6.7 5.2c1.6-4.8 6-8.4 11.3-8.4z"/></svg>`;

function guestForm(notice) {
  return `<span class="overline">BOM TER VOCÊ AQUI</span><h2>Entre na sua conta.</h2><p>Escolha sua conta Google para entrar. No primeiro acesso, sua conta será criada automaticamente.</p><form id="account-form">${message(notice)}<button class="button auth-google-button" type="submit">${googleMark}<span>Entrar com Google</span></button></form>`;
}

export function accountPage({ configured, ready, user, problem = null, notice = null }) {
  let panel;
  if (!configured) panel = `<span class="overline">CONTA</span><h2>Conta indisponível.</h2><p>O acesso por conta ainda não foi configurado neste ambiente. As ferramentas continuam disponíveis sem login.</p>${message(notice)}`;
  else if (!ready) panel = `<span class="overline">CONTA</span><h2>Um momento.</h2><p>Estamos verificando sua sessão.</p>${message(notice)}`;
  else if (problem === 'secure') panel = `<span class="overline">CONTA</span><h2>Não foi possível iniciar o acesso.</h2><p>O acesso com Google precisa de uma conexão segura e de um navegador compatível. Use HTTPS ou tente outro navegador.</p>${message(notice)}`;
  else if (problem === 'storage') panel = `<span class="overline">CONTA</span><h2>Não foi possível iniciar o acesso.</h2><p>Este navegador bloqueou o armazenamento da sessão, necessário para voltar do Google. Permita o armazenamento nesta aba ou tente outro navegador.</p>${message(notice)}`;
  else if (problem) panel = `<span class="overline">CONTA</span><h2>Conta indisponível.</h2><p>Não foi possível carregar o acesso agora. Confira sua conexão e recarregue a página.</p>${message(notice)}`;
  else if (user) panel = `<span class="overline">SUA CONTA</span><h2>Você está conectado.</h2><p class="auth-email">${esc(user.email || 'Conta autenticada')}</p>${message(notice)}<button type="button" class="button button-quiet" data-action="account-signout">Sair desta aba</button><p class="auth-hint">Em um dispositivo compartilhado, saia da conta ao terminar.</p>`;
  else panel = guestForm(notice);
  return `<section class="auth-heading"><span class="eyebrow">UM ESPAÇO PARA APRENDER</span><h1>Seu acesso, <em>do seu jeito.</em></h1><p>Entre ou continue usando as ferramentas sem uma conta.</p></section><div class="auth-layout"><section class="auth-panel" aria-label="Acesso à conta">${panel}</section><aside class="auth-aside"><span class="auth-aside-icon">${icon('book')}</span><span class="overline">IMPORTANTE SABER</span><h2>Conta e dados locais são diferentes.</h2><p>O Google e o Supabase fazem a autenticação. As anotações, tarefas e demais registros continuam somente neste navegador: não são sincronizados nem protegidos pelo login.</p><p>Quem usa o mesmo perfil do navegador pode vê-los. Evite incluir dados sensíveis e limpe os registros locais em dispositivos compartilhados.</p><a href="#/settings" class="text-link">Ver configurações ${icon('arrow')}</a></aside></div>`;
}
