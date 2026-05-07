const CACHE_NAME = 'flashcards-v1';

// Core app files to cache on install
const CORE_ASSETS = [
  './flashcards.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install: cache core app files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache on install:', err);
      })
    )
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for same-origin, cache-first for CDN
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin === location.origin) {
    // Network-first: try to get fresh, cache what we get
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for CDN resources (React, Babel, Google Fonts, etc.)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() =>
            new Response('Resource unavailable offline', { status: 503 })
          );
      })
    );
  }
});
