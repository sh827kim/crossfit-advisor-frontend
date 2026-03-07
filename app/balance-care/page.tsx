'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement } from '@/app/lib/types/workout.types';

import { CarePageLayout } from '@/app/components/shared/CarePageLayout';
import { CareBottomPanel } from '@/app/components/shared/CareBottomPanel';
import { SelectionCard } from '@/app/components/shared/SelectionCard';
import { AlertDialog } from '@/app/components/shared/AlertDialog';
import { useWorkoutGenerator } from '@/app/hooks/useWorkoutGenerator';
import { useApp } from '@/app/context/AppContext';
import { useError } from '@/app/context/ErrorContext';
import { analytics } from '../lib/analytics';
import { getMovementIconPath } from '@/app/lib/iconUtils';

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
  const { wodList, addWod, removeWod, totalTime: selectedTime, setTotalTime: setSelectedTime } = useApp();

  const selectedExercises = wodList.map(m => m.id);

  const [searchInput, setSearchInput] = useState('');
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [frequentMovements, setFrequentMovements] = useState<Movement[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { showError } = useError();

  // API에서 운동 데이터 로드
  const fetchData = useCallback(async () => {
    try {
      const [movementsRes, frequentRes] = await Promise.all([
        fetch('/api/v1/movements'),
        fetch('/api/v1/movements/frequent')
      ]);

      if (!movementsRes.ok || !frequentRes.ok) {
        throw new Error('API fetch error');
      }

      const movementsData = await movementsRes.json();
      const frequentData = await frequentRes.json();

      setAllMovements(movementsData.data?.movements || []);
      setFrequentMovements(frequentData.data?.movements || []);
    } catch (err) {
      console.error('Failed to fetch movements:', err);
      const isNetworkError = err instanceof TypeError;
      showError(isNetworkError ? 'NETWORK' : 'UNKNOWN', fetchData);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 검색 필터링 (초성 검색 포함)
  const filteredMovements = searchInput.trim()
    ? allMovements.filter(movement => {
      const nameMatch = movement.name.includes(searchInput);
      const chosungMatch = getChosung(movement.name).includes(getChosung(searchInput));
      return nameMatch || chosungMatch;
    })
    : [];

  const handleExerciseSelect = (movementId: string) => {
    const isSelected = selectedExercises.includes(movementId);
    if (isSelected) {
      removeWod(movementId);
    } else {
      const movement = allMovements.find(m => m.id === movementId);
      if (movement) {
        addWod(movement);
      }
    }
  };

  const handleAddFrequent = (movement: Movement) => {
    if (!selectedExercises.includes(movement.id)) {
      addWod(movement);
    }
  };

  const handleGenerate = () => {
    if (selectedExercises.length === 0) {
      setIsAlertOpen(true);
      return;
    }

    // Get movement names for logging (no longer sent to GA, preserved for future local logic if needed)
    const selectedNames = selectedExercises
      .map(id => allMovements.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(',');

    analytics.logEvent('request_recommendation', {
      recommend_type: 'selected_wod',
      time_select: selectedTime.toString()
    });

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
    <>
      <CarePageLayout
        title="오늘 한 WOD를"
        subtitle="알려주세요."
        description=""
        onBack={handleBack}
        bottomControls={
          <CareBottomPanel
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            onGenerate={handleGenerate}
            isGenerating={isLoading}
            error={error}
            buttonText="오늘의 플랜 확인하기"
            themeColor="#f43000"
            gradientOverlay="linear-gradient(135deg, rgba(244, 48, 0, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)"
            isDisabled={selectedExercises.length === 0}
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
                placeholder="초성으로 검색 (예: ㅅㄴㅊ)"
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
              <div className="grid grid-cols-2 gap-3">
                {frequentMovements.map(movement => (
                  <SelectionCard
                    key={movement.id}
                    selected={selectedExercises.includes(movement.id)}
                    onClick={() => handleAddFrequent(movement)}
                    label={movement.name}
                    themeColor="#f43000"
                    icon={getMovementIconPath(movement)}
                  />
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
                    icon={getMovementIconPath(movement)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </CarePageLayout>
      <AlertDialog
        isOpen={isAlertOpen}
        title="운동 선택 필요"
        description="최소 1개의 운동을 선택해주세요."
        onConfirm={() => setIsAlertOpen(false)}
        confirmColor="#f43000"
      />
    </>
  );
}

