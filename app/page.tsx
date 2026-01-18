'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

export default function HomePage() {
  const router = useRouter();
  const { setCurrentMode, resetInputState, hasVisited } = useApp();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
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
    router.push('/input');
  };

  // 클라이언트 마운트 전 또는 리다이렉트 중
  if (!isClient || !hasVisited) {
    return null;
  }

  // 일반 홈 페이지
  return (
    <main className="px-6 pb-6 flex-grow flex flex-col pt-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black text-slate-800 leading-tight mb-2">오늘의 운동 목표는?</h2>
        <p className="text-sm text-slate-500 font-medium">상황에 맞는 최적의 루틴을 추천해드려요.</p>
      </div>

      <div className="flex flex-col w-full gap-3">
        {/* 부족한 부위 채우기 */}
        <button
          onClick={() => handleInputClick('wod')}
          className="w-full flex flex-col items-center justify-center p-6 mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center h-44 relative overflow-hidden group active:scale-95"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500"></div>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i className="fa-solid fa-battery-full text-green-600 text-3xl"></i>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">부족한 부위 채우기</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">오늘 WOD에서 안 쓴 근육 위주</p>
        </button>

        {/* 나의 달성 목표 */}
        <button
          onClick={() => handleInputClick('goal')}
          className="w-full flex flex-col items-center justify-center p-6 mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center h-44 relative overflow-hidden group active:scale-95"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500"></div>
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i className="fa-solid fa-trophy text-purple-600 text-3xl"></i>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">나의 달성 목표</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">머슬업, 핸드스탠드 등 스킬</p>
        </button>

        {/* 타겟 부위 선택 */}
        <button
          onClick={() => handleInputClick('part')}
          className="w-full flex flex-col items-center justify-center p-6 mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center h-44 relative overflow-hidden group active:scale-95"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500"></div>
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <i className="fa-solid fa-bullseye text-blue-600 text-3xl"></i>
          </div>
          <h3 className="font-bold text-slate-800 text-lg">타겟 부위 선택</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">원하는 부위 집중 공략</p>
        </button>
      </div>
    </main>
  );
}
