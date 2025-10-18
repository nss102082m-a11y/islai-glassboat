// service-worker.js — cache off / always fresh
self.addEventListener('install', (e) => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

// すべてのリクエストはネットワーク優先（=常に最新を取得）
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
