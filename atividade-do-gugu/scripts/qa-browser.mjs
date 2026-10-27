// Teste opcional de ponta a ponta. Requer playwright-core e um Chromium local.
// APP_URL=http://localhost:5173 CHROMIUM_PATH=/caminho/chromium node scripts/qa-browser.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { tools } from '../src/tools.js';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
const executablePath = process.env.CHROMIUM_PATH;
if (!executablePath) throw new Error('Informe CHROMIUM_PATH para executar os testes de navegador.');
const browser = await chromium.launch({ executablePath, headless:true, args:['--no-sandbox','--disable-setuid-sandbox'] });
const context = await browser.newContext({ viewport:{width:1440,height:900}, acceptDownloads:true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const go = async route => { await page.goto(`${base}#/${route}`, { waitUntil:'domcontentloaded' }); await page.locator('#main-content').waitFor(); };
const records = key => page.evaluate(key => JSON.parse(localStorage.getItem(`help-rds:records:${key}`) || '[]'), key);
const click = action => page.locator(`[data-action="${action}"]`).first().click();
const fill = (form, name, value) => page.locator(`${form} [name="${name}"]`).fill(value);
const submit = form => page.locator(`${form} button[type="submit"]`).click();
const text = selector => page.locator(selector).innerText();
const waitCount = (key, count) => page.waitForFunction(({key,count}) => JSON.parse(localStorage.getItem(`help-rds:records:${key}`) || '[]').length === count, {key,count});
const today = new Date(); today.setDate(today.getDate()+1);
const tomorrow = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

try {
  await go('home');
  assert.equal(await page.locator('.mobile-menu').isVisible(), false, 'menu móvel não deve aparecer no desktop');
  assert.ok((await text('h1')).includes('estudante'));

  // Matérias pessoais: cadastrar, detectar duplicata e editar.
  await go('materias');
  await fill('#subject-form','name','Matemática');
  await fill('#subject-form','year','2º ano fictício');
  await fill('#subject-form','className','Turma fictícia');
  await submit('#subject-form');
  assert.equal((await records('subjects')).length, 1);
  const subjectId = (await records('subjects'))[0].id;
  await fill('#subject-form','name','matematica');
  await fill('#subject-form','year','2º ano fictício');
  await fill('#subject-form','className','Turma fictícia');
  await submit('#subject-form');
  assert.match(await text('#subject-error'), /já foi cadastrada/);
  await click('subject-edit');
  await fill('#subject-form','description','Conteúdo fictício para teste.');
  await submit('#subject-form');
  assert.equal((await records('subjects'))[0].description, 'Conteúdo fictício para teste.');

  // Tarefas existentes continuam editáveis e aparecem na agenda e no painel.
  await go('tool/lista-tarefas');
  await fill('#record-form','titulo','Tarefa fictícia'); await fill('#record-form','prazo',tomorrow); await submit('#record-form');
  assert.equal((await records('tasks')).length, 1);
  await click('edit-record'); await fill('#record-form','titulo','Tarefa fictícia revisada'); await submit('#record-form');
  assert.equal((await records('tasks'))[0].titulo, 'Tarefa fictícia revisada');
  await click('toggle-record'); assert.equal((await records('tasks'))[0].done, true);
  await click('toggle-record'); assert.equal((await records('tasks'))[0].done, false);

  await go('tool/provas-trabalhos');
  await fill('#record-form','titulo','Entrega fictícia'); await fill('#record-form','data',tomorrow); await fill('#record-form','materia','Matemática'); await submit('#record-form');
  assert.equal((await records('school-dates')).length, 1);
  await go('home'); assert.match(await text('.home-deadlines'), /Tarefa fictícia revisada/); assert.match(await text('.home-deadlines'), /Entrega fictícia/);
  await go('agenda'); assert.match(await text('.upcoming-list'), /Entrega fictícia/);
  const previous = await text('#calendar-heading'); await click('calendar-next'); assert.notEqual(await text('#calendar-heading'), previous); await click('calendar-today'); assert.equal(await text('#calendar-heading'), previous);
  const [calendarDownload] = await Promise.all([page.waitForEvent('download'), click('export-calendar')]);
  const calendarPath = await calendarDownload.path(); const ics = await readFile(calendarPath,'utf8');
  assert.match(ics, /BEGIN:VCALENDAR/); assert.match(ics, /Tarefa fictícia revisada/); assert.match(ics, /Entrega fictícia/);

  // Anotações da arquitetura anterior recebem uma matéria opcional.
  await go('tool/anotacoes');
  await fill('#record-form','titulo','Resumo fictício'); await page.selectOption('#record-form [name="categoria"]','outra');
  await fill('#record-form','materia','Matemática'); await fill('#record-form','conteudo','Texto de exemplo sem dados reais.'); await submit('#record-form');
  assert.equal((await records('notes'))[0].materia, 'Matemática');

  // Biblioteca local: validação de URL, deduplicação, filtros, favorito e edição.
  await go('biblioteca');
  await fill('#library-form','title','Guia fictício'); await fill('#library-form','url','https://example.com/guia.pdf#pagina1');
  await page.selectOption('#library-form [name="type"]','PDF'); await fill('#library-form','subject','Matemática'); await submit('#library-form');
  assert.equal((await records('library')).length, 1);
  await fill('#library-form','title','Duplicado'); await fill('#library-form','url','https://example.com/guia.pdf#pagina2'); await submit('#library-form');
  assert.match(await text('#library-error'), /já está/);
  await page.locator('#library-search').fill('matematica'); assert.match(await text('#library-results'), /Guia fictício/);
  await click('library-favorite'); assert.equal((await records('library'))[0].favorite, true);
  await context.route('https://example.com/**', route => route.abort());
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('[data-action="library-open"]').click()]);
  await popup.waitForLoadState('domcontentloaded').catch(() => {}); await popup.close();
  assert.ok((await records('library'))[0].lastOpened, 'abertura de referência deve registrar acesso local');
  await page.locator('#library-favorites').check(); assert.match(await text('#library-results'), /Guia fictício/); await page.locator('#library-favorites').uncheck();
  await click('library-edit'); await fill('#library-form','title','Guia fictício editado'); await submit('#library-form');
  assert.equal((await records('library'))[0].title, 'Guia fictício editado');
  await fill('#library-form','title','Link inseguro'); await fill('#library-form','url','javascript:alert(1)'); await submit('#library-form');
  assert.match(await text('#library-error'), /http ou https/); assert.equal((await records('library')).length, 1);

  // Flashcard manual, revelação e repetição espaçada.
  await go('flashcards');
  await fill('#flashcard-form','question','Quanto é 2 + 2?'); await fill('#flashcard-form','answer','4'); await fill('#flashcard-form','subject','Matemática'); await submit('#flashcard-form');
  assert.equal((await records('flashcards')).length, 1); assert.match(await text('.review-card'), /Quanto é 2/);
  await fill('#flashcard-form','question','Rascunho ainda não salvo');
  await click('flashcard-reveal'); assert.match(await text('.review-answer'), /4/); assert.equal(await page.locator('#flashcard-form [name=question]').inputValue(), 'Rascunho ainda não salvo');
  await page.locator('[data-action="flashcard-rate"][data-rating="dificil"]').click();
  assert.equal(await page.locator('#flashcard-form [name=question]').inputValue(), 'Rascunho ainda não salvo');
  const card = (await records('flashcards'))[0]; assert.equal(card.reviews, 1); assert.equal(card.lastRating, 'dificil'); assert.equal(card.nextReview, tomorrow);
  await page.locator('[data-action="flashcard-mode"][data-mode="difficult"]').click(); assert.match(await text('.review-card'), /Quanto é 2/);

  // A página de matéria associa os registros reais pelo nome informado.
  await go(`materias/${subjectId}`);
  const subjectContent = await text('#main-content');
  assert.match(subjectContent, /Resumo fictício/); assert.match(subjectContent, /Guia fictício editado/); assert.match(subjectContent, /Quanto é 2/);
  await page.reload(); assert.match(await text('#main-content'), /Resumo fictício/);

  // Busca global inclui dados locais e ignora acentos.
  await page.locator('#global-search').fill('resumo ficticio'); assert.match(await text('.search-results'), /Resumo fictício/);
  await page.locator('#global-search').press('Enter'); await page.waitForURL('**/#/busca'); assert.match(await text('#search-page-results'), /Resumo fictício/);
  await page.locator('#search-page-input').fill('guia ficticio'); assert.match(await text('#search-page-results'), /Guia fictício editado/);

  // Catálogo e calculadora originais continuam funcionais.
  await go('catalog'); await page.selectOption('#category-filter','estudos'); assert.match(await text('#catalog-results'), /Lista de tarefas/);
  await page.locator('#catalog-search').fill('termo inexistente xyz'); assert.match(await text('#catalog-results'), /Nenhuma ferramenta/); await click('clear-filters');
  await go('tool/juros-compostos'); await fill('#calculator-form','capital','1000'); await fill('#calculator-form','taxa','10'); await fill('#calculator-form','periodos','2'); await submit('#calculator-form');
  assert.match(await text('#result-panel'), /1\.210,00/); await click('favorite'); await click('theme'); assert.match(await text('#result-panel'), /1\.210,00/); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await go('favorites'); assert.match(await text('#catalog-results'), /Juros compostos/); await page.reload(); assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await go('tool/temporizador'); await page.locator('#timer-minutes').fill('1'); await click('timer-start'); await go('home'); await go('tool/temporizador'); assert.notEqual(await text('#timer-display'), '25:00'); await click('timer-reset');

  // Todas as 38 rotas originais são renderizadas sem erro.
  for (const tool of tools) { await go(`tool/${tool.id}`); assert.ok(await page.locator('h1').count(), `título ausente em ${tool.id}`); }

  // O conteúdo não é interpretado como HTML.
  await go('materias'); await fill('#subject-form','name','<img src=x onerror=alert(1)>'); await submit('#subject-form');
  assert.equal(await page.locator('.subject-card-copy img').count(), 0); assert.match(await text('.subjects-grid'), /<img src=x/);

  // Exclusões com confirmação, preservando registros relacionados.
  await go('biblioteca'); await click('library-delete'); await page.locator('#confirm-submit').click(); await waitCount('library', 0); assert.equal((await records('library')).length, 0);
  await go('flashcards'); await click('flashcard-delete'); await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('#confirm-dialog')?.open); assert.equal((await records('flashcards')).length, 1, 'Escape não confirma uma exclusão anterior'); await click('flashcard-delete'); await page.locator('#confirm-submit').click(); await waitCount('flashcards', 0); assert.equal((await records('flashcards')).length, 0);
  await go('tool/lista-tarefas'); await click('delete-record'); await page.locator('#confirm-submit').click(); await waitCount('tasks', 0); assert.equal((await records('tasks')).length, 0);
  await go('materias'); await page.locator(`[data-action="subject-delete"][data-id="${subjectId}"]`).click(); await page.locator('#confirm-submit').click(); await waitCount('subjects', 1);
  assert.equal((await records('notes')).length, 1, 'excluir matéria não deve apagar notas');
  await go('settings'); const [exportDownload] = await Promise.all([page.waitForEvent('download'), click('export-all')]); assert.match(await readFile(await exportDownload.path(),'utf8'), /records:notes/);
  await click('clear-data'); await page.locator('#confirm-submit').click(); await waitCount('notes', 0); assert.equal((await records('notes')).length, 0);

  // Responsividade, imagens locais e navegação móvel nas principais telas.
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:844});
    for (const route of ['home','materias','biblioteca','flashcards','agenda','tecnologia','tecnologia/html-css','catalog','tool/juros-compostos','settings','about']) {
      await go(route);
      const dimensions = await page.evaluate(() => ({ client:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth }));
      assert.ok(dimensions.scroll <= dimensions.client + 1, `${route} em ${width}px teve rolagem horizontal: ${JSON.stringify(dimensions)}`);
    }
  }
  await page.setViewportSize({width:390,height:844}); await go('home');
  await click('menu'); assert.equal(await page.locator('#sidebar').getAttribute('inert'), null); assert.equal(await page.locator('[data-action="menu"]').getAttribute('aria-expanded'),'true');
  await page.locator('#sidebar a[href="#/flashcards"]').click(); await page.waitForURL('**/#/flashcards'); await page.waitForFunction(() => document.querySelector('#sidebar')?.inert === true); assert.equal(await page.locator('#sidebar').getAttribute('inert'), '');
  await go('home');
  for (const image of await page.locator('main img').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(img => img.decode()); assert.ok(await image.evaluate(img => img.naturalWidth > 0)); }
  assert.deepEqual(errors, [], `erros de JavaScript: ${errors.join('; ')}`);
  const blockedContext = await browser.newContext({ viewport:{width:1000,height:800} });
  await blockedContext.addInitScript(() => Object.defineProperty(window, 'localStorage', { configurable:true, get() { throw new Error('armazenamento bloqueado'); } }));
  const blockedPage = await blockedContext.newPage();
  await blockedPage.goto(`${base}#/tool/lista-tarefas`, {waitUntil:'domcontentloaded'});
  await blockedPage.locator('#record-form [name="titulo"]').fill('Teste fictício');
  await blockedPage.locator('#record-form button[type="submit"]').click();
  assert.match(await blockedPage.locator('#toast').innerText(), /Não foi possível salvar/);
  assert.equal(await blockedPage.locator('#record-form [name="titulo"]').inputValue(), 'Teste fictício');
  console.log(`OK: fluxos de matérias, tarefas, datas, anotações, referências, flashcards, busca, ${tools.length} ferramentas, exportações, exclusões e 5 larguras.`);
} finally { await browser.close(); }
