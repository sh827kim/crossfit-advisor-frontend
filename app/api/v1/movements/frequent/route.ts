import { NextResponse } from 'next/server';
import frequentData from '@/public/data/frequent-movements.json';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '자주 나오는 운동 목록 조회 성공',
      data: {
        movements: frequentData.movements,
        total: frequentData.movements.length
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching frequent movements:', error);
    return NextResponse.json({
      success: false,
      message: '자주 나오는 운동 목록 조회에 실패했습니다.',
      data: null
    }, { status: 500 });
  }
}
