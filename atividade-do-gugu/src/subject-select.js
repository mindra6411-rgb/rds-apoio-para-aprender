const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

export function subjectSelect(subjects, selected = '') {
  return `<label class="field field-wide"><span>Vincular à matéria cadastrada (opcional)</span><select name="subjectId"><option value="">Sem vínculo selecionado</option>${subjects.filter(subject => typeof subject.id === 'string' && typeof subject.name === 'string').map(subject => `<option value="${esc(subject.id)}" ${subject.id === selected ? 'selected' : ''}>${esc([subject.name, subject.year, subject.className].filter(Boolean).join(' · '))}</option>`).join('')}</select><small>A seleção usa o nome cadastrado e mantém o vínculo se a matéria mudar de nome.</small></label>`;
}
