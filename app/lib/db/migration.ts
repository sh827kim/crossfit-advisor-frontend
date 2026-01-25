'use client';

/**
 * LocalStorage → IndexedDB 자동 마이그레이션
 * - 기존 localStorage의 운동 기록을 IndexedDB로 이전
 * - 마이그레이션 완료 후 localStorage에서 해당 데이터 삭제
 */

import { addWorkoutRecord, WorkoutRecordDB } from './indexeddb';

const MIGRATION_FLAG_KEY = 'cf_migration_completed';
const OLD_HISTORY_KEY = 'cf_workout_history';

/**
 * 마이그레이션 완료 여부 확인
 */
export function isMigrationCompleted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
}

/**
 * LocalStorage에서 IndexedDB로 마이그레이션 실행
 * - 이미 완료된 경우 스킵
 * - localStorage에서 cf_workout_history 읽기
 * - IndexedDB에 저장
 * - localStorage 정리
 */
export async function migrateFromLocalStorage(): Promise<void> {
  // SSR 환경에서는 실행하지 않음
  if (typeof window === 'undefined') {
    return;
  }

  // 이미 마이그레이션 완료된 경우 스킵
  if (isMigrationCompleted()) {
    return;
  }

  try {
    // localStorage에서 기존 운동 기록 읽기
    const savedHistory = localStorage.getItem(OLD_HISTORY_KEY);

    if (!savedHistory) {
      // 기록이 없으면 마이그레이션 완료로 표시하고 종료
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return;
    }

    // JSON 파싱
    const oldRecords = JSON.parse(savedHistory) as Array<{
      date: string;
      mode: 'WOD' | 'GOAL' | 'PART';
      duration: number;
      exercises: string[];
    }>;

    // IndexedDB에 저장 (개별 에러 처리)
    let successCount = 0;
    let failCount = 0;

    const migrationPromises = oldRecords.map(async (record) => {
      try {
        const recordWithTimestamp: Omit<WorkoutRecordDB, 'id'> = {
          date: record.date,
          mode: record.mode,
          duration: record.duration,
          exercises: record.exercises,
          createdAt: new Date(record.date).getTime() // 날짜를 timestamp로 변환
        };

        await addWorkoutRecord(recordWithTimestamp);
        successCount++;
      } catch (error) {
        console.error('마이그레이션 실패:', record, error);
        failCount++;
      }
    });

    // 모든 기록이 저장될 때까지 대기
    await Promise.all(migrationPromises);

    // localStorage에서 cf_workout_history 삭제
    localStorage.removeItem(OLD_HISTORY_KEY);

    // 마이그레이션 완료 플래그 설정
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    if (failCount > 0) {
      console.warn(`⚠️ 마이그레이션 일부 실패: 성공 ${successCount}건, 실패 ${failCount}건`);
    } else {
      console.log(`✅ 마이그레이션 완료: ${successCount}건의 기록을 IndexedDB로 이전했습니다.`);
    }
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    // 실패 시 localStorage 데이터는 유지 (다음 실행 시 재시도)
    throw error;
  }
}

/**
 * 마이그레이션 플래그 초기화 (개발/테스트용)
 */
export function resetMigrationFlag(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(MIGRATION_FLAG_KEY);
  console.log('🔄 마이그레이션 플래그가 초기화되었습니다.');
}
