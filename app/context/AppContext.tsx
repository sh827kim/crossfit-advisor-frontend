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
  userProfileColorIndex: number;
  setUserNickname: (nickname: string) => void;
  setUserProfileImage: (image: string | null) => void;
  setUserProfileColorIndex: (index: number) => void;
  markAsVisited: () => void;

  // 리셋
  resetInputState: () => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // localStorage에서 초기값 로드 (Client Only for Hydration Safety)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [hasVisited, setHasVisited] = useState(false);
  const [userNickname, setUserNickname] = useState(''); // Initial empty
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userProfileColorIndex, setUserProfileColorIndex] = useState<number>(0);

  // Load from LocalStorage on mount (Client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedMode = localStorage.getItem('cf_current_mode');
      if (savedMode) setCurrentMode(JSON.parse(savedMode));

      const savedWod = localStorage.getItem('cf_wod_list');
      if (savedWod) setWodList(JSON.parse(savedWod));

      const savedGoal = localStorage.getItem('cf_selected_goal');
      if (savedGoal) setSelectedGoal(JSON.parse(savedGoal));

      const savedParts = localStorage.getItem('cf_selected_parts');
      if (savedParts) setSelectedParts(JSON.parse(savedParts));

      const savedTime = localStorage.getItem('cf_total_time');
      if (savedTime) setTotalTime(parseInt(savedTime));

      const savedPlan = localStorage.getItem('cf_generated_plan');
      if (savedPlan) setGeneratedPlan(JSON.parse(savedPlan));

      const savedExercises = localStorage.getItem('cf_exercises');
      if (savedExercises) setExercisesState(JSON.parse(savedExercises));

      const savedSeconds = localStorage.getItem('cf_timer_seconds');
      if (savedSeconds) setTimerSecondsState(parseInt(savedSeconds));

      const savedRunning = localStorage.getItem('cf_is_running');
      if (savedRunning) setIsRunningState(savedRunning === 'true');

      // User Profile
      const savedVisited = localStorage.getItem('cf_has_visited');
      setHasVisited(savedVisited === 'true');

      const savedNickname = localStorage.getItem('cf_user_nickname');
      if (savedNickname) {
        setUserNickname(savedNickname);
      } else {
        const newNickname = generateRandomNickname();
        setUserNickname(newNickname);
        // localStorage.setItem('cf_user_nickname', newNickname); // Will be handled by effect
      }

      const savedImage = localStorage.getItem('cf_user_profile_image');
      setUserProfileImage(savedImage);

      const savedColor = localStorage.getItem('cf_user_profile_color_index');
      if (savedColor) {
        setUserProfileColorIndex(parseInt(savedColor));
      } else {
        const newColor = Math.floor(Math.random() * 10);
        setUserProfileColorIndex(newColor);
        // localStorage.setItem will handle this
      }

    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, [isClient]);

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

  // 프로필 색상 인덱스 저장
  useEffect(() => {
    localStorage.setItem('cf_user_profile_color_index', userProfileColorIndex.toString());
  }, [userProfileColorIndex]);

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
    setUserProfileColorIndex(Math.floor(Math.random() * 10));
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
        userProfileColorIndex,
        setUserNickname,
        setUserProfileImage,
        setUserProfileColorIndex,
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
