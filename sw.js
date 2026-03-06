const CACHE_NAME = "skate-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/map.html",
  "/skatepark.css",
  "/navbar.css",
  "/main.js",
  "/icon-192.png",
];

// Install and save files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", event => {
  console.log("Service Worker activado");
});

// Intercep requests
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});