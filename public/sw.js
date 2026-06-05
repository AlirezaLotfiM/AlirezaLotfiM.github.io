const swUrl = new URL(self.location.href);
const SW_VERSION = swUrl.searchParams.get('v') || 'dev';
const CACHE_PREFIX = 'damoon-portfolio';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${SW_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${SW_VERSION}`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Damoon-d.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/offline.html'
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        if (!cacheName.startsWith(CACHE_PREFIX)) return Promise.resolve(false);
        if (cacheName === STATIC_CACHE || cacheName === RUNTIME_CACHE) return Promise.resolve(false);
        return caches.delete(cacheName);
      })
    );
    await self.clients.claim();
  })());
});

const isNavigationRequest = (request) => request.mode === 'navigate';
const isCacheableRequest = (requestUrl, request) =>
  request.method === 'GET' &&
  requestUrl.origin === self.location.origin &&
  !requestUrl.pathname.startsWith('/dynamicData/');

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (isNavigationRequest(request)) {
      return (await caches.match('/offline.html')) || (await caches.match('/index.html'));
    }

    throw error;
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || networkFetch;
};

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (!requestUrl.protocol.startsWith('http')) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirst(event.request, RUNTIME_CACHE));
    return;
  }

  if (!isCacheableRequest(requestUrl, event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
});
