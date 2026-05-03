// sw.js — VoteWise Service Worker
// Cache-first strategy for static assets, network-first for API calls

const CACHE_NAME = 'votewise-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data.js',
  '/tests.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js',
  'https://www.gstatic.com/charts/loader.js'
];

// ── Install: pre-cache static assets ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.warn('[SW] Pre-cache partial failure:', err));
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clear old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for static, network-first for API ──────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for Anthropic API (chat responses, never cache)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({
          content: [{ text: 'You are offline. Please reconnect to use VoteWise AI.' }]
        }), { headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // Network-first for Google Charts data requests
  if (url.hostname === 'charts.googleapis.com') {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Cache-first for everything else (static assets, fonts, icons)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Only cache valid 200 responses for same-origin or whitelisted CDNs
        if (
          response.status === 200 &&
          (url.origin === self.location.origin ||
           url.hostname.includes('googleapis.com') ||
           url.hostname.includes('gstatic.com') ||
           url.hostname.includes('unpkg.com') ||
           url.hostname.includes('fonts.gstatic.com'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ── Background Sync: queue failed messages ─────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'votewise-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }))
      )
    );
  }
});