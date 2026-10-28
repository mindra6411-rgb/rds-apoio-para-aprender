import './styles.css';
import './design-components.css';
import './visual.css';
import './admin.css';
import './auth.css';
import { validAuthConfig, createBrowserAuthClient, hasSavedAuthSession, inspectAuthCallback, redirectUrl, callbackDestination, accountError, accountApi } from './auth.js';
import { accountPage, accountLink } from './auth-pages.js';
import { icon } from './icons.js';
import { images } from './assets.js';
import { normalize, localDate, isValidDate, deadlines, upcomingDeadlines, calendarIcs, safeHttpUrl, canonicalUrl, rateFlashcard, guides, findGuide } from './study.js';
import { agendaPage, libraryPage, libraryResults, flashcardsPage, technologyPage, guidePage, searchResultsPage, searchResultsList } from './study-pages.js';
import { subjectsPage, subjectPage } from './subject-pages.js';
import { lessons, findLesson, gradeLesson, careerSteps, simulateBusiness, isUsableScenario } from './admin.js';
import { adminPage, adminLessonPage, renderQuizFeedback, labPage, renderLabResult, labComparison, careerPage, schoolPage } from './admin-pages.js';
import { categories, tools, findTool, findCategory } from './tools.js';
import { calculate, money } from './calculations.js';
import { getPrefs, savePrefs, getRecords, saveRecords, getDraft, saveDraft, clearDraft, clearAllLocalData, exportLocalData } from './storage.js';

