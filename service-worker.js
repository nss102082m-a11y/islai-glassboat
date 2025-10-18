// service-worker.js  — v6 (network-first for HTML/JS/JSON)
const VERSION = 'v6';
const STATIC_CACHE = `islai-static-${VERSION}`;
const IMMUTABLE = [
  '/style.css',
  '/ISLAI_logo_main.PNG',
  '/icon-192.png',
  '/icon-512.png',
  '/audio/ja.mp3',
  '/audio/en.mp3',
  '/audio/zh.mp3',
  '/audio/ko.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(IMMUTABLE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// HTML / JS / JSON は network-first（=更新が即反映）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');
  const isJS   = req.destination === 'script' || url.pathname.endsWith('.js');
  const isJSON = url.pathname.startsWith('/i18n/') || url.pathname.endsWith('.json');

  if (isHTML || isJS || isJSON) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 画像・音声などは cache-first（=オフライン強い）
  event.respondWith(cacheFirst(req));
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req, { cache: 'no-store' });
    const cache = await caches.open(STATIC_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    if (cached) return cached;
    // ルートへフォールバック
    return caches.match('/index.html') || Response.error();
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(req, fresh.clone());
  return fresh;
}
