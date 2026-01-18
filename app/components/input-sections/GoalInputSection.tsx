'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Movement } from '@/app/lib/types/workout.types';

export function GoalInputSection() {
  const { selectedGoal, setSelectedGoal } = useApp();
  const [goals, setGoals] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 목표 운동 목록 로드
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('/api/v1/movements/goals');
        const data = await response.json();
        setGoals(data.data?.movements || []);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  return (
    <div className="mb-8">
      {isLoading ? (
        <div className="text-center text-sm text-slate-400">
          <i className="fa-solid fa-spinner fa-spin"></i> 목표 운동을 불러오는 중...
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
              className={`w-full py-4 px-4 border rounded-xl text-sm font-medium transition-all duration-200 shadow-sm text-center ${
                selectedGoal?.id === goal.id
                  ? 'border-blue-600 text-blue-600 font-bold bg-blue-50 ring-1 ring-blue-600 shadow-md'
                  : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
              }`}
            >
              {goal.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
