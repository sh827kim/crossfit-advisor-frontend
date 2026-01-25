'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import type { Movement, MuscleGroup, Equipment } from '@/app/lib/types/workout.types';

interface ExerciseData {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
}

const BALANCE_CARE_EXERCISES: ExerciseData[] = [
  { id: 'snatch', name: '스내치', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'clean', name: '클린', muscleGroups: ['CORE', 'BACK', 'LEGS'], equipment: 'BARBELL' },
  { id: 'toes-to-bar', name: '토우-투-바', muscleGroups: ['CORE', 'BACK'], equipment: 'BODYWEIGHT' },
  { id: 'pull-up', name: '풀업', muscleGroups: ['BACK', 'CHEST'], equipment: 'BODYWEIGHT' },
  { id: 'rowing', name: '로잉', muscleGroups: ['CARDIO', 'BACK'], equipment: 'ROWING' },
  { id: 'wall-walk', name: '월 워크', muscleGroups: ['CORE', 'CHEST'], equipment: 'WALL' },
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
            const exercise = BALANCE_CARE_EXERCISES.find(e => e.id === exerciseId);
            return exercise ? (
              <button
                key={exerciseId}
                onClick={() => handleExerciseSelect(exerciseId)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg text-xs font-semibold whitespace-nowrap hover:opacity-80 transition"
              >
                <span>{exercise.name}</span>
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
            placeholder="운동 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-2xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700 transition border border-gray-800"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
        </div>
      </div>

      {/* 운동 카드 그리드 */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredExercises.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => handleExerciseSelect(exercise.id)}
                className={`p-4 rounded-xl flex items-center justify-center transition-all active:scale-95 border min-h-32 font-semibold ${
                  selectedExercises.includes(exercise.id)
                    ? 'bg-gray-800 border-gray-700 shadow-lg'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700 shadow-md'
                }`}
              >
                <span className="text-sm text-center leading-tight">{exercise.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 운동 시간 선택 (수평 스크롤) */}
      <div className="flex-shrink-0 px-4 py-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-xs font-bold text-gray-400 mb-4 text-center uppercase tracking-wider">운동 시간</p>
        <div className="flex gap-3 justify-center overflow-x-auto pb-2">
          {[10, 15, 20, 25, 30, 35, 40].map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-all ${
                selectedTime === time
                  ? 'bg-gray-400 text-black text-base'
                  : 'bg-gray-700 text-gray-300 text-sm hover:bg-gray-600'
              }`}
            >
              {time}분
            </button>
          ))}
        </div>
      </div>

      {/* 진행 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6">
        <button
          onClick={handleProceed}
          className="w-full bg-[#f43000] text-black font-bold py-4 rounded-2xl transition-all active:scale-95 text-base hover:opacity-90"
        >
          나만의 밸런스 운동 생성하기
        </button>
      </div>
    </main>
  );
}
