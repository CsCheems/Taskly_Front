'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/service-worker-utils';

export default function PwaRegistry() {
  useEffect(() => {
    // Registrar Service Worker cuando la página carga
    const registerWorker = async () => {
      try {
        await registerServiceWorker();
      } catch (error) {
        console.error('Error al registrar Service Worker:', error);
      }
    };

    // Esperar a que el documento esté completamente cargado
    if (document.readyState === 'loading') {
      window.addEventListener('load', registerWorker);
      return () => window.removeEventListener('load', registerWorker);
    } else {
      registerWorker();
    }
  }, []);

  return null;
}

