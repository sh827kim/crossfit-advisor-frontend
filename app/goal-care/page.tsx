'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Movement } from '@/app/lib/types/workout.types';

import { CarePageLayout } from '@/app/components/shared/CarePageLayout';
import { CareBottomPanel } from '@/app/components/shared/CareBottomPanel';
import { SelectionCard } from '@/app/components/shared/SelectionCard';
import { useWorkoutGenerator } from '@/app/hooks/useWorkoutGenerator';

export default function GoalCarePage() {
  const router = useRouter();
  const { generateWorkout, isLoading, error, setError } = useWorkoutGenerator();

  const [selectedGoal, setSelectedGoal] = useState<Movement | null>(null);
  const [selectedTime, setSelectedTime] = useState(20);
  const [goals, setGoals] = useState<Movement[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // 목표 운동 목록 로드
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('/api/v1/movements/goals');
        const data = await response.json();
        setGoals(data.data?.movements || []);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setIsLoadingGoals(false);
      }
    };

    fetchGoals();
  }, []);

  const handleGenerate = () => {
    if (!selectedGoal) {
      alert('목표를 선택해주세요.');
      return;
    }

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

  // Helper to render icon for goal
  const getGoalIcon = (name: string) => {
    if (name.includes('Pull')) return <i className="fa-solid fa-person-running" />;
    if (name.includes('Muscle')) return <i className="fa-solid fa-dumbbell" />;
    if (name.includes('Hand')) return <i className="fa-solid fa-hands" />;
    return <i className="fa-solid fa-bullseye" />;
  };

  return (
    <CarePageLayout
      title="달성할 목표를"
      subtitle="선택해주세요."
      description="연습하고 싶은 스킬을 선택해주세요"
      onBack={handleBack}
      bottomControls={
        <CareBottomPanel
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          onGenerate={handleGenerate}
          isGenerating={isLoading}
          error={error}
          buttonText="목표 달성 운동 생성하기"
          themeColor={THEME_ACCENT}
          gradientOverlay="linear-gradient(121deg, rgba(124, 253, 50, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)"
        />
      }
    >
      {/* 목표 선택 (Card Grid) */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isLoadingGoals ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="flex flex-col items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin text-lg"></i>
              <p className="text-sm">목표를 불러오는 중...</p>
            </div>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">목표 목록이 없습니다</p>
          </div>
        ) : (
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
                >
                  {/* Pass Icon as children */}
                  {getGoalIcon(goal.name)}
                </SelectionCard>
              );
            })}
          </div>
        )}
      </div>
    </CarePageLayout>
  );
}

