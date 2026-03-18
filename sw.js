const CACHE_NAME = 'discipulado-pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './curriculum.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).catch(() => {
                // If offline and request fails, just return empty gracefully if possible
            });
        })
    );
});

self.addEventListener('push', event => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; } catch(e) {}
    
    const title = data.title || 'Recordatorio de Cita';
    const options = {
        body: data.body || 'Tienes un estudio próximo programado.',
        icon: '/img/icons/icon-192x192.png',
        badge: '/img/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
