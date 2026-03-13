'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * 뒤로가기 버튼 처리 컴포넌트 
 * (네이티브 플러그인 설치 & 빌드 수정 없이 JS만으로 안드로이드 강제 종료를 막는 버전)
 */
export function BackButtonHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const isTrapActive = useRef(false);

  useEffect(() => {
    // 1. 앱 종료가 허용되는 메인(/)과 온보딩(/onboarding)은 덫(Trap) 해제
    if (pathname === '/' || pathname === '/onboarding') {
      isTrapActive.current = false;
      return;
    }

    // 2. 안드로이드 WebView가 이전 히스토리를 인식하지 못해 무조건 앱을 끄는 버그를 막기 위해
    // 현재 URL과 동일한 '가짜 히스토리(Trap)'를 강제로 한 겹 씌웁니다.
    // 이렇게 하면 네이티브의 canGoBack()이 무조건 true가 되어 앱 종료를 멈춥니다.
    if (!isTrapActive.current) {
      window.history.pushState({ isBackTrap: true }, '', window.location.href);
      isTrapActive.current = true;
    }

    const handlePopState = (event: PopStateEvent) => {
      // 3. 사용자가 기기의 '물리 뒤로가기' 버튼을 누르면 이 가짜 히스토리가 빠지면서 이벤트 발생
      if (isTrapActive.current) {
        // 중복 방지 처리 후 Next.js의 라우터를 이용해 실제 이전 화면으로 돌려보냅니다.
        isTrapActive.current = false;
        router.back();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return null;
}
