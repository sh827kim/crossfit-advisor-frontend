/**
 * 로컬스토리지 데이터 관리 유틸
 * - 최대 3000건까지만 유지하며 오래된 데이터 삭제
 */

import { WorkoutRecord } from './types/workout.types';

/**
 * 운동 기록 정리 및 저장
 * @param records 새로운 운동 기록이 추가된 배열
 */
export function cleanupAndSaveWorkoutRecords(records: WorkoutRecord[]): WorkoutRecord[] {
  // 날짜 기준 내림차순 정렬 (최신순)
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedRecords.length > 3000) {
    return sortedRecords.slice(0, 3000);
  }
  
  return sortedRecords;
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
