'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import TasksView from './views/TasksView';
import SettingsView from './views/SettingsView';

type ViewType = 'tasks' | 'settings' | 'about';

interface AppShellProps {
  isOffline?: boolean;
}

export default function AppShell({ isOffline = false }: AppShellProps) {
  const [currentView, setCurrentView] = useState<ViewType>('tasks');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'tasks':
        return <TasksView isOffline={!isOnline} />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return (
          <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Acerca de Taskly</h2>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <p className="text-gray-700">
                <strong>Taskly</strong> es una aplicación web progresiva (PWA) moderna para gestionar tus tareas de manera eficiente.
              </p>
              <h3 className="text-xl font-semibold mt-4">Características:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>✅ Funciona sin conexión a internet</li>
                <li>📱 Instalable como aplicación nativa</li>
                <li>🔄 Sincronización automática con el servidor</li>
                <li>🔔 Notificaciones push en tiempo real</li>
                <li>💾 Almacenamiento local seguro con IndexedDB</li>
              </ul>
              <p className="text-gray-600 text-sm mt-6">
                Versión 1.0.0 | Desarrollado con Next.js, React y Deno
              </p>
            </div>
          </div>
        );
      default:
        return <TasksView isOffline={!isOnline} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen}
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      {/* Footer */}
      <Footer isOnline={isOnline} />
    </div>
  );
}

