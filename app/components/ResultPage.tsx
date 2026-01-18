'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { Exercise } from '@/app/lib/types/workout.types';

interface ExerciseWithStatus extends Exercise {
  isCompleted: boolean;
  currentMinReps: number | null;
  currentMaxReps: number | null;
}

export function ResultPage() {
  const router = useRouter();
  const {
    generatedPlan,
    resetInputState,
    addWorkoutRecord,
    currentMode,
    totalTime
  } = useApp();

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exercises, setExercises] = useState<ExerciseWithStatus[]>([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // 초기화
  useEffect(() => {
    if (generatedPlan) {
      setTimerSeconds(generatedPlan.duration * 60);
      // 각 운동마다 상태 초기화
      setExercises(
        generatedPlan.exercises.map(ex => ({
          ...ex,
          isCompleted: false,
          currentMinReps: ex.minReps ?? null,
          currentMaxReps: ex.maxReps ?? null
        }))
      );
    }
  }, [generatedPlan]);

  // 타이머 진행
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleExerciseComplete = (index: number) => {
    setExercises(prev =>
      prev.map((ex, i) => (i === index ? { ...ex, isCompleted: !ex.isCompleted } : ex))
    );
  };

  const updateReps = (index: number, type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value) || null;
    setExercises(prev =>
      prev.map((ex, i) => {
        if (i === index) {
          if (type === 'min') {
            return { ...ex, currentMinReps: numValue };
          } else {
            return { ...ex, currentMaxReps: numValue };
          }
        }
        return ex;
      })
    );
  };

  const handleSaveRecord = () => {
    if (!generatedPlan || !currentMode) return;

    const record = {
      date: new Date().toISOString().split('T')[0],
      mode: generatedPlan.mode as 'WOD' | 'GOAL' | 'PART',
      duration: totalTime,
      exercises: exercises.map(ex => `${ex.name} ${ex.currentMinReps ? `${ex.currentMinReps}-${ex.currentMaxReps}` : ''}`)
    };

    addWorkoutRecord(record);
    alert('운동 기록 저장 완료! 🔥');

    resetInputState();
    router.push('/history');
  };

  const handleBackToHome = () => {
    setShowConfirmPopup(true);
  };

  const confirmExit = () => {
    setShowConfirmPopup(false);
    resetInputState();
    router.push('/');
  };

  const cancelExit = () => {
    setShowConfirmPopup(false);
  };

  if (!generatedPlan) {
    return (
      <main className="px-6 pb-6 flex-grow flex flex-col justify-center">
        <p className="text-center text-slate-400">운동 계획을 불러오는 중...</p>
      </main>
    );
  }

  const completedCount = exercises.filter(ex => ex.isCompleted).length;
  const allCompleted = exercises.length > 0 && completedCount === exercises.length;

  return (
    <main className="px-6 pb-6 flex-grow flex flex-col pt-6">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Workout Plan</p>
        <h1 className="text-3xl font-black text-slate-800">{generatedPlan.rounds} Rounds Quality</h1>
        <p className="text-sm font-bold text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full">
          1라운드당 목표: {generatedPlan.targetTimePerRound}
        </p>
      </div>

      {/* 운동 계획 카드 */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg shadow-gray-100 mb-6 flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
            {generatedPlan.modeDisplay}
          </span>
          <span className="text-slate-800 font-bold flex items-center">
            <i className="fa-regular fa-clock mr-1.5 text-slate-400"></i> {generatedPlan.duration}분
          </span>
        </div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border-2 transition ${
                exercise.isCompleted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-slate-50 border-gray-100'
              }`}
            >
              <div className="flex items-start mb-3">
                {/* 체크박스 */}
                <button
                  onClick={() => toggleExerciseComplete(index)}
                  className={`flex-shrink-0 w-6 h-6 rounded-md border-2 mr-3 flex items-center justify-center transition ${
                    exercise.isCompleted
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {exercise.isCompleted && (
                    <i className="fa-solid fa-check text-white text-sm"></i>
                  )}
                </button>

                {/* 운동명 */}
                <div className="flex-grow">
                  <div className={`font-bold text-lg ${
                    exercise.isCompleted ? 'line-through text-gray-400' : 'text-slate-800'
                  }`}>
                    {exercise.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {exercise.equipment}
                  </div>
                </div>
              </div>

              {/* 횟수 조절 */}
              <div className="flex gap-2 ml-9">
                <div className="flex items-center gap-1">
                  <label className="text-xs font-bold text-slate-500">최소:</label>
                  <input
                    type="number"
                    value={exercise.currentMinReps ?? ''}
                    onChange={(e) => updateReps(index, 'min', e.target.value)}
                    className="w-12 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:outline-none focus:border-blue-500"
                    placeholder="-"
                    disabled={exercise.isCompleted}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs font-bold text-slate-500">최대:</label>
                  <input
                    type="number"
                    value={exercise.currentMaxReps ?? ''}
                    onChange={(e) => updateReps(index, 'max', e.target.value)}
                    className="w-12 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:outline-none focus:border-blue-500"
                    placeholder="-"
                    disabled={exercise.isCompleted}
                  />
                </div>
                <span className="ml-auto text-xs text-slate-500 py-1">회</span>
              </div>
            </div>
          ))}
        </div>

        {/* 완료 진행 상황 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">운동 완료 진행률</span>
            <span className="text-sm font-bold text-blue-600">
              {completedCount} / {exercises.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / exercises.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 타이머 */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 text-center shadow-xl shadow-slate-200">
        <div className="text-6xl font-mono font-bold mb-6 tracking-tighter">
          {formatTime(timerSeconds)}
        </div>

        <div id="timer-controls" className={!allCompleted && isRunning ? '' : 'hidden'}>
          <button
            onClick={() => setIsRunning(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-orange-900/20 text-lg"
          >
            일시정지 <i className="fa-solid fa-pause ml-2 text-sm"></i>
          </button>
        </div>

        <div id="timer-start" className={!allCompleted && !isRunning ? 'mb-5' : 'hidden mb-5'}>
          <button
            onClick={() => setIsRunning(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-green-900/20 text-lg"
          >
            운동 시작 <i className="fa-solid fa-play ml-2 text-sm"></i>
          </button>
        </div>

        <div className="space-y-2">
          {allCompleted && (
            <button
              onClick={handleSaveRecord}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-900/20 text-lg"
            >
              오늘 운동 기록하기 <i className="fa-solid fa-pen-to-square ml-2"></i>
            </button>
          )}
          <button
            onClick={handleBackToHome}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-2xl transition text-sm"
          >
            기록 없이 돌아가기
          </button>
        </div>
      </div>

      {/* 확인 팝업 */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-black text-slate-800 mb-2 text-center">정말 그만하시겠어요?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              기록하지 않은 운동 데이터는 저장되지 않습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-2xl transition"
              >
                계속하기
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl transition"
              >
                그만하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
