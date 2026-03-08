const CACHE_NAME = "skaterutes-v2";
const TILE_CACHE = "map-tiles";
const MAX_TILES = 200;

const urlsToCache = [
  "/index.html",
  "/map.html",
  "/skatepark.css",
  "/navbar.css",
  "/manifest.json",
  "/main.js",
  "/icon-192.png"
];


// LIMIT CACHE SIZE
function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}


// INSTALL (pre-cache core app files)
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

});


// ACTIVATE (cleanup old caches)
self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== TILE_CACHE)
        .map(key => caches.delete(key))
      );
    })
  );

  self.clients.claim();

});


// FETCH
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const requestURL = event.request.url;

  // TILE CACHE (OpenStreetMap)
  if (requestURL.includes("tile.openstreetmap.org")) {

    event.respondWith(

      caches.open(TILE_CACHE).then(cache => {

        return cache.match(event.request).then(response => {

          const fetchPromise = fetch(event.request).then(networkResponse => {

            cache.put(event.request, networkResponse.clone());

            limitCacheSize(TILE_CACHE, MAX_TILES);

            return networkResponse;

          });

          return response || fetchPromise;

        });

      })

    );

    return;
  }

  // NORMAL CACHE
  event.respondWith(

    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {

        return caches.open(CACHE_NAME).then(cache => {

          cache.put(event.request, networkResponse.clone());

          return networkResponse;

        });

      }).catch(() => {
        return new Response("Offline");
      });

    })

  );

});