'use server';

/**
 * 인증 관련 Server Actions
 *
 * 현재 구조:
 * - 프론트엔드에서 사용자가 로그인 버튼 클릭
 * - 백엔드의 /oauth2/authorization/google으로 리다이렉트
 * - 백엔드가 Google OAuth2 처리 (Spring Security)
 * - 백엔드에서 사용자 정보와 토큰을 쿠키/세션으로 관리
 */

/**
 * 향후 로그아웃 처리용 함수 (구현 예정)
 */
export async function handleLogout() {
  try {
    // 백엔드 로그아웃 API 호출 (향후)
    // const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    // await fetch(`${backendUrl}/api/auth/logout`, {
    //   method: 'POST',
    // });

    // 클라이언트 사이드 정리
    // clearAuthData();

    console.log('로그아웃 처리 예정');
  } catch (error) {
    console.error('로그아웃 오류:', error);
  }
}
