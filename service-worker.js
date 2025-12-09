// Simple offline-first service worker for the Tasbeeh PWA

const CACHE_NAME = "tasbeeh-cache-v1";

// Core assets to cache (add/remove if تغير أسماء الملفات)
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install event - pre-cache core assets
self.addEventListener("install", event => {
  // Skip waiting so new SW takes control faster
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate event - clean up old caches if any
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - offline-first strategy
self.addEventListener("fetch", event => {
  const request = event.request;

  // For navigation requests, always try cache first
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then(cached => {
        return (
          cached ||
          fetch(request).catch(() => caches.match("./index.html"))
        );
      })
    );
    return;
  }

  // For other requests (icons, manifest, etc.)
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          // Optionally cache new responses
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        }).catch(() => cached)
      );
    })
  );
});
