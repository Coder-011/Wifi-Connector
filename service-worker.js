// service-worker.js - Lightweight & efficient
const CACHE_NAME = 'autolog-v1';
const urlsToCache = [
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-First strategy for our static files only
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version immediately if available (best for offline)
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise try network (and don't cache the response to keep storage minimal)
        return fetch(event.request);
      })
      .catch(() => {
        // Fallback: if even the network fails and it's the main page, serve cached index.html
        if (event.request.url.includes('index.html') || event.request.url.endsWith('/')) {
          return caches.match('./index.html');
        }
      })
  );
});