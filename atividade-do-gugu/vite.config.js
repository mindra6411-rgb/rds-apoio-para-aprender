import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// O worker só existe no build: o servidor de desenvolvimento não tem um
// conjunto estável de arquivos para precachear.
function offlineWorker() {
  return {
    name: 'help-rds-offline-worker',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter(name => /\.(?:js|css|webp|png|jpe?g|svg|woff2?)$/i.test(name)).sort();
      const template = readFileSync(new URL('./src/offline-sw.js', import.meta.url), 'utf8');
      const html = bundle['index.html']?.source || '';
      const version = createHash('sha256').update(template).update(files.join('\n')).update(String(html)).digest('hex').slice(0, 16);
      const source = template.replace('__OFFLINE_ASSETS__', JSON.stringify(files.map(file => `./${file}`))).replace('__OFFLINE_VERSION__', version);
      this.emitFile({ type:'asset', fileName:'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './', // Compatível também com hospedagem estática em subdiretórios.
  // Identifica a publicação real sem expor variáveis de servidor: o valor é
  // apenas 'production', 'preview' ou 'local'. A medição de audiência depende
  // dele para nunca contar desenvolvimento, testes ou prévias.
  define: { __HELP_RDS_ENV__: JSON.stringify(process.env.VERCEL_ENV || 'local') },
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  plugins: [offlineWorker()],
});
