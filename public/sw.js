const CACHE = 'kairo-decode-v9';

const PRECACHE_ASSETS = [
  '/kairo-wordmark-cropped.png',
  '/kairo-decode-wordmark-cropped.png',
  '/kairo-decode-wordmark-forest-cropped.png',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Main page navigation: network-first, cache fallback for offline use
  // /visitors and /password still bypass (need live middleware auth)
  if (request.mode === 'navigate') {
    if (url.pathname === '/' || url.pathname === '') {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE).then(cache => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(request).then(r => r || Response.error()))
      );
    }
    return;
  }

  // /api/terms: network-first, cache fallback for offline browsing
  if (url.pathname === '/api/terms') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(r => r || Response.error()))
    );
    return;
  }

  // /_next/static/: cache-first (content-hashed, safe to cache indefinitely)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Other static assets (images, fonts): cache-first, then network
  if (
    url.pathname.startsWith('/_next/') ||
    /\.(png|jpg|jpeg|svg|ico|woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});
