// Subtarefas são locais; a edição conserva a marcação dos textos que continuam.
export function reconcileSteps(text, previous = [], makeId = () => globalThis.crypto.randomUUID()) {
  const lines = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length > 30 || lines.some(line => line.length > 200)) throw new Error('Use até 30 subtarefas, cada uma com até 200 caracteres.');
  const available = Array.isArray(previous) ? previous.filter(item => item && typeof item.text === 'string' && typeof item.id === 'string') : [];
  return lines.map(line => {
    const index = available.findIndex(item => item.text === line);
    if (index >= 0) return available.splice(index, 1)[0];
    return { id:makeId(), text:line, done:false };
  });
}
