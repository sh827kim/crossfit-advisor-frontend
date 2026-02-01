'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Movement, WorkoutPlan, MuscleGroup, Exercise, WorkoutRecord } from '@/app/lib/types/workout.types';
import { generateRandomNickname } from '@/app/lib/nickname-generator';
import { createWorkoutStorage, WorkoutStorageAdapter } from '@/app/lib/db/storage-adapter';
import { clearAllWorkoutRecords } from '@/app/lib/db/indexeddb';

interface ExerciseWithStatus extends Exercise {
  isCompleted: boolean;
  currentMinReps: number | null;
  currentMaxReps: number | null;
}

interface AppContextType {
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
  isLoadingHistory: boolean;
  historyError: string | null;
  addWorkoutRecord: (record: WorkoutRecord) => Promise<void>;
  deleteWorkoutRecord: (id: number) => Promise<void>;

  // 사용자 프로필
  hasVisited: boolean;
  userNickname: string;
  userProfileImage: string | null;
  setUserNickname: (nickname: string) => void;
  setUserProfileImage: (image: string | null) => void;
  markAsVisited: () => void;

  // 리셋
  resetInputState: () => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // localStorage에서 초기값 로드 (lazy initialization) - 입력 상태
  const [currentMode, setCurrentMode] = useState<AppContextType['currentMode']>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('cf_current_mode');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [wodList, setWodList] = useState<Movement[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cf_wod_list');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedGoal, setSelectedGoal] = useState<Movement | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('cf_selected_goal');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedParts, setSelectedParts] = useState<MuscleGroup[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cf_selected_parts');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [totalTime, setTotalTime] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const saved = localStorage.getItem('cf_total_time');
    try {
      return saved ? parseInt(saved) : 10;
    } catch {
      return 10;
    }
  });

  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('cf_generated_plan');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [exercises, setExercisesState] = useState<ExerciseWithStatus[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('cf_exercises');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timerSeconds, setTimerSecondsState] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const saved = localStorage.getItem('cf_timer_seconds');
    try {
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isRunning, setIsRunningState] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('cf_is_running');
    return saved === 'true';
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // localStorage에서 초기값 로드 (lazy initialization)
  const [hasVisited, setHasVisited] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('cf_has_visited') === 'true';
  });

  const [userNickname, setUserNickname] = useState(() => {
    if (typeof window === 'undefined') return generateRandomNickname();
    return localStorage.getItem('cf_user_nickname') || generateRandomNickname();
  });

  const [userProfileImage, setUserProfileImage] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cf_user_profile_image');
  });

  // Storage Adapter 참조 (IndexedDB 또는 LocalStorage)
  const storageRef = useRef<WorkoutStorageAdapter | null>(null);

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

  // 비동기 스토리지 초기화 (IndexedDB 또는 LocalStorage)
  useEffect(() => {
    async function initializeStorage() {
      try {
        const storage = await createWorkoutStorage();
        await storage.initialize(); // 마이그레이션 실행

        // 운동 기록 로드
        const records = await storage.getAll();

        storageRef.current = storage;
        setWorkoutHistory(records);
        setHistoryError(null);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        setHistoryError('운동 기록을 불러오지 못했습니다.');
      } finally {
        setIsLoadingHistory(false);
      }
    }

    initializeStorage();
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

  // 히스토리는 Storage Adapter가 자동으로 저장 (IndexedDB 또는 LocalStorage)

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

  const addWorkoutRecord = useCallback(async (record: WorkoutRecord) => {
    if (!storageRef.current) {
      const errorMsg = 'Storage adapter가 초기화되지 않았습니다.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Storage Adapter를 통해 저장 (IndexedDB 또는 LocalStorage)
      await storageRef.current.add(record);

      // IndexedDB에 저장 후 실제 저장된 데이터를 다시 조회 (id, createdAt 자동 추가되므로)
      const updatedRecords = await storageRef.current.getAll();
      setWorkoutHistory(updatedRecords);
    } catch (error) {
      console.error('Failed to add workout record:', error);
      throw error; // 에러를 호출자에게 전파
    }
  }, []);

  const deleteWorkoutRecord = useCallback(async (id: number) => {
    if (!storageRef.current) {
      console.error('Storage adapter not initialized');
      return;
    }

    try {
      await storageRef.current.delete(id);
      const updatedRecords = await storageRef.current.getAll();
      setWorkoutHistory(updatedRecords);
    } catch (error) {
      console.error('Failed to delete workout record:', error);
      throw error;
    }
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

  const resetAllData = useCallback(async () => {
    // localStorage 먼저 삭제
    try {
      localStorage.clear();
    } catch (error) {
      console.error('❌ localStorage 초기화 실패:', error);
    }

    // Storage Adapter 참조 제거 (데이터 초기화 동안 사용 금지)
    storageRef.current = null;

    // UI/라우팅이 즉시 반응하도록 메모리 상태는 먼저 초기화
    setHasVisited(false);
    setUserNickname(generateRandomNickname());
    setUserProfileImage(null);
    setWorkoutHistory([]);
    setHistoryError(null);
    setIsLoadingHistory(true);
    resetInputState();

    // IndexedDB 기록 초기화 (DB 삭제 대신 Store clear로 블로킹/레이스 최소화)
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        await clearAllWorkoutRecords();
        console.log('✅ IndexedDB 운동 기록이 초기화되었습니다.');
      } catch (error) {
        console.error('❌ IndexedDB 초기화 실패:', error);
      }
    }

    // Storage Adapter 재초기화 (초기화 이후에도 기록 저장 가능해야 함)
    try {
      const storage = await createWorkoutStorage();
      await storage.initialize();

      const records = await storage.getAll();
      storageRef.current = storage;
      setWorkoutHistory(records);
      setHistoryError(null);
    } catch (error) {
      console.error('Failed to re-initialize storage:', error);
      setHistoryError('운동 기록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [resetInputState]);

  return (
    <AppContext.Provider
      value={{
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
        isLoadingHistory,
        historyError,
        addWorkoutRecord,
        deleteWorkoutRecord,
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
