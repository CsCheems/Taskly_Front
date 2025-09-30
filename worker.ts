import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Workbox inyectará aquí la lista de archivos para precachear.
precacheAndRoute(self.__WB_MANIFEST);

// Estrategia para las peticiones a nuestra API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);

// Estrategia para otras peticiones (ej. imágenes, fuentes de Google)
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-assets-cache',
  })
);

// --- Lógica de Notificaciones (sin cambios) ---
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data ? event.data.json() : { title: 'Tasky' };
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/logo-192.png' }));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
