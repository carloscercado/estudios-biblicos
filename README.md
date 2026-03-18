# Crystal Meteoroid - PWA para discipulado

Esta es una Progressive Web App (PWA) diseñada para gestionar grupos de discipulado y estudios bíblicos, con funcionalidad offline y notificaciones push.

## Características
- Gestión de asistentes y estado de avance.
- Interfaz móvil amigable (Mobile First).
- Funcionalidad Offline gracias a Service Workers.
- Notificaciones de recordatorios de estudio.
- Interacción para llamar, enviar mensajes y ver dirección (Google Maps).

## Desarrollo Local
Para correr esta aplicación de forma local, asegúrate de tener Node.js instalado.

```bash
# Instalar dependencias
npm install

# Correr el servidor de desarrollo
npm run serve
```

La aplicación estará disponible en `http://localhost:3000`.

## Despliegue en Render
Este proyecto incluye un archivo `render.yaml` ("Blueprint") configurado para desplegarse fácilmente como un Static Site en Render de forma gratuita. 
Solo es necesario conectar el repositorio de GitHub con Render.
