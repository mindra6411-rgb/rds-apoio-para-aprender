const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

// Contato é opcional e público. Não se inventa canal quando não foi configurado.
export function privacyPage(contact = '') {
  const email = String(contact || '').trim();
  const valid = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email) && email.length <= 254;
  const address = valid ? `${encodeURIComponent(email.slice(0, email.lastIndexOf('@')))}@${email.slice(email.lastIndexOf('@') + 1)}` : '';
  return `<section class="page-intro"><div><span class="eyebrow">SEU ESPAÇO</span><h1>Privacidade e dados</h1><p>Saiba onde suas informações ficam e o que você pode controlar.</p></div></section><div class="privacy-sections">
  <section><h2>Dados de estudo</h2><p>Matérias, tarefas, notas e outros registros ficam neste perfil do navegador. Eles não são protegidos nem sincronizados pelo login. Quem usar o mesmo perfil pode acessá-los; evite dados sensíveis ou de terceiros.</p><p>Em <a href="#/settings">Configurações</a>, você pode exportar uma cópia, restaurar dados e apagar os registros deste navegador. A cópia baixada fica sob sua responsabilidade.</p></section>
  <section><h2>Conta e sessão</h2><p>Ao entrar, o Google e o Supabase processam os dados necessários para autenticação, como o endereço de e-mail. A sessão usada pelo Help RDS fica na aba. Sair da conta não apaga os registros locais, e apagá-los não encerra a sessão.</p></section>
  <section><h2>Solicitar exclusão de conta</h2>${valid ? `<p>Envie sua solicitação ao responsável pelo projeto. A exclusão será tratada fora do site, após verificação de titularidade; ela não apaga automaticamente os dados deste navegador.</p><a class="button button-quiet" href="mailto:${esc(address)}?subject=Solicita%C3%A7%C3%A3o%20de%20exclus%C3%A3o%20de%20conta">Escrever ao responsável</a>` : '<p>O canal de atendimento ainda não foi configurado. Ainda não é possível solicitar a exclusão da conta por esta página; o responsável deve disponibilizar um canal real de atendimento.</p>'}</section>
  <section><h2>Retenção, responsáveis e menores</h2><p>O responsável pelo projeto ainda deve definir e publicar prazos de retenção, atendimento e as medidas adequadas para estudantes menores de idade. Esta página informa o estado do aplicativo e não substitui uma política aprovada.</p></section></div>`;
}
