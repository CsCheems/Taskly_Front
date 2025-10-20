'use client';

import { useState, useEffect } from 'react';

export default function SettingsView() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState('Calculando...');

  useEffect(() => {
    checkSubscription();
    calculateCacheSize();
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (error) {
        console.error('Error al verificar suscripción:', error);
      }
    }
  };

  const calculateCacheSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage! / 1024 / 1024).toFixed(2);
        setCacheSize(`${usedMB} MB`);
      } catch (error) {
        console.error('Error al calcular tamaño de caché:', error);
      }
    }
  };

  const handleNotificationToggle = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(!notificationsEnabled);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCacheSize('0 MB');
      alert('Caché limpiado correctamente');
    }
  };

  const handleExportData = async () => {
    try {
      const db = indexedDB.open('taskly');
      db.onsuccess = () => {
        const request = db.result.transaction('tasks').objectStore('tasks').getAll();
        request.onsuccess = () => {
          const data = {
            tasks: request.result,
            exportDate: new Date().toISOString(),
          };
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `taskly-backup-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        };
      };
    } catch (error) {
      console.error('Error al exportar datos:', error);
      alert('Error al exportar datos');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h2>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">🔔 Notificaciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones Push</p>
              <p className="text-sm text-gray-600">
                {isSubscribed ? 'Habilitadas' : 'Deshabilitadas'}
              </p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`px-4 py-2 rounded-lg transition-colors ${
                notificationsEnabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {notificationsEnabled ? 'Activado' : 'Desactivado'}
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Recibe notificaciones en tiempo real sobre tus tareas y actualizaciones importantes.
          </p>
        </div>
      </div>

      {/* Storage Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">💾 Almacenamiento</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Espacio utilizado</p>
              <p className="text-sm text-gray-600">{cacheSize}</p>
            </div>
            <button
              onClick={calculateCacheSize}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </div>
          <button
            onClick={handleClearCache}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Limpiar Caché
          </button>
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Datos</h3>
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            📥 Exportar datos como JSON
          </button>
          <p className="text-sm text-gray-600">
            Descarga un respaldo de tus tareas en formato JSON para importarlas más tarde.
          </p>
        </div>
      </div>

      {/* App Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Información de la App</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Versión:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tipo:</span>
            <span>Progressive Web App (PWA)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Tecnología:</span>
            <span>Next.js + React + Deno</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Modo Offline:</span>
            <span>✅ Soportado</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Almacenamiento:</span>
            <span>IndexedDB + Service Worker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

