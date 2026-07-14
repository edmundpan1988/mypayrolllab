/* MY Payroll Lab — Service Worker v7 */
const CACHE = 'mypayrolllab-v7';

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

/* Canonical origin — always non-www */
const CANONICAL_ORIGIN = 'https://mypayrolllab.com';

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

/* Activate: delete ALL old caches including any broken www-redirect entries */
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

  /* 1. www redirect — let Cloudflare handle it, never intercept */
  if (url.hostname === 'www.mypayrolllab.com') {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 2. Network-only: always fresh, never cache */
  if (NETWORK_ONLY.some(function(p) { return path === p; })) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 3. Non-GET requests */
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 4. External requests (different origin) */
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  /* 5. App files: cache-first with network fallback */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        /* CRITICAL: never cache redirects, errors, or opaque responses */
        if (!response) return response;
        if (response.status !== 200) return response;
        if (response.type === 'opaqueredirect') return response;
        if (response.redirected) return response;

        /* Safe to cache — clone before consuming */
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        /* Offline fallback — serve cached index */
        return caches.match('/index.html');
      });
    })
  );
});
