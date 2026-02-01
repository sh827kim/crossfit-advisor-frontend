'use client';

/**
 * 운동 기록 스토리지 추상화 인터페이스
 * - IndexedDB 사용 (지원하는 경우)
 * - LocalStorage 폴백 (미지원 브라우저)
 */

import {
  isIndexedDBSupported,
  getAllWorkoutRecords,
  getRecordsByDate,
  getRecordsByMonth,
  addWorkoutRecord as addToIndexedDB,
  deleteWorkoutRecord as deleteFromIndexedDB,
  cleanupMonthlyRecords,
  WorkoutRecordDB
} from './indexeddb';
import { migrateFromLocalStorage } from './migration';
import { cleanupAndSaveWorkoutRecords } from '../storage-manager';
import { WorkoutRecord } from '../types/workout.types';

/**
 * 스토리지 어댑터 인터페이스
 */
export interface WorkoutStorageAdapter {
  /** 초기화 (마이그레이션 포함) */
  initialize(): Promise<void>;

  /** 전체 기록 조회 (최신순) */
  getAll(): Promise<WorkoutRecord[]>;

  /** 날짜별 기록 조회 */
  getByDate(date: string): Promise<WorkoutRecord[]>;

  /** 월별 기록 조회 */
  getByMonth(year: number, month: number): Promise<WorkoutRecord[]>;

  /** 기록 추가 */
  add(record: WorkoutRecord): Promise<void>;

  /** 기록 삭제 */
  delete(id: number): Promise<void>;

  /** 정리 작업 (100건 제한 등) */
  cleanup(): Promise<void>;
}

/**
 * IndexedDB 어댑터
 */
class IndexedDBAdapter implements WorkoutStorageAdapter {
  async initialize(): Promise<void> {
    // 마이그레이션 실행
    await migrateFromLocalStorage();
  }

  async getAll(): Promise<WorkoutRecord[]> {
    const records = await getAllWorkoutRecords();
    return records.map(this.convertFromDB);
  }

  async getByDate(date: string): Promise<WorkoutRecord[]> {
    const records = await getRecordsByDate(date);
    return records.map(this.convertFromDB);
  }

  async getByMonth(year: number, month: number): Promise<WorkoutRecord[]> {
    const records = await getRecordsByMonth(year, month);
    return records.map(this.convertFromDB);
  }

  async add(record: WorkoutRecord): Promise<void> {
    const dbRecord: Omit<WorkoutRecordDB, 'id'> = {
      ...record,
      createdAt: Date.now()
    };

    await addToIndexedDB(dbRecord);

    // 기록 추가 후 정리 작업 실행
    await this.cleanup();
  }

  async delete(id: number): Promise<void> {
    await deleteFromIndexedDB(id);
  }

  async cleanup(): Promise<void> {
    await cleanupMonthlyRecords();
  }

  /** DB 레코드를 앱 레코드로 변환 */
  private convertFromDB(dbRecord: WorkoutRecordDB): WorkoutRecord {
    return {
      id: dbRecord.id,
      date: dbRecord.date,
      mode: dbRecord.mode,
      duration: dbRecord.duration,
      exercises: dbRecord.exercises,
      rounds: dbRecord.rounds,
      planId: dbRecord.planId
    };
  }
}

/**
 * LocalStorage 어댑터 (폴백)
 */
class LocalStorageAdapter implements WorkoutStorageAdapter {
  private readonly HISTORY_KEY = 'cf_workout_history';

  async initialize(): Promise<void> {
    // LocalStorage는 별도 초기화 불필요
  }

  async getAll(): Promise<WorkoutRecord[]> {
    return this.loadRecords();
  }

  async getByDate(date: string): Promise<WorkoutRecord[]> {
    const allRecords = this.loadRecords();
    return allRecords.filter(record => record.date === date);
  }

  async getByMonth(year: number, month: number): Promise<WorkoutRecord[]> {
    const allRecords = this.loadRecords();

    return allRecords.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth() + 1;

      return recordYear === year && recordMonth === month;
    });
  }

  async add(record: WorkoutRecord): Promise<void> {
    const records = this.loadRecords();
    records.push(record);

    // 정리 후 저장
    const cleaned = cleanupAndSaveWorkoutRecords(records);
    this.saveRecords(cleaned);
  }

  async delete(id: number): Promise<void> {
    const records = this.loadRecords();
    const newRecords = records.filter(r => r.id !== id);
    this.saveRecords(newRecords);
  }

  async cleanup(): Promise<void> {
    const records = this.loadRecords();
    const cleaned = cleanupAndSaveWorkoutRecords(records);
    this.saveRecords(cleaned);
  }

  /** localStorage에서 기록 로드 */
  private loadRecords(): WorkoutRecord[] {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (!saved) return [];

      return JSON.parse(saved) as WorkoutRecord[];
    } catch (error) {
      console.error('Failed to load workout records from localStorage:', error);
      return [];
    }
  }

  /** localStorage에 기록 저장 */
  private saveRecords(records: WorkoutRecord[]): void {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save workout records to localStorage:', error);
    }
  }
}

/**
 * 스토리지 어댑터 팩토리
 * - IndexedDB 지원 여부에 따라 적절한 어댑터 반환
 */
export async function createWorkoutStorage(): Promise<WorkoutStorageAdapter> {
  if (isIndexedDBSupported()) {
    return new IndexedDBAdapter();
  } else {
    console.warn('⚠️ IndexedDB를 지원하지 않습니다. LocalStorage를 사용합니다.');
    return new LocalStorageAdapter();
  }
}
