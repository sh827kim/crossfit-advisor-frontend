'use client';

import { Button } from '@/components/ui/button';

interface GoogleSignInProps {
  backendUrl?: string;
}

/**
 * Google 로그인 버튼
 * 백엔드의 OAuth2 엔드포인트로 리다이렉트합니다.
 * 백엔드는 Spring Security OAuth2를 사용하여 Google 인증을 처리합니다.
 */
export function GoogleSignIn({ backendUrl }: GoogleSignInProps) {
  const baseUrl = backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_BACKEND_URL 환경변수가 설정되지 않았습니다.');
    return (
      <div className="text-destructive text-center p-4">
        설정 오류: 백엔드 URL이 정의되지 않았습니다.
      </div>
    );
  }

  const googleAuthUrl = `${baseUrl}/oauth2/authorization/google`;

  const handleClick = () => {
    window.location.href = googleAuthUrl;
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="w-full gap-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <text x="0" y="20" fontSize="20">
          G
        </text>
      </svg>
      <span>Google 계정으로 로그인</span>
    </Button>
  );
}
