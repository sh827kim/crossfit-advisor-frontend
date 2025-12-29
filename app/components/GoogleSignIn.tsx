'use client';

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
      <div className="text-red-600 text-center p-4">
        설정 오류: 백엔드 URL이 정의되지 않았습니다.
      </div>
    );
  }

  const googleAuthUrl = `${baseUrl}/oauth2/authorization/google`;

  const handleClick = () => {
    window.location.href = googleAuthUrl;
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <text x="0" y="20" fontSize="20">
          G
        </text>
      </svg>
      <span>Google 계정으로 로그인</span>
    </button>
  );
}
