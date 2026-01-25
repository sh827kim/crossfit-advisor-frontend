'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export default function HomePage() {
  const router = useRouter();
  const { setCurrentMode, resetInputState, hasVisited, userProfileImage } = useApp();
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

  // 메인 페이지 도착 시 히스토리 초기화
  useEffect(() => {
    if (isClient && hasVisited && window.location.pathname === '/') {
      // 메인 페이지의 히스토리를 깔끔하게 유지
      // 1. 현재 항목을 메인으로 설정 (이전 모든 히스토리 제거)
      window.history.replaceState({ page: 'home' }, '', '/');
      // 2. 뒤로가기 차단을 위해 추가 상태 추가
      window.history.pushState({ page: 'home-guard' }, '', '/');
    }
  }, [isClient, hasVisited]);

  const handleInputClick = (mode: 'wod' | 'goal' | 'part') => {
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
    <main className="flex-grow flex flex-col bg-black text-white pb-6 px-4">
      {/* 타이틀 */}
      <div className="mb-12 mt-8 text-center">
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">TODAY</h1>
        <h2 className="text-5xl font-black text-white leading-tight">PLAN</h2>
        <p className="text-sm text-gray-500 mt-6">상황에 맞는 최적의 루틴을 추천해드려요</p>
      </div>

      {/* 카드 영역 */}
      <div className="flex flex-col gap-4 flex-1">
        {/* 애프터와드 밸런스 케어 */}
        <button
          onClick={() => handleInputClick('wod')}
          className="w-full py-6 px-5 rounded-2xl transition active:scale-95 overflow-hidden relative"
          style={{
            background: 'linear-gradient(118.37deg, rgba(244, 48, 0, 0.2) 8.59%, rgba(0, 0, 0, 0.2) 42.36%), #1F1F1F',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <h3 className="text-lg font-black text-white text-left">애프터와드 밸런스 케어</h3>
          <p className="text-xs text-gray-500 text-left mt-1">오늘 운동을 분석해 균형 잡힌 마무리 운동을 추천해요.</p>
        </button>

        {/* 목표 달성 트레이닝 */}
        <button
          onClick={() => handleInputClick('goal')}
          className="w-full py-6 px-5 rounded-2xl transition active:scale-95 overflow-hidden relative"
          style={{
            background: 'linear-gradient(115.05deg, rgba(124, 253, 50, 0.2) 15.67%, rgba(0, 0, 0, 0.2) 42.31%), #1F1F1F',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <h3 className="text-lg font-black text-white text-left">목표 달성 트레이닝</h3>
          <p className="text-xs text-gray-500 text-left mt-1">설정하신 목표 달성에 필요한 최적의 훈련을 시작해요.</p>
        </button>

        {/* 부위별 집중 강화 */}
        <button
          onClick={() => handleInputClick('part')}
          className="w-full py-6 px-5 rounded-2xl transition active:scale-95 overflow-hidden relative"
          style={{
            background: 'linear-gradient(116.58deg, rgba(35, 212, 224, 0.2) 9.25%, rgba(0, 0, 0, 0.2) 42.06%), #1F1F1F',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <h3 className="text-lg font-black text-white text-left">부위별 집중 강화</h3>
          <p className="text-xs text-gray-500 text-left mt-1">오늘 더 훈련하고 싶은 부위만 골라 운동을 구성하세요.</p>
        </button>
      </div>
    </main>
  );
}
