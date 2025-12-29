import { Suspense } from 'react';
import { LoginButtonClient } from '@/app/components/LoginButtonClient';

/**
 * 로그인 페이지
 * 백엔드의 OAuth2 엔드포인트로 리다이렉트합니다.
 * 백엔드는 Spring Security OAuth2를 사용하여 Google 인증을 처리합니다.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏋️ 또와드
            </h1>
            <p className="text-gray-600">
              오늘도 또 와드를 해냈다! 내일은 또와드와 함께
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                Google 계정으로 로그인하여 시작하세요
              </p>

              {/* Google 로그인 버튼 */}
              <Suspense
                fallback={
                  <div className="flex justify-center py-4">
                    <div className="text-gray-500">로그인 버튼 로드 중...</div>
                  </div>
                }
              >
                <LoginButtonClient />
              </Suspense>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              로그인하면{' '}
              <a href="#" className="text-blue-600 hover:underline">
                서비스 약관
              </a>
              과{' '}
              <a href="#" className="text-blue-600 hover:underline">
                개인정보보호정책
              </a>
              에 동의하는 것입니다.
            </p>
          </div>

          {/* 보안 알림 */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 leading-relaxed">
              🔒 <strong>보안 안내:</strong> 당신의 비밀번호는 안전하게 보호됩니다.
              또와드는 Google 계정으로 안전하게 인증합니다.
            </p>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <span className="text-gray-500">
              Google 계정으로 자동 가입됩니다
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
