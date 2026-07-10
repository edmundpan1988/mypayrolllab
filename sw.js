/* MY Payroll Lab — Service Worker v6 */
const CACHE = 'mypayrolllab-v6';

/* Core app files — match your actual GitHub folder structure */
const APP_ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
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

/* Activate: delete ALL old caches */
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

  /* 1. Network-only: always fresh */
  if (NETWORK_ONLY.some(function(p) { return path === p; })) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 2. Non-GET requests */
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 3. External requests */
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 4. App files: cache-first with network fallback */
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
