/**
 * Cliente API para comunicación con el backend Deno + Oak
 * Maneja reintentos, caché y sincronización offline
 */

const API_BASE_URL = 'https://taskly-back-9erv.onrender.com/api';
const TIMEOUT = 10000; // 10 segundos

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  offline?: boolean;
  cached?: boolean;
}

/**
 * Realizar una solicitud HTTP con reintentos y timeout
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = TIMEOUT, retries = 3 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es el último intento, lanzar el error
      if (attempt === retries - 1) {
        throw lastError;
      }

      // Esperar antes de reintentar (backoff exponencial)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('Failed to fetch');
}

/**
 * Obtener todas las tareas del servidor
 */
export async function fetchTasks(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error fetching tasks:', message);

    return {
      error: message,
      offline: !navigator.onLine,
    };
  }
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPush(subscription: PushSubscription): Promise<ApiResponse<any>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/subscribe`, {
      method: 'POST',
      body: subscription,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error subscribing to push:', message);

    return {
      error: message,
      offline: !navigator.onLine,
    };
  }
}

/**
 * Enviar notificación push de prueba
 */
export async function sendTestNotification(): Promise<ApiResponse<any>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/send-notification`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error sending notification:', message);

    return {
      error: message,
      offline: !navigator.onLine,
    };
  }
}

/**
 * Verificar disponibilidad del servidor
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
      timeout: 5000,
      retries: 1,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtener el estado de la conexión
 */
export function getConnectionStatus(): {
  online: boolean;
  type: string;
} {
  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    type: connection?.effectiveType || 'unknown',
  };
}

/**
 * Escuchar cambios de conexión
 */
export function onConnectionChange(
  callback: (status: { online: boolean; type: string }) => void
): () => void {
  const handleChange = () => {
    callback(getConnectionStatus());
  };

  window.addEventListener('online', handleChange);
  window.addEventListener('offline', handleChange);

  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (connection) {
    connection.addEventListener('change', handleChange);
  }

  return () => {
    window.removeEventListener('online', handleChange);
    window.removeEventListener('offline', handleChange);
    if (connection) {
      connection.removeEventListener('change', handleChange);
    }
  };
}

