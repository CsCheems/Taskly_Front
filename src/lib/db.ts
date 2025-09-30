import { openDB, type DBSchema } from 'idb';


interface TaskyDB extends DBSchema {
    tasks: {
        key: number; 
        value: {
        id: number;
        title: string;
        status: string;
        };
        indexes: { 'by-status': string }; 
    };
}

const dbPromise = openDB<TaskyDB>('tasky-database', 1, {
    upgrade(db) {
        const taskStore = db.createObjectStore('tasks', {
        keyPath: 'id',
        });
        taskStore.createIndex('by-status', 'status');
        console.log('Base de datos IndexedDB creada/actualizada.');
    },
});

    
export async function getTasksFromDB() {
    return (await dbPromise).getAll('tasks');
}

export async function saveTasksToDB(tasks: TaskyDB['tasks']['value'][]) {
    const db = await dbPromise;
    const tx = db.transaction('tasks', 'readwrite');
    await Promise.all(tasks.map(task => tx.store.put(task)));
    await tx.done;
    console.log(`${tasks.length} tareas guardadas en IndexedDB.`);
}
