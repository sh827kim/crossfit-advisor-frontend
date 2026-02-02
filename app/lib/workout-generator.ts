import { Movement, MuscleGroup, WorkoutMode, Exercise, MovementType } from './types/workout.types';
import { GOALS_DATA } from './data/goal-relationships';

/**
 * 셔플 유틸리티 (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 입력한 운동들의 근육 그룹을 분석하여 피해야 할 근육 그룹을 반환
 */
function detectAvoidMuscles(wodMovements: Movement[]): Set<MuscleGroup> {
  const avoidMuscles = new Set<MuscleGroup>();
  wodMovements.forEach(movement => {
    movement.muscleGroups.forEach(group => avoidMuscles.add(group));
  });
  return avoidMuscles;
}

/**
 * [HELPER] 운동 목록에서 'Type'이 겹치지 않게 우선순위로 선택
 * count만큼 뽑되, 가능한 다양한 Type을 구성함.
 */
function selectDiverseMovements(pool: Movement[], count: number, existingTypes: Set<MovementType> = new Set()): Movement[] {
  const selected: Movement[] = [];
  const currentTypes = new Set<MovementType>(existingTypes);

  // pool을 셔플하여 무작위성 확보
  const remaining = shuffle(pool);

  // 1. 같은 타입이 없는 것 우선 선택
  for (let i = 0; i < remaining.length && selected.length < count; i++) {
    const m = remaining[i];
    const mType = m.type || 'GYMNASTICS_BODY'; // Default fallback
    if (!currentTypes.has(mType)) {
      selected.push(m);
      currentTypes.add(mType);
      // 선택된 건 pool에서 제거하기 위해 null 처리하거나 별도 관리해야 하지만,
      // 여기서는 loop 내에서 처리하므로 간단히 넘어감.
      remaining.splice(i, 1);
      i--;
    }
  }

  // 2. 개수가 부족하면 나머지에서 무작위 선택
  while (selected.length < count && remaining.length > 0) {
    selected.push(remaining.shift()!);
  }

  return selected;
}

/**
 * [BALANCE] 계층형 필터링 로직
 * Tier 1: 피로 근육과 전혀 겹치지 않음
 * Tier 2: 'GYMNASTICS_BODY' 또는 'CARDIO' 타입이면서 피로 근육과 일부 겹침 (저강도/전신성)
 * Tier 3: 기구/웨이트성이나 피로 근육 겹침 (제외)
 */
function selectCandidatesForBalance(avoidMuscles: Set<MuscleGroup>, allMovements: Movement[]): Movement[] {
  // Tier 1: 완전 회피
  const tier1 = allMovements.filter(m =>
    !m.muscleGroups.some(mg => avoidMuscles.has(mg))
  );

  // Tier 2: 맨몸/유산소는 허용 (회복성 활동)
  const tier2 = allMovements.filter(m => {
    const isOverlapping = m.muscleGroups.some(mg => avoidMuscles.has(mg));
    if (!isOverlapping) return false; // Tier 1에서 이미 선택됨
    return m.type === 'GYMNASTICS_BODY' || m.type === 'CARDIO';
  });

  // 우선순위: Tier 1 -> Tier 2
  // Tier 1이 충분하면 Tier 1만 반환, 부족하면 Tier 2도 포함
  if (tier1.length >= 4) {
    return tier1;
  }
  return [...tier1, ...tier2];
}

/**
 * [GOAL] 목표 운동 기반 추천 및 필터링
 */
function selectCandidatesForGoal(goalMovementId: string, allMovements: Movement[]): Movement[] {
  const goalEntity = GOALS_DATA.find(g => g.id === goalMovementId);

  if (goalEntity) {
    // 1. 추천 루틴에 있는 운동들 우선 수집 (Level 무관하게 풀업 전체)
    const recommendedIds = new Set<string>();
    goalEntity.recommendedRoutines.forEach(routine => {
      routine.movements.forEach(rm => recommendedIds.add(rm.movementId));
    });

    const recommended = allMovements.filter(m => recommendedIds.has(m.id));

    // 2. 주동근/보조근을 타겟팅하는 운동 추가 (보조 운동 풀을 넓히기 위함)
    const related = allMovements.filter(m =>
      !recommendedIds.has(m.id) &&
      m.muscleGroups.some(mg => goalEntity.primaryMuscles.includes(mg) || goalEntity.secondaryMuscles.includes(mg))
    );

    return [...recommended, ...related];
  }

  // Fallback (기존 로직 유지 또는 전체 반환)
  return allMovements;
}

