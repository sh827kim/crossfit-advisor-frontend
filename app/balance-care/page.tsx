'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { Movement, MuscleGroup, Equipment } from '@/app/lib/types/workout.types';

interface ExerciseData {
  id: string;
  name: string;
  icon: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
}

const BALANCE_CARE_EXERCISES: ExerciseData[] = [
  { id: 'snatch', name: 'Snatch', icon: 'fa-dumbbell', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'clean', name: 'Clean', icon: 'fa-dumbbell', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'toes-to-bar', name: 'Toes-to-bar', icon: 'fa-person', muscleGroups: ['CORE', 'BACK'], equipment: 'BODYWEIGHT' },
  { id: 'pull-up', name: 'Pull-up', icon: 'fa-person', muscleGroups: ['BACK', 'CHEST'], equipment: 'BODYWEIGHT' },
  { id: 'rowing', name: 'Rowing', icon: 'fa-water', muscleGroups: ['CARDIO', 'BACK'], equipment: 'ROWING' },
  { id: 'wall-walk', name: 'Wall Walk', icon: 'fa-arrows', muscleGroups: ['CORE', 'CHEST'], equipment: 'WALL' },
];

export default function BalanceCarePage() {
  const router = useRouter();
  const { setCurrentMode, setTotalTime, resetInputState, addWod } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(20);

  const filteredExercises = BALANCE_CARE_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleProceed = () => {
    if (selectedExercises.length === 0) {
      alert('최소 1개의 운동을 선택해주세요.');
      return;
    }

    resetInputState();
    setCurrentMode('wod');
    setTotalTime(selectedTime);

    selectedExercises.forEach(exerciseId => {
      const exercise = BALANCE_CARE_EXERCISES.find(e => e.id === exerciseId);
      if (exercise) {
        const movement: Movement = {
          id: exercise.id,
          name: exercise.name,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
        };
        addWod(movement);
      }
    });

    router.push('/input');
  };

  const handleBack = () => {
    resetInputState();
    router.push('/');
  };

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      {/* 헤더 섹션 */}
      <div className="flex-shrink-0 px-4 pt-4 pb-8">
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

      {/* 검색 입력 */}
      <div className="flex-shrink-0 px-4 pb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="운동 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition border border-gray-800"
          />
          <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
      </div>

      {/* 운동 카드 그리드 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredExercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise.id)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border min-h-32 ${
                selectedExercises.includes(exercise.id)
                  ? 'bg-blue-600 border-blue-500'
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
              }`}
            >
              <i className={`fa-solid ${exercise.icon} text-2xl mb-2 text-white`}></i>
              <span className="text-xs font-semibold text-center leading-tight">{exercise.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 시간 선택 및 진행 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6 space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">운동 시간</p>
          <button
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="w-full bg-gray-900 rounded-xl px-4 py-3 text-white font-semibold flex items-center justify-between transition border border-gray-800 hover:border-gray-700 text-sm"
          >
            <span>{selectedTime}분</span>
            <i className={`fa-solid fa-chevron-down transition-transform text-xs ${showTimePicker ? 'rotate-180' : ''}`}></i>
          </button>

          {showTimePicker && (
            <div className="mt-2 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {[10, 15, 20, 25, 30, 35, 40].map((time, idx) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setShowTimePicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    } ${idx < 6 ? 'border-b border-gray-800' : ''}`}
                  >
                    {time}분
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleProceed}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm hover:bg-blue-700"
        >
          계속하기
        </button>
      </div>
    </main>
  );
}
