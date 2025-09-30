import type { Metadata } from 'next';
import './globals.css';
import PwaRegistry from '@/components/PwaRegistry';


export const metadata: Metadata = {
  title: 'Tasky PWA',
  description: 'Una app de tareas progresiva',
  // ¡Añade esta línea!
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Opcional: Mejora la apariencia en iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tasky" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#673ab7" />
      </head>
      <body>
        <PwaRegistry/>
        {children}
      </body>
    </html>
  );
}
