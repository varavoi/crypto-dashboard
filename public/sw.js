// Service Worker для Crypto Dashboard PWA
const CACHE_NAME = 'crypto-dashboard-v1.0.0';
const API_CACHE_NAME = 'crypto-api-cache-v1';

// Файлы для кэширования при установке
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints для кэширования
const API_ENDPOINTS = [
  '/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем старые кэши
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Перехват fetch запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем WebSocket и неподдерживаемые схемы
  if (event.request.url.startsWith('ws:') || 
      event.request.url.startsWith('wss:') ||
      event.request.scheme !== 'https') {
    return;
  }

  // Для API запросов используем стратегию "сеть сначала, затем кэш"
  if (event.request.url.includes('api.coingecko.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Клонируем ответ для кэширования
          const responseClone = response.clone();
          
          // Кэшируем успешные ответы
          if (response.status === 200) {
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся взять из кэша
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Возвращаем fallback данные, если нет в кэше
              return new Response(JSON.stringify({
                error: 'Network unavailable and no cached data'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Для статических assets используем стратегию "кэш сначала, затем сеть"
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Возвращаем кэшированный response если есть
        if (cachedResponse) {
          return cachedResponse;
        }

        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then((response) => {
            // Проверяем валидность response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем response для кэширования
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Обработка push уведомлений (для будущих функций)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New cryptocurrency update available',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Crypto Dashboard', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Открываем/фокусируем существующее окно
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Иначе открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});