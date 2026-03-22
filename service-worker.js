const CACHE_NAME = "skaterutes-v2";
const TILE_CACHE = "map-tiles";
const MAX_TILES = 200;

const urlsToCache = [
  "./",
  "./index.html",
  "./map.html",
  "./skatepark.css",
  "./navbar.css",
  "./navbar.html",
  "./manifest.json",
  "./main.js",
  "./icon-192.png"
];


// LIMIT TILE CACHE SIZE
function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}


// FETCH EVENT
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const requestURL = event.request.url;

  // Ignore requests outside this domain except map tiles
  if (
    !event.request.url.startsWith(self.location.origin) &&
    !event.request.url.includes("tile.openstreetmap.org")
  ) {
    return;
  }

  // TILE CACHE
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

/* TO FORCE THE NEW SERVICE WORKER TO REPLACE THE OLD ONE INSTANTLY */

self.addEventListener("install", event => {
  event.waitUntil
  caches.open(CACHE_NAME).then(cache => {
  return Promise.all(
    urlsToCache.map(url =>
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error(`Failed: ${url}`);
          return cache.put(url, response);
        })
        .catch(err => {
          console.warn("Skipped caching:", url);
        })
    )
  );
});

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});