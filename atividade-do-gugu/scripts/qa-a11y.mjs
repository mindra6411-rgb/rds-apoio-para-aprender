// Verificação automatizada complementar; não substitui avaliação humana de acessibilidade.
// Requer playwright-core, @axe-core/playwright e CHROMIUM_PATH.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH, headless:true, args:['--no-sandbox','--disable-setuid-sandbox']});
const context = await browser.newContext({viewport:{width:1440,height:900}});
const page = await context.newPage();
const routes = ['home','vida-escolar','administracao','administracao/fundamentos','administracao/custos-preco','administracao/financas','administracao/marketing','administracao/pessoas','administracao/estrategia','laboratorio','carreira','materias','materias/s1','biblioteca','flashcards','agenda','tool/anotacoes','tool/juros-compostos','tecnologia','tecnologia/html-css','category/matematica','category/tributos','category/marketing','category/gestao','category/rh','category/estudos','catalog','settings','about'];
const violations = [];
try {
  await page.goto(base);
  for (const theme of ['light','dark']) {
    await page.evaluate(theme => {
      const put = (key,value) => localStorage.setItem(`help-rds:${key}`, JSON.stringify(value));
      put('preferences',{theme,favorites:['roi'],recent:['roi']});
      put('records:subjects',[{id:'s1',name:'Matemática',description:'Conteúdo fictício',year:'2º ano'}]);
      put('records:notes',[{id:'n1',titulo:'Nota fictícia',categoria:'outra',materia:'Matemática',conteudo:'Texto fictício'}]);
      put('records:library',[{id:'l1',title:'Guia fictício',subject:'Matemática',url:'https://example.com/',type:'PDF',origin:'Complementar',favorite:true}]);
      put('records:flashcards',[{id:'f1',question:'Pergunta fictícia?',answer:'Resposta fictícia',subject:'Matemática',difficulty:'medio',reviews:1}]);
      put('records:tasks',[{id:'t1',titulo:'Tarefa fictícia',prazo:'2026-10-28'}]);
      put('records:school-dates',[{id:'e1',titulo:'Entrega fictícia',data:'2026-10-28',materia:'Matemática'}]);
      put('records:admin-progress',[{id:'fundamentos',done:true}]);
      put('records:career-progress',[{id:'projeto',done:true}]);
      put('records:business-scenarios',[{id:'a',name:'Produto A',created:Date.now(),values:{price:20,variable:12,fixed:800,quantity:120}},{id:'b',name:'Produto B',created:Date.now(),values:{price:22,variable:12,fixed:800,quantity:120}},{id:'invalid',name:'Inválido',values:{price:'não informado'}}]);
      put('calculator:admin-lab',{name:'Teste fictício',price:'20,00',variable:'12,00',fixed:'800,00',quantity:'120'});
    },theme);
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      for (const route of routes) {
        await page.goto(`${base}#/${route}`,{waitUntil:'domcontentloaded'});
        if (route === 'flashcards' && await page.locator('[data-action="flashcard-reveal"]').count()) await page.locator('[data-action="flashcard-reveal"]').click();
        if (route.startsWith('administracao/')) { await page.locator('#admin-quiz [name="answer"]').first().check(); await page.locator('#admin-quiz button[type="submit"]').click(); }
        if (route === 'laboratorio') {
          await page.locator('#business-form button[type="submit"]').click();
          await page.selectOption('#compare-form [name="scenarioA"]','a'); await page.selectOption('#compare-form [name="scenarioB"]','b');
          await page.locator('#compare-form button[type="submit"]').click();
        }
        const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
        if (result.violations.length) violations.push({theme,width,route,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))});
        if (route === 'laboratorio') {
          await page.locator('[data-action="lab-clear"]').click();
          assert.equal(await page.locator('#confirm-dialog').evaluate(dialog => dialog.open),true);
          const dialogResult = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
          if (dialogResult.violations.length) violations.push({theme,width,route:'laboratorio / confirmação',violations:dialogResult.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))});
          await page.keyboard.press('Escape');
        }
        if (route === 'home' && width === 390) {
          await page.locator('[data-action="menu"]').click();
          const menuResult = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
          if (menuResult.violations.length) violations.push({theme,width,route:'home / menu móvel',violations:menuResult.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))});
          await page.locator('[data-action="menu-close"]').click();
        }
      }
    }
  }
  if (violations.length) { console.error(JSON.stringify(violations,null,2)); process.exitCode = 1; }
  else console.log(`OK: axe WCAG 2 A/AA e 2.1 A/AA em ${routes.length} rotas, dois temas e duas larguras.`);
} finally { await browser.close(); }
