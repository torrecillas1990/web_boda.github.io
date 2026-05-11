const CACHE_NAME = 'vitalstats-cache-v1';

// 1. Lista de archivos que queremos que funcionen OFFLINE
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './recursos/usuarios.js',
    './manifest.json',
    // Herramientas
    './contador-calorias/index.html',
    './calculadora-grasa-corporal/index.html',
    './calculadora-ritmo/index.html',
    './calculadora-ritmo/style.css',
    './calculadora-ritmo/script.js',
    // Rutas (GPX y catálogo)
    './rutas/rutas.js',
    // CDNs externos (Leaflet)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css',
    'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js'
];

// --- EVENTO DE INSTALACIÓN ---
// Se ejecuta la primera vez que el usuario abre la web
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Precargando archivos críticos...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// --- EVENTO DE ACTIVACIÓN ---
// Limpia cachés antiguas si actualizamos la versión de la App
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Borrando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// --- EVENTO DE FETCH (INTERCEPTOR) ---
// Aquí es donde sucede la magia: si no hay red, servimos desde la caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Si el archivo está en caché, lo devolvemos. Si no, lo buscamos en internet.
            return response || fetch(event.request).catch(() => {
                // Si falla internet y no está en caché (ej. una ruta nueva), 
                // podrías devolver una página offline.html aquí.
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});