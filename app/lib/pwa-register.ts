/**
 * Service Worker 등록 및 PWA 초기화
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker 등록됨:', registration);
        })
        .catch(error => {
          console.log('[PWA] Service Worker 등록 실패:', error);
        });
    });
  }
}

/**
 * 설치 프롬프트 처리
 */
let deferredPrompt: any = null;

export function setupInstallPrompt() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e: any) => {
    // 설치 프롬프트 이벤트 저장
    deferredPrompt = e;
    // 사용자가 설치할 수 있도록 UI 표시 (필요시)
    console.log('[PWA] 설치 프롬프트 준비됨');
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] 앱이 설치됨');
    deferredPrompt = null;
  });
}

/**
 * 설치 프롬프트 표시 (필요시 호출)
 */
export async function showInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] 사용자 선택: ${outcome}`);
    deferredPrompt = null;
  }
}
