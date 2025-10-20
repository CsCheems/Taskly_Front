'use client';

import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isOnline: boolean;
}

export default function Header({ onMenuClick, isOnline }: HeaderProps) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleInstall = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker registrado:', registration);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Error al instalar:', error);
      }
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-purple-700 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo and Title */}
        <div className="flex items-center gap-3 flex-1 lg:flex-none">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-purple-600">
            T
          </div>
          <h1 className="text-xl font-bold hidden sm:inline">Taskly</h1>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Online Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              }`}
            ></div>
            <span className="text-sm hidden sm:inline">
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>

          {/* Install Button */}
          {showInstallPrompt && (
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Instalar
            </button>
          )}
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-600 px-4 py-2 text-sm">
          ⚠️ Sin conexión a internet. Usando datos locales.
        </div>
      )}
    </header>
  );
}

