// Orquestra os QAs de navegação no CI; OAuth usa somente respostas simuladas.
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const executable = process.env.CHROMIUM_PATH || chromium.executablePath();
const children = [];
function server(args, extra = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...args], {env:{...process.env,...extra}, stdio:['ignore','pipe','pipe']});
    children.push(child);
    let settled = false; let output = '';
    const timer = setTimeout(() => fail(new Error('O servidor de teste não iniciou em 30 segundos.')),30000);
    const fail = error => { if (settled) return; settled = true; clearTimeout(timer); reject(error); };
    const out = data => {
      const text=String(data); process.stdout.write(text); output+=text;
      if (!settled && /(?:Local:|localhost:)/.test(output)) { settled=true; clearTimeout(timer); resolve(child); }
    };
    child.stdout.on('data',out); child.stderr.on('data',data=>process.stderr.write(String(data)));
    child.on('error',fail); child.on('exit',code=>{if(!settled) fail(new Error(`Servidor encerrou com código ${code}.`));});
  });
}
function run(script, url) {
  return new Promise((resolve,reject) => {
    console.log(`\n--- ${script} ---`);
    const child=spawn(process.execPath,[`scripts/${script}.mjs`],{stdio:'inherit',env:{...process.env,APP_URL:url,CHROMIUM_PATH:executable}});
    child.on('error',reject); child.on('exit',(code,signal)=>code===0?resolve():reject(new Error(`${script} falhou (${code ?? signal}).`)));
  });
}
try {
  await server(['preview','--host','0.0.0.0','--port','4173','--strictPort']);
  await server(['preview','--host','0.0.0.0','--port','4175','--strictPort','--base','/help-rds/']);
  await server(['--host','0.0.0.0','--port','4174','--strictPort'],{VITE_SUPABASE_URL:'https://qa.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_example'});
  for (const script of ['qa-browser','qa-admin','qa-improvements','qa-performance','qa-a11y']) await run(script,'http://127.0.0.1:4173/');
  await run('qa-improvements','http://127.0.0.1:4175/help-rds/');
  await run('qa-auth','http://127.0.0.1:4174/');
} finally {
  for (const child of children) child.kill('SIGTERM');
}
