import { NextResponse } from 'next/server';
import goalsData from '@/public/data/goals.json';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '달성 목표 운동 목록 조회 성공',
      data: {
        movements: goalsData.movements,
        total: goalsData.movements.length
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({
      success: false,
      message: '달성 목표 운동 목록 조회에 실패했습니다.',
      data: null
    }, { status: 500 });
  }
}
