import { NextRequest, NextResponse } from 'next/server';
import movementsData from '@/public/data/movements.json';
import { generatePartPlan } from '@/app/lib/workout-generator';
import { WorkoutGeneratePartRequest, WorkoutPlan, ApiResponse, MuscleGroup } from '@/app/lib/types/workout.types';

const VALID_MUSCLE_GROUPS: MuscleGroup[] = ['CORE', 'LEGS', 'BACK', 'CHEST', 'CARDIO'];

export async function POST(request: NextRequest) {
  try {
    const body: WorkoutGeneratePartRequest = await request.json();
    const { duration, targetMuscleGroups } = body;

    // 유효성 검사
    if (!duration || ![1, 5, 10, 15, 20, 25, 30].includes(duration)) {
      return NextResponse.json({
        success: false,
        message: '요청 데이터가 유효하지 않습니다.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    if (!Array.isArray(targetMuscleGroups) || targetMuscleGroups.length === 0) {
      return NextResponse.json({
        success: false,
        message: '타겟 부위를 최소 하나 선택해주세요.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    // 유효한 근육 그룹인지 검증
    const validMuscles = targetMuscleGroups.filter(m =>
      VALID_MUSCLE_GROUPS.includes(m as MuscleGroup)
    ) as MuscleGroup[];

    if (validMuscles.length === 0) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 부위입니다.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    // 운동 계획 생성
    const allMovements = movementsData.movements;
    const { exercises, rounds, targetTimePerRound } = generatePartPlan(
      duration,
      validMuscles,
      allMovements as any
    );

    const workoutPlan: WorkoutPlan = {
      mode: 'PART',
      duration,
      rounds,
      targetTimePerRound,
      exercises,
      modeDisplay: '타겟 집중'
    };

    return NextResponse.json({
      success: true,
      message: '운동 계획이 생성되었습니다.',
      data: workoutPlan
    } as ApiResponse<WorkoutPlan>, { status: 200 });
  } catch (error) {
    console.error('Error generating Part plan:', error);
    return NextResponse.json({
      success: false,
      message: '운동 계획 생성에 실패했습니다.',
      data: null
    } as ApiResponse<null>, { status: 500 });
  }
}
