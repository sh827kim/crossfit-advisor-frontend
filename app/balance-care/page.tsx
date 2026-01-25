'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { Movement, MuscleGroup, Equipment } from '@/app/lib/types/workout.types';

interface ExerciseData {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
}

// 기본 제공 운동들
const BALANCE_CARE_EXERCISES: ExerciseData[] = [
  { id: 'snatch', name: '스내치', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'clean', name: '클린', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'toes-to-bar', name: '토우-투-바', muscleGroups: ['CORE', 'BACK'], equipment: 'BODYWEIGHT' },
  { id: 'pull-up', name: '풀업', muscleGroups: ['BACK', 'CHEST'], equipment: 'BODYWEIGHT' },
  { id: 'rowing', name: '로잉', muscleGroups: ['CARDIO', 'BACK'], equipment: 'ROWING' },
  { id: 'wall-walk', name: '월 워크', muscleGroups: ['CORE', 'CHEST'], equipment: 'WALL' },
];

// 한글 초성 추출 함수
function getChosung(str: string): string {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code > -1 && code < 11172) result += cho[Math.floor(code/588)];
    else result += str.charAt(i);
  }
  return result;
}

export default function BalanceCarePage() {
  const router = useRouter();
  const { setCurrentMode, setTotalTime, resetInputState, setGeneratedPlan } = useApp();
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
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedExercises.includes(movement.id)
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
          <div className="grid grid-cols-2 gap-2">
            {filteredMovements.map(movement => (
              <button
                key={movement.id}
                onClick={() => handleExerciseSelect(movement.id)}
                className={`p-3 rounded-xl flex items-center justify-center transition-all active:scale-95 border font-semibold text-xs h-24 ${
                  selectedExercises.includes(movement.id)
                    ? 'bg-gray-800 border-gray-700 shadow-lg'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700 shadow-md'
                }`}
              >
                <span className="text-center leading-tight">{movement.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* 운동 시간 선택 (수평 스크롤) */}
      <div className="flex-shrink-0 px-4 py-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-xs font-bold text-gray-400 mb-4 text-center uppercase tracking-wider">운동 시간</p>
        <div className="flex gap-3 justify-center overflow-x-auto pb-2 hide-scrollbar">
          {[10, 15, 20, 25, 30, 35, 40].map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-all ${
                selectedTime === time
                  ? 'bg-white text-black text-base'
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

      {/* 진행 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6">
        <button
          onClick={handleGenerateWorkout}
          disabled={isLoading}
          className="w-full bg-[#f43000] text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-base hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
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
    </main>
  );
}
