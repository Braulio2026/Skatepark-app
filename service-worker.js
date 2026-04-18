const CACHE_NAME = "skaterutes-v3";
const TILE_CACHE = "map-tiles";
const MAX_TILES = 1000;

const urlsToCache = [
  "./",
  "./index.html",
  "./map.html",
  "./skatepark.css",
  "./navbar.css",
  "./navbar.html",
  "./manifest.json",
  "./main.js",
  "./icon-192.png",
  "./offline.html" 
];

// =======================
// LIMIT TILE CACHE SIZE
// =======================

function limitCacheSize(name, size) {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
}


// =======================
// INSTALL (FIXED)
// =======================

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {

      return Promise.all(
        urlsToCache.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) throw new Error(`Failed: ${url}`);
              return cache.put(url, response);
            })
            .catch(() => {
              console.warn("Skipped caching:", url);
            })
        )
      );

    })
  );

  self.skipWaiting();
});


// =======================
// ACTIVATE (CLEAN OLD CACHE)
// =======================

self.addEventListener("activate", event => {

  const allowedCaches = [CACHE_NAME, TILE_CACHE];

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (!allowedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


// =======================
// FETCH EVENT
// =======================

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const requestURL = event.request.url;

  // Ignore requests outside domain except map tiles
  if (
    !requestURL.startsWith(self.location.origin) &&
    !requestURL.includes("tile.openstreetmap.org")
  ) {
    return;
  }

  // =======================
  // TILE CACHE (IMPROVED)
  // =======================

  if (requestURL.includes("tile.openstreetmap.org")) {

    event.respondWith(
      caches.open(TILE_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {

          const networkFetch = fetch(event.request).then(res => {
            cache.put(event.request, res.clone());
            limitCacheSize(TILE_CACHE, MAX_TILES);
            return res;
          });

          return cached || networkFetch.catch(() => cached);

        });
      })
    );

    return;
  }

  // =======================
  // NORMAL CACHE
  // =======================

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
        //  Better offline fallback
        return caches.match("./offline.html");
      });

    })
  );

});