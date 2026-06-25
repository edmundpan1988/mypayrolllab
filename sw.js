/* MY Payroll Lab — Service Worker v1 */
const CACHE = 'mypayrolllab-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* Install: cache all app files */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Activate: clean up old caches */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch: cache-first strategy (app works fully offline) */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        /* Offline fallback */
        return caches.match('/index.html');
      });
    })
  );
});/* Fetch: cache-first strategy (app works fully offline) */
self.addEventListener('fetch', function(e) {

  // Ignore unsupported schemes
  if (
    e.request.url.startsWith('chrome-extension://') ||
    e.request.url.startsWith('moz-extension://') ||
    e.request.url.startsWith('file://')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {

      if (cached) {
        return cached;
      }

      return fetch(e.request).then(function(response) {

        // Only cache successful HTTP/HTTPS requests
        if (
          !response ||
          response.status !== 200 ||
          (e.request.url.indexOf('http://') !== 0 &&
           e.request.url.indexOf('https://') !== 0)
        ) {
          return response;
        }

        var clone = response.clone();

        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });

        return response;

      }).catch(function() {

        // For page navigation when offline
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }

      });

    })
  );
});
