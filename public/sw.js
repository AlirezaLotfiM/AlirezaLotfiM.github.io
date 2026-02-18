// ورژن رو حتما تغییر بده تا مرورگر بفهمه فایل عوض شده
const CACHE_NAME = 'damoon-portfolio-v1.3.3';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Damoon-d.png'
  // نکته: فایل‌های CSS و JS بیلد شده رو اینجا نذار چون اسمشون عوض میشه
];

self.addEventListener('install', (event) => {
  // این خط باعث میشه سرویس ورکر جدید بلافاصله نصب بشه و منتظر نمونه
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // این خط خیلی مهمه: باعث میشه سرویس ورکر جدید بلافاصله کنترل صفحه رو به دست بگیره
      return self.clients.claim(); 
    })
  );
});

self.addEventListener('fetch', (event) => {
  // فیکس ارور chrome-extension و فایل‌های غیر http
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // استراتژی: اول کش، اگر نبود شبکه (Cache First, falling back to Network)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // چک کردن اینکه پاسخ معتبر باشه
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // کلون کردن پاسخ برای ذخیره در کش
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});