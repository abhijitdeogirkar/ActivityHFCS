const CACHE_NAME = 'activity-tracker-v2'; // व्हर्जन v2 केले आहे
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.png'
  // camera.js इथून काढून टाकले आहे
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// जुना कॅशे (v1) डिलीट करण्यासाठी नवीन इव्हेंट
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
