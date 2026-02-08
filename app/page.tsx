'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { analytics } from '@/app/lib/analytics';

export default function HomePage() {
  const router = useRouter();
  const { setCurrentMode, resetInputState, hasVisited } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration mismatch 방지를 위해 클라이언트 마운트 이후에만 렌더링
    setIsClient(true);
  }, []);

  // 첫 방문이면 onboarding 페이지로 리다이렉트
  useEffect(() => {
    if (isClient && !hasVisited) {
      router.replace('/onboarding');
      return;
    }
  }, [isClient, hasVisited, router]);

  // 메인 페이지 도착 시 히스토리 초기화 및 뒤로가기 종료 처리
  useEffect(() => {
    if (isClient && hasVisited && window.location.pathname === '/') {
      // 1. 현재 메인 페이지 상태 덮어쓰기
      window.history.replaceState({ page: 'home' }, '', '/');

      // 2. 뒤로가기 방지를 위한 더미 상태 푸시
      window.history.pushState({ page: 'home-guard' }, '', '/');

      // 3. PopState 이벤트 핸들러 (뒤로가기 시 실행)
      const handlePopState = () => {
        // 앱 종료 시도 (WebView 등 환경에 따라 다름)
        // @ts-ignore
        if (window.ReactNativeWebView) {
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_APP' }));
        } else {
          // 브라우저 환경: 뒤로가기 시 아무런 동작 없이 현재 페이지 유지 (이력 클리어 효과)
          // 알림창 없이 조용히 다시 가드 상태를 푸시하여 뒤로가기를 막음
          window.history.pushState({ page: 'home-guard' }, '', '/');
        }
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isClient, hasVisited]);

  const handleInputClick = (mode: 'wod' | 'goal' | 'part') => {
    let target = '';
    if (mode === 'wod') target = 'workout_1';
    else if (mode === 'goal') target = 'workout_2';
    else if (mode === 'part') target = 'workout_3';

    analytics.logEvent('click', {
      screen_name: 'main',
      event_category: 'main',
      target: target
    });

    resetInputState();
    setCurrentMode(mode);

    // 모드별 전용 선택 페이지로 이동
    if (mode === 'wod') {
      router.push('/balance-care');
    } else if (mode === 'goal') {
      router.push('/goal-care');
    } else {
      router.push('/part-care');
    }
  };

  // 클라이언트 마운트 전 또는 리다이렉트 중
  if (!isClient || !hasVisited) {
    return null;
  }

  // Figma 디자인 기반 홈 페이지
  return (
    <main className="min-h-screen flex flex-col bg-[#010101] text-white overflow-hidden relative font-apple-sd">
      {/* 상단 로고 및 텍스트 영역 (Top spacing approx 130px from design considering header) */}
      <div className="pt-[80px] pl-[41px] mb-[40px]">
        {/* Logo */}
        <div className="mb-4">
          <img src="/logo-red.svg" alt="AFTERWOD" className="w-[94px] h-auto" />
        </div>
        {/* Text */}
        <h1 className="text-[24px] font-bold leading-tight text-white mb-1">
          오늘도 잘 오셨어요!
        </h1>
        <h2 className="text-[24px] font-bold leading-tight text-white mb-2">
          어떤 운동을 할까요?
        </h2>
        <p className="text-[14px] text-gray-500 font-normal">
          목표에 맞는 운동 플랜을 설계해 드릴게요.
        </p>
      </div>

      {/* 케어 버튼 영역 */}
      <div className="flex flex-col gap-[14px] items-center w-full px-[12px]">
        {/* 1. 애프터와드 밸런스 케어 (Red) */}
        <button
          onClick={() => handleInputClick('wod')}
          className="w-full max-w-[357px] h-[100px] rounded-[24px] relative overflow-hidden transition active:scale-95 text-left pl-[24px] pr-[24px] flex flex-col justify-center gap-1 group"
          style={{
            background: 'linear-gradient(115.05deg, rgba(244, 48, 0, 0.2) 15.67%, rgba(0, 0, 0, 0.2) 42.31%), #1F1F1F',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
            backgroundClip: 'padding-box'
          }}
        >
          <h3 className="text-[22px] font-bold text-white leading-[26px]">밸런스 케어</h3>
          <p className="text-[14px] font-normal text-white/55 leading-[19px]">목표에 맞는 운동 플랜을 설계해 드릴게요.</p>

          {/* Hover/Active Effect Overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
        </button>

        {/* 2. 목표 달성 트레이닝 (Yellow) */}
        <button
          onClick={() => handleInputClick('goal')}
          className="w-full max-w-[357px] h-[100px] rounded-[24px] relative overflow-hidden transition active:scale-95 text-left pl-[24px] pr-[24px] flex flex-col justify-center gap-1 group"
          style={{
            background: 'linear-gradient(115.05deg, rgba(238, 253, 50, 0.2) 15.67%, rgba(0, 0, 0, 0.2) 42.31%), #1F1F1F',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
            backgroundClip: 'padding-box'
          }}
        >
          <h3 className="text-[22px] font-bold text-white leading-[26px]">스킬 마스터</h3>
          <p className="text-[14px] font-normal text-white/55 leading-[19px]">체계적인 플랜으로 목표 동작 달성</p>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
        </button>

        {/* 3. 부위별 집중 강화 (Blue) */}
        <button
          onClick={() => handleInputClick('part')}
          className="w-full max-w-[357px] h-[100px] rounded-[24px] relative overflow-hidden transition active:scale-95 text-left pl-[24px] pr-[24px] flex flex-col justify-center gap-1 group"
          style={{
            background: 'linear-gradient(115.05deg, rgba(35, 212, 224, 0.2) 15.67%, rgba(0, 0, 0, 0.2) 42.31%), #1F1F1F',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
            backgroundClip: 'padding-box'
          }}
        >
          <h3 className="text-[22px] font-bold text-white leading-[26px]">포커스 트레이닝</h3>
          <p className="text-[14px] font-normal text-white/55 leading-[19px]">원하는 신체 부위의 근력을 효과적으로 강화</p>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
        </button>
      </div>
    </main>
  );
}
