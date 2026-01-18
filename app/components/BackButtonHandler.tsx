'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

/**
 * 뒤로가기 버튼 처리 컴포넌트
 * 메인 페이지에서 히스토리가 초기화되므로:
 * 1. 메인 페이지 (/)에서 뒤로가기: 앱 종료
 * 2. 첫 랜딩 페이지에서 뒤로가기: 앱 종료
 * 3. 나머지 페이지에서 뒤로가기: 메인페이지로 이동
 */
export function BackButtonHandler() {
  const router = useRouter();
  const { hasVisited } = useApp();
  const isInitialized = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;

      // 첫 랜딩 페이지 (onboarding)에서 뒤로가기 → 앱 종료
      if (!hasVisited) {
        window.history.pushState(null, '', currentPath);
        return;
      }

      // 메인 페이지(/)에서 뒤로가기 → 앱 종료
      // (메인 페이지는 replaceState로 초기화되므로 실제 뒤로가기 발생)
      if (currentPath === '/') {
        window.history.pushState(null, '', currentPath);
        return;
      }

      // 나머지 페이지에서 뒤로가기 → 메인페이지로 이동
      // 메인 페이지에서 replaceState로 히스토리가 초기화되므로
      // 다시 뒤로가기를 누르면 앱이 종료됨
      router.push('/');
    };

    // 뒤로가기 감지
    window.addEventListener('popstate', handlePopState);

    // 초기 히스토리 상태 설정 (한 번만)
    if (!isInitialized.current) {
      window.history.pushState(null, '', window.location.pathname);
      isInitialized.current = true;
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasVisited, router]);

  return null;
}
