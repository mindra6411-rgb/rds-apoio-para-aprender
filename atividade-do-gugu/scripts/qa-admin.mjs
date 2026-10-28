// Teste opcional V3. Requer playwright-core, Chromium e o aplicativo em execução.
// APP_URL=http://localhost:5173 CHROMIUM_PATH=/caminho/chromium node scripts/qa-admin.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { lessons } from '../src/admin.js';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox','--disable-setuid-sandbox']});
const context = await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const go = async route => { await page.goto(`${base}#/${route}`,{waitUntil:'domcontentloaded'}); await page.locator('#main-content').waitFor(); };
const records = key => page.evaluate(key => JSON.parse(localStorage.getItem(`help-rds:records:${key}`) || '[]'), key);
const waitCount = (key,count) => page.waitForFunction(({key,count}) => JSON.parse(localStorage.getItem(`help-rds:records:${key}`) || '[]').length === count,{key,count});
const text = selector => page.locator(selector).innerText();
const click = action => page.locator(`[data-action="${action}"]`).first().click();
const fill = (form,field,value) => page.locator(`${form} [name="${field}"]`).fill(value);
const submit = form => page.locator(`${form} button[type="submit"]`).click();

try {
  await go('home');
  for (const route of ['vida-escolar','administracao','laboratorio','carreira']) assert.ok(await page.locator(`main a[href="#/${route}"]`).count(), `entrada ausente: ${route}`);
  await go('administracao'); assert.match(await text('.admin-progress'), /0\s*\/\s*6/);
  await go('administracao/fundamentos');
  await page.locator('#admin-quiz [value="b"]').check(); await submit('#admin-quiz');
  assert.match(await text('#quiz-feedback'), /Ainda não/); assert.equal((await records('admin-attempts'))[0].correct,false);
  await click('quiz-reset'); assert.equal(await page.locator('#admin-quiz [name="answer"]:checked').count(),0);
  await page.locator('#admin-quiz [value="a"]').focus(); await page.keyboard.press('Space'); await submit('#admin-quiz');
  assert.match(await text('#quiz-feedback'), /Resposta correta/); assert.equal((await records('admin-attempts')).length,1);
  await click('admin-mark'); assert.equal(await page.locator('[data-action="admin-mark"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#admin-quiz [value="a"]').isChecked(),true); assert.match(await text('#quiz-feedback'), /Resposta correta/);
  await page.reload(); assert.match(await text('.attempt-note'), /resposta correta/); assert.equal(await page.locator('[data-action="admin-mark"]').getAttribute('aria-pressed'),'true');
  await go('administracao'); assert.match(await text('.admin-progress'), /1\s*\/\s*6/); assert.match(await text('.path-list'), /Estudada/);
  for (const lesson of lessons) {
    await go(`administracao/${lesson.id}`);
    await page.locator(`#admin-quiz [value="${lesson.question.correct}"]`).check(); await submit('#admin-quiz');
    assert.match(await text('#quiz-feedback'), /Resposta correta/, `atividade ${lesson.id}`);
  }
  assert.equal((await records('admin-attempts')).length,6);

  // Valores aceitam a notação brasileira; formulário valida e mostra fórmulas.
  await go('laboratorio');
  await fill('#business-form','name','Cenário A'); await fill('#business-form','price','texto'); await fill('#business-form','variable','12,00');
  await fill('#business-form','fixed','800,00'); await fill('#business-form','quantity','120'); await submit('#business-form');
  assert.match(await text('#business-error'), /números/); assert.equal(await page.locator('[data-action="lab-save"]').count(),0);
  await fill('#business-form','price','20,00'); await submit('#business-form');
  assert.match(await text('#business-result'), /160,00/); assert.match(await text('#business-result'), /100 unidades/);
  assert.match(await text('#business-result'), /2\.400,00/); await click('lab-save');
  assert.equal((await records('business-scenarios')).length,1);
  await page.evaluate(() => {
    const key = 'help-rds:records:business-scenarios'; const items = JSON.parse(localStorage.getItem(key));
    items.push({id:'broken',name:'Inválido',values:{price:'não é número'}}); localStorage.setItem(key,JSON.stringify(items));
  });
  await page.reload(); assert.match(await text('.scenario-list'), /Cenário A/); assert.equal(await page.locator('#business-form [name="price"]').inputValue(),'20,00');
  assert.match(await text('.invalid-scenarios'), /não puderam ser lidos/);
  await click('lab-remove-invalid'); await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#confirm-dialog')?.open); assert.equal((await records('business-scenarios')).length,2);
  await click('lab-remove-invalid'); await page.locator('#confirm-submit').click(); await waitCount('business-scenarios',1);
  assert.match(await text('.scenario-list'), /Cenário A/);
  await page.locator('.scenario-row').filter({hasText:'Cenário A'}).locator('[data-action="lab-load"]').click();
  assert.equal(await page.locator('#business-form [name="price"]').inputValue(),'20'); await submit('#business-form');
  await fill('#business-form','name','<img src=x onerror=alert(1)>');
  await fill('#business-form','price','22,00'); assert.equal(await page.locator('[data-action="lab-save"]').count(),0);
  assert.match(await text('#business-result'), /Simule novamente/); await submit('#business-form'); assert.match(await text('#business-result'), /400,00/); await click('lab-save');
  const scenarios = await records('business-scenarios'); assert.equal(scenarios.length,2);
  assert.equal(await page.locator('.scenario-list img').count(),0, 'nome é texto, nunca HTML');
  assert.match(await text('.scenario-list'), /<img src=x/);
  await page.selectOption('#compare-form [name="scenarioA"]',scenarios[0].id); await page.selectOption('#compare-form [name="scenarioB"]',scenarios[0].id); await submit('#compare-form');
  assert.match(await text('#compare-error'), /diferentes/);
  await page.selectOption('#compare-form [name="scenarioB"]',scenarios[1].id); await submit('#compare-form');
  assert.match(await text('#compare-result'), /240,00/); assert.match(await text('.compare-table'), /Receita estimada/);
  assert.match(await text('.compare-table'), /2\.400,00/); assert.match(await text('.compare-table'), /2\.640,00/);
  assert.equal(await page.locator('#compare-result img').count(),0);
  await page.setViewportSize({width:320,height:844});
  const populatedWidth = await page.evaluate(() => ({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(populatedWidth.scroll <= populatedWidth.client + 1, `comparação preenchida em 320px: ${JSON.stringify(populatedWidth)}`);
  await page.setViewportSize({width:1440,height:900});

  await page.locator('.scenario-row').filter({hasText:'Cenário A'}).locator('[data-action="lab-delete"]').click();
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#confirm-dialog')?.open); assert.equal((await records('business-scenarios')).length,2);
  await page.locator('.scenario-row').filter({hasText:'Cenário A'}).locator('[data-action="lab-delete"]').click(); await page.locator('#confirm-submit').click(); await waitCount('business-scenarios',1);
  await page.locator('.scenario-row [data-action="lab-load"]').click(); assert.equal(await page.locator('#business-form [name="price"]').inputValue(),'22');
  await fill('#business-form','name','Rascunho em andamento');
  await page.locator('.scenario-row [data-action="lab-load"]').click(); await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#confirm-dialog')?.open);
  assert.equal(await page.locator('#business-form [name="name"]').inputValue(),'Rascunho em andamento');
  await page.locator('.scenario-row [data-action="lab-load"]').click(); await page.locator('#confirm-submit').click();
  await page.waitForFunction(() => document.querySelector('#business-form [name="name"]')?.value === '<img src=x onerror=alert(1)>');
  await click('lab-clear'); await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#confirm-dialog')?.open);
  assert.equal(await page.locator('#business-form [name="price"]').inputValue(),'22');
  await click('lab-clear'); await page.locator('#confirm-submit').click(); await page.waitForFunction(() => document.querySelector('#business-form [name="price"]')?.value === '');
  assert.equal((await records('business-scenarios')).length,1);

  // Progresso profissional é explícito, reversível e permanece localmente.
  await go('carreira'); await click('scroll-career'); assert.equal(await page.evaluate(() => document.activeElement?.dataset.action),'career-toggle');
  await page.locator('[data-action="career-toggle"]').nth(0).click(); await page.locator('[data-action="career-toggle"]').nth(1).click();
  assert.match(await text('.career-count'), /2 de 5/); await page.reload(); assert.match(await text('.career-count'), /2 de 5/);
  await page.locator('[data-action="career-toggle"]').nth(0).click(); assert.match(await text('.career-count'), /1 de 5/);

  // Os dados antigos continuam visíveis e a busca encontra conteúdos novos e cenários.
  await page.evaluate(() => {
    localStorage.setItem('help-rds:records:subjects',JSON.stringify([{id:'old-subject',name:'Matéria antiga'}]));
    localStorage.setItem('help-rds:records:tasks',JSON.stringify([{id:'old-task',titulo:'Tarefa antiga',done:false}]));
  });
  await go('vida-escolar'); assert.match(await text('.school-resource-grid'), /1 matéria cadastrada/); assert.match(await text('.school-resource-grid'), /1 tarefa em aberto/);
  await page.locator('#global-search').fill('formacao de preco'); assert.match(await text('.search-results'), /Custos e formação de preço/);
  await page.locator('#global-search').fill('img src=x'); assert.match(await text('.search-results'), /Cenário pessoal/); assert.equal(await page.locator('.search-results img').count(),0);

  // Exportação e remoção incluem os dados novos, sem apagar nada automaticamente.
  await go('settings');
  const [download] = await Promise.all([page.waitForEvent('download'),click('export-all')]);
  const json = JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(json.format, 'help-rds-local-backup'); assert.ok(json.data['records:business-scenarios']); assert.ok(json.data['records:admin-progress']); assert.ok(json.data['records:career-progress']); assert.ok(json.data['records:subjects']);
  await click('clear-data'); await page.locator('#confirm-submit').click(); await waitCount('business-scenarios',0);
  assert.equal((await records('admin-progress')).length,0); assert.equal((await records('career-progress')).length,0); assert.equal((await records('subjects')).length,0);

  // Larguras pequenas e grandes, todas as novas rotas e imagens locais.
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:844});
    for (const route of ['home','vida-escolar','administracao',...lessons.map(l=>`administracao/${l.id}`),'laboratorio','carreira']) {
      await go(route);
      const dimensions = await page.evaluate(() => ({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
      assert.ok(dimensions.scroll <= dimensions.client+1, `${route} em ${width}px: ${JSON.stringify(dimensions)}`);
      for (const image of await page.locator('main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(img => img.decode()); assert.ok(await image.evaluate(img => img.naturalWidth > 0)); }
    }
  }
  await page.setViewportSize({width:390,height:844}); await go('home');
  await click('menu'); assert.equal(await page.evaluate(() => document.activeElement?.dataset.action),'menu-close');
  await click('menu-close'); assert.equal(await page.locator('#sidebar').getAttribute('inert'),'');
  assert.equal(await page.evaluate(() => document.activeElement?.dataset.action),'menu');
  await click('menu'); await page.keyboard.press('Escape'); assert.equal(await page.locator('#sidebar').getAttribute('inert'),'');
  assert.deepEqual(errors,[],`erros de JavaScript: ${errors.join('; ')}`);

  const blockedContext = await browser.newContext({viewport:{width:1000,height:800}});
  await blockedContext.addInitScript(() => Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('armazenamento bloqueado');}}));
  const blockedPage = await blockedContext.newPage();
  await blockedPage.goto(`${base}#/administracao/fundamentos`,{waitUntil:'domcontentloaded'});
  await blockedPage.locator('#admin-quiz [value="a"]').check(); await blockedPage.locator('#admin-quiz button[type="submit"]').click();
  assert.match(await blockedPage.locator('#quiz-feedback').innerText(),/Resposta correta/); assert.match(await blockedPage.locator('#toast').innerText(),/Não foi possível salvar/);
  await blockedPage.locator('[data-action="admin-mark"]').click(); assert.equal(await blockedPage.locator('[data-action="admin-mark"]').getAttribute('aria-pressed'),'false');
  await blockedPage.goto(`${base}#/laboratorio`);
  for (const [name,value] of Object.entries({price:'20,00',variable:'12,00',fixed:'800',quantity:'120'})) await blockedPage.locator(`#business-form [name="${name}"]`).fill(value);
  await blockedPage.locator('#business-form button[type="submit"]').click(); assert.match(await blockedPage.locator('#business-result').innerText(),/160,00/);
  await blockedPage.locator('[data-action="lab-save"]').click(); assert.match(await blockedPage.locator('#toast').innerText(),/Não foi possível salvar/);
  console.log('OK: trilhas e correções, simulação e comparação, carreira, dados anteriores, busca, exportação, falha de armazenamento, imagens e cinco larguras.');
} finally { await browser.close(); }
