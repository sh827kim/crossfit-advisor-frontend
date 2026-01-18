'use client';

import { useApp } from '@/app/context/AppContext';
import { MuscleGroup } from '@/app/lib/types/workout.types';

const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'CORE', label: '복근 / 코어' },
  { id: 'LEGS', label: '하체 / 힙' },
  { id: 'BACK', label: '등 / 광배' },
  { id: 'CHEST', label: '가슴 / 어깨' },
  { id: 'CARDIO', label: '유산소' }
];

export function PartInputSection() {
  const { selectedParts, togglePart } = useApp();

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-3">
        {MUSCLE_GROUPS.map(group => (
          <button
            key={group.id}
            onClick={() => togglePart(group.id)}
            className={`w-full py-4 px-4 border rounded-xl text-sm font-medium transition-all duration-200 shadow-sm text-center ${
              selectedParts.includes(group.id)
                ? 'border-blue-600 text-blue-600 font-bold bg-blue-50 ring-1 ring-blue-600 shadow-md'
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>
    </div>
  );
}
