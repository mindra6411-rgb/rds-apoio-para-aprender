// Fluxos locais e offline, sempre com dados fictícios. Não testa login Google real.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
const locationOrigin = new URL(base).origin;
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox','--disable-setuid-sandbox']});
const context = await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const go = async route => { await page.goto(`${base}#/${route}`,{waitUntil:'domcontentloaded'}); await page.locator('#main-content').waitFor(); };
const records = key => page.evaluate(key => JSON.parse(localStorage.getItem(`help-rds:records:${key}`) || '[]'),key);
const click = action => page.locator(`[data-action="${action}"]`).first().click();
const fill = (form,name,value) => page.locator(`${form} [name="${name}"]`).fill(value);
const submit = form => page.locator(`${form} button[type="submit"]`).click();
const choose = (form,name,value) => page.selectOption(`${form} [name="${name}"]`,value);
const read = selector => page.locator(selector).innerText();
const localDay = await page.evaluate(() => {const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
const dayPlus = days => { const date = new Date(`${localDay}T12:00:00`); date.setDate(date.getDate()+days); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; };

try {
  await go('home');
  assert.equal(await page.locator('.start-guide').count(),1);
  await click('dismiss-guide'); await page.reload(); assert.equal(await page.locator('.start-guide').count(),0);

  await go('materias');
  await fill('#subject-form','name','Matemática fictícia'); await submit('#subject-form');
  await fill('#subject-form','name','História fictícia'); await submit('#subject-form');
  const [math,history] = await records('subjects');
  assert.ok(math.id && history.id);

  await go('tool/lista-tarefas');
  await fill('#record-form','titulo','Tarefa vinculada'); await fill('#record-form','prazo',localDay);
  await choose('#record-form','subjectId',math.id); await choose('#record-form','prioridade','alta');
  await fill('#record-form','subtasks','Ler\nAnotar dúvidas'); await submit('#record-form');
  let [task] = await records('tasks');
  assert.equal(task.subjectId,math.id); assert.equal(task.prioridade,'alta'); assert.equal(task.steps.length,2);
  await click('toggle-subtask'); [task] = await records('tasks'); assert.equal(task.steps[0].done,true);
  await click('edit-record'); await fill('#record-form','subtasks','Anotar dúvidas\nLer'); await submit('#record-form');
  [task] = await records('tasks'); assert.equal(task.steps.find(step=>step.text==='Ler').done,true);

  await go('tool/anotacoes');
  await fill('#record-form','titulo','Anotação de estudo'); await fill('#record-form','conteudo','Resposta que eu mesmo revisei.');
  await choose('#record-form','subjectId',math.id); await submit('#record-form');
  await click('note-to-card'); await page.locator('#flashcard-form').waitFor();
  assert.equal(await page.locator('#flashcard-form [name="answer"]').inputValue(),'Resposta que eu mesmo revisei.');
  assert.equal(await page.locator('#flashcard-form [name="question"]').inputValue(),'');
  assert.equal(await page.locator('#flashcard-form [name="subjectId"]').inputValue(),math.id);
  await fill('#flashcard-form','question','Pergunta matemática?'); await fill('#flashcard-form','topic','Álgebra'); await submit('#flashcard-form');
  await fill('#flashcard-form','question','Pergunta história?'); await fill('#flashcard-form','answer','Resposta história');
  await choose('#flashcard-form','subjectId',history.id); await fill('#flashcard-form','topic','História'); await submit('#flashcard-form');
  assert.equal((await records('flashcards')).length,2);
  await go('home'); assert.match(await read('.home-agenda-footer'),/2 cartões para revisar/);

  await go('flashcards');
  await choose('#review-filter','subject',`id:${math.id}`); await fill('#review-filter','topic','algebra'); await submit('#review-filter');
  assert.match(await read('.review-card'),/Pergunta matemática/); assert.doesNotMatch(await read('.review-card'),/Pergunta história/);
  await page.locator('.review-settings summary').click();
  await fill('#review-settings-form','dificil','2'); await fill('#review-settings-form','medio','5'); await fill('#review-settings-form','facil','10'); await submit('#review-settings-form');
  await click('flashcard-reveal'); assert.match(await read('.rating-buttons'),/5 dias/);
  await page.locator('[data-action="flashcard-rate"][data-rating="medio"]').click();
  const reviewed = (await records('flashcards')).find(card=>card.question==='Pergunta matemática?');
  assert.equal(reviewed.nextReview,dayPlus(5));

  await go('materias'); await page.locator(`[data-action="subject-edit"][data-id="${math.id}"]`).click();
  await fill('#subject-form','name','Matemática renomeada'); await submit('#subject-form');
  await go(`materias/${encodeURIComponent(math.id)}`);
  assert.match(await read('.subject-resource-grid'),/Tarefa vinculada/);
  assert.match(await read('.subject-resource-grid'),/Anotação de estudo/);
  assert.match(await read('.subject-resource-grid'),/Pergunta matemática/);

  // Três datas no mesmo dia, incluindo uma somente por ID (sem texto manual).
  await go('tool/provas-trabalhos');
  for (let i=1;i<=3;i++) {
    await fill('#record-form','titulo',`Data fictícia ${i}`); await fill('#record-form','data',localDay);
    await choose('#record-form','subjectId',math.id); await submit('#record-form');
  }
  const dates = await records('school-dates'); assert.equal(dates.length,3); assert.equal(dates[0].subjectId,math.id);
  await go('agenda'); await page.locator(`.calendar-more[data-date="${localDay}"]`).click();
  assert.equal(await page.locator('#calendar-day-details li').count(),4); // 3 datas + tarefa
  const third = page.locator('#calendar-day-details a').filter({hasText:'Data fictícia 3'});
  await third.click(); await page.waitForURL(url=>url.hash.includes(`item=${encodeURIComponent(dates[2].id)}`));
  assert.equal(await page.locator('.record-highlight').getAttribute('data-record-id'),dates[2].id);

  await go('busca'); await page.locator('#search-page-input').fill('Tarefa vinculada');
  await page.selectOption('#search-type-filter','personal'); await page.locator('.global-result').filter({hasText:'Tarefa vinculada'}).click();
  await page.waitForURL(url=>url.hash.includes(`item=${encodeURIComponent(task.id)}`));
  assert.equal(await page.locator('.record-highlight').getAttribute('data-record-id'),task.id);

  await go('administracao/fundamentos');
  assert.match(await read('.extra-practice'),/responsáveis ainda precisam conferir/);
  await page.locator('#admin-quiz-extra [value="a"]').check(); await submit('#admin-quiz-extra');
  assert.match(await read('.quiz-extra-feedback'),/Resposta correta/);
  await go('laboratorio');
  await fill('#business-form','price','5'); await fill('#business-form','variable','8'); await fill('#business-form','fixed','100'); await fill('#business-form','quantity','20'); await submit('#business-form');
  assert.match(await read('.lab-chart-table'),/Resultado simplificado/); assert.match(await read('.lab-chart-table'),/160,00/);
  assert.equal(await page.locator('.lab-chart-bars').getAttribute('aria-hidden'),'true');

  // Backup legado, dados atuais preservados em mesclagem e substituição limitada.
  await go('settings');
  const beforeNotes = JSON.stringify(await records('notes'));
  const legacy = {'records:tasks':[{id:task.id,titulo:'Valor antigo não deve sobrescrever'},{id:'restored',titulo:'Restaurada',prazo:''}]};
  const file = (name,data) => ({name,mimeType:'application/json',buffer:Buffer.from(data)});
  // Uma leitura antiga não pode reaparecer após o estudante escolher outro arquivo.
  await page.evaluate(() => {
    const original=File.prototype.text; window.__restoreFileText=()=>{File.prototype.text=original;};
    File.prototype.text=function() { const current=this; return new Promise(resolve => { window.__releaseBackup=()=>original.call(current).then(text=>{resolve(text);setTimeout(()=>{window.__readCompleted=true;},0);}); }); };
  });
  await page.locator('#backup-form [name="backup"]').setInputFiles(file('primeiro.json',JSON.stringify({'records:tasks':[{id:'old',titulo:'Antigo'}]}))); await submit('#backup-form');
  await page.waitForFunction(() => Boolean(window.__releaseBackup));
  await page.locator('#backup-form [name="backup"]').setInputFiles(file('antigo.json',JSON.stringify(legacy)));
  await page.evaluate(() => window.__releaseBackup()); await page.waitForFunction(() => Boolean(window.__readCompleted));
  assert.equal(await read('#backup-preview'),''); await page.evaluate(() => window.__restoreFileText());
  await submit('#backup-form');
  await page.waitForFunction(() => document.querySelector('#backup-preview')?.textContent.includes('Mesclar'));
  assert.match(await read('#backup-preview'),/Mesclar/); await click('apply-backup'); await page.locator('#confirm-submit').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('help-rds:records:tasks') || '[]').some(item=>item.id==='restored'));
  let imported = await records('tasks'); assert.equal(imported.find(item=>item.id===task.id).titulo,'Tarefa vinculada');
  assert.ok(imported.some(item=>item.id==='restored')); assert.equal(JSON.stringify(await records('notes')),beforeNotes);
  await page.locator('#backup-form [name="backup"]').setInputFiles(file('invalido.json','{')); await submit('#backup-form');
  await page.waitForFunction(() => document.querySelector('#backup-preview')?.textContent.includes('JSON válido'));
  assert.match(await read('#backup-preview'),/JSON válido/); assert.equal(await page.locator('[data-action="apply-backup"]').count(),0);
  await page.locator('#backup-form [name="backup"]').setInputFiles(file('tasks.json',JSON.stringify([{id:'individual',titulo:'Tarefa individual'}]))); await submit('#backup-form');
  await page.waitForFunction(() => document.querySelector('#backup-preview')?.textContent.includes('Escolha a ferramenta'));
  await choose('#backup-form','collection','records:tasks'); await submit('#backup-form'); await click('apply-backup'); await page.locator('#confirm-submit').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('help-rds:records:tasks') || '[]').some(item=>item.id==='individual'));
  await page.locator('#backup-form [name="backup"]').setInputFiles(file('novo.json',JSON.stringify({'records:tasks':[{id:'new-only',titulo:'Somente este'}]})));
  await choose('#backup-form','mode','replace'); await submit('#backup-form'); await click('apply-backup'); await page.locator('#confirm-submit').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('help-rds:records:tasks') || '[]').some(item=>item.id==='new-only'));
  imported=await records('tasks'); assert.deepEqual(imported.map(item=>item.id),['new-only']); assert.equal(JSON.stringify(await records('notes')),beforeNotes);
  await go('privacidade'); assert.match(await read('.privacy-sections'),/canal de atendimento ainda não foi configurado/);

  // Opt-in: somente conteúdo estático entra no cache; registros persistem offline.
  await go('settings'); await page.waitForFunction(() => document.querySelector('#offline-status')?.textContent.includes('não preparada'));
  await click('offline-enable'); await page.waitForFunction(() => document.querySelector('#offline-status')?.textContent.includes('preparada neste navegador'),null,{timeout:45000});
  const cached = await page.evaluate(async () => {
    const names=(await caches.keys()).filter(name=>name.startsWith('help-rds-static:'));
    const urls=[]; for (const name of names) for (const request of await (await caches.open(name)).keys()) urls.push(request.url);
    return urls;
  });
  assert.ok(cached.length > 3); assert.ok(cached.every(value => {const url=new URL(value);return url.origin===locationOrigin && !url.search && (url.pathname.endsWith('/')||url.pathname.includes('/assets/'));}));
  // Confere o cabeçalho que causou regressão em Chromium recente e verifica
  // que JavaScript e CSS vieram do worker, não apenas do cache do navegador.
  const hasVaryOrigin = await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (/\/assets\/.*\.js$/.test(new URL(request.url).pathname) && /\borigin\b/i.test((await cache.match(request))?.headers.get('vary') || '')) return true;
      }
    }
    return false;
  });
  assert.equal(hasVaryOrigin, true, 'O teste offline deve incluir um asset com Vary: Origin.');
  const offlineAssets = []; const offlineFailures = [];
  const trackResponse = response => {
    if (response.url().startsWith(base) && /\/assets\//.test(new URL(response.url()).pathname)) {
      offlineAssets.push({type:response.request().resourceType(),status:response.status(),worker:response.fromServiceWorker()});
    }
  };
  const trackFailure = request => {
    if (request.url().startsWith(base) && /\/assets\//.test(new URL(request.url()).pathname)) offlineFailures.push(`${request.url()}: ${request.failure()?.errorText}`);
  };
  page.on('response',trackResponse); page.on('requestfailed',trackFailure);
  try {
    await context.setOffline(true); await page.reload({waitUntil:'load'});
    assert.match(await read('#main-content'),/Configurações/); assert.equal((await records('tasks'))[0].id,'new-only');
    for (const type of ['script','stylesheet']) assert.ok(offlineAssets.some(asset => asset.type===type && asset.status===200 && asset.worker), `${type} não veio do worker: ${JSON.stringify(offlineAssets)}`);
    assert.deepEqual(offlineFailures,[]);
  } catch (error) {
    console.error('Recarga offline: arquivos e falhas',JSON.stringify({offlineAssets,offlineFailures}));
    throw error;
  } finally { page.off('response',trackResponse); page.off('requestfailed',trackFailure); }
  await go('materias'); await fill('#subject-form','name','Matéria criada offline'); await submit('#subject-form');
  assert.ok((await records('subjects')).some(item=>item.name==='Matéria criada offline'));
  await context.setOffline(false); await go('settings'); await page.waitForFunction(() => document.querySelector('#offline-status')?.textContent.includes('preparada neste navegador'));
  await click('offline-disable'); await page.locator('#confirm-submit').click(); await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => document.querySelector('#offline-status')?.textContent.includes('não preparada'));
  assert.deepEqual(await page.evaluate(async () => (await caches.keys()).filter(name=>name.startsWith('help-rds-static:'))),[]);
  assert.deepEqual(errors,[]);
  console.log('OK: guia, vínculos, subtarefas, cartões, agenda, busca, exercícios, gráfico, restauração e offline com dados fictícios.');
} finally { await browser.close(); }
