// service-worker.js
const CACHE_NAME = 'islai-v1';
const ASSETS = [
  './',
  './index.html',
  './guide.html',
  './about.html',
  './settings.html',
  './style.css',
  './app.js',
  './splash-lottie.css',
  './splash-lottie.js',
  './ISLAI_logo_main.PNG',
  './manifest.json',
  './icon-192.PNG',
  './icon-512.PNG'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// キャッシュ優先、なければネット、失敗したら index をフォールバック
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((res) => {
      if (res) return res;
      return fetch(req).catch(() => caches.match('./index.html'));
    })
  );
});