const app = document.querySelector('#app');
// Retire o retorno da URL imediatamente; o código PKCE vive só em memória até
// ser entregue ao SDK, nunca no estado da interface ou nos dados de estudo.
const initialAuthCallback = inspectAuthCallback(location.href);
let initialAuthCode = initialAuthCallback?.hasCode ? new URL(location.href).searchParams.get('code') : null;
if (initialAuthCallback) history.replaceState(history.state, '', callbackDestination(location.href, 'conta'));
const authUrl = import.meta.env.VITE_SUPABASE_URL;
const authKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const authState = { configured: validAuthConfig(authUrl, authKey), ready: false, user: null, problem: null, notice: null };
let authClient = null;
let authApi = null;
let authStarted = false;
let authBooting = Boolean(initialAuthCallback);
let accountActionPending = false;
let prefs = getPrefs();
let currentResult = null;
let businessPreview = null;
let currentTimer = null;
let toastTimer;
let calendarView = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12);
let libraryFilters = { query:'', type:'', sort:'recent', favorites:false };
let flashState = { mode:'due', completed:[], revealed:false };
let searchQuery = '';
const makeId = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const route = () => location.hash.replace(/^#\/?/, '') || 'home';
const path = value => { location.hash = `/${value}`; };
const labelType = type => ({calculator:'Calculadora', notes:'Organizador', planner:'Planejador', board:'Lista', timer:'Temporizador'})[type] || 'Ferramenta';
const categoryName = id => findCategory(id)?.name || '';
const fmtDate = value => isValidDate(value) ? new Intl.DateTimeFormat('pt-BR', { dateStyle:'medium' }).format(new Date(`${value}T12:00:00`)) : '';
const categoryIcon = id => ({ matematica:'calculator', tributos:'chart', marketing:'megaphone', gestao:'grid', rh:'users', estudos:'book' })[id] || 'spark';
const getDeadlines = () => deadlines(getRecords('tasks'), getRecords('school-dates'));
const saveCollection = (key, records) => { if (saveRecords(key, records)) return true; toast('Não foi possível salvar. Confira o armazenamento do navegador.'); return false; };

function updatePrefs() { return savePrefs(prefs); }
function confirmAction(title, description, confirmLabel='Confirmar') {
  const dialog=document.querySelector('#confirm-dialog');
  if(!dialog?.showModal) return Promise.resolve(window.confirm(`${title}\n\n${description}`));
  dialog.querySelector('#confirm-title').textContent=title;
  dialog.querySelector('#confirm-description').textContent=description;
  dialog.querySelector('#confirm-submit').textContent=confirmLabel;
  return new Promise(resolve=>{
    const onClose=()=>{dialog.removeEventListener('close',onClose);resolve(dialog.returnValue==='confirm');};
    dialog.addEventListener('close',onClose);
    dialog.returnValue = ''; // Escape/cancelamento não pode reutilizar uma confirmação anterior.
    dialog.showModal();
  });
}
function toast(message) {
  const node = document.querySelector('#toast'); if (!node) return;
  node.textContent = message; node.classList.add('visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 2400);
}
function favoriteButton(tool) {
  const active = prefs.favorites.includes(tool.id);
  return `<button class="icon-button favorite-button ${active ? 'is-favorite' : ''}" data-action="favorite" data-id="${tool.id}" aria-pressed="${active}" aria-label="${active ? 'Remover dos' : 'Adicionar aos'} favoritos" title="${active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${icon('heart')}</button>`;
}
function card(tool) {
  const cat = findCategory(tool.category);
  return `<article class="tool-card tool-card-${cat?.color || 'blue'}">
    <div class="tool-card-top"><span class="tool-card-icon ${cat?.color || ''}">${icon(categoryIcon(tool.category))}</span>${favoriteButton(tool)}</div>
    <a class="tool-card-link" href="#/tool/${tool.id}"><span class="eyebrow ${cat?.color || ''}">${esc(cat?.short || '')}</span><h3>${esc(tool.name)}</h3><p>${esc(tool.description)}</p><span class="card-action">Abrir ferramenta ${icon('arrowUp')}</span></a>
  </article>`;
}
function categoryTile(category) {
  const count = tools.filter(tool => tool.category === category.id).length;
  return `<a class="category-tile ${category.color}" href="#/category/${category.id}"><span class="category-tile-icon">${icon(categoryIcon(category.id))}</span><span class="category-count">${String(count).padStart(2,'0')} ferramentas</span><h3>${esc(category.name)}</h3><p>${esc(category.intro)}</p><span class="tile-arrow" aria-hidden="true">${icon('arrowUp')}</span></a>`;
}
function sidebar(active) {
  const primary = [['home','home','Início'],['vida-escolar','book','Vida escolar'],['administracao','layers','Administração'],['laboratorio','calculator','Laboratório'],['carreira','target','Meu futuro'],['catalog','grid','Ferramentas']];
  const personal = [['conta','users','Minha conta'],['materias','book','Minhas matérias'],['agenda','calendar','Agenda'],['biblioteca','library','Minha biblioteca'],['flashcards','cards','Flashcards'],['tool/anotacoes','note','Minhas anotações'],['favorites','heart','Favoritos'],['recent','clock','Recentes']];
  const nav = links => links.map(([id,ic,label])=>`<a href="#/${id}" class="nav-link ${active===id?'active':''}" ${active===id?'aria-current="page"':''}><span class="nav-icon">${icon(ic)}</span><span>${label}</span>${id==='favorites'&&prefs.favorites.length?`<span class="nav-count">${prefs.favorites.length}</span>`:''}</a>`).join('');
  return `<aside class="sidebar" id="sidebar"><a href="#/home" class="wordmark"><span class="brand-mark" aria-hidden="true"><span></span></span><span class="brand-type"><strong>help<span>.</span>rds</strong><small>ESTUDOS &amp; ADMINISTRAÇÃO</small></span></a><button type="button" class="sidebar-close icon-button" data-action="menu-close" aria-label="Fechar navegação">${icon('close')}</button>
    <div class="side-label">MENU PRINCIPAL</div><nav class="main-nav" aria-label="Navegação principal">${nav(primary)}</nav>
    <div class="side-label category-label">SEU ESPAÇO</div><nav class="category-nav" aria-label="Seu espaço">${nav(personal)}</nav>
    <div class="sidebar-bottom"><a class="nav-link ${active==='settings'?'active':''}" href="#/settings"><span class="nav-icon">${icon('settings')}</span>Configurações</a><a class="nav-link ${active==='about'?'active':''}" href="#/about"><span class="nav-icon">${icon('info')}</span>Sobre o projeto</a><div class="sidebar-note"><span class="sidebar-note-icon">${icon('spark')}</span><strong>Um passo de cada vez.</strong><p>Seu espaço de estudo, no seu ritmo.</p><a href="#/tool/temporizador">Começar uma sessão ${icon('arrow')}</a></div><div class="local-note"><span class="privacy-dot"></span>Dados salvos neste navegador.</div></div>
  </aside>`;
}
function shell(content, active, pageTitle='Help RDS') {
  document.title = `${pageTitle} — Help RDS`;
  return `<a class="skip-link" href="#main-content" data-action="skip-main">Pular para o conteúdo</a><div class="app-shell">${sidebar(active)}<div class="main-area"><header class="topbar"><button class="mobile-menu icon-button" data-action="menu" aria-label="Abrir navegação" aria-controls="sidebar" aria-expanded="false">${icon('menu')}</button><div class="breadcrumbs"><span>SEU ESPAÇO</span><span class="crumb-divider">/</span><strong>${esc(pageTitle)}</strong></div><div class="top-actions"><div class="search-wrap" role="search">${icon('search')}<input id="global-search" type="search" placeholder="Buscar no seu espaço..." autocomplete="off" aria-label="Buscar ferramentas e conteúdos" /><kbd>Ctrl K</kbd></div><button class="theme-switch" data-action="theme" aria-label="Alternar para tema ${prefs.theme==='dark'?'claro':'escuro'}" title="Alternar tema">${icon(prefs.theme==='dark'?'sun':'moon')}</button>${accountLink(authState.user)}</div></header><main id="main-content" tabindex="-1">${content}</main><footer class="site-footer"><span><strong>help.rds</strong> <span class="footer-sep">·</span> Um espaço independente de apoio ao estudo.</span><a href="#/about">Sobre e créditos ${icon('arrowUp')}</a></footer></div></div><dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description"><form method="dialog"><span class="eyebrow">CONFIRMAÇÃO</span><h2 id="confirm-title">Confirmar ação</h2><p id="confirm-description"></p><div class="dialog-actions"><button type="submit" value="cancel" class="button button-quiet">Cancelar</button><button type="submit" value="confirm" class="button button-danger" id="confirm-submit">Confirmar</button></div></form></dialog><div id="toast" role="status" aria-live="polite" class="toast"></div>`;
}
function homePage() {
  const recent = prefs.recent.map(id=>findTool(id)).find(Boolean);
  const favorites = prefs.favorites.map(id=>findTool(id)).filter(Boolean);
  const upcoming = upcomingDeadlines(getDeadlines()).slice(0, 3);
  const quick = [
    ['vida-escolar','book','Vida escolar','Matérias e revisões','quick-blue'],
    ['administracao','layers','Administração','Aprenda os fundamentos','quick-orange'],
    ['laboratorio','calculator','Laboratório','Experimente suas ideias','quick-purple'],
    ['agenda','calendar','Agenda e rotina','Organize suas datas','quick-yellow'],
    ['carreira','target','Meu futuro','Habilidades e projetos','quick-green'],
    ['catalog','grid','Ferramentas','Encontre o que precisa','quick-pink'],
  ];
  const featured = [
    { href:'administracao', image:images.management, alt:'Ilustração de cadernos e elementos de gestão', label:'APRENDER ADMINISTRAÇÃO', title:'Entenda os conceitos', desc:'Trilhas introdutórias para conectar ideias.', color:'blue', meta:'6 trilhas complementares' },
    { href:'laboratorio', image:images.adminHero, alt:'Ilustração de uma pequena loja, caderno e calculadora', label:'APLICAR NA PRÁTICA', title:'Laboratório empresarial', desc:'Simule e compare suas decisões.', color:'orange', meta:'Experiências fictícias' },
    { href:'carreira', image:images.career, alt:'Ilustração de caderno, lápis e pasta', label:'OLHAR PARA O FUTURO', title:'Meu desenvolvimento', desc:'Reconheça habilidades e crie projetos.', color:'purple', meta:'Um passo de cada vez' },
  ];
  return `<div class="home-greeting"><div><span class="overline"><span class="tiny-spark">✳</span> UM ESPAÇO FEITO PARA VOCÊ</span><h1>Oi, estudante<span class="heading-dot">!</span></h1><p>Um espaço independente para estudantes do Ensino Médio Técnico em Administração.</p></div><div class="greeting-aside"><span class="greeting-spark">${icon('spark')}</span><span>Pequenos passos,<br><strong>grandes descobertas.</strong></span></div></div>
  <section class="student-hero"><div class="student-hero-copy"><span class="hero-kicker">${icon('spark')} ESTUDOS + ADMINISTRAÇÃO</span><h2>Suas ideias,<br><em>o mundo em movimento</em><span>.</span></h2><p>Um espaço para estudar, experimentar ideias de negócio e imaginar seus próximos passos.</p><div class="hero-actions"><a href="#/administracao" class="button button-hero">Explorar Administração ${icon('arrowUp')}</a><a href="#/laboratorio" class="hero-secondary">Abrir laboratório ${icon('arrow')}</a></div></div><div class="student-hero-art"><img src="${images.adminHero}" alt="Ilustração de uma pequena loja, caderno e calculadora" width="1200" height="670" fetchpriority="high"><span class="hero-sticker">${icon('spark')} UMA IDEIA<br>DE CADA VEZ</span></div></section>
  <section class="home-section quick-section"><div class="home-section-heading"><div><span class="overline">TUDO À MÃO</span><h2>Seu acesso rápido<span class="heading-dot">.</span></h2><p>Escolha por onde começar.</p></div><a href="#/catalog" class="text-link">Ver ferramentas ${icon('arrow')}</a></div><div class="quick-grid">${quick.map(([href,ic,title,desc,color])=>`<a href="#/${href}" class="quick-link"><span class="quick-icon ${color}">${icon(ic)}</span><span><strong>${title}</strong><small>${desc}</small></span><span class="quick-arrow">${icon('arrowUp')}</span></a>`).join('')}</div></section>
  <div class="home-content-grid"><section class="home-section discover-section"><div class="home-section-heading"><div><span class="overline">APRENDER, EXPERIMENTAR, CRIAR</span><h2>Ideias em movimento<span class="heading-dot">.</span></h2><p>Escolha seu ponto de partida e descubra algo novo.</p></div><a href="#/administracao" class="text-link">Ver trilhas de Administração ${icon('arrow')}</a></div><div class="discover-grid">${featured.map(item=>`<a href="#/${item.href}" class="discover-card"><div class="discover-image ${item.color}"><img src="${item.image}" alt="${esc(item.alt)}" width="1200" height="670" loading="lazy" decoding="async"><span class="discover-arrow">${icon('arrowUp')}</span></div><span class="discover-label ${item.color}">${item.label}</span><h3>${item.title}</h3><p>${item.desc}</p><span class="discover-meta">${item.meta} ${icon('arrow')}</span></a>`).join('')}</div><div class="area-chip-list" aria-label="Outras áreas de ferramentas"><span>Mais áreas</span>${categories.filter(cat=>!['matematica','estudos'].includes(cat.id)).map(cat=>`<a href="#/category/${cat.id}">${icon(categoryIcon(cat.id))} ${esc(cat.name)}</a>`).join('')}</div></section><aside class="home-agenda"><div class="home-agenda-heading"><span class="agenda-icon">${icon('calendar')}</span><a href="#/agenda" aria-label="Abrir agenda">${icon('arrowUp')}</a></div><span class="overline">ORGANIZE SEU TEMPO</span><h2>Seu próximo passo</h2><p>Seus compromissos em um só lugar.</p>${upcoming.length?`<div class="home-deadlines">${upcoming.map(item=>`<a href="${item.href}"><span class="deadline-date">${esc(fmtDate(item.date).replace(' de ', ' ').replace(/ de \d{4}$/, ''))}</span><span><strong>${esc(item.title)}</strong><small>${esc(item.date<localDate() && item.kind==='Tarefa'?'Tarefa atrasada':item.kind)}</small></span>${icon('arrowUp')}</a>`).join('')}</div><a href="#/agenda" class="text-link agenda-link">Ver minha agenda ${icon('arrow')}</a>`:`<div class="home-agenda-empty"><div class="empty-calendar-art">${icon('calendar')}<span>✳</span></div><strong>Uma página em branco.</strong><p>Adicione suas datas e tarefas para acompanhar tudo por aqui.</p><a href="#/tool/provas-trabalhos" class="text-link">Adicionar compromisso ${icon('arrow')}</a></div>`}<div class="home-agenda-footer">${icon('info')} Datas adicionadas por você, neste navegador.</div></aside></div>
  <section class="home-section continuity-section"><div class="home-section-heading"><div><span class="overline">SEU ESPAÇO, SEU TEMPO</span><h2>Continue de onde parou<span class="heading-dot">.</span></h2><p>Um pouco todo dia já é um ótimo começo.</p></div><a href="#/recent" class="text-link">Ver histórico ${icon('arrow')}</a></div><div class="continuity-content"><div class="continuity-illustration">${icon(recent?'clock':'spark')}<span>✳</span></div><div class="continuity-copy"><span class="overline">${recent?'ACESSADO RECENTEMENTE':'UM BOM COMEÇO'}</span><h3>${recent?esc(recent.name):'Seu próximo aprendizado começa aqui.'}</h3><p>${recent?esc(recent.description):'Explore as ferramentas e encontre um jeito de estudar que funciona para você.'}</p><a href="#/${recent?`tool/${recent.id}`:'catalog'}" class="button button-dark">${recent?'Continuar de onde parei':'Explorar ferramentas'} ${icon('arrow')}</a></div><div class="continuity-side"><span class="continuity-side-icon">${icon('heart')}</span><strong>${favorites.length?`${favorites.length} ${favorites.length===1?'favorito salvo':'favoritos salvos'}`:'Guarde suas descobertas'}</strong><p>${favorites.length?'Tudo o que você marcou, pertinho de você.':'Marque ferramentas para encontrá-las mais rápido.'}</p><a href="#/${favorites.length?'favorites':'catalog'}" class="text-link">${favorites.length?'Ver favoritos':'Encontrar ferramentas'} ${icon('arrow')}</a></div></div></section>
  <section class="community-strip"><div><span class="overline">FEITO PARA QUEM ESTÁ APRENDENDO</span><h2>Ideias boas crescem quando a gente coloca em prática.</h2><p>Apoio independente para estudantes da Escola Raphael Di Santo — Unidade Garcia.</p></div><a href="#/about" class="button button-quiet">Conheça o projeto ${icon('arrowUp')}</a></section>`;
}
function emptyState(title, text, link='catalog', action='Explorar ferramentas') { return `<div class="empty-state"><span class="empty-art">${icon('spark')}</span><h2>${esc(title)}</h2><p>${esc(text)}</p><a href="#/${link}" class="button button-primary">${esc(action)} ${icon('arrow')}</a></div>`; }
function catalogPage({query='',category='',favorites=false,recent=false}={}) {
  let filtered = tools.filter(t=>{
    const matchesQuery = !query || normalize(`${t.name} ${t.description} ${categoryName(t.category)} ${t.keywords||''}`).includes(normalize(query));
    return matchesQuery && (!category||t.category===category) && (!favorites||prefs.favorites.includes(t.id)) && (!recent||prefs.recent.includes(t.id));
  });
  if (recent) filtered.sort((a,b)=>prefs.recent.indexOf(a.id)-prefs.recent.indexOf(b.id));
  const cat = category ? findCategory(category) : null;
  const categoryImage = cat ? ({ matematica:images.science, tributos:images.management, marketing:images.marketing, gestao:images.management, rh:images.management, estudos:images.planning })[cat.id] : '';
  const title = category?categoryName(category)||'Área não encontrada':favorites?'Favoritos':recent?'Acessadas recentemente':'Explore as ferramentas';
  return `<section class="page-intro ${cat?`category-intro category-intro-${cat.color}`:''}"><div><span class="eyebrow">${cat?esc(cat.short):favorites?'SEU ESPAÇO':recent?'SEU HISTÓRICO':'ENCONTRE SEU CAMINHO'}</span><h1>${esc(title)}<span class="heading-dot">.</span></h1><p>${cat?esc(cat.intro):favorites?'Suas ferramentas salvas em um só lugar.':recent?'As últimas ferramentas que você abriu, guardadas neste navegador.':category?'Confira as áreas disponíveis no catálogo.':'Calculadoras, organizadores e recursos para colocar seus planos em movimento.'}</p>${cat?`<span class="category-intro-tag">${icon(categoryIcon(cat.id))} ${filtered.length} ferramentas nesta área</span>`:''}</div>${cat?`<div class="category-intro-art">${categoryImage?`<img src="${categoryImage}" alt="" width="1200" height="670" loading="lazy">`:`<span>${icon(categoryIcon(cat.id))}</span><i>✳</i>`}</div>`:`<span class="catalog-total"><b>${filtered.length}</b><small>${filtered.length===1?'ferramenta':'ferramentas'}</small></span>`}</section>
  <section class="catalog-controls"><label class="filter-search">${icon('search')}<input id="catalog-search" type="search" value="${esc(query)}" placeholder="Nome, assunto ou palavra-chave" aria-label="Buscar no catálogo"></label><label class="select-filter"><span class="sr-only">Filtrar categoria</span><select id="category-filter"><option value="">Todas as áreas</option>${categories.map(c=>`<option value="${c.id}" ${category===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label class="select-filter"><span class="sr-only">Filtrar tipo</span><select id="type-filter"><option value="">Todos os tipos</option>${[['calculator','Calculadoras'],['planner','Planejadores'],['notes','Organizadores'],['board','Listas'],['timer','Temporizadores']].map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label class="select-filter"><span class="sr-only">Filtrar finalidade</span><select id="purpose-filter"><option value="">Todas as finalidades</option><option value="calcular">Calcular e simular</option><option value="organizar">Organizar informações</option><option value="planejar">Planejar atividades</option><option value="foco">Foco e tempo</option></select></label><label class="select-filter"><span class="sr-only">Ordenar por</span><select id="sort-filter"><option value="relevance">Relevância</option><option value="name">Nome A–Z</option><option value="recent">Uso recente</option></select></label></section>
  <div class="catalog-meta"><span>${query?`Resultados para “${esc(query)}”`:cat?'Ferramentas desta área':'Explore as áreas disponíveis'}</span><button class="text-button" data-action="clear-filters">Limpar filtros</button></div><div class="tool-grid" id="catalog-results">${filtered.length?filtered.map(card).join(''):emptyState(favorites?'Ainda não há favoritos.':recent?'Seu histórico está vazio.':'Nenhuma ferramenta encontrada.',favorites?'Toque no coração de uma ferramenta para guardá-la aqui.':recent?'As ferramentas que você abrir aparecerão aqui.':'Tente outros termos ou remova algum filtro.','catalog',favorites?'Encontrar ferramentas':'Ver catálogo')}</div>`;
}
function calculatorPage(tool) {
  const fields = tool.fields.map(field => fieldHTML(field)).join('');
  return `<section class="tool-heading"><a class="back-link" href="#/category/${tool.category}">← ${esc(categoryName(tool.category))}</a><div class="tool-heading-line"><div><span class="eyebrow">${esc(categoryName(tool.category))} <span class="eyebrow-divider">/</span> ${esc(labelType(tool.type))}</span><h1>${esc(tool.name)}</h1><p>${esc(tool.description)}</p></div>${favoriteButton(tool)}</div></section>
  <div class="tool-workspace calculator-layout"><form id="calculator-form" class="form-panel"><div class="panel-heading"><div><span class="eyebrow">SEUS DADOS</span><h2>Informe os valores</h2></div><span class="step-number">01</span></div><div class="fields-grid">${fields}</div><div class="form-actions"><button type="submit" class="button button-primary">Calcular <span aria-hidden="true">→</span></button><button type="reset" class="button button-quiet">Limpar</button></div><p class="form-footnote">Os valores são processados localmente no seu dispositivo.</p></form>
  <section class="result-panel" id="result-panel" aria-live="polite"><div class="result-placeholder"><span class="result-mark">∑</span><span class="eyebrow">SEU RESULTADO</span><h2>Vamos resolver juntos.</h2><p>Preencha os campos e selecione <b>Calcular</b> para ver o resultado e as etapas.</p></div></section></div>
  <section class="learning-note"><span class="learning-icon">i</span><div><span class="eyebrow">ENTENDA A IDEIA</span><h3>Fórmula utilizada</h3><p class="formula-line">${esc(tool.formula)}</p>${tool.note?`<p class="disclaimer">${esc(tool.note)}</p>`:''}<p class="learning-caption">${tool.category==='tributos'?'Esta ferramenta é uma simulação educacional. Não substitui consulta à legislação vigente ou orientação profissional. Nenhuma alíquota oficial é pré-preenchida.':'Os resultados são arredondados para duas casas decimais quando apresentados em moeda.'}</p></div></section>`;
}
function fieldHTML(field) {
  const required = field.required ? 'required' : '';
  const id = `field-${field.name}`;
  if(field.type==='select') return `<label class="field" for="${id}"><span>${esc(field.label)}</span><select id="${id}" name="${field.name}" ${required}>${field.options.map(value=>{const [v,label]=value.split('|');return `<option value="${esc(v)}">${esc(label)}</option>`}).join('')}</select></label>`;
  if(field.type==='textarea') return `<label class="field field-wide" for="${id}"><span>${esc(field.label)}</span><textarea id="${id}" name="${field.name}" placeholder="${esc(field.placeholder||'')}" rows="3" maxlength="5000" ${required}></textarea></label>`;
  return `<label class="field ${field.type==='text'?'field-wide':''}" for="${id}"><span>${esc(field.label)}</span><div class="input-unit"><input id="${id}" name="${field.name}" type="${field.type||'number'}" ${field.type==='number'?`min="${field.min??0}" step="${field.step||'any'}"`:''} ${field.type==='text'?'maxlength="300"':''} placeholder="${esc(field.placeholder||'')}" ${required}/>${field.unit?`<span>${esc(field.unit)}</span>`:''}</div></label>`;
}
function renderResult(data, tool) {
  return `<div class="result-content"><span class="eyebrow">RESULTADO DA SIMULAÇÃO</span><h2>${esc(data.title)}</h2><div class="result-value">${esc(data.value)}</div><div class="result-details"><h3>Como chegamos lá</h3><ol>${(Array.isArray(data.steps)?data.steps:[data.steps]).map(step=>`<li>${esc(step)}</li>`).join('')}</ol>${data.extra?.length?`<div class="result-extras">${data.extra.map(item=>`<p>${esc(item)}</p>`).join('')}</div>`:''}</div><div class="result-actions"><button class="button button-quiet button-small" data-action="copy-result">Copiar resultado</button><button class="button button-quiet button-small" data-action="print">Imprimir</button></div><p class="result-disclaimer">${tool.note?esc(tool.note):'Confira se os dados informados correspondem ao exercício que você está resolvendo.'}</p></div>`;
}
function recordsPage(tool) {
  const records = getRecords(tool.storage);
  const rows = records.slice().reverse().map(record => {
    const titleKey = ['titulo','tarefa','tema','produto','habito','atividade','prova'].find(key=>record[key]);
    const title = titleKey ? record[titleKey] : 'Registro';
    const metadata = tool.fields.filter(field=>field.name!==titleKey && !['conteudo','forcas','fraquezas','oportunidades','ameacas'].includes(field.name) && record[field.name]!==undefined && record[field.name]!=='').map(field=>{
      const value = String(record[field.name]);
      const option = field.options?.find(item=>item.split('|')[0]===value)?.split('|')[1];
      return `${field.label.replace(' (opcional)','')}: ${option || (isValidDate(value)?fmtDate(value):value)}`;
    }).join(' · ');
    const done = Boolean(record.done);
    return `<article class="record-row ${done?'record-done':''}"><div class="record-status">${tool.type==='board'?`<button class="check-button" data-action="toggle-record" data-record="${esc(record.id)}" aria-label="${done?'Reabrir':'Concluir'} tarefa" aria-pressed="${done}">${done?icon('check'):''}</button>`:'<span class="record-bullet"></span>'}</div><div class="record-main"><h3>${esc(title)}</h3>${record.conteudo?`<p>${esc(record.conteudo)}</p>`:''}${record.forcas?`<div class="swot-preview">${['forcas','fraquezas','oportunidades','ameacas'].map(k=>record[k]?`<span><b>${esc(k)}:</b> ${esc(record[k])}</span>`:'').join('')}</div>`:''}${metadata?`<small>${esc(metadata)}</small>`:''}</div><div class="record-actions"><button class="icon-button" data-action="edit-record" data-record="${esc(record.id)}" aria-label="Editar ${esc(title)}" title="Editar">${icon('edit')}</button><button class="icon-button danger-action" data-action="delete-record" data-record="${esc(record.id)}" aria-label="Excluir ${esc(title)}" title="Excluir">${icon('trash')}</button></div></article>`;
  }).join('');
  const timer = tool.type==='timer';
  return `<section class="tool-heading"><a class="back-link" href="#/category/${tool.category}">${icon('chevronLeft')} ${esc(categoryName(tool.category))}</a><div class="tool-heading-line"><div><span class="eyebrow">${esc(categoryName(tool.category))} <span class="eyebrow-divider">/</span> ${esc(labelType(tool.type))}</span><h1>${esc(tool.name)}</h1><p>${esc(tool.description)}</p></div>${favoriteButton(tool)}</div></section>
  ${timer?`<section class="timer-panel"><span class="eyebrow">TEMPO DE FOCO</span><div id="timer-display" class="timer-display">${timerDisplay()}</div><div class="timer-controls"><label class="timer-input"><span>Duração em minutos</span><input id="timer-minutes" type="number" min="1" max="180" value="${currentTimer?.minutes||25}"></label><button class="button button-primary" data-action="timer-start">Iniciar sessão</button><button class="button button-quiet" data-action="timer-reset">Reiniciar</button></div><p>Deixe a página aberta durante a sessão. Não há notificações em segundo plano.</p></section>`:`<div class="records-layout"><form id="record-form" class="form-panel"><div class="panel-heading"><div><span class="eyebrow" id="record-form-eyebrow">NOVO REGISTRO</span><h2 id="record-form-title">Adicione ao seu espaço</h2></div><span class="step-number">01</span></div><div class="fields-grid">${tool.fields.map(fieldHTML).join('')}</div><input type="hidden" name="recordId"><div class="form-actions"><button type="submit" class="button button-primary" id="record-submit">Salvar registro ${icon('arrow')}</button><button type="reset" class="button button-quiet" data-action="cancel-edit">Limpar</button></div><p class="form-footnote">Salvo apenas neste navegador. Não inclua dados pessoais sensíveis.</p></form>
  <section class="records-panel"><div class="records-heading"><div><span class="eyebrow">SEU CONTEÚDO</span><h2>${records.length} ${records.length===1?'registro':'registros'}</h2></div>${records.length?`<button class="text-button" data-action="export-tool" data-id="${tool.id}">Exportar .json</button>`:''}</div><div class="records-list">${rows||`<div class="records-empty"><span class="empty-art">${icon('note')}</span><h3>Seu espaço começa aqui.</h3><p>Adicione o primeiro registro no formulário. Você poderá voltar e editar quando quiser.</p></div>`}</div></section></div>`}
  ${timer?'':`<div class="privacy-callout"><span class="privacy-dot"></span>Este conteúdo fica neste navegador e pode ser visto por quem usa o mesmo perfil. Exporte uma cópia quando precisar.</div>`}`;
}
function toolPage(tool) {
  if(!tool) return `<section class="page-intro"><div><span class="eyebrow">NÃO ENCONTRADO</span><h1>Essa ferramenta não existe.</h1><a href="#/catalog" class="text-link">Voltar ao catálogo →</a></div></section>`;
  return tool.type==='calculator'?calculatorPage(tool):recordsPage(tool);
}
function settingsPage() {
  return `<section class="page-intro"><div><span class="eyebrow">PREFERÊNCIAS</span><h1>Configurações</h1><p>Personalize sua experiência e controle seus dados locais.</p></div></section><div class="settings-list"><section class="settings-item"><div><span class="eyebrow">APARÊNCIA</span><h2>Tema da plataforma</h2><p>Escolha como o Help RDS aparece neste dispositivo.</p></div><div class="segmented-control"><button data-action="set-theme" data-value="light" class="${prefs.theme==='light'?'selected':''}" aria-pressed="${prefs.theme==='light'}">Claro</button><button data-action="set-theme" data-value="dark" class="${prefs.theme==='dark'?'selected':''}" aria-pressed="${prefs.theme==='dark'}">Escuro</button></div></section><section class="settings-item"><div><span class="eyebrow">SEUS DADOS</span><h2>Armazenamento local</h2><p>Favoritos, histórico e registros de ferramentas ficam somente neste navegador, mesmo com login. Quem usa o mesmo perfil também pode acessá-los; a conta não sincroniza nem protege esses dados. Não há backup automático.</p></div><button class="button button-quiet" data-action="export-all">Exportar meus dados</button></section><section class="settings-item settings-danger"><div><span class="eyebrow">PRIVACIDADE</span><h2>Apagar dados deste dispositivo</h2><p>Remove favoritos, histórico, preferências e registros salvos no Help RDS neste navegador. Esta ação não pode ser desfeita.</p></div><button class="button button-danger" data-action="clear-data">Apagar dados locais</button></section><p class="settings-note">Em dispositivo compartilhado, saia da conta, exporte o que deseja guardar e limpe seus dados locais. Apagar dados locais não encerra a sessão.</p></div>`;
}
function aboutPage() {
 return `<section class="about-hero"><span class="eyebrow">SOBRE O PROJETO</span><h1>Aprender também é<br><em>ter as ferramentas certas.</em></h1><p>Help RDS é uma plataforma independente de apoio a estudantes do Ensino Médio Técnico em Administração da Escola Raphael Di Santo — Unidade Garcia. Um espaço para praticar, organizar ideias e aprender fazendo.</p></section><section class="about-columns"><article><span class="eyebrow">NOSSO PROPÓSITO</span><h2>Útil no dia a dia.<br>Claro para aprender.</h2><p>Calculadoras didáticas, organizadores e recursos para apoiar a vida escolar e os estudos técnicos. As ferramentas funcionam no navegador e os dados criados ficam neste dispositivo.</p></article><article class="credits-details"><span class="eyebrow">CRÉDITOS E RESPONSABILIDADES</span><div class="credit-group"><span class="eyebrow">PROGRAMAÇÃO</span><h3>Ytalo Lima</h3><p>Desenvolvimento, implementação técnica, integração dos materiais de design, testes e manutenção.</p></div><div class="credit-group"><span class="eyebrow">EQUIPE DE DESIGN</span><h3>Pedro Miranda · Matheus Gama</h3><p>Direção visual, identidade, linguagem gráfica, layouts, componentes e orientações de UX/UI.</p></div><p class="design-note">A divisão de tarefas individuais entre Pedro Miranda e Matheus Gama cabe à própria equipe. A proposta visual atual é independente e não representa materiais oficiais aprovados pela escola ou pela equipe de design.</p></article></section><section class="about-disclaimer"><span class="eyebrow">USO RESPONSÁVEL</span><h2>Aprendizado, não aconselhamento profissional.</h2><p>Os cálculos tributários, financeiros e de RH são exercícios educacionais e usam valores informados pelo estudante. Não são consultoria fiscal, jurídica, contábil ou financeira. Verifique fontes oficiais e consulte profissionais para decisões reais.</p><p>Ferramenta independente de apoio aos estudos, sem vínculo ou representação oficial da escola. Não insira informações pessoais sensíveis. Os registros de estudo não são enviados para o servidor; quem usa o mesmo perfil do navegador pode acessá-los. Se você usar uma conta, seu e-mail e os dados necessários à autenticação são enviados ao Supabase.</p></section>`;
}
function setTheme(theme) {
  prefs.theme = theme === 'dark' ? 'dark' : 'light';
  if (!updatePrefs()) toast('Não foi possível salvar o tema neste navegador.');
  document.documentElement.dataset.theme = prefs.theme;
  const toggle = document.querySelector('.theme-switch');
  if (toggle) {
    toggle.innerHTML = icon(prefs.theme === 'dark' ? 'sun' : 'moon');
    toggle.setAttribute('aria-label', `Alternar para tema ${prefs.theme === 'dark' ? 'claro' : 'escuro'}`);
  }
  document.querySelectorAll('[data-action="set-theme"]').forEach(button => { const selected = button.dataset.value === prefs.theme; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
}
function rememberTool(tool) {
  prefs.recent = [tool.id, ...prefs.recent.filter(id => id !== tool.id)].slice(0, 12);
  updatePrefs();
}
let lastRenderedRoute = '';
function render() {
  const currentRoute = route();
  if (lastRenderedRoute !== currentRoute) {
    currentResult = null;
    businessPreview = null;
    if (currentRoute === 'biblioteca') libraryFilters = { query:'', type:'', sort:'recent', favorites:false };
  }
  lastRenderedRoute = currentRoute;
  const parts = currentRoute.split('/');
  const page = parts[0];
  let content, active = page, title = 'Início';
  if (page === 'home') content = homePage();
  else if (page === 'catalog') { title = 'Ferramentas'; content = catalogPage(); }
  else if (page === 'category') { const cat = findCategory(parts[1]); title = cat?.name || 'Área'; content = catalogPage({ category:parts[1] }); active = 'catalog'; }
  else if (page === 'favorites') { title = 'Favoritos'; content = catalogPage({ favorites:true }); }
  else if (page === 'recent') { title = 'Acessadas recentemente'; content = catalogPage({ recent:true }); }
  else if (page === 'tool') {
    const tool = findTool(parts[1]); title = tool?.name || 'Ferramenta'; content = toolPage(tool);
    if (tool) rememberTool(tool);
    active = parts[1] === 'anotacoes' ? 'tool/anotacoes' : 'catalog';
  }
  else if (page === 'materias') {
    title = 'Minhas matérias'; active = 'materias';
    if (parts[1]) { let id = ''; try { id = decodeURIComponent(parts[1]); } catch {} const subject = getRecords('subjects').find(item => item.id === id); title = subject?.name || 'Matéria'; content = subjectPage(subject, getRecords('notes'), getRecords('library'), getRecords('flashcards')); }
    else content = subjectsPage(getRecords('subjects'));
  }
  else if (page === 'vida-escolar') { title = 'Vida escolar'; content = schoolPage({subjects:getRecords('subjects'), tasks:getRecords('tasks'), dates:getDeadlines(), cards:getRecords('flashcards'), library:getRecords('library')}); }
  else if (page === 'administracao') { title = parts[1] ? (findLesson(parts[1])?.title || 'Trilha de Administração') : 'Administração'; active = 'administracao'; content = parts[1] ? adminLessonPage(findLesson(parts[1]), getRecords('admin-progress'), getRecords('admin-attempts')) : adminPage(getRecords('admin-progress'), getRecords('admin-attempts')); }
  else if (page === 'laboratorio') { title = 'Laboratório empresarial'; content = labPage(getRecords('business-scenarios'), getDraft('admin-lab'), businessPreview); }
  else if (page === 'carreira') { title = 'Meu futuro'; content = careerPage(getRecords('career-progress')); }
  else if (page === 'agenda') { title = 'Agenda'; content = agendaPage(getDeadlines(), calendarView); }
  else if (page === 'biblioteca') { title = 'Biblioteca'; content = libraryPage(getRecords('library'), libraryFilters); }
  else if (page === 'flashcards') { title = 'Flashcards'; content = flashcardsPage(getRecords('flashcards'), flashState); }
  else if (page === 'tecnologia') { title = parts[1] ? (findGuide(parts[1])?.title || 'Tecnologia') : 'Tecnologia'; content = parts[1] ? guidePage(findGuide(parts[1])) : technologyPage(); active = 'tecnologia'; }
  else if (page === 'busca') { title = 'Busca'; content = searchResultsPage(searchQuery, searchItems(searchQuery)); }
  else if (page === 'conta') { title = 'Minha conta'; content = accountPage({ ...authState, notice: authState.notice?.route === currentRoute ? authState.notice : null }); }
  else if (page === 'settings') { title = 'Configurações'; content = settingsPage(); }
  else if (page === 'about') { title = 'Sobre o projeto'; content = aboutPage(); }
  else { title = 'Página não encontrada'; content = emptyState('Esta página não foi encontrada.', 'Confira o endereço ou volte para explorar as ferramentas.'); }
  app.innerHTML = shell(content, active, title);
  document.documentElement.dataset.theme = prefs.theme;
  document.body.dataset.page = page;
  bindPageEvents();
  if (currentResult && page === 'tool') {
    const tool = findTool(parts[1]);
    const panel = document.querySelector('#result-panel');
    if (tool && panel) panel.innerHTML = renderResult(currentResult, tool);
  }
  syncMobileMenu(false);
  if (page === 'conta') ensureAccountInitialized();
}

function ensureAccountInitialized() {
  if (authStarted) return;
  authStarted = true;
  initializeAccount();
}
function updateAccountLink() {
  const link = document.querySelector('#account-link');
  if (link) link.outerHTML = accountLink(authState.user);
}
function accountNavigate(destination, text = '', kind = 'success') {
  authState.notice = text ? { route: destination, text, kind } : null;
  history.replaceState(history.state, '', callbackDestination(location.href, destination));
  render();
  document.querySelector('#main-content')?.focus({ preventScroll: true });
}
function accountFeedback(form, text, isError = false) {
  const feedback = form.querySelector('#auth-feedback');
  if (feedback) { feedback.textContent = text; feedback.classList.toggle('is-error', isError); }
}
async function handleAccountSubmit(event) {
  event.preventDefault();
  if (!authApi || accountActionPending) return;
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  accountActionPending = true;
  if (button) button.disabled = true;
  accountFeedback(form, 'Redirecionando para o Google...');
  let redirectStarted = false;
  try {
    const result = await authApi.signInWithGoogle();
    if (result?.error || !result?.data?.url) {
      accountFeedback(form, accountError(result?.error), true);
      return;
    }
    // O SDK redireciona a própria aba. Evite dois fluxos PKCE simultâneos.
    redirectStarted = true;
    setTimeout(() => {
      accountActionPending = false;
      if (!form.isConnected) return;
      if (button) button.disabled = false;
      accountFeedback(form, 'Não foi possível abrir o Google. Tente novamente.', true);
    }, 10000);
  } catch {
    accountFeedback(form, 'Não foi possível entrar com Google agora. Confira sua conexão e tente novamente.', true);
  } finally {
    if (!redirectStarted) {
      accountActionPending = false;
      if (button?.isConnected) button.disabled = false;
    }
  }
}

async function initializeAccount() {
  const result = await createBrowserAuthClient(authUrl, authKey);
  authClient = result.client;
  authState.problem = result.problem;
  if (!authClient) {
    initialAuthCode = null;
    authState.ready = true;
    authBooting = false;
    if (initialAuthCallback || route().split('/')[0] === 'conta') render();
    if (initialAuthCallback) document.querySelector('#main-content')?.focus({ preventScroll: true });
    return;
  }
  authApi = accountApi(authClient, redirectUrl(location.href));
  authClient.auth.onAuthStateChange((event, session) => {
    const previousUser = authState.user?.id || null;
    authState.user = session?.user || null;
    const changed = previousUser !== (authState.user?.id || null);
    // Não faça chamadas ao SDK dentro deste callback; eventos duplicados não
    // devem apagar uma ação em andamento ou re-renderizar desnecessariamente.
    if (changed && authState.ready && !authBooting) {
      updateAccountLink();
      if (!accountActionPending && route().split('/')[0] === 'conta') render();
    }
  });
  let callbackSucceeded = false;
  const callbackError = text => { authState.notice = { route: 'conta', text, kind: 'error' }; };
  try {
    await authClient.auth.initialize();
    if (initialAuthCallback) {
      if (initialAuthCallback.hasLegacyToken) {
        callbackError('Este link de acesso antigo não é mais aceito. Entre com Google.');
      } else if (initialAuthCallback.hasError) {
        callbackError(initialAuthCallback.cancelled ? 'A entrada com Google foi cancelada. Você pode tentar novamente.' : 'Não foi possível concluir o acesso com Google. Tente novamente.');
      } else if (initialAuthCode) {
        // Só o SDK troca o código pelo login; não inferimos sucesso de uma sessão anterior.
        const code = initialAuthCode;
        initialAuthCode = null;
        const exchange = await authApi.exchangeCode(code);
        callbackSucceeded = !exchange?.error && Boolean(exchange?.data?.session?.user);
        if (!callbackSucceeded) callbackError('Não foi possível concluir o acesso com Google. O retorno pode ter expirado; tente novamente nesta aba.');
      } else {
        callbackError('Não foi possível concluir o acesso com Google. Tente novamente nesta aba.');
      }
    }
    const { data, error } = await authClient.auth.getSession();
    authState.user = data?.session?.user || null;
    if (callbackSucceeded && !error && authState.user) {
      authState.notice = null;
      history.replaceState(history.state, '', callbackDestination(location.href, 'home'));
    } else if (callbackSucceeded) {
      callbackSucceeded = false;
      callbackError('Não foi possível verificar sua sessão. Tente entrar novamente.');
    }
  } catch {
    callbackSucceeded = false;
    if (initialAuthCallback) callbackError('Não foi possível concluir o acesso com Google. Confira sua conexão e tente novamente.');
  } finally {
    initialAuthCode = null;
    authState.ready = true;
    authBooting = false;
    if (initialAuthCallback || route().split('/')[0] === 'conta') render();
    else updateAccountLink();
    if (initialAuthCallback) document.querySelector('#main-content')?.focus({ preventScroll: true });
    if (callbackSucceeded) toast('Você entrou com Google.');
  }
}

function bindPageEvents() {
  const accountForm = document.querySelector('#account-form');
  if (accountForm) accountForm.addEventListener('submit', handleAccountSubmit);
  const form = document.querySelector('#calculator-form');
  if (form) {
    const tool = findTool(route().split('/')[1]);
    const draft = getDraft(tool.id);
    for (const [key, value] of Object.entries(draft)) if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value;
    const save = () => { if (!saveDraft(tool.id, Object.fromEntries(new FormData(form)))) toast('Não foi possível salvar o rascunho neste navegador.'); };
    form.addEventListener('input', save);
    form.addEventListener('change', save);
    form.addEventListener('reset', () => {
      clearDraft(tool.id); currentResult = null;
      setTimeout(() => { const panel = document.querySelector('#result-panel'); if (panel) panel.innerHTML = '<div class="result-placeholder"><span class="result-mark">∑</span><span class="eyebrow">SEU RESULTADO</span><h2>Vamos resolver juntos.</h2><p>Preencha os campos e selecione <b>Calcular</b> para ver o resultado e as etapas.</p></div>'; }, 0);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        currentResult = calculate(tool.operation, Object.fromEntries(new FormData(form)));
        document.querySelector('#result-panel').innerHTML = renderResult(currentResult, tool);
      } catch (error) {
        currentResult = null;
        document.querySelector('#result-panel').innerHTML = `<div class="error-result" role="alert"><span class="error-mark">!</span><span class="eyebrow">VAMOS REVISAR</span><h2>Confira os valores informados</h2><p>${esc(error.message)}</p></div>`;
        Array.from(form.elements).find(el => el.name)?.focus();
      }
    });
  }
  const recordForm = document.querySelector('#record-form');
  if (recordForm) recordForm.addEventListener('submit', event => {
    event.preventDefault();
    const tool = findTool(route().split('/')[1]);
    const data = Object.fromEntries(new FormData(recordForm));
    const id = data.recordId; delete data.recordId;
    const cleaned = Object.fromEntries(Object.entries(data).map(([key,value]) => [key, String(value).trim()]));
    const missing = tool.fields.find(field => field.required && !cleaned[field.name]);
    if (missing) { toast(`Preencha o campo ${missing.label}.`); recordForm.elements.namedItem(missing.name)?.focus(); return; }
    const records = getRecords(tool.storage);
    if (id) {
      const index = records.findIndex(item => item.id === id);
      if (index < 0) { toast('Este registro não foi encontrado.'); return; }
      records[index] = { ...records[index], ...cleaned, updated:Date.now() };
    } else records.push({ id:makeId(), ...cleaned, created:Date.now(), done:false });
    if (!saveCollection(tool.storage, records)) return;
    render(); toast(id ? 'Registro atualizado.' : 'Registro salvo neste navegador.');
  });
  const subjectForm = document.querySelector('#subject-form');
  if (subjectForm) subjectForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(subjectForm));
    const id = data.recordId; delete data.recordId;
    const cleaned = Object.fromEntries(Object.entries(data).map(([key,value]) => [key, String(value).trim()]));
    const error = document.querySelector('#subject-error');
    if (!cleaned.name) { error.textContent = 'Informe o nome da matéria.'; return; }
    const records = getRecords('subjects');
    if (records.some(item => item.id !== id && normalize(item.name) === normalize(cleaned.name) && normalize(item.year) === normalize(cleaned.year) && normalize(item.className) === normalize(cleaned.className))) { error.textContent = 'Esta matéria já foi cadastrada para o mesmo ano e turma.'; return; }
    if (id) {
      const index = records.findIndex(item => item.id === id);
      if (index < 0) { error.textContent = 'Esta matéria não foi encontrada.'; return; }
      records[index] = { ...records[index], ...cleaned, updated:Date.now() };
    } else records.push({ id:makeId(), ...cleaned, created:Date.now() });
    if (!saveCollection('subjects', records)) return;
    render(); toast(id ? 'Matéria atualizada.' : 'Matéria salva neste navegador.');
  });
  const libraryForm = document.querySelector('#library-form');
  if (libraryForm) libraryForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(libraryForm));
    const id = data.recordId; delete data.recordId;
    const cleaned = Object.fromEntries(Object.entries(data).map(([key,value]) => [key, String(value).trim()]));
    const error = document.querySelector('#library-error');
    const url = safeHttpUrl(cleaned.url);
    if (!cleaned.title || !url) { error.textContent = 'Informe um título e um link http ou https válido, sem usuário ou senha.'; return; }
    const records = getRecords('library');
    if (records.some(item => item.id !== id && canonicalUrl(item.url) === canonicalUrl(url))) { error.textContent = 'Este link já está na sua biblioteca. Edite a referência existente.'; return; }
    cleaned.url = url;
    if (id) {
      const index = records.findIndex(item => item.id === id);
      if (index < 0) { error.textContent = 'Esta referência não foi encontrada.'; return; }
      records[index] = { ...records[index], ...cleaned, updated:Date.now() };
    } else records.push({ id:makeId(), ...cleaned, favorite:false, created:Date.now() });
    if (!saveCollection('library', records)) return;
    render(); toast(id ? 'Referência atualizada.' : 'Referência salva neste navegador.');
  });
  const flashForm = document.querySelector('#flashcard-form');
  if (flashForm) flashForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(flashForm));
    const id = data.recordId; delete data.recordId;
    const cleaned = Object.fromEntries(Object.entries(data).map(([key,value]) => [key, String(value).trim()]));
    const error = document.querySelector('#flashcard-error');
    if (!cleaned.question || !cleaned.answer) { error.textContent = 'Escreva uma pergunta e uma resposta.'; return; }
    if (!['facil','medio','dificil'].includes(cleaned.difficulty)) { error.textContent = 'Escolha uma dificuldade válida.'; return; }
    const records = getRecords('flashcards');
    if (id) {
      const index = records.findIndex(item => item.id === id);
      if (index < 0) { error.textContent = 'Este cartão não foi encontrado.'; return; }
      records[index] = { ...records[index], ...cleaned, updated:Date.now() };
    } else records.push({ id:makeId(), ...cleaned, created:Date.now(), reviews:0 });
    if (!saveCollection('flashcards', records)) return;
    flashState.completed = []; flashState.revealed = false;
    render(); toast(id ? 'Cartão atualizado.' : 'Cartão salvo neste navegador.');
  });
  const quizForm = document.querySelector('#admin-quiz');
  if (quizForm) quizForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const lessonId = quizForm.dataset.lesson;
      const answer = new FormData(quizForm).get('answer');
      const outcome = gradeLesson(lessonId, answer);
      const records = getRecords('admin-attempts').filter(item => item.lessonId !== lessonId);
      const saved = saveCollection('admin-attempts', [...records, { id:makeId(), lessonId, answer, correct:outcome.correct, created:Date.now() }]);
      document.querySelector('#quiz-feedback').innerHTML = renderQuizFeedback(outcome);
      const previous = quizForm.querySelector('.attempt-note');
      if (previous) previous.textContent = saved ? `Última tentativa neste navegador: ${outcome.correct ? 'resposta correta' : 'continue praticando'}.` : 'Não foi possível salvar esta tentativa.';
    } catch (error) { document.querySelector('#quiz-feedback').textContent = error.message; }
  });
  const businessForm = document.querySelector('#business-form');
  if (businessForm) {
    businessForm.addEventListener('input', () => {
      if (!saveDraft('admin-lab', Object.fromEntries(new FormData(businessForm)))) toast('Não foi possível salvar o rascunho neste navegador.');
      if (businessPreview) {
        businessPreview = null;
        document.querySelector('#business-result').innerHTML = renderLabResult(null) + '<p class="lab-changed">Valores alterados. Simule novamente para atualizar o resultado.</p>';
      }
      document.querySelector('#business-error').textContent = '';
    });
    businessForm.addEventListener('submit', event => {
      event.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(businessForm));
        const result = simulateBusiness(data);
        businessPreview = { name:String(data.name || '').trim().slice(0,80), result, values:{price:result.price, variable:result.variable, fixed:result.fixed, quantity:result.quantity} };
        document.querySelector('#business-error').textContent = '';
        document.querySelector('#business-result').innerHTML = renderLabResult(businessPreview);
      } catch (error) {
        businessPreview = null;
        document.querySelector('#business-error').textContent = error.message;
        document.querySelector('#business-result').innerHTML = renderLabResult(null);
      }
    });
  }
  const compareForm = document.querySelector('#compare-form');
  if (compareForm) compareForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(compareForm);
    const a = getRecords('business-scenarios').find(item => item.id === data.get('scenarioA'));
    const b = getRecords('business-scenarios').find(item => item.id === data.get('scenarioB'));
    const error = document.querySelector('#compare-error');
    if (!a || !b || a.id === b.id) { error.textContent = 'Escolha dois cenários diferentes para comparar.'; document.querySelector('#compare-result').innerHTML = ''; return; }
    try { document.querySelector('#compare-result').innerHTML = labComparison(a, b); error.textContent = ''; }
    catch { error.textContent = 'Não foi possível comparar esses cenários. Confira os valores salvos.'; document.querySelector('#compare-result').innerHTML = ''; }
  });
  ['#category-filter','#type-filter','#purpose-filter','#sort-filter'].forEach(selector => document.querySelector(selector)?.addEventListener('change', applyFilters));
  ['#library-type-filter','#library-sort','#library-favorites'].forEach(selector => document.querySelector(selector)?.addEventListener('change', updateLibraryFilters));
}

function applyFilters() {
  const query = normalize(document.querySelector('#catalog-search')?.value || '');
  const category = document.querySelector('#category-filter')?.value || '';
  const type = document.querySelector('#type-filter')?.value || '';
  const purpose = document.querySelector('#purpose-filter')?.value || '';
  const sort = document.querySelector('#sort-filter')?.value || 'relevance';
  let base = tools;
  if (route() === 'favorites') base = tools.filter(t => prefs.favorites.includes(t.id));
  if (route() === 'recent') base = prefs.recent.map(id => findTool(id)).filter(Boolean);
  const list = base.filter(t => (!query || normalize(`${t.name} ${t.description} ${categoryName(t.category)} ${t.keywords || ''}`).includes(query)) && (!category || t.category === category) && (!type || t.type === type) && (!purpose || (purpose === 'calcular' && t.type === 'calculator') || (purpose === 'organizar' && ['notes','board'].includes(t.type)) || (purpose === 'planejar' && t.type === 'planner') || (purpose === 'foco' && t.type === 'timer')));
  if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name,'pt-BR'));
  if (sort === 'recent') list.sort((a,b) => (prefs.recent.indexOf(a.id)<0?999:prefs.recent.indexOf(a.id)) - (prefs.recent.indexOf(b.id)<0?999:prefs.recent.indexOf(b.id)));
  const total = document.querySelector('.catalog-total');
  if (total) { total.querySelector('b').textContent = list.length; total.querySelector('small').textContent = list.length === 1 ? 'ferramenta' : 'ferramentas'; }
  const result = document.querySelector('#catalog-results');
  if (result) result.innerHTML = list.length ? list.map(card).join('') : emptyState('Nenhuma ferramenta encontrada.', 'Tente outros termos ou remova algum filtro.');
}
function updateLibraryFilters() {
  libraryFilters = { query:document.querySelector('#library-search')?.value || '', type:document.querySelector('#library-type-filter')?.value || '', sort:document.querySelector('#library-sort')?.value || 'recent', favorites:document.querySelector('#library-favorites')?.checked || false };
  const result = document.querySelector('#library-results');
  if (result) result.innerHTML = libraryResults(getRecords('library'), libraryFilters);
}

function searchItems(query) {
  const term = normalize(query);
  if (!term) return [];
  const items = [
    ...tools.map(tool => ({ title:tool.name, type:'Ferramenta', detail:categoryName(tool.category), href:`#/tool/${tool.id}`, icon:categoryIcon(tool.category), terms:`${tool.description} ${tool.keywords || ''}` })),
    ...categories.map(cat => ({ title:cat.name, type:'Área de ferramentas', detail:cat.intro, href:`#/category/${cat.id}`, icon:categoryIcon(cat.id), terms:cat.short })),
    ...guides.map(guide => ({ title:guide.title, type:'Guia complementar', detail:guide.description, href:`#/tecnologia/${guide.id}`, icon:'code', terms:`${guide.intro} programação tecnologia` })),
    ...lessons.map(lesson => ({ title:lesson.title, type:'Trilha complementar de Administração', detail:lesson.description, href:`#/administracao/${lesson.id}`, icon:'book', terms:`${lesson.intro} ${lesson.keywords}` })),
    { title:'Administração', type:'Recurso', detail:'Trilhas complementares com atividades', href:'#/administracao', icon:'layers', terms:'gestão administração trilhas estudar' },
    { title:'Laboratório empresarial', type:'Recurso', detail:'Simulação de cenários fictícios', href:'#/laboratorio', icon:'calculator', terms:'empresa simulação preço custos resultado equilíbrio comparar' },
    { title:'Meu futuro', type:'Recurso', detail:'Desenvolvimento profissional e projetos', href:'#/carreira', icon:'target', terms:'carreira habilidades competências futuro profissional' },
    { title:'Vida escolar', type:'Recurso', detail:'Organização e recursos de estudo', href:'#/vida-escolar', icon:'book', terms:'estudo rotina matérias agenda tarefas' },
    ...getRecords('business-scenarios').map(item => ({ title:item.name || 'Cenário sem nome', type:'Cenário pessoal', detail:'Simulação salva neste navegador', href:'#/laboratorio', icon:'chart', terms:'empresa laboratório negócio cenário' })),
    { title:'Minhas matérias', type:'Recurso', detail:'Espaços de estudo cadastrados por você', href:'#/materias', icon:'book', terms:'disciplinas matérias' },
    { title:'Minha biblioteca', type:'Recurso', detail:'Referências de estudo neste navegador', href:'#/biblioteca', icon:'library', terms:'materiais links pdf' },
    { title:'Agenda de estudos', type:'Recurso', detail:'Calendário pessoal', href:'#/agenda', icon:'calendar', terms:'calendário provas trabalhos datas' },
    { title:'Flashcards', type:'Recurso', detail:'Cartões de revisão', href:'#/flashcards', icon:'cards', terms:'cartões revisão memorizar' },
    ...getRecords('subjects').map(item => ({ title:item.name || 'Matéria', type:'Matéria pessoal', detail:[item.year,item.className,item.period].filter(Boolean).join(' · ') || 'Salva neste navegador', href:`#/materias/${encodeURIComponent(String(item.id))}`, icon:'book', terms:item.description || '' })),
    ...getRecords('notes').map(item => ({ title:item.titulo || 'Anotação', type:'Anotação pessoal', detail:'Salva neste navegador', href:'#/tool/anotacoes', icon:'note', terms:`${item.categoria || ''} ${item.materia || ''} ${item.conteudo || ''}` })),
    ...getRecords('tasks').map(item => ({ title:item.titulo || 'Tarefa', type:'Tarefa pessoal', detail:item.prazo ? `Prazo: ${fmtDate(item.prazo)}` : 'Sem prazo informado', href:'#/tool/lista-tarefas', icon:'list', terms:item.prazo || '' })),
    ...getRecords('school-dates').map(item => ({ title:item.titulo || 'Compromisso', type:'Data pessoal', detail:fmtDate(item.data), href:'#/tool/provas-trabalhos', icon:'calendar', terms:item.materia || '' })),
    ...getRecords('projects').map(item => ({ title:item.tarefa || 'Projeto', type:'Projeto pessoal', detail:'Salvo neste navegador', href:'#/tool/projetos', icon:'layers', terms:`${item.status || ''} ${item.responsavel || ''}` })),
    ...getRecords('library').map(item => ({ title:item.title || 'Referência', type:'Referência pessoal', detail:item.subject || 'Salva neste navegador', href:'#/biblioteca', icon:'library', terms:`${item.period || ''} ${item.tags || ''} ${item.type || ''}` })),
    ...getRecords('flashcards').map(item => ({ title:item.question || 'Flashcard', type:'Flashcard pessoal', detail:item.subject || 'Salvo neste navegador', href:'#/flashcards', icon:'cards', terms:`${item.answer || ''} ${item.topic || ''}` })),
  ];
  return items.filter(item => normalize(`${item.title} ${item.detail} ${item.type} ${item.terms || ''}`).includes(term)).sort((a,b) => Number(!normalize(a.title).includes(term)) - Number(!normalize(b.title).includes(term))).slice(0, 100);
}
function showGlobalSearch(input) {
  document.querySelector('.search-results')?.remove();
  const query = input.value.trim();
  if (!query) return;
  const matches = searchItems(query).slice(0, 7);
  const dropdown = document.createElement('div');
  dropdown.className = 'search-results';
  dropdown.setAttribute('aria-live', 'polite');
  dropdown.innerHTML = matches.length ? matches.map(item => `<a href="${item.href}"><span>${esc(item.title)}<small>${esc(item.type)} · ${esc(item.detail)}</small></span>${icon('arrowUp')}</a>`).join('') + `<button class="search-all" data-action="search-all">Ver todos os resultados ${icon('arrow')}</button>` : `<p>Nada encontrado. Tente outro termo.</p><button class="search-all" data-action="search-all">Abrir busca ${icon('arrow')}</button>`;
  input.closest('.search-wrap').append(dropdown);
}
function goToSearch(query) {
  searchQuery = query.trim();
  if (route() === 'busca') { render(); document.querySelector('#search-page-input')?.focus(); }
  else path('busca');
}
function syncMobileMenu(open) {
  const sidebar = document.querySelector('#sidebar');
  const button = document.querySelector('[data-action="menu"]');
  if (!sidebar || !button) return;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  sidebar.classList.toggle('mobile-open', mobile && open);
  sidebar.inert = mobile && !open;
  button.setAttribute('aria-expanded', String(mobile && open));
  button.setAttribute('aria-label', mobile && open ? 'Fechar navegação' : 'Abrir navegação');
}
function renderFlashReview(focusSelector = '') {
  // Uma revisão não deve apagar um cartão que o estudante esteja preenchendo.
  const oldForm = document.querySelector('#flashcard-form');
  const draft = oldForm ? Object.fromEntries(new FormData(oldForm)) : null;
  render();
  const newForm = document.querySelector('#flashcard-form');
  if (!draft || !newForm) return;
  for (const [key,value] of Object.entries(draft)) {
    const input = newForm.elements.namedItem(key);
    if (input) input.value = value;
  }
  if (draft.recordId) {
    document.querySelector('#flashcard-form-title').textContent = 'Editar cartão';
    document.querySelector('#flashcard-form-eyebrow').textContent = 'EDIÇÃO';
    document.querySelector('#flashcard-submit').innerHTML = `Salvar alterações ${icon('arrow')}`;
  }
  if (focusSelector) document.querySelector(focusSelector)?.focus({ preventScroll:true });
}
function editForm(form, record, kind) {
  if (!form || !record) return;
  Object.entries(record).forEach(([key,value]) => { const input = form.elements.namedItem(key); if (input) input.value = value; });
  form.elements.namedItem('recordId').value = record.id;
  if (kind === 'record') {
    document.querySelector('#record-form-title').textContent = 'Editar registro';
    document.querySelector('#record-form-eyebrow').textContent = 'EDIÇÃO';
    document.querySelector('#record-submit').innerHTML = `Salvar alterações ${icon('arrow')}`;
  } else {
    document.querySelector(`#${kind}-form-title`).textContent = kind === 'library' ? 'Editar referência' : kind === 'subject' ? 'Editar matéria' : 'Editar cartão';
    document.querySelector(`#${kind}-form-eyebrow`).textContent = 'EDIÇÃO';
    document.querySelector(`#${kind}-submit`).innerHTML = `Salvar alterações ${icon('arrow')}`;
  }
  form.scrollIntoView({ behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'center' });
  form.querySelector('input:not([type="hidden"]), textarea')?.focus({ preventScroll:true });
}
function resetFormHeading(kind) {
  if (kind === 'record') {
    document.querySelector('#record-form-title').textContent = 'Adicione ao seu espaço';
    document.querySelector('#record-form-eyebrow').textContent = 'NOVO REGISTRO';
    document.querySelector('#record-submit').innerHTML = `Salvar registro ${icon('arrow')}`;
  } else {
    document.querySelector(`#${kind}-form-title`).textContent = kind === 'library' ? 'Guardar um link' : kind === 'subject' ? 'Adicionar matéria' : 'Criar um cartão';
    document.querySelector(`#${kind}-form-eyebrow`).textContent = kind === 'library' ? 'NOVA REFERÊNCIA' : kind === 'subject' ? 'DO SEU JEITO' : 'FEITO POR VOCÊ';
    document.querySelector(`#${kind}-submit`).innerHTML = `${kind === 'library'?'Salvar referência':kind === 'subject'?'Salvar matéria':'Salvar cartão'} ${icon('arrow')}`;
    document.querySelector(`#${kind}-error`).textContent = '';
  }
}

app.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'account-signout' && authApi && !accountActionPending) {
    accountActionPending = true;
    button.disabled = true;
    try {
      const { error } = await authApi.signOut();
      if (error) {
        const feedback = document.querySelector('#auth-feedback');
        if (feedback) { feedback.textContent = 'Não foi possível sair. Confira sua conexão e tente novamente.'; feedback.classList.add('is-error'); }
      } else {
        authState.user = null;
        accountNavigate('conta', 'Você saiu da conta nesta aba.');
      }
    } catch {
      const feedback = document.querySelector('#auth-feedback');
      if (feedback) { feedback.textContent = 'Não foi possível sair. Confira sua conexão e tente novamente.'; feedback.classList.add('is-error'); }
    } finally { accountActionPending = false; if (button.isConnected) button.disabled = false; }
  }
  if (action === 'skip-main') { event.preventDefault(); document.querySelector('#main-content')?.focus(); }
  if (action === 'favorite') {
    const id = button.dataset.id;
    prefs.favorites = prefs.favorites.includes(id) ? prefs.favorites.filter(value => value !== id) : [id, ...prefs.favorites];
    if (!savePrefs(prefs)) toast('Não foi possível salvar seus favoritos neste navegador.');
    else toast(prefs.favorites.includes(id) ? 'Adicionada aos favoritos.' : 'Removida dos favoritos.');
    const favoriteNav = document.querySelector('.category-nav a[href="#/favorites"]');
    if (favoriteNav) { let count = favoriteNav.querySelector('.nav-count'); if (prefs.favorites.length) { if (!count) { count = document.createElement('span'); count.className = 'nav-count'; favoriteNav.append(count); } count.textContent = prefs.favorites.length; } else count?.remove(); }
    if (route() === 'favorites') applyFilters();
    else document.querySelectorAll(`[data-action="favorite"][data-id="${id}"]`).forEach(element => {
      const active = prefs.favorites.includes(id); element.classList.toggle('is-favorite', active); element.setAttribute('aria-pressed', String(active));
      element.setAttribute('aria-label', `${active?'Remover dos':'Adicionar aos'} favoritos`); element.title = `${active?'Remover dos':'Adicionar aos'} favoritos`;
    });
  }
  if (action === 'theme') setTheme(prefs.theme === 'dark' ? 'light' : 'dark');
  if (action === 'set-theme') setTheme(button.dataset.value);
  if (action === 'menu') {
    const open = !document.querySelector('#sidebar')?.classList.contains('mobile-open');
    syncMobileMenu(open);
    if (open) document.querySelector('[data-action="menu-close"]')?.focus({preventScroll:true});
  }
  if (action === 'menu-close') { syncMobileMenu(false); document.querySelector('[data-action="menu"]')?.focus({preventScroll:true}); }
  if (action === 'search-all') goToSearch(document.querySelector('#global-search')?.value || '');
  if (action === 'clear-filters') {
    const input = document.querySelector('#catalog-search');
    if (input) { input.value = ''; ['#category-filter','#type-filter','#purpose-filter'].forEach(selector => { document.querySelector(selector).value = ''; }); document.querySelector('#sort-filter').value = 'relevance'; applyFilters(); }
  }
  if (action === 'copy-result' && currentResult) {
    try { await navigator.clipboard.writeText(`${currentResult.title}: ${currentResult.value}\n${Array.isArray(currentResult.steps)?currentResult.steps.join('\n'):currentResult.steps}`); toast('Resultado copiado.'); }
    catch { toast('Não foi possível copiar automaticamente.'); }
  }
  if (action === 'print') window.print();
  if (action === 'delete-record') {
    if (!await confirmAction('Excluir este registro?', 'Esta ação não pode ser desfeita.', 'Excluir')) return;
    const tool = findTool(route().split('/')[1]);
    if (saveCollection(tool.storage, getRecords(tool.storage).filter(item => item.id !== button.dataset.record))) { render(); toast('Registro excluído.'); }
  }
  if (action === 'toggle-record') {
    const tool = findTool(route().split('/')[1]);
    if (saveCollection(tool.storage, getRecords(tool.storage).map(item => item.id === button.dataset.record ? { ...item, done:!item.done } : item))) { render(); toast('Tarefa atualizada.'); }
  }
  if (action === 'edit-record') {
    const tool = findTool(route().split('/')[1]);
    editForm(document.querySelector('#record-form'), getRecords(tool.storage).find(item => item.id === button.dataset.record), 'record');
  }
  if (action === 'cancel-edit') resetFormHeading('record');
  if (action === 'export-tool') { const tool = findTool(button.dataset.id); downloadJSON(`${tool.storage}.json`, getRecords(tool.storage)); }
  if (action === 'export-all') downloadJSON('help-rds-dados-locais.json', exportLocalData());
  if (action === 'clear-data') {
    if (!await confirmAction('Apagar dados locais?', 'Isso remove favoritos, histórico, preferências, rascunhos e registros deste navegador. Esta ação não pode ser desfeita.', 'Apagar dados')) return;
    if (clearAllLocalData()) { prefs = getPrefs(); businessPreview = null; flashState = { mode:'due', completed:[], revealed:false }; libraryFilters = { query:'', type:'', sort:'recent', favorites:false }; render(); toast('Dados locais removidos.'); }
    else toast('Não foi possível apagar os dados locais.');
  }
  if (action === 'timer-start') startTimer();
  if (action === 'timer-reset') { clearInterval(currentTimer?.interval); currentTimer = null; document.querySelector('#timer-display').textContent = '25:00'; document.querySelector('#timer-minutes').value = 25; }
  if (action === 'calendar-prev' || action === 'calendar-next') { calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() + (action === 'calendar-prev' ? -1 : 1), 1, 12); render(); document.querySelector(`[data-action="${action}"]`)?.focus({ preventScroll:true }); }
  if (action === 'calendar-today') { const today = new Date(); calendarView = new Date(today.getFullYear(), today.getMonth(), 1, 12); render(); document.querySelector('[data-action="calendar-today"]')?.focus({ preventScroll:true }); }
  if (action === 'export-calendar') downloadFile('help-rds-agenda.ics', calendarIcs(getDeadlines()), 'text/calendar;charset=utf-8');
  if (action === 'subject-cancel') resetFormHeading('subject');
  if (action === 'subject-edit') editForm(document.querySelector('#subject-form'), getRecords('subjects').find(item => item.id === button.dataset.id), 'subject');
  if (action === 'subject-delete') {
    if (!await confirmAction('Excluir esta matéria?', 'O espaço será removido, mas suas anotações, referências e cartões continuarão salvos neste navegador.', 'Excluir')) return;
    if (saveCollection('subjects', getRecords('subjects').filter(item => item.id !== button.dataset.id))) { render(); toast('Matéria excluída.'); }
  }
  if (action === 'library-cancel') resetFormHeading('library');
  if (action === 'library-edit') editForm(document.querySelector('#library-form'), getRecords('library').find(item => item.id === button.dataset.id), 'library');
  if (action === 'library-delete') {
    if (!await confirmAction('Excluir esta referência?', 'O link será removido apenas deste navegador.', 'Excluir')) return;
    if (saveCollection('library', getRecords('library').filter(item => item.id !== button.dataset.id))) { render(); toast('Referência excluída.'); }
  }
  if (action === 'library-favorite') {
    if (saveCollection('library', getRecords('library').map(item => item.id === button.dataset.id ? { ...item, favorite:!item.favorite } : item))) { updateLibraryFilters(); toast('Favoritos atualizados.'); }
  }
  if (action === 'library-open') {
    const records = getRecords('library').map(item => item.id === button.dataset.id ? { ...item, lastOpened:localDate() } : item);
    if (!saveRecords('library', records)) toast('Não foi possível registrar o acesso neste navegador.');
  }
  if (action === 'scroll-flashcard-form') { event.preventDefault(); document.querySelector('#flashcard-form')?.scrollIntoView({ behavior:'smooth', block:'start' }); document.querySelector('#flashcard-form textarea')?.focus({ preventScroll:true }); }
  if (action === 'flashcard-cancel') resetFormHeading('flashcard');
  if (action === 'flashcard-edit') editForm(document.querySelector('#flashcard-form'), getRecords('flashcards').find(item => item.id === button.dataset.id), 'flashcard');
  if (action === 'flashcard-delete') {
    if (!await confirmAction('Excluir este cartão?', 'As revisões registradas neste cartão também serão removidas.', 'Excluir')) return;
    if (saveCollection('flashcards', getRecords('flashcards').filter(item => item.id !== button.dataset.id))) { flashState.revealed = false; render(); toast('Cartão excluído.'); }
  }
  if (action === 'flashcard-mode' && ['due','all','difficult'].includes(button.dataset.mode)) { flashState = { mode:button.dataset.mode, completed:[], revealed:false }; renderFlashReview(`[data-action="flashcard-mode"][data-mode="${button.dataset.mode}"]`); }
  if (action === 'flashcard-reveal') { flashState.revealed = true; renderFlashReview('[data-action="flashcard-rate"][data-rating="dificil"]'); }
  if (action === 'flashcard-rate') {
    const cards = getRecords('flashcards');
    const index = cards.findIndex(item => item.id === button.dataset.id);
    if (index < 0) return;
    try { cards[index] = rateFlashcard(cards[index], button.dataset.rating); } catch { toast('Não foi possível registrar a revisão.'); return; }
    if (saveCollection('flashcards', cards)) { flashState.completed.push(button.dataset.id); flashState.revealed = false; renderFlashReview(); (document.querySelector('[data-action="flashcard-reveal"]') || document.querySelector('[data-action="flashcard-mode"].selected'))?.focus({ preventScroll:true }); toast('Revisão registrada.'); }
  }
  if (action === 'admin-mark') {
    const lesson = findLesson(button.dataset.id); if (!lesson) return;
    const records = getRecords('admin-progress');
    const isDone = records.some(item => item.id === lesson.id && item.done === true);
    const updated = records.filter(item => item.id !== lesson.id);
    if (!isDone) updated.push({ id:lesson.id, done:true, updated:Date.now() });
    const selectedAnswer = document.querySelector('#admin-quiz input[name="answer"]:checked')?.value;
    const feedback = document.querySelector('#quiz-feedback')?.innerHTML || '';
    if (saveCollection('admin-progress', updated)) {
      render();
      const option = Array.from(document.querySelectorAll('#admin-quiz input[name="answer"]')).find(input => input.value === selectedAnswer);
      if (option) option.checked = true;
      const target = document.querySelector('#quiz-feedback'); if (target) target.innerHTML = feedback;
      document.querySelector('[data-action="admin-mark"]')?.focus({preventScroll:true});
      toast(isDone ? 'Marcação removida.' : 'Trilha marcada como estudada.');
    }
  }
  if (action === 'quiz-reset') {
    const quiz = document.querySelector('#admin-quiz'); quiz?.reset();
    const feedback = document.querySelector('#quiz-feedback'); if (feedback) feedback.innerHTML = '';
    quiz?.querySelector('input')?.focus({preventScroll:true});
  }
  if (action === 'lab-save') {
    if (!businessPreview) { toast('Simule os valores atuais antes de salvar.'); return; }
    const records = getRecords('business-scenarios');
    if (records.length >= 100) { toast('Limite de 100 cenários. Exclua algum para salvar outro.'); return; }
    records.push({ id:makeId(), name:businessPreview.name || 'Cenário sem nome', values:businessPreview.values, created:Date.now() });
    if (saveCollection('business-scenarios', records)) { render(); document.querySelector('[data-action="lab-save"]')?.focus({preventScroll:true}); toast('Cenário salvo neste navegador.'); }
  }
  if (action === 'lab-clear') {
    const form = document.querySelector('#business-form');
    const hasInput = form && Array.from(new FormData(form).values()).some(value => String(value).trim());
    if (hasInput && !await confirmAction('Limpar o rascunho?', 'Os valores atuais serão apagados. Os cenários salvos não serão alterados.', 'Limpar campos')) return;
    if (!clearDraft('admin-lab')) { toast('Não foi possível limpar o rascunho neste navegador.'); return; }
    businessPreview = null; render(); document.querySelector('#business-form [name="name"]')?.focus({preventScroll:true}); toast('Campos limpos.');
  }
  if (action === 'lab-load') {
    const scenario = getRecords('business-scenarios').find(item => item.id === button.dataset.id);
    if (!scenario) { toast('Cenário não encontrado.'); return; }
    try {
      const values = simulateBusiness(scenario.values);
      const draft = { name:String(scenario.name || '').slice(0,80), price:values.price, variable:values.variable, fixed:values.fixed, quantity:values.quantity };
      const form = document.querySelector('#business-form');
      const current = form ? Object.fromEntries(new FormData(form)) : {};
      const hasInput = Object.values(current).some(value => String(value).trim());
      let sameDraft = false;
      try {
        const calculated = simulateBusiness(current);
        sameDraft = (String(current.name || '').trim() || 'Cenário sem nome') === (draft.name || 'Cenário sem nome') && ['price','variable','fixed','quantity'].every(key => calculated[key] === values[key]);
      } catch { /* Um rascunho incompleto também merece proteção antes de ser substituído. */ }
      if (hasInput && !sameDraft && !await confirmAction('Substituir o rascunho atual?', 'Os valores preenchidos serão substituídos pelos deste cenário. Os cenários salvos não serão alterados.', 'Substituir rascunho')) return;
      if (!saveDraft('admin-lab', draft)) { toast('Não foi possível carregar o rascunho neste navegador.'); return; }
      businessPreview = null; render();
      const loadedForm = document.querySelector('#business-form'); loadedForm?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); loadedForm?.querySelector('[name="name"]')?.focus({preventScroll:true});
      toast('Cenário carregado. Simule novamente para ver o resultado.');
    } catch { toast('Não foi possível ler os valores deste cenário.'); }
  }
  if (action === 'lab-delete') {
    if (!await confirmAction('Excluir este cenário?', 'A simulação salva será removida deste navegador. Esta ação não pode ser desfeita.', 'Excluir')) return;
    if (saveCollection('business-scenarios', getRecords('business-scenarios').filter(item => item.id !== button.dataset.id))) { render(); document.querySelector('#business-form [name="name"]')?.focus({preventScroll:true}); toast('Cenário excluído.'); }
  }
  if (action === 'lab-remove-invalid') {
    const records = getRecords('business-scenarios');
    if (!records.some(item => !isUsableScenario(item))) return;
    if (!await confirmAction('Remover cenários inválidos?', 'Somente registros que não puderam ser lidos serão removidos. Exporte seus dados primeiro se quiser preservar uma cópia.', 'Remover inválidos')) return;
    if (saveCollection('business-scenarios', getRecords('business-scenarios').filter(isUsableScenario))) { render(); document.querySelector('#business-form [name="name"]')?.focus({preventScroll:true}); toast('Cenários inválidos removidos.'); }
  }
  if (action === 'career-toggle') {
    const step = careerSteps.find(item => item.id === button.dataset.id); if (!step) return;
    const records = getRecords('career-progress');
    const isDone = records.some(item => item.id === step.id && item.done === true);
    const updated = records.filter(item => item.id !== step.id);
    if (!isDone) updated.push({id:step.id, done:true, updated:Date.now()});
    if (saveCollection('career-progress', updated)) { render(); document.querySelector(`[data-action="career-toggle"][data-id="${step.id}"]`)?.focus({preventScroll:true}); toast(isDone ? 'Passo desmarcado.' : 'Passo marcado no seu mapa.'); }
  }
  if (action === 'scroll-career') {
    const section = document.querySelector('#career-steps');
    section?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    section?.querySelector('[data-action="career-toggle"]')?.focus({preventScroll:true});
  }
  if (action === 'copy-guide') {
    const guide = findGuide(button.dataset.id);
    try { await navigator.clipboard.writeText(guide.code); toast('Exemplo copiado.'); }
    catch { toast('Não foi possível copiar automaticamente. Selecione o exemplo para copiá-lo.'); }
  }
});

