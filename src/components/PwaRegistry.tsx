'use client';

import { useEffect } from 'react';

export default function PwaRegistry() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('✅ Service Worker registrado manualmente con éxito. Scope:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Error al registrar el Service Worker manualmente:', error);
            });
        });
        }
    }, []);
    return null;
}
