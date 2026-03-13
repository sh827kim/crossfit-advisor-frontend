'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';

/**
 * 뒤로가기 버튼 처리 컴포넌트
 *
 * [Web/PWA] popstate 이벤트로 처리
 * [Android Native] @capacitor/app 플러그인의 backButton 이벤트로 처리
 *
 * 메인(/) / 온보딩(/onboarding)에서 뒤로가기 → 종료 확인 팝업
 * 나머지 페이지 → 이전 화면으로 이동
 */

const EXIT_PATHS = ['/', '/onboarding'];

export function BackButtonHandler() {
  const isInitialized = useRef(false);
  const router = useRouter();
  const currentPath = usePathname();
  const [showExitDialog, setShowExitDialog] = useState(false);

  // 앱 종료 실행
  const handleExitApp = () => {
    setShowExitDialog(false);

    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app')
        .then(({ App }) => App.exitApp())
        .catch(() => {});
    }
    // Web/PWA 환경에서는 종료 수단이 없으므로 팝업만 닫힘
  };

  // === 1. 네이티브 앱(Android) 물리적 백버튼 처리 ===
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | null = null;

    import('@capacitor/app')
      .then(({ App }) => {
        const listener = App.addListener('backButton', () => {
          if (EXIT_PATHS.includes(currentPath)) {
            setShowExitDialog(true);
          } else {
            router.back();
          }
        });

        listener.then((handle) => {
          removeListener = () => handle.remove();
        });
      })
      .catch(() => {
        console.warn('[BackButtonHandler] @capacitor/app not available');
      });

    return () => {
      removeListener?.();
    };
  }, [currentPath, router]);

  // === 2. Web / PWA 에서의 popstate 뒤로가기 처리 ===
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    const handlePopState = () => {
      const path = window.location.pathname;
      if (EXIT_PATHS.includes(path)) {
        // 히스토리를 다시 밀어서 실제 뒤로가기를 차단하고 팝업 표시
        window.history.pushState(null, '', path);
        setShowExitDialog(true);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);

    if (!isInitialized.current) {
      window.history.pushState(null, '', window.location.pathname);
      isInitialized.current = true;
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <ConfirmDialog
      isOpen={showExitDialog}
      title="앱을 종료하시겠습니까?"
      description="뒤로가기를 누르셨습니다."
      confirmText="종료"
      cancelText="취소"
      onConfirm={handleExitApp}
      onCancel={() => setShowExitDialog(false)}
    />
  );
}

