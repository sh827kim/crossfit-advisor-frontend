// Service Worker for PWA
const CACHE_NAME = 'afterword-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] 캐시 오픈됨');
      return cache.addAll(urlsToCache).catch(() => {
        console.log('[Service Worker] 기본 URL 캐싱 스킵 (동적 캐싱 사용)');
      });
    })
  );
});

// 활성화 이벤트 (이전 캐시 정리)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 페치 이벤트 (캐시-먼저 전략)
self.addEventListener('fetch', event => {
  const { request } = event;

  // 비GET 요청은 네트워크로 직접 전송
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // http/https 요청만 처리 (chrome-extension 등 다른 프로토콜 제외)
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      // 캐시에 있으면 캐시에서 반환
      if (response) {
        return response;
      }

      // 캐시에 없으면 네트워크에서 요청
      return fetch(request).then(response => {
        // 에러 응답은 캐싱하지 않기
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // 응답을 클론해서 캐시에 저장
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // 네트워크 오류 시 캐시된 응답 반환
        return caches.match(request);
      });
    })
  );
});
