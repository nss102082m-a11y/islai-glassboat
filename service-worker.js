// service-worker.js — v8 (network-first for HTML/JS/JSON, relative paths)
const VERSION = 'v8';
const STATIC_CACHE = `islai-static-${VERSION}`;
const IMMUTABLE = [
  'style.css',
  'ISLAI_logo_main.PNG',
  'icon-192.png',
  'icon-512.png',
  'audio/ja.mp3',
  'audio/en.mp3',
  'audio/zh.mp3',
  'audio/ko.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(IMMUTABLE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');
  const isJS   = req.destination === 'script' || url.pathname.endsWith('.js');
  const isJSON = url.pathname.includes('/i18n/') || url.pathname.endsWith('.json');
// service-worker.js v7 — relative paths + network-first for HTML/JS/JSON
const VERSION = 'v7';
const STATIC_CACHE = `islai-static-${VERSION}`;

const IMMUTABLE = [
  'style.css',
  'ISLAI_logo_main.PNG',
  'icon-192.png',
  'icon-512.png',
  'audio/ja.mp3',
  'audio/en.mp3',
  'audio/zh.mp3',
  'audio/ko.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(IMMUTABLE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');
  const isJS   = req.destination === 'script' || url.pathname.endsWith('.js');
  const isJSON = url.pathname.includes('/i18n/') || url.pathname.endsWith('.json');

  if (isHTML || isJS || isJSON) {
    event.respondWith(networkFirst(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});

async function networkFirst(req){
  try{
    const fresh = await fetch(req, { cache:'no-store' });
    const cache = await caches.open(STATIC_CACHE);
    cache.put(req, fresh.clone());
    return fresh;
  }catch{
    return (await caches.match(req)) || caches.match('index.html');
  }
}

async function cacheFirst(req){
  const cached = await caches.match(req);
  if (cached) return cached;
  const fresh = await fetch(req);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(req, fresh.clone());
  return fresh;
}

