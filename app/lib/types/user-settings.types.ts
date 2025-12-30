/**
 * 단위 타입 Enum
 * LB: 파운드 (야드파운드법)
 * KG: 킬로그램 (미터법)
 */
export enum UnitType {
  LB = 'LB',
  KG = 'KG',
}

/**
 * 사용자 설정 정보 조회 응답
 */
export interface UserSettings {
  nickname: string;
  unitType: UnitType;
  workoutMinutes: number;
  additionalInfo: string | null;
}

/**
 * 사용자 설정 정보 변경 요청
 */
export interface ChangeMyInfoCommand {
  nickname: string;
  unitType: UnitType;
  workoutMinutes: number;
  additionalInfo?: string;
}

/**
 * 설정 폼 Validation 에러
 */
export type SettingsFormErrors = Record<string, string>;
