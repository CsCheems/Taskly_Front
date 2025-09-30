'use client';

import { useState, useEffect } from 'react';
import { getTasksFromDB, saveTasksToDB } from '@/lib/db';
import NotificationManager from './NotificationManager';

interface Task {
    id: number;
    title: string;
    status: string;
}

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        async function loadTasks() {
        try {
            const response = await fetch('http://localhost:8000/api/tasks' );
            if (!response.ok) {
            throw new Error('La respuesta del servidor no fue OK');
            }
            const remoteTasks: Task[] = await response.json();
            setTasks(remoteTasks);
            setIsOffline(false);
            setError(null);

            await saveTasksToDB(remoteTasks);

        } catch (err) {
            console.warn('Fallo al obtener tareas de la API, intentando desde IndexedDB.', err);
            setError('No se pudo conectar al servidor.');
            setIsOffline(true);

            const localTasks = await getTasksFromDB();
            if (localTasks && localTasks.length > 0) {
            setTasks(localTasks);
            setError(null);
            } else {
            setError('No hay conexión y no se encontraron datos locales.');
            }
        }
        }

        async function checkSubscription() {
            if ('serviceWorker' in navigator) {
                try {
                const reg = await navigator.serviceWorker.ready; // Espera a que el worker esté listo
                const sub = await reg.pushManager.getSubscription(); // Comprueba la suscripción
                if (sub) {
                    setIsSubscribed(true); // Actualiza el estado
                }
                } catch (err) {
                console.error("Error al comprobar la suscripción:", err);
                }
            }
        }

        loadTasks();
        checkSubscription();
        
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {isOffline && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Modo Fuera de Línea</p>
            <p>Estás viendo datos guardados. Algunas funciones pueden no estar disponibles.</p>
            </div>
        )}

        <header className="flex justify-between items-center border-b-2 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Mis Tareas</h1>
            <button className="bg-purple-700 text-white rounded-full w-12 h-12 text-2xl font-bold hover:bg-purple-800 transition-colors">
            +
            </button>
        </header>

        <main className="mt-6">
            {error && <p className="text-red-500">{error}</p>}
            
            {tasks.length > 0 ? (
            tasks.map(task => (
                <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-lg mb-3 flex justify-between items-center shadow-md border border-gray-200"
                >
                    <p className="text-gray-800 font-medium">{task.title}</p>
                    <span 
                        className={`px-3 py-1 text-sm font-bold rounded-full ${
                            task.status === 'Completada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {task.status}
                    </span>
                </div>
            ))
            ) : (
            !error && <p className="text-gray-500">Cargando tareas...</p>
            )}
        </main>
        <NotificationManager 
            isSubscribed={isSubscribed} 
            setIsSubscribed={setIsSubscribed} 
        />
        </div>
    );
}
