import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Compatível também com hospedagem estática em subdiretórios.
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
});
