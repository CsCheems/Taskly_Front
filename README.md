Taskly-Front: Aplicación Web Progresiva

Este repositorio aloja el frontend de Taskly, una aplicación diseñada para la gestión de tareas, implementada como una Progressive Web App (PWA). La arquitectura PWA permite ofrecer una experiencia de usuario optimizada, con capacidades offline y un rendimiento mejorado.

Aspectos Clave de la PWA:

App Shell

La estructura del App Shell de Taskly asegura una carga inicial rápida y una interfaz de usuario consistente. El componente src/components/AppShell.tsx define el esqueleto básico de la aplicación, que incluye la cabecera, el pie de página y el área de contenido principal. Esta estructura se almacena en caché para facilitar el acceso instantáneo en visitas subsiguientes.

Service Worker

El Service Worker, localizado en public/service-worker.js, es fundamental para la funcionalidad PWA de Taskly. Este script opera en segundo plano para gestionar el almacenamiento en caché, las notificaciones y la sincronización. Las estrategias de caché implementadas son:

•
Network First (APIs): Prioriza la obtención de datos recientes de la red para las solicitudes a la API, con un mecanismo de fallback a la caché para asegurar la disponibilidad offline.

•
Cache First (Activos Estáticos): Sirve recursos como archivos JavaScript, CSS e imágenes directamente desde la caché. Si un recurso no está disponible en caché, se busca en la red y se almacena para futuras solicitudes.

•
Network First (Documentos HTML): Intenta siempre recuperar la versión más actualizada de los documentos HTML de la red, recurriendo a la caché en caso de fallos de conexión.

Web App Manifest

El archivo public/manifest.json describe cómo Taskly se presenta al usuario cuando se instala en un dispositivo. Contiene metadatos como el nombre de la aplicación, íconos, la URL de inicio y el modo de visualización (standalone), permitiendo una integración similar a la de una aplicación nativa.

Contenido Dinámico

El contenido dinámico de Taskly se carga mediante APIs y se integra dentro del App Shell. El Service Worker facilita la gestión de este contenido al cachear las respuestas de la API, lo que permite a la aplicación funcionar y mostrar datos incluso sin conexión a internet. La sincronización de datos se realiza automáticamente una vez que se restablece la conectividad.

Configuración y Ejecución

Para poner en marcha el proyecto localmente:

1. Clonar el repositorio

2. Instalar dependencias

3. Iniciar el servidor de desarrollo

La aplicación estará accesible en http://localhost:10000.

