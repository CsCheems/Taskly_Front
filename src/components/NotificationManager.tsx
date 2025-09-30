'use client';

import { useState } from 'react';

const VAPID_PUBLIC_KEY = "BD84b3_4YjcrhpVnsSPRNAlsB88M0IT16lR6Jv2H8XRmhT3IGskt8Z6w7Zy2pX5gT01F1D1ANr-BdO8zRlkU88s";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface NotificationManagerProps {
    isSubscribed: boolean;
    setIsSubscribed: (isSubscribed: boolean) => void;
}

export default function NotificationManager({ isSubscribed, setIsSubscribed }: NotificationManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        if (!VAPID_PUBLIC_KEY.startsWith('B')) {
        setError("Error: La clave pública VAPID no parece ser válida.");
        return;
        }
        setError(null);
        setIsLoading(true);
        try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        await fetch('https://taskly-deno.onrender.com/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub ),
        });
        setIsSubscribed(true);
        } catch (err) {
        console.error(err);
        if (Notification.permission === 'denied') {
            setError("Has bloqueado las notificaciones. Debes habilitarlas en la configuración del navegador.");
        } else {
            setError("No se pudo suscribir a las notificaciones.");
        }
        } finally {
        setIsLoading(false);
        }
    };
    
    const handleSendTestNotification = async () => {
        await fetch('https://taskly-deno.onrender.com/api/send-notification', { method: 'POST' } );
    };

    return (
        <div className="bg-black-50 p-4 rounded-lg mt-6 border">
        <h2 className="font-bold mb-2">Gestión de Notificaciones</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        {!isSubscribed ? (
            <button onClick={handleSubscribe} disabled={isLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
            Activar Notificaciones
            </button>
        ) : (
            <div>
            <p className="text-green-700 mb-2">✅ ¡Ya estás suscrito a las notificaciones!</p>
            <button onClick={handleSendTestNotification} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Enviar Notificación de Prueba
            </button>
            </div>
        )}
        </div>
    );
}
