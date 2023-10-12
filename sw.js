const CACHE_NAME = "v1_cache";
const urlsToCache = [
  "/",
  "./Champions/index.html",
  "./Champions/js/app.js",
  "./Champions/assets/images/freddie.png",
  "./Champions/index.css",
  "./android-chrome-192x192.png",
  "./android-chrome-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
