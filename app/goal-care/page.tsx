'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement } from '@/app/lib/types/workout.types';

import { CarePageLayout } from '@/app/components/shared/CarePageLayout';
import { CareBottomPanel } from '@/app/components/shared/CareBottomPanel';
import { SelectionCard } from '@/app/components/shared/SelectionCard';
import { AlertDialog } from '@/app/components/shared/AlertDialog';
import { EncouragedOverlay } from '@/app/components/shared/EncouragedOverlay';
import { useWorkoutGenerator } from '@/app/hooks/useWorkoutGenerator';
import { useApp } from '@/app/context/AppContext';
import { useError } from '@/app/context/ErrorContext';
import { analytics } from '@/app/lib/analytics';
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

export default function GoalCarePage() {
  const router = useRouter();
  const { generateWorkout, isLoading, error, setError } = useWorkoutGenerator();
  const { selectedGoal, setSelectedGoal, totalTime: selectedTime, setTotalTime: setSelectedTime } = useApp();

  const { showError } = useError();

  const [goals, setGoals] = useState<Movement[]>([]);
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // 목표 운동 및 전체 운동 목록 로드
  const fetchData = useCallback(async () => {
    try {
      setIsLoadingGoals(true);
      const [goalsRes, movementsRes] = await Promise.all([
        fetch('/api/v1/movements/goals'),
        fetch('/api/v1/movements')
      ]);
      if (!goalsRes.ok || !movementsRes.ok) {
        throw new Error('API fetch error');
      }

      const goalsData = await goalsRes.json();
      const movementsData = await movementsRes.json();

      setGoals(goalsData.data?.movements || []);
      setAllMovements(movementsData.data?.movements || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      const isNetworkError = err instanceof TypeError;
      showError(isNetworkError ? 'NETWORK' : 'UNKNOWN', fetchData);
    } finally {
      setIsLoadingGoals(false);
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

  const handleGenerate = () => {
    if (!selectedGoal) {
      setIsAlertOpen(true);
      return;
    }

    analytics.logEvent('request_recommendation', {
      recommend_type: 'selected_goal',
      time_select: selectedTime.toString()
    });

    generateWorkout(
      '/api/v1/workouts/generate/goal',
      {
        duration: selectedTime,
        goalMovementId: selectedGoal.id
      },
      '/goal-care/runner'
    );
  };

  const handleBack = () => {
    router.push('/');
  };

  // Theme Constants
  const THEME_ACCENT = '#EEFD32'; // Yellow

  // Helper to render icon for goal removed

  return (
    <>
      <CarePageLayout
        title="어떤 동작을"
        subtitle="연습할까요?"
        description=""
        onBack={handleBack}
        overlayNode={
          selectedGoal ? (
            <EncouragedOverlay
              label="선택한 동작"
              title={selectedGoal.name}
              themeColor={THEME_ACCENT}
            />
          ) : undefined
        }
        bottomControls={
          <CareBottomPanel
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            onGenerate={handleGenerate}
            isGenerating={isLoading}
            error={error}
            buttonText="오늘의 플랜 확인하기"
            themeColor={THEME_ACCENT}
            gradientOverlay="linear-gradient(121deg, rgba(124, 253, 50, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)"
            isDisabled={!selectedGoal}
          />
        }
      >
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col">
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

          <div className="flex-1">
            {isLoadingGoals ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                  <p className="text-sm">데이터를 불러오는 중...</p>
                </div>
              </div>
            ) : searchInput.trim() ? (
              /* 검색 결과 화면 */
              filteredMovements.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 py-10">
                  <p className="text-sm">검색 결과가 없습니다</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredMovements.map(movement => {
                    const isSelected = selectedGoal?.id === movement.id;
                    return (
                      <SelectionCard
                        key={movement.id}
                        selected={isSelected}
                        onClick={() => setSelectedGoal(isSelected ? null : movement)}
                        label={movement.name}
                        themeColor={THEME_ACCENT}
                        icon={getMovementIconPath(movement)}
                      />
                    );
                  })}
                </div>
              )
            ) : (
              /* 기본 목표 목록 화면 */
              goals.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 py-10">
                  <p className="text-sm">목표 목록이 없습니다</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">주요 목표 동작</p>
                  <div className="grid grid-cols-2 gap-3">
                    {goals.map(goal => {
                      const isSelected = selectedGoal?.id === goal.id;
                      return (
                        <SelectionCard
                          key={goal.id}
                          selected={isSelected}
                          onClick={() => setSelectedGoal(isSelected ? null : goal)}
                          label={goal.name}
                          themeColor={THEME_ACCENT}
                          icon={getMovementIconPath(goal)}
                        />
                      );
                    })}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </CarePageLayout>
      <AlertDialog
        isOpen={isAlertOpen}
        title="목표 선택 필요"
        description="목표를 선택해주세요."
        onConfirm={() => setIsAlertOpen(false)}
        confirmColor="#EEFD32"
      />
    </>
  );
}