/**
 * [PART] 부위별 운동 선택 (Type 다양성 고려는 generateWorkoutPlan 내부에서 처리)
 */
function selectCandidatesForPart(targetMuscles: MuscleGroup[], allMovements: Movement[]): Movement[] {
  return allMovements.filter(m =>
    m.muscleGroups.some(mg => targetMuscles.includes(mg))
  );
}

/**
 * 공통 운동 계획 생성기
 */
export function generateWorkoutPlan(
  mode: WorkoutMode,
  duration: number,
  candidates: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {

  // 운동 개수 계산 (10분당 1개 + 1, 최대 5개)
  let count = Math.ceil(duration / 10) + 1;
  if (count > 5) count = 5; // 5개까지 늘림
  if (count < 2) count = 2; // 최소 2개

  // 다양성 고려하여 선택
  const selectedMovements = selectDiverseMovements(candidates, count);

  // 운동이 부족할 경우 로직 (코어 운동 채우기)
  // candidates가 비어있지 않다면 selectDiverseMovements가 최대한 채웠을 것임.
  // 만약 그래도 부족하다면 (candidates 자체가 적음), 중복 허용하거나 Core 추가.
  // 여기서는 간단히 처리.

  // 라운드 수 계산
  let rounds = Math.max(3, Math.floor(duration / 3));
  if (duration <= 10) rounds = 3;
  else if (duration <= 20) rounds = 4;
  else rounds = 5;

  // 시간 계산
  const timePerRoundSeconds = (duration * 60) / rounds;
  const timePerRoundMin = Math.floor(timePerRoundSeconds / 60);
  const timePerRoundSec = Math.floor(timePerRoundSeconds % 60);
  const targetTimePerRound = `${timePerRoundMin}분 ${timePerRoundSec}초`;

  // Exercise 객체로 변환
  const exercises: Exercise[] = selectedMovements.map((movement, index) => ({
    exerciseId: index,
    movementId: movement.id,
    name: movement.name,
    minReps: movement.minReps || 10,
    maxReps: movement.maxReps || 20,
    equipment: movement.equipment,
    muscleGroups: movement.muscleGroups
  }));

  return { exercises, rounds, targetTimePerRound };
}

/**
 * BALANCE Plan
 */
export function generateBalancePlan(
  duration: number,
  wodMovements: Movement[],
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const avoidMuscles = detectAvoidMuscles(wodMovements);
  const candidates = selectCandidatesForBalance(avoidMuscles, allMovements);

  // 만약 후보가 너무 적으면(0개), Tier 2 제한을 더 풀어서(모든 GB/CA) 가져오거나 코어만.
  if (candidates.length === 0) {
    const core = allMovements.filter(m => m.muscleGroups.includes('CORE'));
    return generateWorkoutPlan('BALANCE', duration, core);
  }

  return generateWorkoutPlan('BALANCE', duration, candidates);
}

/**
 * GOAL Plan
 */
export function generateGoalPlan(
  duration: number,
  goalMovementId: string, // ID로 변경됨
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const candidates = selectCandidatesForGoal(goalMovementId, allMovements);
  return generateWorkoutPlan('GOAL', duration, candidates);
}

/**
 * PART Plan
 */
export function generatePartPlan(
  duration: number,
  targetMuscles: MuscleGroup[],
  allMovements: Movement[]
): { exercises: Exercise[]; rounds: number; targetTimePerRound: string } {
  const candidates = selectCandidatesForPart(targetMuscles, allMovements);
  return generateWorkoutPlan('PART', duration, candidates);
}

