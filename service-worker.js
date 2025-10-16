// service-worker.js  — 完成版
const VERSION = 'v3';                         // ★バージョンを上げるたびに更新
const CACHE_NAME = `islai-${VERSION}`;
const ORIGIN = self.location.origin;

// ここにオフラインで必要な資産を列挙
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

  // ★音声（ルート直下に置いた ja.mp3 / en.mp3 / zh.mp3 を想定）
  './ja.mp3',
  './en.mp3',
  './zh.mp3',
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // すぐ新SWへ
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('islai-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 任意で skipWaiting を即時反映できるようにしておく
self.addEventListener('message', (evt) => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});

// キャッシュ優先（更新も徐々に取り込む）＋ナビゲーションはフォールバック
self.addEventListener('fetch', (evt) => {
  const req = evt.request;

  // POST 等は素通し
  if (req.method !== 'GET') return;

  // 音声などの Range リクエストはネット優先（キャッシュは Range をうまく返せない）
  if (req.headers.has('range')) {
    evt.respondWith(fetch(req));
    return;
  }

  evt.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // クエリ違いでも拾えるように ignoreSearch
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const res = await fetch(req);
      // 自サイト配下・成功レスポンスならキャッシュへ保存（後から効く）
      try {
        const url = new URL(req.url);
        if (url.origin === ORIGIN && res.ok) {
          cache.put(req, res.clone());
        }
      } catch {}
      return res;
    } catch (err) {
      // オフライン時の画面遷移は index にフォールバック
      if (req.mode === 'navigate') {
        const home = await cache.match('./index.html');
        if (home) return home;
      }
      // 最後の最後の保険
      return caches.match('./index.html');
    }
  })());
});
