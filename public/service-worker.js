// Taskly PWA Service Worker
// Proporciona funcionalidad offline y caché para el App Shell

const CACHE_VERSION = 'v1';
const CACHE_NAME = `taskly-${CACHE_VERSION}`;
const RUNTIME_CACHE = `taskly-runtime-${CACHE_VERSION}`;
const API_CACHE = `taskly-api-${CACHE_VERSION}`;

// Archivos críticos del App Shell que deben estar disponibles offline
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
];

// Patrones de URL para diferentes estrategias de caché
const API_PATTERN = /^https:\/\/taskly-deno\.onrender\.com\/api\//;
const STATIC_PATTERN = /\.(js|css|woff2|png|svg|ico)$/;

// ============================================================================
// INSTALL EVENT - Precachear el App Shell
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS).catch((error) => {
        console.warn('[Service Worker] Some critical assets failed to cache:', error);
        // No fallar la instalación si algunos assets no se pueden cachear
        return Promise.resolve();
      });
    })
  );

  // Forzar que el nuevo Service Worker tome control inmediatamente
  self.skipWaiting();
});

// ============================================================================
// ACTIVATE EVENT - Limpiar cachés antiguos
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés que no sean la versión actual
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE &&
            cacheName.startsWith('taskly-')
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de todos los clientes inmediatamente
  self.clients.claim();
});

// ============================================================================
// FETCH EVENT - Estrategias de caché inteligentes
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar solicitudes a extensiones de Chrome
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Estrategia para API
  if (API_PATTERN.test(request.url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Estrategia para archivos estáticos
  if (STATIC_PATTERN.test(request.url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Estrategia por defecto para documentos HTML
  event.respondWith(handleDocumentRequest(request));
});

// ============================================================================
// ESTRATEGIA: Network First para API (con fallback a caché)
// ============================================================================
async function handleApiRequest(request) {
  try {
    // Intentar obtener del servidor
    const response = await fetch(request);

    // Si la respuesta es exitosa, guardarla en caché
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Si falla la red, intentar obtener del caché
    console.log('[Service Worker] API request failed, trying cache:', request.url);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Si no hay caché, retornar una respuesta de error offline
    return new Response(
      JSON.stringify({
        error: 'No hay conexión y no hay datos en caché',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================================================
// ESTRATEGIA: Cache First para archivos estáticos
// ============================================================================
async function handleStaticRequest(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Static asset not available:', request.url);
    // Retornar un placeholder para imágenes
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ddd" width="100" height="100"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Not available offline', { status: 503 });
  }
}

// ============================================================================
// ESTRATEGIA: Network First para documentos HTML
// ============================================================================
async function handleDocumentRequest(request) {
  try {
    // Intentar obtener del servidor
    const response = await fetch(request);

    if (response.ok) {
      // Guardar en caché si es exitoso
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Si falla la red, intentar obtener del caché
    console.log('[Service Worker] Document request failed, trying cache:', request.url);
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    // Retornar la página principal como fallback
    const mainPage = await caches.match('/');
    if (mainPage) {
      return mainPage;
    }

    return new Response('No hay conexión y la página no está en caché', {
      status: 503,
    });
  }
}

// ============================================================================
// MESSAGE EVENT - Comunicación con el cliente
// ============================================================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'CLEAR_CACHE':
      handleClearCache();
      break;
    case 'CACHE_URLS':
      handleCacheUrls(payload);
      break;
    case 'GET_CACHE_SIZE':
      handleGetCacheSize(event);
      break;
    default:
      console.log('[Service Worker] Unknown message type:', type);
  }
});

// Limpiar todo el caché
async function handleClearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith('taskly-'))
      .map((name) => caches.delete(name))
  );
  console.log('[Service Worker] Cache cleared');
}

// Cachear URLs específicas
async function handleCacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    await cache.addAll(urls);
    console.log('[Service Worker] URLs cached:', urls);
  } catch (error) {
    console.warn('[Service Worker] Failed to cache URLs:', error);
  }
}

// Obtener tamaño del caché
async function handleGetCacheSize(event) {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('taskly-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
  }

  event.ports[0].postMessage({
    type: 'CACHE_SIZE',
    size: totalSize,
  });
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    badge: '/logo/taskly-logo.png',
    icon: '/logo/taskly-logo.png',
    vibrate: [100, 50, 100],
    tag: 'taskly-notification',
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || 'Taskly';
      options.body = data.body || 'Tienes una nueva notificación';
    } catch {
      options.title = 'Taskly';
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(options.title, options));
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si hay una ventana abierta, enfocarse en ella
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[Service Worker] Loaded and ready');

