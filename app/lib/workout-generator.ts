import { Movement, MuscleGroup, WorkoutMode, Exercise } from './types/workout.types';

/**
 * 입력한 운동들의 근육 그룹을 분석하여 피해야 할 근육 그룹을 계산
 * 입력한 운동들이 사용하는 모든 근육 그룹을 합산한 후 반환
 */
function detectAvoidMuscles(wodMovements: Movement[]): Set<MuscleGroup> {
  const avoidMuscles = new Set<MuscleGroup>();

  // 입력한 각 운동의 근육 그룹을 모두 피해야 할 그룹에 추가
  wodMovements.forEach(movement => {
    movement.muscleGroups.forEach(group => {
      avoidMuscles.add(group);
    });
  });

  return avoidMuscles;
}

/**
 * 목표 운동에 맞는 보조 운동을 선택
 */
function selectCandidatesForGoal(goalMovementName: string, allMovements: Movement[]): Movement[] {
  if (goalMovementName.includes("풀업") || goalMovementName.includes("토투바") || goalMovementName.includes("체스트")) {
    // 등과 코어 운동 추천
    return allMovements.filter(m =>
      m.muscleGroups.includes('BACK') || m.muscleGroups.includes('CORE')
    );
  } else if (goalMovementName.includes("머슬업")) {
    // 딥스, 등, 가슴 운동 추천
    return allMovements.filter(m =>
      m.name.includes("딥스") || m.muscleGroups.includes('BACK') || m.muscleGroups.includes('CHEST')
    );
  } else if (goalMovementName.includes("핸드스탠드")) {
    // 어깨와 코어 운동 추천
    return allMovements.filter(m =>
      m.muscleGroups.includes('CHEST') || m.muscleGroups.includes('CORE')
    );
  }
  return allMovements;
}

/**
 * 부위 선택에 맞는 운동을 선택
 */
function selectCandidatesForPart(targetMuscles: MuscleGroup[], allMovements: Movement[]): Movement[] {
  return allMovements.filter(m =>
    m.muscleGroups.some(mg => targetMuscles.includes(mg))
  );
}

/**
 * WOD 모드용 운동을 선택
 */
function selectCandidatesForWod(avoidMuscles: Set<MuscleGroup>, allMovements: Movement[]): Movement[] {
  const candidates = allMovements.filter(m => {
    // 피해야 할 근육을 사용하는 운동 제외
    return !m.muscleGroups.some(mg => avoidMuscles.has(mg));
  });

  // 아무것도 남지 않으면 코어 운동만 추천
  if (candidates.length === 0) {
    return allMovements.filter(m => m.muscleGroups.includes('CORE'));
  }

  return candidates;
}

/**
 * 운동 계획 생성
 */
export function generateWorkoutPlan(
  mode: WorkoutMode,
  duration: number,
  candidates: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  // 운동 개수 계산 (시간당 1개 기본, 최대 4개)
  let count = Math.ceil(duration / 10) + 1;
  if (count > 4) count = 4;

  // 후보 운동에서 무작위로 선택
  const pool = [...candidates];
  pool.sort(() => Math.random() - 0.5);

  const selectedMovements: Movement[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    selectedMovements.push(pool[i]);
  }

  // 운동이 하나도 없으면 코어 운동 2개 추가
  if (selectedMovements.length === 0) {
    const coreMovements = candidates.filter(m => m.muscleGroups.includes('CORE'));
    selectedMovements.push(coreMovements[0] || candidates[0]);
    if (coreMovements.length > 1) selectedMovements.push(coreMovements[1]);
  }

  // 라운드 수 계산
  const rounds = Math.max(3, Math.floor(duration / 3));
  const timePerRoundSeconds = (duration * 60) / rounds;
  const timePerRoundMin = Math.floor(timePerRoundSeconds / 60);
  const timePerRoundSec = Math.floor(timePerRoundSeconds % 60);
  const targetTimePerRound = `${timePerRoundMin}분 ${timePerRoundSec}초`;

  // Exercise 객체로 변환
  const exercises: Exercise[] = selectedMovements.map((movement, index) => ({
    exerciseId: index,
    movementId: movement.id,
    name: movement.name,
    minReps: 10,
    maxReps: 15,
    equipment: movement.equipment,
    muscleGroups: movement.muscleGroups
  }));

  return { exercises, rounds, targetTimePerRound };
}

/**
 * WOD 모드 운동 계획 생성
 */
export function generateWodPlan(
  duration: number,
  wodMovements: Movement[],
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const avoidMuscles = detectAvoidMuscles(wodMovements);
  const candidates = selectCandidatesForWod(avoidMuscles, allMovements);
  return generateWorkoutPlan('WOD', duration, candidates);
}

/**
 * Goal 모드 운동 계획 생성
 */
export function generateGoalPlan(
  duration: number,
  goalMovementName: string,
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const candidates = selectCandidatesForGoal(goalMovementName, allMovements);
  return generateWorkoutPlan('GOAL', duration, candidates);
}

/**
 * Part 모드 운동 계획 생성
 */
export function generatePartPlan(
  duration: number,
  targetMuscles: MuscleGroup[],
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const candidates = selectCandidatesForPart(targetMuscles, allMovements);
  return generateWorkoutPlan('PART', duration, candidates);
}
