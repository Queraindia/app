/* Quera Music: app-shell caching only. No library or audio data is modified. */
const BASE = self.registration.scope;
const PREFIX = 'quera-studio-plus-' + encodeURIComponent(BASE) + '-';
const CACHE = PREFIX + 'v7ef14fc947ea';
const url = path => new URL(path, BASE).href;
const INDEX = url('./index.html');
const SHELL = [
  './index.html', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-192.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
].map(url);
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js';
const FONTS = 'https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,300;0,700;0,900;1,800&display=swap';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Optional external dependencies: failure must not prevent installation.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      await Promise.allSettled([CDN, FONTS].map(async src => {
        const req = new Request(src, { mode: 'no-cors', signal: controller.signal });
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') await cache.put(req, res);
      }));
    } finally {
      clearTimeout(timeout);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const target = new URL(req.url);
  const root = new URL(BASE);
  const isAppNavigation = req.mode === 'navigate' &&
    target.origin === root.origin &&
    (target.pathname === root.pathname || target.pathname === new URL(INDEX).pathname);

  if (isAppNavigation) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(INDEX, res.clone());
          return res;
        }
        return res;
      } catch (error) {
        return (await caches.open(CACHE)).match(INDEX).then(hit => hit || Response.error());
      }
    })());
    return;
  }

  const isShell = SHELL.includes(target.href);
  const isExternal = target.href === CDN || target.href === FONTS ||
    target.origin === 'https://fonts.gstatic.com';
  if (!isShell && !isExternal) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') {
        try { await cache.put(req, res.clone()); } catch (_) {}
      }
      return res;
    } catch (_) { return Response.error(); }
  })());
});
