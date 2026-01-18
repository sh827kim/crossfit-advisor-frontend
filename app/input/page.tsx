'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { WodInputSection } from '@/app/components/input-sections/WodInputSection';
import { GoalInputSection } from '@/app/components/input-sections/GoalInputSection';
import { PartInputSection } from '@/app/components/input-sections/PartInputSection';
import { TimeSelector } from '@/app/components/input-sections/TimeSelector';

const MODE_TITLES: Record<'wod' | 'goal' | 'part', { title: string; description: string }> = {
  wod: {
    title: '오늘의 WOD',
    description: '오늘 수행한 운동을 입력해주세요.'
  },
  goal: {
    title: '나의 달성 목표',
    description: '연습하고 싶은 스킬을 선택해주세요.'
  },
  part: {
    title: '타겟 부위',
    description: '집중적으로 운동할 부위를 선택하세요.'
  }
};

export default function InputPage() {
  const router = useRouter();
  const {
    currentMode,
    totalTime,
    setTotalTime,
    setGeneratedPlan,
    resetInputState,
    wodList,
    selectedGoal,
    selectedParts
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모드가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!currentMode) {
      router.push('/');
    }
  }, [currentMode, router]);

  if (!currentMode) {
    return null;
  }

  const modeConfig = MODE_TITLES[currentMode];

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let requestBody: any;

      if (currentMode === 'wod') {
        if (wodList.length === 0) {
          if (!confirm('입력된 WOD가 없습니다. 전신 보조운동을 추천할까요?')) {
            setIsLoading(false);
            return;
          }
        }
        requestBody = {
          duration: totalTime,
          wodMovementIds: wodList.map(m => m.id)
        };
      } else if (currentMode === 'goal') {
        if (!selectedGoal) {
          setError('목표를 선택해주세요.');
          setIsLoading(false);
          return;
        }
        requestBody = {
          duration: totalTime,
          goalMovementId: selectedGoal.id
        };
      } else {
        // part mode
        if (selectedParts.length === 0) {
          setError('타겟 부위를 하나 이상 선택해주세요.');
          setIsLoading(false);
          return;
        }
        requestBody = {
          duration: totalTime,
          targetMuscleGroups: selectedParts
        };
      }

      const endpoint = `/api/v1/workouts/generate/${currentMode}`;
      const response = await fetch(endpoint, {
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
      router.push('/result');
    } catch (err) {
      console.error('Error generating workout:', err);
      setError('운동 계획 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="px-6 pb-6 flex-grow flex flex-col">
      <button
        onClick={() => {
          resetInputState();
          router.replace('/');
        }}
        className="text-sm font-bold text-slate-400 mb-6 flex items-center w-fit hover:text-slate-800 transition mt-6"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> 이전으로
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 mb-1">{modeConfig.title}</h2>
        <p className="text-sm text-slate-500 font-medium">{modeConfig.description}</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 모드별 입력 섹션 */}
      {currentMode === 'wod' && <WodInputSection />}
      {currentMode === 'goal' && <GoalInputSection />}
      {currentMode === 'part' && <PartInputSection />}

      {/* 시간 선택 */}
      <TimeSelector totalTime={totalTime} setTotalTime={setTotalTime} />

      {/* 생성 버튼 */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <button
          onClick={handleGenerateWorkout}
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition transform active:scale-95 flex justify-center items-center text-lg disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
              생성 중...
            </>
          ) : (
            <>
              <span>{totalTime}분 운동 계획 생성하기</span>
            </>
          )}
        </button>
      </div>
    </main>
  );
}
