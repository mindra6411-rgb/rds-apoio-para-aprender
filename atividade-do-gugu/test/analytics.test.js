import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsAllowed, createMeasurement, deployEnvironment, publicRoute } from '../src/analytics.js';

const production = {
  environment: 'production',
  protocol: 'https:',
  hostname: 'rds-apoio-para-aprender.vercel.app',
};

test('medição só é permitida na publicação real, em HTTPS e sem recusa', () => {
  assert.equal(analyticsAllowed(production), true);
  assert.equal(analyticsAllowed({ ...production, environment: 'local' }), false);
  assert.equal(analyticsAllowed({ ...production, environment: 'preview' }), false);
  assert.equal(analyticsAllowed({ ...production, protocol: 'http:' }), false);
  assert.equal(analyticsAllowed({ ...production, hostname: 'localhost' }), false);
  assert.equal(analyticsAllowed({ ...production, hostname: '127.0.0.1' }), false);
  assert.equal(analyticsAllowed({ ...production, hostname: 'app.localhost' }), false);
  assert.equal(analyticsAllowed({ ...production, hostname: '' }), false);
  assert.equal(analyticsAllowed({ ...production, enabled: false }), false);
  assert.equal(analyticsAllowed({ ...production, doNotTrack: '1' }), false);
  assert.equal(analyticsAllowed({ ...production, doNotTrack: 'yes' }), false);
  assert.equal(analyticsAllowed({ ...production, globalPrivacyControl: true }), false);
  assert.equal(analyticsAllowed({ ...production, allowedHosts: ['outro.example'] }), false);
  assert.equal(analyticsAllowed({ ...production, allowedHosts: ['RDS-Apoio-Para-Aprender.Vercel.App'] }), true);
  assert.equal(analyticsAllowed(), false);
});

test('rota pública descarta identificadores e parâmetros', () => {
  assert.equal(publicRoute('#/tool/anotacoes?item=3f8a1c2e-0000-4000-8000-123456789abc'), 'tool/anotacoes');
  assert.equal(publicRoute('#/tool/anotacoes'), 'tool/anotacoes');
  assert.equal(publicRoute('#/materias/3f8a1c2e-0000-4000-8000-123456789abc'), 'materias');
  assert.equal(publicRoute('#/home?code=segredo'), 'home');
  assert.equal(publicRoute('#/'), 'home');
  assert.equal(publicRoute(''), 'home');
  assert.equal(publicRoute('#/administracao/gestao-de-pessoas'), 'administracao');
  assert.equal(publicRoute('#/aa/bb/cc'), 'aa');
  assert.equal(publicRoute('#/a'), 'outros');
  assert.equal(publicRoute('#/Seção'), 'outros');
  assert.equal(publicRoute('#/tool/../../etc'), 'tool');
});

test('nenhum pacote é carregado quando a medição não é permitida', async () => {
  let loads = 0;
  const measurement = createMeasurement({ ...production, environment: 'local', load: async () => { loads += 1; return { inject() {}, track() {} }; } });
  assert.equal(await measurement.start(), false);
  assert.equal(measurement.route('#/home'), false);
  assert.equal(loads, 0);
});

test('medição envia uma vez a visita e cada troca de seção', async () => {
  const injected = [];
  const events = [];
  const measurement = createMeasurement({
    ...production,
    load: async () => ({ inject: () => injected.push('inject'), track: (name, data) => events.push([name, data]) }),
  });
  assert.equal(await measurement.start(), true);
  assert.deepEqual(injected, ['inject']);
  assert.equal(measurement.route('#/home'), true);
  assert.equal(measurement.route('#/home'), false);
  assert.equal(measurement.route('#/tool/anotacoes?item=abc'), true);
  assert.deepEqual(events, [['rota', { rota: 'home' }], ['rota', { rota: 'tool/anotacoes' }]]);
  // Reiniciar não duplica a visita já contada.
  assert.equal(await measurement.start(), true);
  assert.deepEqual(injected, ['inject']);
});

test('desativar interrompe novas contagens sem recarregar o script', async () => {
  const injected = [];
  const events = [];
  const measurement = createMeasurement({
    ...production,
    load: async () => ({ inject: () => injected.push('inject'), track: (name, data) => events.push([name, data]) }),
  });
  await measurement.start();
  measurement.setEnabled(false);
  assert.equal(measurement.route('#/home'), false);
  measurement.setEnabled(true);
  assert.equal(await measurement.start(), true);
  assert.equal(measurement.route('#/home'), true);
  assert.deepEqual(injected, ['inject']);
  assert.equal(events.length, 1);
});

test('falha ao carregar o pacote não quebra a aplicação', async () => {
  const measurement = createMeasurement({ ...production, load: async () => { throw new Error('rede'); } });
  assert.equal(await measurement.start(), false);
  assert.equal(measurement.route('#/home'), false);
  assert.equal(measurement.allowed(), true);
});

test('ambiente é local fora do build do Vercel', () => {
  assert.equal(deployEnvironment(), 'local');
});
