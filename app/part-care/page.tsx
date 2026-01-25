'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { MuscleGroup } from '@/app/lib/types/workout.types';

const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'CORE', label: '복근 / 코어' },
  { id: 'LEGS', label: '하체 / 힙' },
  { id: 'BACK', label: '등 / 광배' },
  { id: 'CHEST', label: '가슴 / 어깨' },
  { id: 'CARDIO', label: '유산소' }
];

export default function PartCarePage() {
  const router = useRouter();
  const { setGeneratedPlan } = useApp();
  const [selectedParts, setSelectedParts] = useState<MuscleGroup[]>([]);
  const [selectedTime, setSelectedTime] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePart = (part: MuscleGroup) => {
    setSelectedParts(prev =>
      prev.includes(part)
        ? prev.filter(p => p !== part)
        : [...prev, part]
    );
  };

  const handleGenerateWorkout = async () => {
    if (selectedParts.length === 0) {
      alert('최소 1개의 부위를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        duration: selectedTime,
        targetMuscleGroups: selectedParts
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
      router.push('/result');
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

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      {/* 헤더 섹션 */}
      <div className="flex-shrink-0 px-4 pt-4 pb-6">
        <button
          onClick={handleBack}
          className="text-xs font-bold text-gray-400 mb-4 flex items-center hover:text-gray-200 transition uppercase tracking-wide"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>이전으로
        </button>
        <h1 className="text-3xl font-black text-white">집중할 부위를</h1>
        <h2 className="text-3xl font-black text-white">선택해주세요.</h2>
        <p className="text-xs text-gray-500 font-medium mt-2">집중적으로 운동할 부위를 선택하세요</p>
      </div>

      {/* 선택된 부위 칩 */}
      {selectedParts.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-4 flex gap-2 overflow-x-auto flex-wrap">
          {selectedParts.map(partId => {
            const part = MUSCLE_GROUPS.find(g => g.id === partId);
            return part ? (
              <button
                key={partId}
                onClick={() => togglePart(partId)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-xs font-semibold whitespace-nowrap hover:opacity-80 transition"
              >
                <span>{part.label}</span>
                <span className="text-lg leading-none">×</span>
              </button>
            ) : null;
          })}
        </div>
      )}

      {/* 부위 선택 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {MUSCLE_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => togglePart(group.id)}
              className={`w-full py-4 px-4 border rounded-xl text-sm font-semibold transition-all ${
                selectedParts.includes(group.id)
                  ? 'bg-gray-800 border-gray-700 text-white shadow-lg'
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* 운동 시간 선택 (수평 스크롤) */}
      <div className="flex-shrink-0 px-4 py-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-xs font-bold text-gray-400 mb-4 text-center uppercase tracking-wider">운동 시간</p>
        <div className="flex gap-3 justify-center overflow-x-auto pb-2">
          {[10, 15, 20, 25, 30, 35, 40].map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-all ${
                selectedTime === time
                  ? 'bg-cyan-500 text-black text-base'
                  : 'bg-gray-700 text-gray-300 text-sm hover:bg-gray-600'
              }`}
            >
              {time}분
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="px-4 py-3 mb-4 bg-red-900 border border-red-700 rounded-lg text-xs text-red-200 text-center">
          {error}
        </div>
      )}

      {/* 생성 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6">
        <button
          onClick={handleGenerateWorkout}
          disabled={isLoading}
          className="w-full bg-cyan-500 text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-base hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
    </main>
  );
}
