import { NextRequest, NextResponse } from 'next/server';
import movementsData from '@/public/data/movements.json';

// 한글 초성 추출 함수
function getChosung(str: string): string {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code > -1 && code < 11172) result += cho[Math.floor(code/588)];
    else result += str.charAt(i);
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const keyword = request.nextUrl.searchParams.get('keyword');

    let filteredMovements = movementsData.movements;

    // 검색 키워드가 있으면 필터링
    if (keyword) {
      const keywordChosung = getChosung(keyword.toLowerCase());
      filteredMovements = movementsData.movements.filter(movement => {
        const nameMatch = movement.name.includes(keyword);
        const chosungMatch = getChosung(movement.name).includes(keywordChosung);
        return nameMatch || chosungMatch;
      });
    }

    return NextResponse.json({
      success: true,
      message: '운동 목록 조회 성공',
      data: {
        movements: filteredMovements,
        total: filteredMovements.length
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({
      success: false,
      message: '운동 목록 조회에 실패했습니다.',
      data: null
    }, { status: 500 });
  }
}
