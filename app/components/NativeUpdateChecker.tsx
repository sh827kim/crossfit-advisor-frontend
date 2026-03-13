'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * 네이티브 앱 업데이트 체커
 *
 * 동작 원리:
 * 1. 네이티브 앱일 때만 동작 (웹/PWA에서는 무시)
 * 2. @capacitor/app의 App.getInfo()로 현재 설치된 앱의 versionCode(build)를 읽음
 * 3. 아래 MINIMUM_BUILD_NUMBER보다 낮으면 업데이트 팝업 표시
 * 4. 이 값을 웹에서 변경 + 배포만 하면, 모든 구버전 앱에 팝업이 뜸 (앱 빌드 불필요)
 *
 * 사용법:
 * - 새로운 네이티브 빌드를 배포한 후, 아래 MINIMUM_BUILD_NUMBER를 해당 빌드의 versionCode로 변경
 * - 예: versionCode 5로 빌드했다면 MINIMUM_BUILD_NUMBER = 5로 설정
 */

// ============================================================
// 🔧 이 숫자만 바꾸면 구버전 사용자에게 업데이트 팝업이 자동으로 뜹니다
// build.gradle의 versionCode와 대응됩니다
// ============================================================
const MINIMUM_BUILD_NUMBER = 5;

// Play Store URL (앱 ID 기반)
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.spark.afterwod';

export function NativeUpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    // 1. 네이티브 플랫폼 확인
    const isNative = Capacitor.isNativePlatform();
    console.log('[NativeUpdateChecker] Is Native Platform:', isNative);
    if (!isNative) return;

    // 2. 앱 정보 확인
    import('@capacitor/app')
      .then(async ({ App }) => {
        try {
          const info = await App.getInfo();
          console.log('[NativeUpdateChecker] App Info:', info);
          
          const buildNumber = parseInt(info.build, 10);
          console.log(`[NativeUpdateChecker] Build Check: Current(${buildNumber}) < Min(${MINIMUM_BUILD_NUMBER})`);

          if (!isNaN(buildNumber) && buildNumber < MINIMUM_BUILD_NUMBER) {
            setCurrentVersion(info.version);
            setShowUpdate(true);
          }
        } catch (err) {
          console.error('[NativeUpdateChecker] Failed to get app info:', err);
        }
      })
      .catch((err) => {
        console.warn('[NativeUpdateChecker] @capacitor/app plugin not found in this build:', err);
        // 만약 플러그인이 없는 구버전이라면? 
        // 여기서 무조건 팝업을 띄우게 할 수도 있습니다 (가장 확실한 방법)
        setCurrentVersion('Low');
        setShowUpdate(true);
      });
  }, []);

  if (!showUpdate) return null;

  const handleUpdate = () => {
    window.open(PLAY_STORE_URL, '_system');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '20px',
          padding: '32px 24px',
          maxWidth: '320px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* 아이콘 */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F43000 0%, #FF6B3D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
          }}
        >
          🔄
        </div>

        {/* 제목 */}
        <h2
          style={{
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: 700,
            marginBottom: '12px',
            lineHeight: 1.3,
          }}
        >
          앱 업데이트가 필요합니다
        </h2>

        {/* 설명 */}
        <p
          style={{
            color: '#999999',
            fontSize: '14px',
            lineHeight: 1.6,
            marginBottom: '8px',
          }}
        >
          더 나은 사용 경험을 위해<br />
          최신 버전으로 업데이트해 주세요.
        </p>

        {/* 현재 버전 표시 */}
        <p
          style={{
            color: '#666666',
            fontSize: '12px',
            marginBottom: '24px',
          }}
        >
          현재 버전: v{currentVersion}
        </p>

        {/* 업데이트 버튼 */}
        <button
          onClick={handleUpdate}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #F43000 0%, #FF6B3D 100%)',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'opacity 0.2s',
          }}
        >
          지금 업데이트
        </button>

        {/* 나중에 버튼 */}
        <button
          onClick={() => setShowUpdate(false)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'transparent',
            color: '#999999',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          나중에
        </button>
      </div>
    </div>
  );
}
