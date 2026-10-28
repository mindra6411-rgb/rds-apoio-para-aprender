import { normalize } from './study.js';

const names = subject => [subject?.name, ...(Array.isArray(subject?.aliases) ? subject.aliases : [])].filter(value => typeof value === 'string' && value.trim());

export function matchingSubjects(value, subjects) {
  const name = normalize(value);
  if (!name) return [];
  return subjects.filter(subject => typeof subject?.id === 'string' && names(subject).some(item => normalize(item) === name));
}

// Um nome antigo só vira ID quando aponta a uma única matéria. Empates permanecem
// como texto e são exibidos como antes, sem adivinhar ano ou turma.
export function attachSubject(record, field, subjects) {
  const requested = String(record.subjectId || '');
  if (requested) {
    const subject = subjects.find(item => item.id === requested);
    if (!subject) throw new Error('A matéria escolhida não existe mais.');
    return { ...record, subjectId:subject.id, [field]:subject.name };
  }
  const matches = matchingSubjects(record[field], subjects);
  return { ...record, subjectId:matches.length === 1 ? matches[0].id : '' };
}

export function belongsToSubject(record, subject, subjects, field) {
  if (record.subjectId) return record.subjectId === subject.id;
  const value = record[field] || (field === 'materia' ? record.categoria : '');
  const matches = matchingSubjects(value, subjects);
  if (matches.length === 1) return matches[0].id === subject.id;
  // Compatibilidade para dados antigos ambíguos: antes eles apareciam nas
  // matérias com o mesmo nome. Não transformar o empate em um vínculo novo.
  return matches.length > 1 && normalize(subject.name) === normalize(value);
}

export function updateSubject(previous, fields, subjects) {
  const oldName = String(previous.name || '').trim();
  const changed = normalize(oldName) && normalize(oldName) !== normalize(fields.name);
  const matches = matchingSubjects(oldName, subjects);
  const unique = matches.length === 1 && matches[0].id === previous.id;
  const aliases = Array.isArray(previous.aliases) ? previous.aliases.filter(item => typeof item === 'string') : [];
  if (changed && unique && !aliases.some(item => normalize(item) === normalize(oldName))) aliases.push(oldName);
  return { ...previous, ...fields, aliases, updated:Date.now() };
}
