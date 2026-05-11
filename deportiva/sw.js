const CACHE_NAME = 'vitalstats-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/contador-calorias/index.html',
  '/calculadora-grasa-corporal/index.html',
  '/calculadora-ritmo/index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Instalación: Guardar archivos críticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Estrategia: Cache First (Cargar rápido, luego actualizar)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});