'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { MuscleGroup } from '@/app/lib/types/workout.types';
import { CareTimeSelector } from '@/app/components/CareTimeSelector';

const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] = [
  { id: 'CORE', label: '복근 / 코어', icon: 'fa-cube' },
  { id: 'LEGS', label: '하체 / 힙', icon: 'fa-person-running' },
  { id: 'BACK', label: '등 / 광배', icon: 'fa-dumbbell' },
  { id: 'CHEST', label: '가슴 / 어깨', icon: 'fa-child-reaching' },
  { id: 'CARDIO', label: '유산소', icon: 'fa-heart-pulse' }
];

export default function PartCarePage() {
  const router = useRouter();
  const { setGeneratedPlan } = useApp();
  const [selectedPart, setSelectedPart] = useState<MuscleGroup | null>(null);
  const [selectedTime, setSelectedTime] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPart = (part: MuscleGroup) => {
    setSelectedPart(prev => (prev === part ? null : part));
  };

  const handleGenerateWorkout = async () => {
    if (!selectedPart) {
      alert('운동할 부위를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        duration: selectedTime,
        targetMuscleGroups: [selectedPart]
      };

      const response = await fetch('/api/v1/workouts/generate/part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || '운동 계획 생성에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      setGeneratedPlan(data.data);
      router.push('/part-care/runner');
    } catch (err) {
      console.error('Error generating workout:', err);
      setError('운동 계획 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  // Theme Constants
  const THEME_ACCENT = '#00DCEB'; // Cyan

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      {/* 헤더 섹션 */}
      <div className="flex-shrink-0 px-4 pt-4 pb-6">
        <button
          onClick={handleBack}
          aria-label="이전으로"
          type="button"
          className="w-11 h-11 mb-4 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <i aria-hidden="true" className="fa-solid fa-angle-left text-2xl"></i>
        </button>
        <h1 className="text-3xl font-black text-white">집중할 부위를</h1>
        <h2 className="text-3xl font-black text-white">선택해주세요.</h2>
        <p className="text-xs text-gray-500 font-medium mt-2">집중적으로 운동할 부위를 선택하세요</p>
      </div>

      {/* 부위 선택 (Grid) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          {MUSCLE_GROUPS.map(group => {
            const isSelected = selectedPart === group.id;
            return (
              <button
                key={group.id}
                onClick={() => handleSelectPart(group.id)}
                className={`relative w-full h-[60px] rounded-xl px-4 flex flex-row items-center transition-all border ${isSelected
                    ? 'bg-[#1F1F1F] border-[#00DCEB] shadow-[0_0_15px_rgba(0,220,235,0.3)]'
                    : 'bg-[#1F1F1F] border-white/5 hover:border-white/20'
                  }`}
              >
                {/* Icon */}
                <div className={`text-xl flex-shrink-0 w-8 text-center ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
                  <i className={`fa-solid ${group.icon}`} />
                </div>

                <span className={`text-[15px] font-bold text-left ml-3 leading-tight ${isSelected ? 'text-[#00DCEB]' : 'text-white/60'}`}>
                  {group.label}
                </span>

                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#00DCEB] rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-check text-black text-xs" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 컨트롤 패널 (배경 카드) */}
      <div className="flex-shrink-0 relative w-full mt-auto">
        {/* Top Fade */}
        <div className="absolute top-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-transparent to-black pointer-events-none"></div>

        <div className="w-full bg-[#1F1F1F] rounded-t-[32px] border-t border-white/10 shadow-[0_-6px_44px_rgba(0,0,0,0.8)] relative overflow-hidden pb-6 pt-2">
          {/* Gradient Overlay (Cyan for Part Care) */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(121deg, rgba(35, 212, 224, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)' }}></div>

          <div className="relative z-10 flex flex-col items-center">
            <CareTimeSelector value={selectedTime} onChange={setSelectedTime} />

            {/* 에러 메시지 */}
            {error && (
              <div className="px-4 py-2 mb-2 w-full max-w-xs bg-red-900/50 border border-red-700/50 rounded-lg text-xs text-red-200 text-center">
                {error}
              </div>
            )}

            <div className="px-6 w-full max-w-sm mt-2">
              <button
                onClick={handleGenerateWorkout}
                disabled={isLoading}
                className="w-full h-[58px] text-black font-extrabold rounded-2xl transition-all active:scale-95 text-[17px] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-lg"
                style={{ backgroundColor: THEME_ACCENT, boxShadow: `0 10px 15px -3px rgba(0, 220, 235, 0.2)` }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    생성 중...
                  </>
                ) : (
                  '나만의 부위별 운동 생성하기'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
