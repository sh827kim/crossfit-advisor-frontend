'use client';

/**
 * IndexedDB 핵심 로직
 * - 운동 기록을 IndexedDB에 저장
 * - 날짜별 인덱스 지원
 * - 100건 제한 로직 포함
 */

// IndexedDB에 저장되는 운동 기록 구조
export interface WorkoutRecordDB {
  id?: number; // Auto-increment primary key
  date: string; // '2026-01-18' 형식
  mode: 'WOD' | 'GOAL' | 'PART';
  duration: number;
  exercises: string[];
  createdAt: number; // timestamp (같은 날짜의 여러 기록 정렬용)
}

const DB_NAME = 'AfterWOD_DB';
const DB_VERSION = 1;
const STORE_NAME = 'workout_records';
const MAX_MONTHLY_RECORDS = 100; // 당월 최대 보관 기록 수

/**
 * IndexedDB 데이터베이스 연결 및 스키마 생성
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is not available in SSR'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 스키마 생성 또는 업그레이드
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // ObjectStore 생성 (이미 존재하면 스킵)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        // 날짜별 조회를 위한 인덱스
        objectStore.createIndex('date', 'date', { unique: false });

        // 모드별 필터링을 위한 인덱스
        objectStore.createIndex('mode', 'mode', { unique: false });

        // 정렬용 인덱스 (같은 날짜의 여러 기록)
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 모든 운동 기록 초기화
 * - DB 삭제 대신 ObjectStore를 clear하여 블로킹 가능성을 줄임
 */
export async function clearAllWorkoutRecords(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.clear();

    request.onerror = () => {
      try {
        db.close();
      } catch {
        // noop
      }
      reject(request.error);
    };

    transaction.oncomplete = () => {
      try {
        db.close();
      } catch {
        // noop
      }
      resolve();
    };

    transaction.onerror = () => {
      try {
        db.close();
      } catch {
        // noop
      }
      reject(transaction.error);
    };

    transaction.onabort = () => {
      try {
        db.close();
      } catch {
        // noop
      }
      reject(transaction.error);
    };
  });
}

/**
 * 전체 운동 기록 조회 (최신순)
 */
export async function getAllWorkoutRecords(): Promise<WorkoutRecordDB[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.getAll();

    request.onsuccess = () => {
      const records = request.result as WorkoutRecordDB[];
      // createdAt 기준 내림차순 정렬 (최신순)
      records.sort((a, b) => b.createdAt - a.createdAt);
      resolve(records);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 날짜별 운동 기록 조회
 * @param date '2026-01-18' 형식
 */
export async function getRecordsByDate(date: string): Promise<WorkoutRecordDB[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('date');
    const request = index.getAll(date);

    request.onsuccess = () => {
      const records = request.result as WorkoutRecordDB[];
      // createdAt 기준 내림차순 정렬
      records.sort((a, b) => b.createdAt - a.createdAt);
      resolve(records);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 월별 운동 기록 조회
 * @param year 연도 (2026)
 * @param month 월 (1-12)
 */
export async function getRecordsByMonth(year: number, month: number): Promise<WorkoutRecordDB[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('date');

    // 월의 시작일과 종료일 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    request.onsuccess = () => {
      const records = request.result as WorkoutRecordDB[];
      // createdAt 기준 내림차순 정렬
      records.sort((a, b) => b.createdAt - a.createdAt);
      resolve(records);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 운동 기록 추가
 */
export async function addWorkoutRecord(record: Omit<WorkoutRecordDB, 'id'>): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    // createdAt이 없으면 현재 시각으로 설정
    const recordWithTimestamp: Omit<WorkoutRecordDB, 'id'> = {
      ...record,
      createdAt: record.createdAt || Date.now()
    };

    const request = objectStore.add(recordWithTimestamp);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * 당월 운동 기록 100건 제한 적용
 * - 당월 기록이 100건을 초과하면 오래된 기록 삭제
 * - 이전 달 기록은 모두 삭제
 */
export async function cleanupMonthlyRecords(): Promise<void> {
  const db = await openDatabase();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 전체 기록 조회
  const allRecords = await getAllWorkoutRecords();

  // 삭제할 기록 ID 목록
  const idsToDelete: number[] = [];

  // 이번달 기록과 이전 기록 분리
  const thisMonthRecords: WorkoutRecordDB[] = [];
  const otherRecords: WorkoutRecordDB[] = [];

  allRecords.forEach(record => {
    const recordDate = new Date(record.date);
    const recordYear = recordDate.getFullYear();
    const recordMonth = recordDate.getMonth() + 1;

    if (recordYear === currentYear && recordMonth === currentMonth) {
      thisMonthRecords.push(record);
    } else if (recordYear < currentYear || (recordYear === currentYear && recordMonth < currentMonth)) {
      // 이전 달 기록은 삭제 대상
      if (record.id !== undefined) {
        idsToDelete.push(record.id);
      }
    } else {
      // 미래 기록은 유지
      otherRecords.push(record);
    }
  });

  // 이번달 기록이 MAX_MONTHLY_RECORDS건 초과하면 오래된 기록 삭제
  if (thisMonthRecords.length > MAX_MONTHLY_RECORDS) {
    // createdAt 기준 내림차순 정렬 (최신순)
    thisMonthRecords.sort((a, b) => b.createdAt - a.createdAt);

    // MAX_MONTHLY_RECORDS건 이후의 기록은 삭제 대상
    for (let i = MAX_MONTHLY_RECORDS; i < thisMonthRecords.length; i++) {
      const recordId = thisMonthRecords[i].id;
      if (recordId !== undefined) {
        idsToDelete.push(recordId);
      }
    }
  }

  // 삭제 실행 (트랜잭션 최적화)
  if (idsToDelete.length > 0) {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      // 모든 삭제 작업 예약 (트랜잭션에 일괄 추가)
      idsToDelete.forEach(id => {
        objectStore.delete(id);
      });

      // 트랜잭션 완료/에러 이벤트만 감지
      transaction.oncomplete = () => {
        console.log(`🗑️ ${idsToDelete.length}건의 오래된 기록을 삭제했습니다.`);
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }
}

/**
 * IndexedDB 지원 여부 확인
 */
export function isIndexedDBSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'indexedDB' in window && window.indexedDB !== null;
}
