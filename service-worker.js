/*
  Service Worker for Tasbeeh App
  Strategy: Stale-While-Revalidate for non-critical, Cache-First for assets.
*/

const CACHE_NAME = "tasbeeh-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  const req = event.request;
  
  // HTML: Network First, fallback to cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets: Cache First
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, res.clone());
          return res;
        });
      });
    })
  );
});