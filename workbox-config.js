module.exports = {
  // 1. Directorio donde Workbox buscará los archivos para cachear.
  // Next.js pone todo en la carpeta .next/static.
  globDirectory: '.next/static/',
  
  // 2. Patrones de archivos a incluir en el precaché.
  globPatterns: [
    '**/*.{js,css,woff2}', // Cachea todos los JS, CSS y fuentes
    'chunks/app/**/*.js', // Cachea las páginas de la app
  ],
  
  // 3. Dónde se guardará el Service Worker final.
  swDest: 'public/sw.js',
  
  // 4. Archivo base para inyectar la lógica de precaché.
  // Usaremos nuestro worker.ts (compilado a .js).
  swSrc: '.next/static/worker.js',
  
  // 5. Nombre de la variable que contiene el manifiesto de precaché.
  injectionPoint: 'self.__WB_MANIFEST',
};
