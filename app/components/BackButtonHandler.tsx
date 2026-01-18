'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

/**
 * 뒤로가기 버튼 처리 컴포넌트
 * 1. 첫 랜딩 페이지 (OnboardingPage): PWA 종료 팝업
 * 2. 메인 페이지 (/): PWA 종료 팝업
 * 3. 나머지 화면: 메인페이지로 이동
 */
export function BackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasVisited, setShowExitPopup } = useApp();

  useEffect(() => {
    const handlePopState = () => {
      // 첫 랜딩 페이지: onboarding 중 뒤로가기
      if (!hasVisited) {
        setShowExitPopup(true);
        // 뒤로가기 기본 동작 취소
        window.history.pushState(null, '', window.location.pathname);
        return;
      }

      // 메인 페이지: 뒤로가기
      if (pathname === '/') {
        setShowExitPopup(true);
        // 뒤로가기 기본 동작 취소
        window.history.pushState(null, '', window.location.pathname);
        return;
      }

      // 나머지 페이지: 메인페이지로 이동
      router.push('/');
    };

    // 뒤로가기 감지
    window.addEventListener('popstate', handlePopState);

    // 초기 히스토리 상태 설정 (뒤로가기 방지)
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, hasVisited, router, setShowExitPopup]);

  return null;
}
