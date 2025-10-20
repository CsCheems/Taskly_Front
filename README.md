# Taskly PWA Frontend

Bienvenido al frontend de Taskly, una **Aplicación Web Progresiva (PWA)** moderna para la gestión de tareas. Este proyecto ha sido desarrollado utilizando **Next.js** y **React** para el frontend, **Tailwind CSS** para un diseño responsivo y eficiente, y se integra con un backend desarrollado en **Deno + Oak**.

## 🚀 Características Principales

Taskly está diseñado para ofrecer una experiencia de usuario fluida y robusta, incluso en condiciones de red inestables o sin conexión, gracias a la implementación de las siguientes características PWA:

*   **App Shell Arquitecture**: La interfaz de usuario básica (encabezado, menú de navegación, pie de página) se carga instantáneamente y se cachea, proporcionando una experiencia de carga rápida y consistente.
*   **Funcionalidad Offline**: Gracias al **Service Worker**, la aplicación puede funcionar sin conexión a internet, mostrando datos cacheados y sincronizando los cambios una vez que la conexión se restablece.
*   **Manifiesto Web (manifest.json)**: Permite que la aplicación sea instalable en el dispositivo del usuario, ofreciendo una experiencia similar a la de una aplicación nativa, con su propio ícono en la pantalla de inicio y una experiencia de pantalla completa.
*   **Contenido Dinámico**: Carga y gestiona tareas de forma dinámica, con persistencia de datos local a través de **IndexedDB** y sincronización con el backend.
*   **Notificaciones Push**: Soporte para notificaciones en tiempo real (requiere configuración del backend).

## 🏗️ Arquitectura del Proyecto

El frontend de Taskly sigue una arquitectura basada en componentes de React y la estructura de directorios de Next.js. La aplicación se divide en las siguientes secciones clave:

*   **App Shell**: Compuesto por `Header.tsx`, `Sidebar.tsx`, `Footer.tsx`, y `AppShell.tsx` (que orquesta estos componentes). Estos elementos proporcionan la estructura básica de la interfaz de usuario.
*   **Vistas Dinámicas**: El contenido principal de la aplicación se carga dinámicamente dentro del App Shell. Actualmente, `TasksView.tsx` es la vista principal para la gestión de tareas, y `SettingsView.tsx` para la configuración de la aplicación.
*   **Service Worker**: Implementado en `public/service-worker.js`, es responsable de la estrategia de caché para el App Shell, activos estáticos y llamadas a la API, permitiendo la funcionalidad offline.
*   **Manifiesto Web**: `public/manifest.json` define los metadatos de la PWA, como el nombre, íconos, colores y comportamiento de instalación.
*   **IndexedDB**: Utilizado a través de `@/lib/db.ts` para el almacenamiento persistente de datos de tareas en el cliente, asegurando la disponibilidad offline.
*   **API Client**: `@/lib/api-client.ts` encapsula la lógica para interactuar con el backend de Deno + Oak, incluyendo manejo de errores, reintentos y timeouts.
*   **PwaRegistry**: `@/components/PwaRegistry.tsx` se encarga de registrar el Service Worker al cargar la aplicación.

### Interacción con el Backend (Deno + Oak)

El frontend se comunica con un backend RESTful desarrollado en Deno + Oak. Las operaciones CRUD para las tareas se manejan a través de endpoints API, y el backend también soporta la gestión de suscripciones y envío de notificaciones push.

## ⚙️ Configuración y Ejecución

### Requisitos

*   Node.js (v18 o superior)
*   pnpm (o npm/yarn)
*   Deno (v1.x o superior) para el backend

### Frontend

1.  **Instalar dependencias:**
    ```bash
    cd taskly-front/taskly-front
    pnpm install
    ```

2.  **Ejecutar en modo desarrollo:**
    ```bash
    pnpm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

3.  **Construir para producción:**
    ```bash
    pnpm run build
    ```

4.  **Ejecutar en modo producción:**
    ```bash
    pnpm run start
    ```

### Backend (Deno + Oak)

1.  **Navegar al directorio del backend:**
    ```bash
    cd taskly-backend/taskly
    ```

2.  **Ejecutar el servidor Deno:**
    ```bash
    deno run --allow-net --allow-read --allow-write main.ts
    ```
    El backend se ejecutará en el puerto 8000 por defecto. Asegúrate de que las claves VAPID estén configuradas en `main.ts` si deseas probar las notificaciones push.

## 🌐 Cómo Probar la Funcionalidad Offline

Para verificar que la PWA funciona correctamente sin conexión, sigue estos pasos:

1.  **Acceder a la aplicación:** Abre la aplicación en tu navegador (preferiblemente Chrome o Edge) en modo desarrollo (`pnpm run dev`) o producción.
2.  **Instalar la PWA:** En la barra de direcciones del navegador, busca el ícono de instalación (usualmente un `+` o un monitor con una flecha) y haz clic para instalar Taskly en tu escritorio o pantalla de inicio.
3.  **Navegar y cargar datos:** Asegúrate de que la aplicación esté en línea y carga algunas tareas para que se almacenen en la caché de IndexedDB y el Service Worker.
4.  **Desconectar la red:**
    *   **Opción 1 (Modo Avión):** Activa el modo avión en tu dispositivo.
    *   **Opción 2 (Herramientas de Desarrollador):** Abre las Herramientas de Desarrollador (F12), ve a la pestaña `Application` -> `Service Workers` y marca la casilla `Offline`. También puedes ir a la pestaña `Network` y cambiar el estado a `Offline`.
5.  **Recargar la aplicación:** Con la red desconectada, recarga la página de Taskly o abre la aplicación instalada. Deberías ver el App Shell cargarse instantáneamente y las tareas previamente cargadas mostrarse desde el caché de IndexedDB.
6.  **Realizar acciones offline:** Intenta agregar o eliminar tareas. Estas acciones se guardarán localmente. Al volver a conectarte, la aplicación intentará sincronizar estos cambios con el backend.

## 📝 Documentación Adicional

*   **Service Worker (`public/service-worker.js`)**: Contiene la lógica de caché para `CACHE_NAME` (App Shell y documentos), `RUNTIME_CACHE` (activos estáticos) y `API_CACHE` (respuestas de la API). Implementa estrategias **Network First** para APIs y documentos, y **Cache First** para activos estáticos.
*   **Manifiesto (`public/manifest.json`)**: Configurado con `display: standalone` para una experiencia de aplicación, `theme_color` y `background_color` para una transición de carga fluida, y múltiples íconos para diferentes resoluciones y propósitos (`any`, `maskable`). También incluye `shortcuts` para acceso rápido a vistas específicas.
*   **IndexedDB (`src/lib/db.ts`)**: Utiliza la librería `idb` para una gestión sencilla de la base de datos IndexedDB, almacenando las tareas para persistencia offline.

---
