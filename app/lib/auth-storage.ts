// 브라우저 로컬 스토리지에서 인증 정보를 관리하는 유틸리티
import type { UnitType } from './types/user-settings.types';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export interface User {
  id: string;
  email: string;
  // 사용자 설정 정보
  nickname: string;
  unitType: UnitType;
  workoutMinutes: number;
  additionalInfo: string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Access Token을 로컬 스토리지에 저장
 */
export function saveAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

/**
 * 로컬 스토리지에서 Access Token 조회
 */
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

/**
 * Refresh Token을 로컬 스토리지에 저장
 */
export function saveRefreshToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

/**
 * 로컬 스토리지에서 Refresh Token 조회
 */
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

/**
 * Access Token과 Refresh Token을 모두 저장
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  saveAccessToken(accessToken);
  saveRefreshToken(refreshToken);
}

/**
 * 사용자 정보를 로컬 스토리지에 저장
 */
export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * 로컬 스토리지에서 사용자 정보 조회
 */
export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        return null;
      }
    }
  }
  return null;
}

/**
 * 인증 정보 모두 제거 (로그아웃)
 */
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * 사용자가 로그인되어 있는지 확인
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * JWT 토큰의 만료 시간을 초 단위로 반환
 * 만료된 경우 음수 반환
 */
export function getTokenExpiresIn(token: string): number {
  try {
    // JWT의 payload는 두 번째 . 다음 부분
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    // Base64 URL 디코딩
    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    if (!decoded.exp) {
      throw new Error('Token has no expiration');
    }

    // exp는 초 단위이므로, 현재 시간(밀리초)을 초로 변환하여 비교
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn;
  } catch (error) {
    console.error('토큰 만료 시간 계산 오류:', error);
    return -1;
  }
}

/**
 * 토큰이 만료되었는지 확인
 * @param token JWT 토큰
 * @param bufferSeconds 버퍼 시간 (기본값: 60초, 60초 전에 만료된 것으로 취급)
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const expiresIn = getTokenExpiresIn(token);
  return expiresIn < bufferSeconds;
}
