/**
 * 인증 관련 라우트 정의 및 URL 헬퍼
 * 환경변수와 라우트를 중앙에서 관리합니다.
 */

/**
 * 인증 관련 라우트
 */
export const AUTH_ROUTES = {
  LOGIN: '/login',
  LOGIN_ERROR: '/login/error',
  DASHBOARD: '/dashboard',
  HOME: '/',
} as const;

/**
 * 환경변수로부터 리다이렉트 URL을 가져옵니다.
 * 백엔드 응답에 따라 동적으로 처리됩니다.
 */
export function getAuthRedirectUrls() {
  return {
    /**
     * 로그인 성공 시 리다이렉트할 URL
     * 기본값: /dashboard
     */
    successPath:
      process.env.NEXT_PUBLIC_LOGIN_SUCCESS_REDIRECT_PATH || AUTH_ROUTES.DASHBOARD,

    /**
     * 로그인 실패 시 리다이렉트할 URL
     * 기본값: /login?error={errorMessage}
     */
    errorPath:
      process.env.NEXT_PUBLIC_LOGIN_ERROR_REDIRECT_PATH || AUTH_ROUTES.LOGIN,

    /**
     * 로그아웃 후 리다이렉트할 URL
     * 기본값: /
     */
    logoutPath:
      process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_PATH || AUTH_ROUTES.HOME,
  };
}

/**
 * 로그인 성공 URL 생성
 * @param token - 백엔드에서 받은 인증 토큰
 * @returns 성공 리다이렉트 URL
 */
export function getLoginSuccessUrl(token: string): string {
  const { successPath } = getAuthRedirectUrls();
  const url = new URL(successPath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  url.searchParams.append('token', token);
  return url.toString();
}

/**
 * 로그인 실패 URL 생성
 * @param errorMessage - 에러 메시지 (선택사항)
 * @returns 실패 리다이렉트 URL
 */
export function getLoginErrorUrl(errorMessage?: string): string {
  const { errorPath } = getAuthRedirectUrls();
  const url = new URL(errorPath, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  if (errorMessage) {
    url.searchParams.append('error', errorMessage);
  }
  return url.toString();
}

/**
 * 로그아웃 URL
 */
export function getLogoutUrl(): string {
  const { logoutPath } = getAuthRedirectUrls();
  return logoutPath;
}
