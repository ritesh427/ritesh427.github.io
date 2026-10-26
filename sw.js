/* =========================================================
   DevPath Service Worker (PWA Offline & Auto-Update Engine)
   ========================================================= */

const CACHE_NAME = 'devpath-v1.0.1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './css/style.css',
  './css/quiz.css',
  './css/battle.css',
  './js/core.js',
  './js/data.js',
  './js/store.js',
  './js/quiz-engine.js',
  './js/share-card.js',
  './js/views.js',
  './js/quiz-ui.js',
  './js/battle-engine.js',
  './js/battle-ui.js',
  './js/pwa.js',
  './js/app.js',
  './js/bank/bank_java.js',
  './js/bank/bank_spring.js',
  './js/bank/bank_microservices.js',
  './js/bank/bank_eda.js',
  './js/bank/bank_lld.js',
  './js/bank/bank_hld.js',
  './js/bank/bank_junit.js',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-192.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png',
  './assets/favicon-32.png',
  './assets/favicon-16.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('DevPath SW: Precache notice:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Bypass WebRTC & PeerJS peer signaling traffic
  if (url.hostname.includes('peerjs') || url.pathname.includes('/peerjs')) {
    return;
  }

  // Always fetch version.json fresh from network so update detection is instant
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
    );
    return;
  }

  // Network-First with Cache Fallback for dynamic content
  event.respondWith(
    fetch(req).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(req).then(cached => {
        if (cached) return cached;
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
