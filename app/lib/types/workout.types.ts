// 운동 계획 생성 요청/응답 타입

export type WorkoutMode = 'WOD' | 'GOAL' | 'PART';

export type MuscleGroup = 'CORE' | 'LEGS' | 'BACK' | 'CHEST' | 'CARDIO';

export type Equipment =
  | 'BODYWEIGHT'
  | 'BAR'
  | 'BAND'
  | 'RINGS'
  | 'BARBELL'
  | 'BOX'
  | 'DUMBBELL'
  | 'KETTLEBELL'
  | 'WALLBALL'
  | 'WALL'
  | 'ASSAULT_BIKE'
  | 'ROWING'
  | 'GHD';

export interface Movement {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  minReps?: number | null;
  maxReps?: number | null;
}

export interface Exercise {
  exerciseId: number;
  movementId: string;
  name: string;
  minReps?: number | null;
  maxReps?: number | null;
  equipment: Equipment;
  muscleGroups: MuscleGroup[];
}

export interface WorkoutGenerateWodRequest {
  duration: number;
  wodMovementIds?: string[];
}

export interface WorkoutGenerateGoalRequest {
  duration: number;
  goalMovementId: string;
}

export interface WorkoutGeneratePartRequest {
  duration: number;
  targetMuscleGroups: MuscleGroup[];
}

export interface WorkoutPlan {
  mode: WorkoutMode;
  duration: number;
  rounds: number;
  targetTimePerRound: string;
  exercises: Exercise[];
  modeDisplay: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// 운동 기록 (앱 전체에서 사용)
export interface WorkoutRecord {
  date: string; // '2026-01-18' 형식
  mode: 'WOD' | 'GOAL' | 'PART';
  duration: number;
  exercises: string[];
}

// IndexedDB에 저장되는 운동 기록 (내부용)
export interface WorkoutRecordDB extends WorkoutRecord {
  id?: number; // Auto-increment primary key
  createdAt: number; // timestamp
}
