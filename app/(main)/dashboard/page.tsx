'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutFromBackend } from '@/app/lib/api';
import {
  saveUser,
  getUser,
  getAccessToken,
  saveTokens,
  clearAuthData,
  type User,
  type TokenResponse,
} from '@/app/lib/auth-storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CommonResult<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * 대시보드 페이지
 * 로그인 후 메인 페이지입니다.
 * 백엔드에서 현재 사용자 정보를 조회합니다 (세션/쿠키 기반).
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * 1단계: 백엔드의 cf_refresh 쿠키로부터 토큰 초기화
     * 백엔드는 Google OAuth 인증 성공 후 cf_refresh 쿠키에 refresh token 저장
     * 프론트엔드는 이를 이용하여 JWT access token을 발급받습니다.
     *
     * 2단계: 발급받은 토큰들을 localStorage에 저장
     * 3단계: 현재 사용자 정보를 조회하여 표시
     */
    const initializeAuth = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('NEXT_PUBLIC_BACKEND_URL 환경변수가 설정되지 않았습니다.');
        }

        // 토큰이 이미 초기화되어 있으면 스킵
        const existingAccessToken = getAccessToken();
        if (existingAccessToken) {
          await fetchUserInfo();
          return;
        }

        // 1단계: cf_refresh 쿠키로부터 access token 발급받기
        // 쿠키는 credentials: 'include'로 자동 포함됨
        // 백엔드는 쿠키의 cf_refresh를 읽어서 새로운 토큰 발급
        const refreshResponse = await fetch(`${backendUrl}/auth-token/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // cf_refresh 쿠키 포함
          body: JSON.stringify({
            // refreshToken은 URL 파라미터로 받을 수도 있지만,
            // 일반적으로 쿠키로부터 자동으로 처리됨
          }),
        });

        if (!refreshResponse.ok) {
          if (refreshResponse.status === 401) {
            // 인증되지 않음 - 로그인 페이지로
            router.push('/login');
            return;
          }
          throw new Error(`토큰 초기화 실패: ${refreshResponse.status}`);
        }

        const result: CommonResult<TokenResponse> = await refreshResponse.json();

        if (!result.success || !result.data?.accessToken || !result.data?.refreshToken) {
          throw new Error(result.message || '토큰 응답이 유효하지 않습니다.');
        }

        // 2단계: 토큰 저장
        saveTokens(result.data.accessToken, result.data.refreshToken);

        // 3단계: 사용자 정보 조회
        await fetchUserInfo();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('인증 초기화 오류:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    /**
     * 현재 사용자 정보를 조회합니다.
     * localStorage에 저장된 사용자 정보가 있으면 먼저 표시하고,
     * 필요시 백엔드에서 최신 정보를 조회합니다.
     */
    const fetchUserInfo = async () => {
      try {
        // 로컬 스토리지에 저장된 사용자 정보 먼저 표시
        const cachedUser = getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const accessToken = getAccessToken();

        if (!accessToken) {
          throw new Error('Access token not found');
        }

        // 백엔드에서 최신 사용자 정보 조회
        const response = await fetch(`${backendUrl}/api/user/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 토큰이 만료되었거나 유효하지 않음
            clearAuthData();
            router.push('/login');
            return;
          }
          throw new Error(`사용자 정보 조회 실패: ${response.status}`);
        }

        const result: CommonResult<User> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.message || '사용자 정보를 찾을 수 없습니다.');
        }

        setUser(result.data);
        saveUser(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('사용자 정보 조회 오류:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">로드 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">오류 발생</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                다시 로그인하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-center text-muted-foreground">
                사용자 정보를 찾을 수 없습니다.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                로그인하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-foreground">
              🏋️ 또와드
            </h1>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-foreground font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  // 로그아웃 처리
                  clearAuthData();
                  await logoutFromBackend();
                  router.push('/login');
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WOD 입력 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>📝 WOD 입력하기</CardTitle>
              <CardDescription>오늘의 WOD를 입력해주세요!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                📷 카메라로 촬영
              </Button>
              <Button variant="secondary" className="w-full" size="lg">
                ✍️ 텍스트로 입력
              </Button>
            </CardContent>
          </Card>

          {/* AI 추천 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI 추천받기</CardTitle>
              <CardDescription>
                WOD 분석 후 맞춤형 보강운동을 추천받으세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription className="text-sm">
                  💡 <strong>팁:</strong> WOD를 먼저 입력해주세요. 이후 AI 에이전트가 최적의 보강운동을 제안해줄 것입니다.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 설정 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ 내 설정</CardTitle>
              <CardDescription>
                선호하는 보강운동 방식을 설정하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                설정 관리하기
              </Button>
            </CardContent>
          </Card>

          {/* 기록 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 나의 기록</CardTitle>
              <CardDescription>
                운동 기록을 관리하고 진행상황을 추적하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                기록 보기
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 안내 섹션 */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>🎯 시작하기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    WOD 입력
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    텍스트로 자유롭게 입력하거나 사진을 촬영하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    AI 분석
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    AI 에이전트가 WOD를 분석하고 추천 운동을 제안합니다
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    조절하기
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    대화를 통해 강도나 부위를 조절할 수 있습니다
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
