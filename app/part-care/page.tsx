'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MuscleGroup } from '@/app/lib/types/workout.types';

import { CarePageLayout } from '@/app/components/shared/CarePageLayout';
import { CareBottomPanel } from '@/app/components/shared/CareBottomPanel';
import { SelectionCard } from '@/app/components/shared/SelectionCard';
import { AlertDialog } from '@/app/components/shared/AlertDialog';
import { EncouragedOverlay } from '@/app/components/shared/EncouragedOverlay';
import { useWorkoutGenerator } from '@/app/hooks/useWorkoutGenerator';
import { useApp } from '@/app/context/AppContext';
import { analytics } from '../lib/analytics';

const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] = [
  { id: 'CORE', label: '복근 / 코어', icon: '/wod-icon/part/core.svg' },
  { id: 'LEGS', label: '하체 / 힙', icon: '/wod-icon/part/legs.svg' },
  { id: 'BACK', label: '등 / 광배', icon: '/wod-icon/part/back.svg' },
  { id: 'CHEST', label: '가슴 / 어깨', icon: '/wod-icon/part/chest.svg' },
  { id: 'CARDIO', label: '유산소', icon: '/wod-icon/part/cardio-focus.svg' }
];

export default function PartCarePage() {
  const router = useRouter();
  const { generateWorkout, isLoading, error, setError } = useWorkoutGenerator();
  const { selectedParts, clearParts, togglePart, totalTime: selectedTime, setTotalTime: setSelectedTime } = useApp();

  const selectedPart = selectedParts[0] || null;
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleSelectPart = (part: MuscleGroup) => {
    if (selectedParts[0] === part) {
      clearParts();
    } else {
      clearParts();
      togglePart(part);
    }
  };

  const handleGenerate = () => {
    if (!selectedPart) { // Changed from selectedTargets.length === 0 to !selectedPart to match existing state
      setIsAlertOpen(true);
      return;
    }

    analytics.logEvent('request_recommendation', {
      recommend_type: 'selected_target',
      time_select: selectedTime.toString()
    });

    generateWorkout(
      '/api/v1/workouts/generate/part',
      {
        duration: selectedTime,
        targetMuscleGroups: [selectedPart] // Changed from targetMuscles: selectedTargets to targetMuscleGroups: [selectedPart] to match existing state
      },
      '/part-care/runner'
    );
  };

  const handleBack = () => {
    if (selectedPart) {
      clearParts();
    } else {
      router.push('/');
    }
  };

  // Theme Constants
  const THEME_ACCENT = '#00DCEB'; // Cyan

  return (
    <>
      <CarePageLayout
        title="어떤 부위의"
        subtitle="근력을 키울까요?"
        description=""
        onBack={handleBack}
        overlayNode={
          selectedPart ? (
            <EncouragedOverlay
              label="선택한 타겟 부위"
              title={MUSCLE_GROUPS.find(g => g.id === selectedPart)?.label || ''}
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
            buttonText="타겟 부위 운동 생성하기"
            themeColor={THEME_ACCENT}
            gradientOverlay="linear-gradient(121deg, rgba(35, 212, 224, 0.2) 0%, rgba(10, 10, 10, 0.2) 100%)"
            isDisabled={!selectedPart}
          />
        }
      >
        {/* 부위 선택 (Grid) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {MUSCLE_GROUPS.map(group => (
              <SelectionCard
                key={group.id}
                selected={selectedPart === group.id}
                onClick={() => handleSelectPart(group.id)}
                label={group.label}
                themeColor={THEME_ACCENT}
                icon={group.icon}
              />
            ))}
            {/* 자동 추천 (Random Select) */}
            <SelectionCard
              selected={false}
              onClick={() => {
                // Randomly select one from MUSCLE_GROUPS
                const randomPart = MUSCLE_GROUPS[Math.floor(Math.random() * MUSCLE_GROUPS.length)];
                handleSelectPart(randomPart.id);
              }}
              label="자동 추천"
              themeColor={THEME_ACCENT}
              icon="fa-wand-magic-sparkles"
            />
          </div>
        </div>
      </CarePageLayout>
      <AlertDialog
        isOpen={isAlertOpen}
        title="부위 선택 필요"
        description="운동할 부위를 선택해주세요."
        onConfirm={() => setIsAlertOpen(false)}
        confirmColor="#00DCEB"
      />
    </>
  );
}

