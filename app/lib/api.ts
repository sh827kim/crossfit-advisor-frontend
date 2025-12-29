// 백엔드 API 호출을 위한 유틸리티 함수

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  isTokenExpired,
  clearAuthData,
  type TokenResponse,
} from './auth-storage';

const getBackendUrl = (): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL 환경변수가 설정되지 않았습니다.');
  }
  return backendUrl;
};

/**
 * 백엔드에서 Access Token과 Refresh Token을 새로 발급받습니다.
 * Refresh Token을 사용하여 토큰을 갱신합니다.
 * @param refreshToken - Refresh Token
 * @returns {accessToken, refreshToken} 새로운 토큰들
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  try {
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/auth-token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // cf_refresh 쿠키 포함
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Refresh Token이 만료되었으면 로그아웃 처리
        clearAuthData();
        throw new Error('Refresh Token expired. Please login again.');
      }
      throw new Error(`토큰 갱신 실패: ${response.status}`);
    }

    const data = await response.json();

    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid token response');
    }

    // 새로운 토큰들을 저장
    saveTokens(data.accessToken, data.refreshToken);

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    throw error;
  }
}

/**
 * 현재 Access Token을 확인하고, 필요시 자동으로 갱신합니다.
 * @returns 유효한 Access Token
 */
export async function ensureValidAccessToken(): Promise<string> {
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Access Token이 곧 만료되면 갱신
  if (isTokenExpired(accessToken)) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    try {
      const newTokens = await refreshAccessToken(refreshToken);
      accessToken = newTokens.accessToken;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw error;
    }
  }

  return accessToken;
}

/**
 * Authorization 헤더에 Access Token을 포함한 API 호출
 * Access Token이 만료되었으면 자동으로 갱신합니다.
 * @param endpoint - API 엔드포인트
 * @param options - fetch 옵션
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Access Token 확인 및 갱신
    const accessToken = await ensureValidAccessToken();

    const backendUrl = getBackendUrl();
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${backendUrl}${endpoint}`;

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
      // 리다이렉트를 자동으로 따르지 않고 직접 처리
      redirect: 'manual',
    });

    // 401 에러 또는 리다이렉트 상태 코드(301, 302, 303, 307, 308)
    // 리다이렉트는 서버가 인증 실패 시 Google 로그인으로 보내는 것을 의미
    if (response.status === 401 || (response.status >= 301 && response.status <= 308)) {
      clearAuthData();

      // 클라이언트에서 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = process.env.NEXT_PUBLIC_LOGIN_ERROR_REDIRECT_PATH || '/login';
      }

      throw new Error('Unauthorized. Please login again.');
    }

    return response;
  } catch (error) {
    console.error('인증된 API 호출 오류:', error);
    throw error;
  }
}

/**
 * 백엔드에 로그아웃 요청
 * (세션/쿠키 정리 목적)
 */
export async function logoutFromBackend(): Promise<void> {
  try {
    const backendUrl = getBackendUrl();
    await fetch(`${backendUrl}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('로그아웃 API 호출 오류:', error);
  }
}