function downloadFile(filename, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Arquivo exportado.');
}
function downloadJSON(filename, data) { downloadFile(filename, JSON.stringify(data,null,2), 'application/json'); }
function timerDisplay() {
  const seconds = currentTimer ? Math.max(0, Math.ceil((currentTimer.endsAt - Date.now()) / 1000)) : 25 * 60;
  return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
}
function startTimer() {
  const mins = Number(document.querySelector('#timer-minutes').value);
  if (!Number.isInteger(mins) || mins < 1 || mins > 180) { toast('Escolha uma duração entre 1 e 180 minutos.'); return; }
  clearInterval(currentTimer?.interval);
  currentTimer = { endsAt:Date.now()+mins*60000, minutes:mins, interval:null };
  const update = () => {
    const display = document.querySelector('#timer-display'); if (display) display.textContent = timerDisplay();
    if (currentTimer && Date.now() >= currentTimer.endsAt) { clearInterval(currentTimer.interval); currentTimer = null; if (display) display.textContent = '00:00'; toast('Sessão de foco concluída. Bom trabalho!'); }
  };
  update(); currentTimer.interval = setInterval(update, 1000);
}

app.addEventListener('input', event => {
  if (event.target.id === 'catalog-search') applyFilters();
  if (event.target.id === 'library-search') updateLibraryFilters();
  if (event.target.id === 'global-search') showGlobalSearch(event.target);
  if (event.target.id === 'search-page-input') { searchQuery = event.target.value; document.querySelector('#search-page-results').innerHTML = searchResultsList(searchQuery, searchItems(searchQuery)); }
});
app.addEventListener('keydown', event => {
  if (event.target.id === 'global-search' && event.key === 'Enter') { event.preventDefault(); goToSearch(event.target.value); }
  if (event.key === 'Escape') { document.querySelector('.search-results')?.remove(); if (document.querySelector('#sidebar')?.classList.contains('mobile-open')) { syncMobileMenu(false); document.querySelector('[data-action="menu"]')?.focus(); } }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.search-wrap')) document.querySelector('.search-results')?.remove();
  if (!event.target.closest('#sidebar') && !event.target.closest('[data-action="menu"]')) syncMobileMenu(false);
});
document.addEventListener('keydown', event => {
  if (((event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'))) { event.preventDefault(); document.querySelector('#global-search')?.focus(); }
});
window.addEventListener('resize', () => syncMobileMenu(false));
window.addEventListener('hashchange', () => {
  if (authBooting) return;
  // Um link antigo ou erro aberto na aba atual pode mudar só o fragmento.
  // Recarregue para limpar o retorno antes de tratar a rota.
  if (inspectAuthCallback(location.href)) { location.reload(); return; }
  // Eventos de fragmento atrasados podem chegar após a navegação já ter renderizado a mesma rota.
  if (route() === lastRenderedRoute) return;
  render();
  window.scrollTo(0,0);
  (route() === 'busca' ? document.querySelector('#search-page-input') : document.querySelector('#main-content'))?.focus({ preventScroll:true });
});
if (authBooting) app.innerHTML = '<main id="main-content" tabindex="-1"><p role="status">Validando seu acesso...</p></main>';
else render();
// Só carregue o SDK no início se há sessão Google nesta aba ou retorno de autenticação.
if (initialAuthCallback || hasSavedAuthSession()) ensureAccountInitialized();
