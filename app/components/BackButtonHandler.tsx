'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

/**
 * 뒤로가기 버튼 처리 컴포넌트
 * 1. 첫 랜딩 페이지 (OnboardingPage): 앱 종료
 * 2. 메인 페이지 (/): 앱 종료
 * 3. 나머지 화면: 메인페이지로 이동
 */
export function BackButtonHandler() {
  const router = useRouter();
  const { hasVisited } = useApp();
  const isInitialized = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      // 현재 경로 확인
      const currentPath = window.location.pathname;

      // 첫 랜딩 페이지 또는 메인 페이지에서 뒤로가기 → 앱 종료 방지
      if (!hasVisited || currentPath === '/') {
        // 히스토리에 현재 경로 추가 (뒤로가기 방지)
        window.history.pushState(null, '', currentPath);
        return;
      }

      // 나머지 페이지에서 뒤로가기 → 메인페이지로 이동
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
