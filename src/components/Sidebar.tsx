'use client';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onViewChange: (view: 'tasks' | 'settings' | 'about') => void;
}

export default function Sidebar({ isOpen, currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'tasks',
      label: 'Mis Tareas',
      icon: '✓',
      description: 'Gestiona tus tareas diarias',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: '⚙',
      description: 'Preferencias de la app',
    },
    {
      id: 'about',
      label: 'Acerca de',
      icon: 'ℹ',
      description: 'Información de Taskly',
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => onViewChange(currentView as any)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Taskly PWA v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}

