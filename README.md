# Frontend de Taskly PWA ⚛️

Este es el proyecto del frontend para **Tasky**, una Aplicación Web Progresiva (PWA) construida con **Next.js** (React).

Esta aplicación funciona como el cliente que los usuarios ven y con el que interactúan. Se conecta al backend `taskly` para obtener datos y gestionar las notificaciones push.

---

## ✨ Características Principales

-   **Interfaz Moderna:** Construida con React y estilizada con Tailwind CSS.
-   **Instalable (PWA):** Configurada con un Manifiesto Web y un Service Worker para ser instalable en cualquier dispositivo.
-   **Capacidad Offline:** Utiliza un Service Worker para cachear los recursos de la aplicación y **IndexedDB** para almacenar datos, permitiendo su uso sin conexión.
-   **Notificaciones Push:** Permite al usuario suscribirse para recibir notificaciones del servidor.
-   **Renderizado del Lado del Servidor (SSR):** Aprovecha Next.js para una carga inicial rápida y un buen SEO.

---

## 🛠️ Tecnologías y Dependencias

-   **Entorno de Ejecución:** [Node.js](https://nodejs.org/en/ ) (v18 o superior) y npm.
-   **Framework Principal:** [Next.js](https://nextjs.org/ ) (v15.x)
-   **UI:** [React](https://react.dev/ ) (v19) y [Tailwind CSS](https://tailwindcss.com/ )
-   **Almacenamiento Offline:** [idb](https://github.com/jakearchibald/idb ) - Un wrapper ligero para IndexedDB.
-   **Service Worker:** Generado y gestionado a través de un script de `build` personalizado que utiliza **Workbox**, dándonos control total sobre las estrategias de caché.

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos
-   Tener [Node.js](https://nodejs.org/en/ ) y npm instalados.
-   El [servidor del backend (`taskly`)](#) debe estar configurado y corriendo en `http://localhost:8000`.

### Pasos de Configuración

1.  **Navega a esta carpeta:**
    ```bash
    cd taskly-pwa
    ```

2.  **Instala las dependencias del proyecto:**
    ```bash
    npm install
    ```

3.  **Configura la Clave Pública VAPID:**
    Abre el archivo `src/components/NotificationManager.tsx`. Busca la constante `VAPID_PUBLIC_KEY` y pega la **clave pública** que generaste en el backend.

4.  **Compila y Ejecuta la Aplicación:**
    Las funcionalidades de PWA (como el Service Worker ) solo están activas en el modo de producción.
    
    a. **Compila la aplicación:**
    ```bash
    npm run build
    ```
    Este paso optimiza el código y genera el Service Worker en la carpeta `public/`.

    b. **Inicia el servidor de producción:**
    ```bash
    npm run start
    ```

¡Listo! La aplicación web estará disponible en `http://localhost:3000`.

---

## 🕹️ Uso y Pruebas

### ⚠️ Nota Importante sobre Navegadores
Para probar las notificaciones push, se recomienda encarecidamente usar **Google Chrome** o **Microsoft Edge**. Navegadores como Brave u Opera tienen protecciones de privacidad que pueden interferir con la API de Notificaciones Push.

### Probar la Funcionalidad PWA
1.  Abre `http://localhost:3000` en Chrome o Edge.
2.  Abre las Herramientas de Desarrollador (F12 ) y ve a la pestaña `Application`.
3.  En `Service Workers`, deberías ver `sw.js` activado y corriendo.
4.  En `Manifest`, deberías ver los detalles de la aplicación. El icono de "Instalar" debería aparecer en la barra de direcciones.

### Probar las Notificaciones Push
1.  En la aplicación, busca la sección "Gestión de Notificaciones".
2.  Haz clic en **"Activar Notificaciones"** y acepta el permiso.
3.  Una vez suscrito, haz clic en **"Enviar Notificación de Prueba"**. Deberías recibir una notificación en tu escritorio.

---

## 📜 Scripts Disponibles

-   `npm run dev`: Inicia el servidor de desarrollo con recarga rápida. **Nota:** Las funcionalidades de PWA están desactivadas en este modo.
-   `npm run build`: Compila la aplicación para producción.
-   `npm run start`: Inicia el servidor de producción (requiere `npm run build` primero).
-   `npm run lint`: Ejecuta el linter para revisar la calidad del código.
