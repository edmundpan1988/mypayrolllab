/* MY Payroll Lab — Service Worker v4 */
const CACHE = 'mypayrolllab-v4';

/* Core app files — cache-first (needed for offline PWA) */
const APP_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* Files that must always be fresh — never serve from cache */
const NETWORK_ONLY = [
  '/sitemap.xml',
  '/robots.txt',
  '/_headers'
];

/* Install: precache core app files only */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(APP_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Activate: delete ALL old caches so stale files are gone */
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

/* Fetch: split strategy based on file type */
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  var path = url.pathname;

  /* 1. Network-only: always fetch fresh from server, never cache */
  if (NETWORK_ONLY.some(function(p) { return path === p; })) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 2. Non-GET requests (POST etc): go straight to network */
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 3. External requests (CDN, analytics etc): network-only */
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 4. App files: cache-first with network fallback (offline support) */
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
        return caches.match('/index.html');
      });
    })
  );
});
