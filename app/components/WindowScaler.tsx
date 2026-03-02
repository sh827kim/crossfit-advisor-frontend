'use client';

import { useEffect, useState } from 'react';

export function WindowScaler() {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleResize = () => {
            const BASE_WIDTH = 430; // 기준 디바이스 너비 (iPhone Pro Max 등)
            const windowWidth = window.innerWidth;

            if (windowWidth > BASE_WIDTH) {
                // 9:16 비율 제한
                const maxAllowedWidth = window.innerHeight * (9 / 16);
                const effectiveWidth = Math.min(windowWidth, maxAllowedWidth);
                const newScale = effectiveWidth / BASE_WIDTH;
                // 크기가 1보다 작아지진 않게 보장
                setScale(Math.max(1, newScale));
            } else {
                setScale(1);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 초기 로드시 계산

        return () => window.removeEventListener('resize', handleResize);
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
      }
      `
        }} />
    );
}
