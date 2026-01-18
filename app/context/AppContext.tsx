'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Movement, WorkoutPlan, MuscleGroup, Exercise } from '@/app/lib/types/workout.types';
import { generateRandomNickname } from '@/app/lib/nickname-generator';
import { cleanupAndSaveWorkoutRecords } from '@/app/lib/storage-manager';

interface ExerciseWithStatus extends Exercise {
  isCompleted: boolean;
  currentMinReps: number | null;
  currentMaxReps: number | null;
}

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

  // 운동 실행 중 상태
  exercises: ExerciseWithStatus[];
  setExercises: (exercises: ExerciseWithStatus[] | ((prev: ExerciseWithStatus[]) => ExerciseWithStatus[])) => void;
  timerSeconds: number;
  setTimerSeconds: (seconds: number | ((prev: number) => number)) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean | ((prev: boolean) => boolean)) => void;

  // 운동 기록
  workoutHistory: WorkoutRecord[];
  addWorkoutRecord: (record: WorkoutRecord) => void;

  // 사용자 프로필
  hasVisited: boolean;
  userNickname: string;
  userProfileImage: string | null;
  setUserNickname: (nickname: string) => void;
  setUserProfileImage: (image: string | null) => void;
  markAsVisited: () => void;

  // 리셋
  resetInputState: () => void;
  resetAllData: () => void;
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
  const [exercises, setExercisesState] = useState<ExerciseWithStatus[]>([]);
  const [timerSeconds, setTimerSecondsState] = useState(0);
  const [isRunning, setIsRunningState] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [hasVisited, setHasVisited] = useState(false);
  const [userNickname, setUserNickname] = useState(generateRandomNickname());
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  // Wrapper functions for setters that support both direct values and functions
  const setExercises = useCallback((value: ExerciseWithStatus[] | ((prev: ExerciseWithStatus[]) => ExerciseWithStatus[])) => {
    setExercisesState(prevExercises =>
      typeof value === 'function' ? value(prevExercises) : value
    );
  }, []);

  const setTimerSeconds = useCallback((value: number | ((prev: number) => number)) => {
    setTimerSecondsState(prevSeconds =>
      typeof value === 'function' ? value(prevSeconds) : value
    );
  }, []);

  const setIsRunning = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsRunningState(prevRunning =>
      typeof value === 'function' ? value(prevRunning) : value
    );
  }, []);

  // localStorage에서 데이터 로드 (초기화)
  useEffect(() => {
    // 방문 이력, 닉네임, 프로필 사진 로드
    const savedHasVisited = localStorage.getItem('cf_has_visited');
    const savedNickname = localStorage.getItem('cf_user_nickname');
    const savedProfileImage = localStorage.getItem('cf_user_profile_image');

    if (savedHasVisited === 'true') {
      setHasVisited(true);
      if (savedNickname) setUserNickname(savedNickname);
      if (savedProfileImage) setUserProfileImage(savedProfileImage);
    } else {
      setHasVisited(false);
    }

    // 히스토리 로드
    const savedHistory = localStorage.getItem('cf_workout_history');
    if (savedHistory) {
      try {
        setWorkoutHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load workout history:', error);
      }
    }

    // 생성된 계획 로드
    const savedPlan = localStorage.getItem('cf_generated_plan');
    if (savedPlan) {
      try {
        setGeneratedPlan(JSON.parse(savedPlan));
      } catch (error) {
        console.error('Failed to load generated plan:', error);
      }
    }

    // 운동 상태 로드
    const savedExercises = localStorage.getItem('cf_exercises');
    if (savedExercises) {
      try {
        setExercisesState(JSON.parse(savedExercises));
      } catch (error) {
        console.error('Failed to load exercises:', error);
      }
    }

    // 타이머 상태 로드
    const savedTimerSeconds = localStorage.getItem('cf_timer_seconds');
    if (savedTimerSeconds) {
      try {
        setTimerSecondsState(parseInt(savedTimerSeconds));
      } catch (error) {
        console.error('Failed to load timer seconds:', error);
      }
    }

    const savedIsRunning = localStorage.getItem('cf_is_running');
    if (savedIsRunning) {
      try {
        setIsRunningState(savedIsRunning === 'true');
      } catch (error) {
        console.error('Failed to load is running:', error);
      }
    }

    // 입력 상태 로드 (모드, WOD 목록, 목표, 부위, 시간)
    const savedCurrentMode = localStorage.getItem('cf_current_mode');
    if (savedCurrentMode) {
      try {
        setCurrentMode(JSON.parse(savedCurrentMode));
      } catch (error) {
        console.error('Failed to load current mode:', error);
      }
    }

    const savedWodList = localStorage.getItem('cf_wod_list');
    if (savedWodList) {
      try {
        setWodList(JSON.parse(savedWodList));
      } catch (error) {
        console.error('Failed to load wod list:', error);
      }
    }

    const savedSelectedGoal = localStorage.getItem('cf_selected_goal');
    if (savedSelectedGoal) {
      try {
        setSelectedGoal(JSON.parse(savedSelectedGoal));
      } catch (error) {
        console.error('Failed to load selected goal:', error);
      }
    }

    const savedSelectedParts = localStorage.getItem('cf_selected_parts');
    if (savedSelectedParts) {
      try {
        setSelectedParts(JSON.parse(savedSelectedParts));
      } catch (error) {
        console.error('Failed to load selected parts:', error);
      }
    }

    const savedTotalTime = localStorage.getItem('cf_total_time');
    if (savedTotalTime) {
      try {
        setTotalTime(parseInt(savedTotalTime));
      } catch (error) {
        console.error('Failed to load total time:', error);
      }
    }
  }, []);

  // 닉네임 저장
  useEffect(() => {
    localStorage.setItem('cf_user_nickname', userNickname);
  }, [userNickname]);

  // 프로필 이미지 저장
  useEffect(() => {
    if (userProfileImage) {
      localStorage.setItem('cf_user_profile_image', userProfileImage);
    } else {
      localStorage.removeItem('cf_user_profile_image');
    }
  }, [userProfileImage]);

  // 생성된 계획 저장
  useEffect(() => {
    if (generatedPlan) {
      localStorage.setItem('cf_generated_plan', JSON.stringify(generatedPlan));
    } else {
      localStorage.removeItem('cf_generated_plan');
    }
  }, [generatedPlan]);

  // 운동 상태 저장
  useEffect(() => {
    if (exercises.length > 0) {
      localStorage.setItem('cf_exercises', JSON.stringify(exercises));
    } else {
      localStorage.removeItem('cf_exercises');
    }
  }, [exercises]);

  // 타이머 상태 저장
  useEffect(() => {
    if (timerSeconds > 0) {
      localStorage.setItem('cf_timer_seconds', timerSeconds.toString());
    }
  }, [timerSeconds]);

  // 타이머 실행 상태 저장
  useEffect(() => {
    localStorage.setItem('cf_is_running', isRunning.toString());
  }, [isRunning]);

  // 입력 상태 저장
  useEffect(() => {
    if (currentMode) {
      localStorage.setItem('cf_current_mode', JSON.stringify(currentMode));
    } else {
      localStorage.removeItem('cf_current_mode');
    }
  }, [currentMode]);

  useEffect(() => {
    if (wodList.length > 0) {
      localStorage.setItem('cf_wod_list', JSON.stringify(wodList));
    } else {
      localStorage.removeItem('cf_wod_list');
    }
  }, [wodList]);

  useEffect(() => {
    if (selectedGoal) {
      localStorage.setItem('cf_selected_goal', JSON.stringify(selectedGoal));
    } else {
      localStorage.removeItem('cf_selected_goal');
    }
  }, [selectedGoal]);

  useEffect(() => {
    if (selectedParts.length > 0) {
      localStorage.setItem('cf_selected_parts', JSON.stringify(selectedParts));
    } else {
      localStorage.removeItem('cf_selected_parts');
    }
  }, [selectedParts]);

  useEffect(() => {
    localStorage.setItem('cf_total_time', totalTime.toString());
  }, [totalTime]);

  // 히스토리 저장 및 정리
  useEffect(() => {
    const cleanedHistory = cleanupAndSaveWorkoutRecords(workoutHistory);
    localStorage.setItem('cf_workout_history', JSON.stringify(cleanedHistory));
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
    setExercisesState([]);
    setTimerSecondsState(0);
    setIsRunningState(false);
    setCurrentMode(null);
  }, []);

  const markAsVisited = useCallback(() => {
    setHasVisited(true);
    localStorage.setItem('cf_has_visited', 'true');
  }, []);

  const resetAllData = useCallback(() => {
    // 모든 상태 초기화
    setHasVisited(false);
    setUserNickname(generateRandomNickname());
    setUserProfileImage(null);
    setWorkoutHistory([]);
    resetInputState();

    // localStorage 전체 삭제
    localStorage.clear();
  }, [resetInputState]);

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
        exercises,
        setExercises,
        timerSeconds,
        setTimerSeconds,
        isRunning,
        setIsRunning,
        workoutHistory,
        addWorkoutRecord,
        hasVisited,
        userNickname,
        userProfileImage,
        setUserNickname,
        setUserProfileImage,
        markAsVisited,
        resetInputState,
        resetAllData
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
