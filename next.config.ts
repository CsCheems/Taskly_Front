import { type NextConfig } from 'next';
import { build } from 'esbuild';
import { execSync } from 'child_process';

const nextConfig: NextConfig = {
  // Ya no necesitamos la cabecera Service-Worker-Allowed con este método
};

// --- LÓGICA DE BUILD PERSONALIZADA ---
// Sobrescribimos el comando `next build`
const originalBuild = nextConfig.webpack;
nextConfig.webpack = (config, options) => {
  if (!options.isServer) {
    // Compilamos nuestro worker.ts a .next/static/worker.js
    build({
      entryPoints: ['worker.ts'],
      outfile: '.next/static/worker.js',
      bundle: true,
      minify: true,
    }).then(() => {
      // Una vez compilado, usamos Workbox CLI para inyectar el precaché
      console.log('🚀 Generando Service Worker con Workbox...');
      execSync('npx workbox-cli injectManifest workbox-config.js');
      console.log('✅ Service Worker generado en public/sw.js');
    });
  }
  
  if (typeof originalBuild === 'function') {
    return originalBuild(config, options);
  }
  return config;
};

export default nextConfig;
