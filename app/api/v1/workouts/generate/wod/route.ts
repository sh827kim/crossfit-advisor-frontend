import { NextRequest, NextResponse } from 'next/server';
import movementsData from '@/public/data/movements.json';
import { generateWodPlan } from '@/app/lib/workout-generator';
import { WorkoutGenerateWodRequest, WorkoutPlan, ApiResponse, Movement } from '@/app/lib/types/workout.types';

export async function POST(request: NextRequest) {
  try {
    const body: WorkoutGenerateWodRequest = await request.json();
    const { duration, wodMovementIds } = body;

    // 유효성 검사
    if (!duration || ![1, 5, 10, 15, 20, 25, 30].includes(duration)) {
      return NextResponse.json({
        success: false,
        message: '요청 데이터가 유효하지 않습니다.',
        data: null
      } as ApiResponse<null>, { status: 400 });
    }

    // 입력한 운동 객체 가져오기 (ID 기반)
    const allMovements = movementsData.movements as unknown as Movement[];
    const wodMovements: Movement[] = [];

    if (wodMovementIds && Array.isArray(wodMovementIds)) {
      for (const id of wodMovementIds) {
        const movement = allMovements.find(m => m.id === id);
        if (movement) {
          wodMovements.push(movement);
        }
      }
    }

    // 운동 계획 생성
    const { exercises, rounds, targetTimePerRound } = generateWodPlan(
      duration,
      wodMovements,
      allMovements
    );

    const workoutPlan: WorkoutPlan = {
      mode: 'WOD',
      duration,
      rounds,
      targetTimePerRound,
      exercises,
      modeDisplay: '부족 부위 채우기'
    };

    return NextResponse.json({
      success: true,
      message: '운동 계획이 생성되었습니다.',
      data: workoutPlan
    } as ApiResponse<WorkoutPlan>, { status: 200 });
  } catch (error) {
    console.error('Error generating WOD plan:', error);
    return NextResponse.json({
      success: false,
      message: '운동 계획 생성에 실패했습니다.',
      data: null
    } as ApiResponse<null>, { status: 500 });
  }
}
