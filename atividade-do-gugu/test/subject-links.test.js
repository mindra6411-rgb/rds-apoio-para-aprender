import test from 'node:test';
import assert from 'node:assert/strict';
import { attachSubject, belongsToSubject, matchingSubjects, updateSubject } from '../src/subject-links.js';

const math = { id:'m', name:'Matemática', year:'1' };
const history = { id:'h', name:'História' };

test('associa conteúdo pelo ID escolhido ou por nome único, sem apagar o texto', () => {
  const subjects = [math, history];
  assert.deepEqual(attachSubject({ subject:'matematica' }, 'subject', subjects), { subject:'matematica', subjectId:'m' });
  assert.deepEqual(attachSubject({ subject:'qualquer', subjectId:'h' }, 'subject', subjects), { subject:'História', subjectId:'h' });
  assert.throws(() => attachSubject({ subjectId:'inexistente' }, 'subject', subjects), /não existe/);
});

test('renomear preserva conteúdo antigo sem editar registros e novos vínculos seguem o ID', () => {
  const oldNote = { materia:'Matemática', titulo:'Revisão' };
  const linked = { subjectId:'m', subject:'Matemática', question:'?' };
  const renamed = updateSubject(math, { name:'Matemática financeira' }, [math, history]);
  const subjects = [renamed, history];
  assert.deepEqual(renamed.aliases, ['Matemática']);
  assert.equal(belongsToSubject(oldNote, renamed, subjects, 'materia'), true);
  assert.equal(belongsToSubject(linked, renamed, subjects, 'subject'), true);
  assert.equal(belongsToSubject({ subjectId:'h', subject:'Matemática' }, renamed, subjects, 'subject'), false);
});

test('nomes ambíguos não são vinculados automaticamente nem preservados como alias', () => {
  const other = { id:'m2', name:'Matemática', year:'2' };
  const subjects = [math, other];
  assert.equal(matchingSubjects('matemática', subjects).length, 2);
  assert.equal(attachSubject({ subject:'Matemática' }, 'subject', subjects).subjectId, '');
  assert.equal(belongsToSubject({ subject:'Matemática' }, math, subjects, 'subject'), true);
  assert.equal(belongsToSubject({ subject:'Matemática' }, other, subjects, 'subject'), true);
  assert.deepEqual(updateSubject(math, { name:'Nova' }, subjects).aliases, []);
});
