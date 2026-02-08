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

const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] = [
  { id: 'CORE', label: '복근 / 코어', icon: 'fa-cube' },
  { id: 'LEGS', label: '하체 / 힙', icon: 'fa-person-running' },
  { id: 'BACK', label: '등 / 광배', icon: 'fa-dumbbell' },
  { id: 'CHEST', label: '가슴 / 어깨', icon: 'fa-shirt' },
  { id: 'CARDIO', label: '유산소', icon: 'fa-heart-pulse' }
];

export default function PartCarePage() {
  const router = useRouter();
  const { generateWorkout, isLoading, error, setError } = useWorkoutGenerator();

  const [selectedPart, setSelectedPart] = useState<MuscleGroup | null>(null);
  const [selectedTime, setSelectedTime] = useState(20);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleSelectPart = (part: MuscleGroup) => {
    setSelectedPart(prev => (prev === part ? null : part));
  };

  const handleGenerate = () => {
    if (!selectedPart) {
      setIsAlertOpen(true);
      return;
    }

    generateWorkout(
      '/api/v1/workouts/generate/part',
      {
        duration: selectedTime,
        targetMuscleGroups: [selectedPart]
      },
      '/part-care/runner'
    );
  };

  const handleBack = () => {
    if (selectedPart) {
      setSelectedPart(null);
    } else {
      router.push('/');
    }
  };

  // Theme Constants
  const THEME_ACCENT = '#00DCEB'; // Cyan

  return (
    <>
      <CarePageLayout
        title="집중적으로 운동할"
        subtitle="부위를 선택해주세요."
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

