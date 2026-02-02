'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement } from '@/app/lib/types/workout.types';

import { CarePageLayout } from '@/app/components/shared/CarePageLayout';
import { CareBottomPanel } from '@/app/components/shared/CareBottomPanel';
import { SelectionCard } from '@/app/components/shared/SelectionCard';
import { useWorkoutGenerator } from '@/app/hooks/useWorkoutGenerator';

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
  const { generateWorkout, isLoading, error, setError } = useWorkoutGenerator();

  const [searchInput, setSearchInput] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState(20);
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [frequentMovements, setFrequentMovements] = useState<Movement[]>([]);

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

  const handleGenerate = () => {
    if (selectedExercises.length === 0) {
      alert('최소 1개의 운동을 선택해주세요.');
      return;
    }

    generateWorkout(
      '/api/v1/workouts/generate/balance',
      {
        duration: selectedTime,
        wodMovementIds: selectedExercises
      },
      '/balance-care/runner'
    );
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <CarePageLayout
      title="오늘의 WOD를"
      subtitle="알려주세요."
      description="오늘 수행한 운동을 알려주세요"
      onBack={handleBack}
      bottomControls={
        <CareBottomPanel
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
          error={error}
          buttonText="나만의 밸런스 운동 생성하기"
          themeColor="#f43000"
          gradientOverlay="linear-gradient(135deg, rgba(244, 48, 0, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)"
        />
      }
    >
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col">
        {/* 선택된 운동 칩 */}
        {selectedExercises.length > 0 && (
          <div className="flex-shrink-0 pb-4 flex gap-2 overflow-x-auto">
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
        <div className="flex-shrink-0 pb-4">
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
          <div className="flex-shrink-0 pb-4">
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
        <div className="flex-1">
          {searchInput.trim() && filteredMovements.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 py-10">
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          ) : searchInput.trim() ? (
            <div className="flex flex-col gap-2">
              {filteredMovements.map(movement => (
                <SelectionCard
                  key={movement.id}
                  selected={selectedExercises.includes(movement.id)}
                  onClick={() => handleExerciseSelect(movement.id)}
                  label={movement.name}
                  themeColor="#f43000"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </CarePageLayout>
  );
}

