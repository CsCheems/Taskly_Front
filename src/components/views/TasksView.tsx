'use client';

import { useState, useEffect } from 'react';
import { getTasksFromDB, saveTasksToDB } from '@/lib/db';
import { fetchTasks } from '@/lib/api-client';

interface Task {
  id: number;
  title: string;
  status: string;
}

interface TasksViewProps {
  isOffline: boolean;
}

export default function TasksView({ isOffline }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Intentar obtener del servidor
      const result = await fetchTasks();

      if (result.data) {
        setTasks(result.data);
        await saveTasksToDB(result.data);
        setLastSyncTime(new Date());
        setError(null);
      } else if (result.error) {
        // Si hay error pero estamos offline, intentar cargar del caché
        if (!navigator.onLine) {
          const localTasks = await getTasksFromDB();
          if (localTasks && localTasks.length > 0) {
            setTasks(localTasks);
            setError('Usando datos guardados localmente');
          } else {
            setError('No se pudieron cargar las tareas');
          }
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      // Intentar cargar del caché local
      const localTasks = await getTasksFromDB();
      if (localTasks && localTasks.length > 0) {
        setTasks(localTasks);
        setError('Usando datos guardados localmente');
      } else {
        setError('No se pudieron cargar las tareas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      title: newTaskTitle,
      status: 'Pendiente',
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasksToDB(updatedTasks);
    setNewTaskTitle('');

    // Intentar sincronizar con el servidor si estamos online
    if (navigator.onLine) {
      try {
        await fetchTasks();
      } catch (err) {
        console.warn('No se pudo sincronizar con el servidor');
      }
    }
  };

  const handleToggleTask = async (id: number) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status: task.status === 'Completada' ? 'Pendiente' : 'Completada',
          }
        : task
    );
    setTasks(updatedTasks);
    await saveTasksToDB(updatedTasks);
  };

  const handleDeleteTask = async (id: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    await saveTasksToDB(updatedTasks);
  };

  const handleRefresh = async () => {
    await loadTasks();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'Pendiente';
    if (filter === 'completed') return task.status === 'Completada';
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Completada').length,
    pending: tasks.filter((t) => t.status === 'Pendiente').length,
  };

  const completionPercentage = tasks.length > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Offline Banner */}
      {isOffline && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800 font-semibold">⚠️ Modo sin conexión</p>
          <p className="text-yellow-700 text-sm">
            Estás viendo datos guardados localmente. Los cambios se sincronizarán cuando recuperes conexión.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Tareas</h2>
          <p className="text-gray-600">Gestiona y organiza tus tareas de manera eficiente</p>
          {lastSyncTime && (
            <p className="text-xs text-gray-500 mt-2">
              Última sincronización: {lastSyncTime.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          disabled={loading}
        >
          {loading ? '⟳ Actualizando...' : '⟳ Actualizar'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pendientes</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completadas</p>
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Progreso general</p>
            <p className="text-sm font-bold text-purple-600">{completionPercentage}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Agregar nueva tarea..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Agregar
          </button>
        </div>
      </form>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'all' && 'Todas'}
            {f === 'pending' && 'Pendientes'}
            {f === 'completed' && 'Completadas'}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
          <p className="text-gray-500 mt-4">Cargando tareas...</p>
        </div>
      ) : error && tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'Completada'}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.status === 'Completada' ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    task.status === 'Completada'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {task.status}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar tarea"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {filter === 'all'
              ? 'No hay tareas. ¡Crea una nueva!'
              : `No hay tareas ${filter === 'pending' ? 'pendientes' : 'completadas'}`}
          </p>
        </div>
      )}
    </div>
  );
}

