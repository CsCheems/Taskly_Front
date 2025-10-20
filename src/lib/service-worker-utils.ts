/**
 * Utilidades para gestionar el Service Worker
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers no soportados en este navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('✅ Service Worker registrado:', registration);

    // Escuchar actualizaciones
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            console.log('📦 Nueva versión del Service Worker disponible');
            notifyUserOfUpdate();
          }
        });
      }
    });

    // Verificar actualizaciones cada hora
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    return registration;
  } catch (error) {
    console.error('❌ Error al registrar Service Worker:', error);
    return null;
  }
}

/**
 * Notificar al usuario que hay una actualización disponible
 */
function notifyUserOfUpdate() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Taskly - Actualización disponible', {
      body: 'Una nueva versión de la aplicación está disponible. Recarga la página para actualizar.',
      icon: '/logo/taskly-logo.png',
      badge: '/logo/taskly-logo.png',
      tag: 'update-notification',
    });
  }
}

/**
 * Limpiar el caché del Service Worker
 */
export async function clearServiceWorkerCache() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if (registration.active) {
    registration.active.postMessage({
      type: 'CLEAR_CACHE',
    });
  }
}

/**
 * Cachear URLs específicas
 */
export async function cacheUrls(urls: string[]) {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if (registration.active) {
    registration.active.postMessage({
      type: 'CACHE_URLS',
      payload: urls,
    });
  }
}

/**
 * Obtener el tamaño del caché
 */
export async function getCacheSize(): Promise<number> {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator)) {
      resolve(0);
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_SIZE') {
            resolve(event.data.size);
          }
        };
        registration.active.postMessage(
          {
            type: 'GET_CACHE_SIZE',
          },
          [channel.port2]
        );
      } else {
        resolve(0);
      }
    });
  });
}

/**
 * Solicitar permiso de notificaciones
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Notificaciones no soportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPushNotifications(publicKey: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications no soportadas');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Enviar suscripción al servidor
    await fetch('https://taskly-deno.onrender.com/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    console.log('✅ Suscrito a notificaciones push');
    return subscription;
  } catch (error) {
    console.error('❌ Error al suscribirse a push notifications:', error);
    return null;
  }
}

/**
 * Convertir clave VAPID de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Verificar si la app está online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Escuchar cambios de estado online/offline
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

