// Service Worker for PWA
const CACHE_NAME = 'afterwod-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// 설치 이벤트
self.addEventListener('install', event => {
  // 새 서비스 워커가 즉시 활성화되도록 설정
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] 캐시 오픈됨');
      return cache.addAll(urlsToCache).catch((err) => {
        console.log('[Service Worker] 기본 URL 캐싱 실패 (무시됨):', err);
      });
    })
  );
});

// 활성화 이벤트 (이전 캐시 정리)
self.addEventListener('activate', event => {
  // 활성화 즉시 클라이언트 제어
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
    }).then(() => self.clients.claim())
  );
});

// 페치 이벤트
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API 요청: 네트워크 전용 (캐싱 안함)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. Next.js 정적 자원 (_next/static): 캐시 우선 (Cache First)
  // 해시된 파일이므로 내용은 불변. 캐시에 있으면 바로 반환.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) return response;
        return fetch(request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. 페이지 탐색 (HTML): 네트워크 우선 (Network First)
  // 항상 최신 HTML을 가져오고, 오프라인일 때만 캐시 사용
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // 4. 기타 요청 (이미지 등): 네트워크 우선 (Network First)
  // 404 에러 방지를 위해 네트워크 시도 후 실패 시 캐시 확인 (또는 그 반대)
  // 여기서는 안전하게 네트워크 우선 사용
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request).then(response => {
        // 정상 응답이면 캐시 업데이트
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});
