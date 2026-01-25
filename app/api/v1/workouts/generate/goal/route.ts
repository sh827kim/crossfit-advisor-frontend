import { NextRequest, NextResponse } from 'next/server';
import movementsData from '@/public/data/movements.json';
import { generateGoalPlan } from '@/app/lib/workout-generator';
import { WorkoutGenerateGoalRequest, WorkoutPlan, ApiResponse, Movement } from '@/app/lib/types/workout.types';

export async function POST(request: NextRequest) {
  try {
    const body: WorkoutGenerateGoalRequest = await request.json();
    const { duration, goalMovementId } = body;

    // 유효성 검사
    if (!duration || ![1, 5, 10, 15, 20, 25, 30].includes(duration)) {
      return NextResponse.json({
        success: false,
        message: '요청 데이터가 유효하지 않습니다.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    if (!goalMovementId) {
      return NextResponse.json({
        success: false,
        message: '목표 운동을 선택해주세요.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    // 목표 운동 이름 가져오기
    const allMovements = movementsData.movements as unknown as Movement[];
    const goalMovement = allMovements.find(m => m.id === goalMovementId);

    if (!goalMovement) {
      return NextResponse.json({
        success: false,
        message: '선택한 목표 운동을 찾을 수 없습니다.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    // 운동 계획 생성
    const { exercises, rounds, targetTimePerRound } = generateGoalPlan(
      duration,
      goalMovement.name,
      allMovements
    );

    const workoutPlan: WorkoutPlan = {
      mode: 'GOAL',
      duration,
      rounds,
      targetTimePerRound,
      exercises,
      modeDisplay: '목표 달성'
    };

    return NextResponse.json({
      success: true,
      message: '운동 계획이 생성되었습니다.',
      data: workoutPlan
    } as ApiResponse<WorkoutPlan>, { status: 200 });
  } catch (error) {
    console.error('Error generating Goal plan:', error);
    return NextResponse.json({
      success: false,
      message: '운동 계획 생성에 실패했습니다.',
      data: null
    } as ApiResponse<null>, { status: 500 });
  }
}
