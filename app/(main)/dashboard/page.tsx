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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">로드 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h2 className="text-lg font-semibold text-red-900 mb-2">오류 발생</h2>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
            >
              다시 로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-gray-600 mb-4">사용자 정보를 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              🏋️ 또와드
            </h1>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-900 font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={async () => {
                  // 로그아웃 처리
                  clearAuthData();
                  await logoutFromBackend();
                  router.push('/login');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WOD 입력 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📝 WOD 입력하기
              </h2>
              <p className="text-gray-600">
                오늘의 WOD를 입력해주세요!
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium transition">
                📷 카메라로 촬영
              </button>
              <button className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium transition">
                ✍️ 텍스트로 입력
              </button>
            </div>
          </div>

          {/* AI 추천 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🤖 AI 추천받기
              </h2>
              <p className="text-gray-600">
                WOD 분석 후 맞춤형 보강운동을 추천받으세요
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>팁:</strong> WOD를 먼저 입력해주세요. 이후 AI 에이전트가 최적의 보강운동을 제안해줄 것입니다.
              </p>
            </div>
          </div>

          {/* 설정 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ⚙️ 내 설정
              </h2>
              <p className="text-gray-600">
                선호하는 보강운동 방식을 설정하세요
              </p>
            </div>

            <button className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium transition">
              설정 관리하기
            </button>
          </div>

          {/* 기록 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                📊 나의 기록
              </h2>
              <p className="text-gray-600">
                운동 기록을 관리하고 진행상황을 추적하세요
              </p>
            </div>

            <button className="w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium transition">
              기록 보기
            </button>
          </div>
        </div>

        {/* 안내 섹션 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 시작하기
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  WOD 입력
                </h3>
                <p className="text-gray-600 text-sm">
                  텍스트로 자유롭게 입력하거나 사진을 촬영하세요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  AI 분석
                </h3>
                <p className="text-gray-600 text-sm">
                  AI 에이전트가 WOD를 분석하고 추천 운동을 제안합니다
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  조절하기
                </h3>
                <p className="text-gray-600 text-sm">
                  대화를 통해 강도나 부위를 조절할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
