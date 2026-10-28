// Medição local, com rede e CPU simuladas. Os números não representam usuários reais.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const base = (process.env.APP_URL || 'http://127.0.0.1:5173/').replace(/\/?$/, '/');
if (!process.env.CHROMIUM_PATH) throw new Error('Informe CHROMIUM_PATH.');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
const context = await browser.newContext({viewport:{width:390,height:844}});
const page = await context.newPage();
try {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.goto(`${base}#/home`,{waitUntil:'load',timeout:30000});
  await page.locator('#main-content h1').waitFor({timeout:30000});
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint').find(entry=>entry.name==='first-contentful-paint');
    return {domContentLoaded:navigation?.domContentLoadedEventEnd,load:navigation?.loadEventEnd,firstContentfulPaint:paint?.startTime ?? null};
  });
  assert.ok(Number.isFinite(metrics.domContentLoaded) && metrics.domContentLoaded > 0);
  assert.ok(Number.isFinite(metrics.load) && metrics.load > 0);
  console.log(`Carregamento simulado em 390px (CPU 4x, latência 150ms, download 1,6 Mbps): DOM ${Math.round(metrics.domContentLoaded)} ms; load ${Math.round(metrics.load)} ms; FCP ${metrics.firstContentfulPaint === null?'não informado':`${Math.round(metrics.firstContentfulPaint)} ms`}.`);
  console.log('Use monitoramento consentido e testes reais em dispositivos e conexões para avaliar a experiência.');
} finally { await browser.close(); }
