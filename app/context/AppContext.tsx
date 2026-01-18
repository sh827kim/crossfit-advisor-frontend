'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Movement, WorkoutPlan, MuscleGroup } from '@/app/lib/types/workout.types';

interface WorkoutRecord {
  date: string;
  mode: 'WOD' | 'GOAL' | 'PART';
  duration: number;
  exercises: string[];
}

interface AppContextType {
  // 페이지 상태
  currentPage: 'home' | 'input' | 'result' | 'history' | 'profile';
  setCurrentPage: (page: AppContextType['currentPage']) => void;

  // 입력 모드
  currentMode: 'wod' | 'goal' | 'part' | null;
  setCurrentMode: (mode: AppContextType['currentMode']) => void;

  // WOD 모드
  wodList: Movement[];
  addWod: (movement: Movement) => void;
  removeWod: (id: string) => void;
  clearWodList: () => void;

  // Goal 모드
  selectedGoal: Movement | null;
  setSelectedGoal: (movement: Movement | null) => void;

  // Part 모드
  selectedParts: MuscleGroup[];
  togglePart: (part: MuscleGroup) => void;
  clearParts: () => void;

  // 운동 시간
  totalTime: number;
  setTotalTime: (time: number) => void;

  // 생성된 계획
  generatedPlan: WorkoutPlan | null;
  setGeneratedPlan: (plan: WorkoutPlan | null) => void;

  // 운동 기록
  workoutHistory: WorkoutRecord[];
  addWorkoutRecord: (record: WorkoutRecord) => void;

  // 리셋
  resetInputState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<AppContextType['currentPage']>('home');
  const [currentMode, setCurrentMode] = useState<AppContextType['currentMode']>(null);

  const [wodList, setWodList] = useState<Movement[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Movement | null>(null);
  const [selectedParts, setSelectedParts] = useState<MuscleGroup[]>([]);
  const [totalTime, setTotalTime] = useState(10);
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);

  // localStorage에서 히스토리 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('cf_workout_history');
    if (savedHistory) {
      try {
        setWorkoutHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load workout history:', error);
      }
    }
  }, []);

  // 히스토리 저장
  useEffect(() => {
    localStorage.setItem('cf_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  const addWod = useCallback((movement: Movement) => {
    setWodList(prev => {
      if (prev.some(m => m.id === movement.id)) {
        return prev;
      }
      return [...prev, movement];
    });
  }, []);

  const removeWod = useCallback((id: string) => {
    setWodList(prev => prev.filter(m => m.id !== id));
  }, []);

  const clearWodList = useCallback(() => {
    setWodList([]);
  }, []);

  const togglePart = useCallback((part: MuscleGroup) => {
    setSelectedParts(prev => {
      if (prev.includes(part)) {
        return prev.filter(p => p !== part);
      }
      return [...prev, part];
    });
  }, []);

  const clearParts = useCallback(() => {
    setSelectedParts([]);
  }, []);

  const addWorkoutRecord = useCallback((record: WorkoutRecord) => {
    setWorkoutHistory(prev => [...prev, record]);
  }, []);

  const resetInputState = useCallback(() => {
    setWodList([]);
    setSelectedGoal(null);
    setSelectedParts([]);
    setTotalTime(10);
    setGeneratedPlan(null);
    setCurrentMode(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentMode,
        setCurrentMode,
        wodList,
        addWod,
        removeWod,
        clearWodList,
        selectedGoal,
        setSelectedGoal,
        selectedParts,
        togglePart,
        clearParts,
        totalTime,
        setTotalTime,
        generatedPlan,
        setGeneratedPlan,
        workoutHistory,
        addWorkoutRecord,
        resetInputState
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
