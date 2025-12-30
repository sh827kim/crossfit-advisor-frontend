'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/app/hooks/use-user-settings';
import { UnitType } from '@/app/lib/types/user-settings.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster, toast } from 'sonner';

/**
 * 사용자 설정 폼 컴포넌트
 * - 닉네임, 단위 타입, 운동 시간, 추가 정보 입력
 * - 실시간 validation 및 에러 표시
 */
export default function SettingsForm() {
  const router = useRouter();
  const { settings, isLoading, isSaving, error, updateSettings } = useUserSettings();

  // 폼 상태
  const [nickname, setNickname] = useState('');
  const [unitType, setUnitType] = useState<UnitType>(UnitType.KG);
  const [workoutMinutes, setWorkoutMinutes] = useState(30);
  const [additionalInfo, setAdditionalInfo] = useState('');

  // validation 에러
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 설정 로드 시 폼 초기화
  useEffect(() => {
    if (settings) {
      setNickname(settings.nickname);
      setUnitType(settings.unitType);
      setWorkoutMinutes(settings.workoutMinutes);
      setAdditionalInfo(settings.additionalInfo || '');
    }
  }, [settings]);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await updateSettings({
      nickname: nickname.trim(),
      unitType,
      workoutMinutes,
      additionalInfo: additionalInfo.trim() || undefined,
    });

    if (result.success) {
      // 성공 토스트 표시
      toast.success('설정이 저장되었습니다.');

      // 2초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else if (result.errors) {
      // validation 에러 표시
      setErrors(result.errors);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">설정 로드 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-center" />

      {/* 네비게이션 바 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-black">
              🏋️ 또와드 - 내 설정
            </h1>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
            >
              대시보드로
            </Button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>내 설정</CardTitle>
            <CardDescription>
              AI 추천에 사용될 개인 정보를 설정하세요
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* 전역 에러 메시지 */}
              {error && (
                <Alert>
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              {/* 닉네임 입력 */}
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임 *</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  className={errors.nickname ? 'border-red-500' : ''}
                />
                {errors.nickname && (
                  <p className="text-sm text-red-500">{errors.nickname}</p>
                )}
              </div>

              {/* 단위 타입 선택 */}
              <div className="space-y-2">
                <Label htmlFor="unitType">단위 타입 *</Label>
                <Select
                  id="unitType"
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as UnitType)}
                >
                  <option value={UnitType.KG}>미터법 (kg, m)</option>
                  <option value={UnitType.LB}>야드파운드법 (lb, ft)</option>
                </Select>
                <p className="text-sm text-gray-500">
                  운동 기록 및 추천에 사용될 단위입니다.
                </p>
              </div>

              {/* 운동 시간 입력 */}
              <div className="space-y-2">
                <Label htmlFor="workoutMinutes">운동 가능 시간 (분) *</Label>
                <Input
                  id="workoutMinutes"
                  type="number"
                  value={workoutMinutes}
                  onChange={(e) => setWorkoutMinutes(parseInt(e.target.value, 10))}
                  min={5}
                  max={180}
                  className={errors.workoutMinutes ? 'border-red-500' : ''}
                />
                {errors.workoutMinutes && (
                  <p className="text-sm text-red-500">{errors.workoutMinutes}</p>
                )}
                <p className="text-sm text-gray-500">
                  보강운동에 할애 가능한 시간입니다 (5-180분).
                </p>
              </div>

              {/* 추가 정보 입력 */}
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">추가 정보 (선택)</Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="선호 부위, 보강 방식, 주의사항 등을 입력하세요"
                  rows={4}
                  maxLength={500}
                  className={errors.additionalInfo ? 'border-red-500' : ''}
                />
                {errors.additionalInfo && (
                  <p className="text-sm text-red-500">{errors.additionalInfo}</p>
                )}
                <p className="text-sm text-gray-500">
                  {additionalInfo.length}/500자
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
