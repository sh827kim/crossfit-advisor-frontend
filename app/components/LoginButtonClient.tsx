'use client';

import { GoogleSignIn } from './GoogleSignIn';

/**
 * 로그인 페이지에서 Google 로그인을 담당하는 클라이언트 컴포넌트
 * 사용자가 Google 로그인 버튼을 클릭하면 백엔드의 OAuth2 엔드포인트로 리다이렉트됩니다.
 */
export function LoginButtonClient() {
  return (
    <div className="w-full">
      <GoogleSignIn />
    </div>
  );
}
