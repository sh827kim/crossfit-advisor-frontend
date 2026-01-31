'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { Movement } from '@/app/lib/types/workout.types';
import { CareTimeSelector } from '@/app/components/CareTimeSelector';

// 한글 초성 추출 함수
function getChosung(str: string): string {
  const cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
    else result += str.charAt(i);
  }
  return result;
}

export default function BalanceCarePage() {
  const router = useRouter();
  const { setGeneratedPlan } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState(20);
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [frequentMovements, setFrequentMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API에서 운동 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movementsRes, frequentRes] = await Promise.all([
          fetch('/api/v1/movements'),
          fetch('/api/v1/movements/frequent')
        ]);

        const movementsData = await movementsRes.json();
        const frequentData = await frequentRes.json();

        setAllMovements(movementsData.data?.movements || []);
        setFrequentMovements(frequentData.data?.movements || []);
      } catch (error) {
        console.error('Failed to fetch movements:', error);
      }
    };

    fetchData();
  }, []);

  // 검색 필터링 (초성 검색 포함)
  const filteredMovements = searchInput.trim()
    ? allMovements.filter(movement => {
      const nameMatch = movement.name.includes(searchInput);
      const chosungMatch = getChosung(movement.name).includes(getChosung(searchInput));
      return nameMatch || chosungMatch;
    })
    : [];

  const handleExerciseSelect = (movementId: string) => {
    setSelectedExercises(prev =>
      prev.includes(movementId)
        ? prev.filter(id => id !== movementId)
        : [...prev, movementId]
    );
  };

  const handleAddFrequent = (movement: Movement) => {
    if (!selectedExercises.includes(movement.id)) {
      setSelectedExercises(prev => [...prev, movement.id]);
    }
  };

  const handleGenerateWorkout = async () => {
    if (selectedExercises.length === 0) {
      alert('최소 1개의 운동을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        duration: selectedTime,
        wodMovementIds: selectedExercises
      };

      const response = await fetch('/api/v1/workouts/generate/wod', {
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
      router.push('/balance-care/runner');
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
          aria-label="이전으로"
          type="button"
          className="w-11 h-11 mb-4 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <i aria-hidden="true" className="fa-solid fa-angle-left text-2xl"></i>
        </button>
        <h1 className="text-3xl font-black text-white">오늘의 WOD를</h1>
        <h2 className="text-3xl font-black text-white">알려주세요.</h2>
        <p className="text-xs text-gray-500 font-medium mt-2">오늘 수행한 운동을 알려주세요</p>
      </div>

      {/* 선택된 운동 칩 */}
      {selectedExercises.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-4 flex gap-2 overflow-x-auto">
          {selectedExercises.map(exerciseId => {
            const movement = allMovements.find(m => m.id === exerciseId);
            return movement ? (
              <button
                key={exerciseId}
                onClick={() => handleExerciseSelect(exerciseId)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-xs font-semibold whitespace-nowrap hover:opacity-80 transition"
              >
                <span>{movement.name}</span>
                <span className="text-lg leading-none">×</span>
              </button>
            ) : null;
          })}
        </div>
      )}

      {/* 검색 입력 */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="운동 검색 (초성: ㅅㄴㅊ)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700 transition border border-gray-800"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
      </div>

      {/* 자주하는 운동 */}
      {frequentMovements.length > 0 && !searchInput.trim() && (
        <div className="flex-shrink-0 px-4 pb-4">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">자주하는 운동</p>
          <div className="grid grid-cols-3 gap-2">
            {frequentMovements.map(movement => (
              <button
                key={movement.id}
                onClick={() => handleAddFrequent(movement)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${selectedExercises.includes(movement.id)
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
                  }`}
              >
                {movement.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 운동 카드 그리드 (검색 결과) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {searchInput.trim() && filteredMovements.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : searchInput.trim() ? (
          <div className="flex flex-col gap-2">
            {filteredMovements.map(movement => (
              <button
                key={movement.id}
                onClick={() => handleExerciseSelect(movement.id)}
                className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all active:scale-95 border font-semibold text-sm ${selectedExercises.includes(movement.id)
                  ? 'bg-gray-800 border-gray-700 shadow-lg text-white'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700 shadow-md text-gray-300'
                  }`}
              >
                <span className="text-left leading-tight">{movement.name}</span>
                {selectedExercises.includes(movement.id) ? (
                  <i aria-hidden="true" className="fa-solid fa-check text-xs text-white/80"></i>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 하단 컨트롤 패널 (배경 카드) */}
      <div className="flex-shrink-0 relative w-full mt-auto">
        <div className="absolute top-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-transparent to-black pointer-events-none"></div>

        <div className="w-full bg-[#1F1F1F] rounded-t-[32px] border-t border-white/10 shadow-[0_-6px_44px_rgba(0,0,0,0.8)] relative overflow-hidden pb-6 pt-2">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F43000]/20 to-black/20 pointer-events-none"></div>

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
                className="w-full h-[58px] bg-[#f43000] text-black font-extrabold rounded-2xl transition-all active:scale-95 text-[17px] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-orange-900/20"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    생성 중...
                  </>
                ) : (
                  '나만의 밸런스 운동 생성하기'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
