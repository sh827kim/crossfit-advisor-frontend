'use client';

import { useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '@/app/lib/api/user-settings.api';
import type { UserSettings, ChangeMyInfoCommand, SettingsFormErrors } from '@/app/lib/types/user-settings.types';

/**
 * 사용자 설정 관리 훅
 * - 설정 조회, 업데이트, validation 처리
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 설정 조회
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getUserSettings();
        setSettings(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '설정 조회 실패';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 설정 업데이트
  const updateSettings = async (
    command: ChangeMyInfoCommand
  ): Promise<{ success: boolean; errors?: SettingsFormErrors }> => {
    // 클라이언트 사이드 validation
    const errors = validateSettings(command);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    try {
      setIsSaving(true);
      setError(null);
      await updateUserSettings(command);

      // 성공 시 로컬 상태 업데이트
      setSettings({
        nickname: command.nickname,
        unitType: command.unitType,
        workoutMinutes: command.workoutMinutes,
        additionalInfo: command.additionalInfo || null,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '설정 변경 실패';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSettings,
  };
}

/**
 * 설정 폼 validation
 */
function validateSettings(command: ChangeMyInfoCommand): SettingsFormErrors {
  const errors: SettingsFormErrors = {};

  // 닉네임 검증 (1-20자)
  if (!command.nickname || command.nickname.trim().length === 0) {
    errors.nickname = '닉네임을 입력해주세요.';
  } else if (command.nickname.length > 20) {
    errors.nickname = '닉네임은 20자 이하로 입력해주세요.';
  }

  // 운동 시간 검증 (5-180분)
  if (!command.workoutMinutes || command.workoutMinutes < 5) {
    errors.workoutMinutes = '운동 시간은 최소 5분 이상이어야 합니다.';
  } else if (command.workoutMinutes > 180) {
    errors.workoutMinutes = '운동 시간은 180분 이하로 입력해주세요.';
  }

  // 추가 정보 검증 (선택, 최대 500자)
  if (command.additionalInfo && command.additionalInfo.length > 500) {
    errors.additionalInfo = '추가 정보는 500자 이하로 입력해주세요.';
  }

  return errors;
}
