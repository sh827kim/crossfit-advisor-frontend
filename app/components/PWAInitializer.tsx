'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/app/lib/pwa-register';

/**
 * PWA 초기화 컴포넌트
 * Service Worker 등록 및 설치 프롬프트 설정
 */
export function PWAInitializer() {
  useEffect(() => {
    // Service Worker 등록
    registerServiceWorker();

    // 설치 프롬프트 설정
    setupInstallPrompt();
  }, []);

  return null;
}
