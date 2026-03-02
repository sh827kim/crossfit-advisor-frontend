'use client';

import { useEffect, useState } from 'react';

export function WindowScaler() {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            setTimeout(() => {
                const BASE_WIDTH = 430; // 기준 디바이스 너비 (iPhone Pro Max 등)

                // iOS Safari 등 PWA 환경에서 보다 정확한 시각적 뷰포트 크기 획득
                const vWidth = window.visualViewport?.width || window.innerWidth;
                const vHeight = window.visualViewport?.height || window.innerHeight;

                if (vWidth > BASE_WIDTH) {
                    // 9:16 비율 제한
                    const maxAllowedWidth = vHeight * (9 / 16);
                    const effectiveWidth = Math.min(vWidth, maxAllowedWidth);
                    const newScale = effectiveWidth / BASE_WIDTH;
                    // 크기가 1보다 작아지진 않게 보장
                    setScale(Math.max(1, newScale));
                } else {
                    setScale(1);
                }
            }, 50); // iOS 회전 및 웹앱 진입 시 딜레이 고려
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        window.visualViewport?.addEventListener('resize', handleResize);

        handleResize(); // 초기 로드시 계산

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
      :root {
        --app-scale: ${scale};
      }
      .app-container {
         width: 100%;
         max-width: ${430}px;
         margin: 0 auto;
         transform: scale(var(--app-scale));
         transform-origin: top center;
         height: calc(100% / var(--app-scale));
         overflow-x: hidden;
         padding-top: env(safe-area-inset-top);
         padding-bottom: env(safe-area-inset-bottom);
      }
      `
        }} />
    );
}
