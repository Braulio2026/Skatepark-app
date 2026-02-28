const CACHE_NAME = "skate-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/map.html",
  "/skatepark.css",
  "/navbar.css",
  "/main.js"
];

// Instalar y guardar archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activar
self.addEventListener("activate", event => {
  console.log("Service Worker activado");
});

// Interceptar peticiones
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});