'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';

/**
 * 뒤로가기 버튼 처리 컴포넌트
 * 1. 메인 페이지 (/)에서 뒤로가기: 앱 종료 (히스토리 차단)
 * 2. 첫 랜딩 페이지에서 뒤로가기: 앱 종료 (히스토리 차단)
 * 3. 나머지 페이지에서 뒤로가기: 실제 뒤로가기 실행 (메인으로 돌아감)
 */
export function BackButtonHandler() {
  const { hasVisited } = useApp();
  const isInitialized = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;

      // 첫 랜딩 페이지 (onboarding)에서 뒤로가기 → 앱 종료 (차단)
      if (!hasVisited) {
        window.history.pushState(null, '', currentPath);
        return;
      }

      // 메인 페이지(/)에서 뒤로가기 → 앱 종료 (차단)
      if (currentPath === '/') {
        // replaceState로 히스토리 누적 방지
        window.history.replaceState(null, '', currentPath);
        return;
      }

      // 나머지 페이지에서 뒤로가기는 그냥 진행
      // (window.history.back()으로 메인 페이지로 돌아감)
      // popstate 이벤트가 자동으로 처리되므로 추가 작업 없음
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
  }, [hasVisited]);

  return null;
}
