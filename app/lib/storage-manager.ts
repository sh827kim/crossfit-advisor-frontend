/**
 * 로컬스토리지 데이터 관리 유틸
 * - 지난달 데이터 삭제
 * - 이번달 데이터 100건 초과 시 오래된 데이터 삭제
 */

import { WorkoutRecord } from './types/workout.types';

/**
 * 운동 기록 정리 및 저장
 * @param records 새로운 운동 기록이 추가된 배열
 */
export function cleanupAndSaveWorkoutRecords(records: WorkoutRecord[]): WorkoutRecord[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 이번달 기록과 지난달 이후 기록 분리
  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    const recordYear = recordDate.getFullYear();
    const recordMonth = recordDate.getMonth() + 1;

    // 현재 년도와 월이 같으면 유지
    if (recordYear === currentYear && recordMonth === currentMonth) {
      return true;
    }

    // 현재 년도 이전의 기록은 제거
    if (recordYear < currentYear) {
      return false;
    }

    // 현재 년도지만 이전 월의 기록은 제거
    if (recordYear === currentYear && recordMonth < currentMonth) {
      return false;
    }

    // 미래의 기록은 유지
    if (recordYear > currentYear) {
      return true;
    }

    return false;
  });

  // 이번달 기록이 100건 초과면 오래된 기록 삭제
  const thisMonthRecords = filteredRecords.filter(record => {
    const recordDate = new Date(record.date);
    const recordYear = recordDate.getFullYear();
    const recordMonth = recordDate.getMonth() + 1;
    return recordYear === currentYear && recordMonth === currentMonth;
  });

  if (thisMonthRecords.length > 100) {
    // 이번달 기록을 날짜 기준 내림차순으로 정렬
    thisMonthRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // 최신 100건만 유지
    const recentThisMonth = thisMonthRecords.slice(0, 100);

    // 이번달이 아닌 기록들과 병합
    const nonThisMonthRecords = filteredRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth() + 1;
      return !(recordYear === currentYear && recordMonth === currentMonth);
    });

    return [...nonThisMonthRecords, ...recentThisMonth];
  }

  return filteredRecords;
}

/**
 * 저장된 운동 기록 조회 및 정리
 */
export function getCleanedWorkoutRecords(): WorkoutRecord[] {
  try {
    const saved = localStorage.getItem('cf_workout_history');
    if (!saved) return [];

    const records: WorkoutRecord[] = JSON.parse(saved);
    const cleaned = cleanupAndSaveWorkoutRecords(records);

    // 정리된 데이터 저장
    localStorage.setItem('cf_workout_history', JSON.stringify(cleaned));

    return cleaned;
  } catch (error) {
    console.error('운동 기록 로드 실패:', error);
    return [];
  }
}
