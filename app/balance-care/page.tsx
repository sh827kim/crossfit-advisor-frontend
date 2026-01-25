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

    // 선택된 운동과 시간 저장
    resetInputState();
    setCurrentMode('wod');
    setTotalTime(selectedTime);

    // 선택된 운동을 컨텍스트에 추가
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

    // 인풋 페이지로 이동
    router.push('/input');
  };

  const handleBack = () => {
    resetInputState();
    router.push('/');
  };

  return (
    <main
      className="flex-grow flex flex-col text-white"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#010101',
      }}
    >
      {/* 헤더 - 메인 화면과 동일 */}
      <div className="flex-shrink-0 px-4 pt-6 pb-6">
        <button
          onClick={handleBack}
          className="text-xs font-bold text-gray-500 mb-6 flex items-center hover:text-gray-300 transition uppercase tracking-wide"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>이전으로
        </button>
        <h1 className="text-4xl font-black text-white mb-2">오늘의 WOD를</h1>
        <h2 className="text-4xl font-black text-white mb-3">알려주세요.</h2>
        <p className="text-xs text-gray-500 font-medium">오늘 수행한 운동을 알려주세요</p>
      </div>

      {/* 검색 입력 */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="운동 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full text-white placeholder-gray-600 focus:outline-none px-4 py-3 rounded-2xl text-sm transition"
            style={{
              backgroundColor: '#1F1F1F',
              border: '1px solid rgba(255, 255, 255, 0.03)',
            }}
          />
          <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600"></i>
        </div>
      </div>

      {/* 운동 카드 그리드 */}
      <div className="flex-grow overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredExercises.map(exercise => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise.id)}
              className="p-5 rounded-2xl flex flex-col items-center justify-center transition transform active:scale-95 border min-h-[140px]"
              style={{
                backgroundColor: selectedExercises.includes(exercise.id) ? '#0B63F8' : '#1F1F1F',
                borderColor: selectedExercises.includes(exercise.id)
                  ? 'rgba(11, 99, 248, 0.5)'
                  : 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <i className={`fa-solid ${exercise.icon} text-3xl mb-2 text-white`}></i>
              <span className="text-xs font-bold text-center leading-tight">{exercise.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 시간 선택 및 진행 버튼 */}
      <div className="flex-shrink-0 px-4 pb-6">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">운동 시간</p>
          <button
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="w-full rounded-2xl px-4 py-3 text-white font-bold flex items-center justify-between transition"
            style={{
              backgroundColor: '#1F1F1F',
              border: '1px solid rgba(255, 255, 255, 0.03)',
            }}
          >
            <span className="text-sm">{selectedTime}분</span>
            <i className={`fa-solid fa-chevron-down transition text-xs ${showTimePicker ? 'rotate-180' : ''}`}></i>
          </button>

          {/* 시간 선택 드롭다운 */}
          {showTimePicker && (
            <div
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#1F1F1F',
                border: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="max-h-60 overflow-y-auto">
                {[10, 15, 20, 25, 30, 35, 40].map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setShowTimePicker(false);
                    }}
                    className="w-full px-4 py-3 text-left transition text-sm"
                    style={{
                      backgroundColor: selectedTime === time ? '#0B63F8' : 'transparent',
                      color: selectedTime === time ? '#FFFFFF' : '#999999',
                      borderBottomColor: 'rgba(255, 255, 255, 0.03)',
                      borderBottomWidth: time === 40 ? '0px' : '1px',
                      fontWeight: selectedTime === time ? '700' : '400',
                    }}
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
          className="w-full text-white font-bold py-4 rounded-2xl transition transform active:scale-95 text-sm"
          style={{
            backgroundColor: '#0B63F8',
          }}
        >
          계속하기
        </button>
      </div>
    </main>
  );
}
