import { authenticatedFetch } from '../api';
import type { CommonResult } from '../types/common.types';
import type { UserSettings, ChangeMyInfoCommand } from '../types/user-settings.types';

/**
 * 현재 사용자 설정 정보 조회
 * GET /api/user/me
 */
export async function getUserSettings(): Promise<UserSettings> {
  const response = await authenticatedFetch('/api/user/me');

  if (!response.ok) {
    throw new Error(`사용자 설정 조회 실패: ${response.status}`);
  }

  const result: CommonResult<UserSettings> = await response.json();

  if (!result.success) {
    throw new Error(result.message || '사용자 설정 조회 실패');
  }

  return result.data;
}

/**
 * 사용자 설정 정보 변경
 * PUT /api/user/me
 */
export async function updateUserSettings(
  settings: ChangeMyInfoCommand
): Promise<void> {
  const response = await authenticatedFetch('/api/user/me', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`사용자 설정 변경 실패: ${response.status}`);
  }

  const result: CommonResult<void> = await response.json();

  if (!result.success) {
    throw new Error(result.message || '사용자 설정 변경 실패');
  }
}
