// service-worker.js
const VERSION = 'v4';               // ★バージョンを上げる
const CACHE_NAME = `islai-${VERSION}`;
const ORIGIN = self.location.origin;

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
  './icon-192.png',
  './icon-512.png',
  // ★実ファイル名に合わせる（コロン入り）
  './audio:ja.mp3',
  './audio:en.mp3',
  './audio:zh.mp3',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => k.startsWith('islai-') && k !== CACHE_NAME)
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (evt) => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  if (req.method !== 'GET') return;          // POST等は素通し
  if (req.headers.has('range')) {            // Rangeはネット優先
    evt.respondWith(fetch(req));
    return;
  }

  evt.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;

    try {
      const res = await fetch(req);
      try {
        const url = new URL(req.url);
        if (url.origin === ORIGIN && res.ok) cache.put(req, res.clone());
      } catch {}
      return res;
    } catch {
      if (req.mode === 'navigate') {
        const home = await cache.match('./index.html');
        if (home) return home;
      }
      return caches.match('./index.html');
    }
  })());
});
