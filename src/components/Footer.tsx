'use client';

interface FooterProps {
  isOnline: boolean;
}

export default function Footer({ isOnline }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 text-sm border-t border-gray-700 sticky bottom-0">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p>© {currentYear} Taskly. Todos los derechos reservados.</p>
          <span className="hidden sm:inline">|</span>
          <p className="hidden sm:inline">
            {isOnline ? '🟢 En línea' : '🔴 Sin conexión'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">PWA</span>
          <span className="text-xs">•</span>
          <span className="text-xs">Offline First</span>
        </div>
      </div>
    </footer>
  );
}

