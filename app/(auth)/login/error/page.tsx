'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * 로그인 오류 페이지
 * 로그인 실패 시 사용자에게 오류 메시지를 표시합니다.
 */
export default function LoginErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, { title: string; description: string }> = {
    signin_failed: {
      title: '로그인 실패',
      description:
        '로그인 중에 오류가 발생했습니다. 다시 시도해주세요.',
    },
    server_error: {
      title: '서버 오류',
      description:
        '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
    invalid_token: {
      title: '잘못된 토큰',
      description: 'Google 토큰이 유효하지 않습니다. 다시 로그인해주세요.',
    },
    network_error: {
      title: '네트워크 오류',
      description:
        '네트워크 연결을 확인하고 다시 시도해주세요.',
    },
    access_denied: {
      title: '접근 거부',
      description:
        '로그인이 거부되었습니다. 권한 설정을 확인하고 다시 시도해주세요.',
    },
    unknown_error: {
      title: '알 수 없는 오류',
      description: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
    },
  };

  const errorInfo =
    errorMessages[error as string] ||
    errorMessages.unknown_error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {errorInfo.title}
            </h1>
          </div>

          {/* 오류 메시지 */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-center">
              {errorInfo.description}
            </p>

            {/* 상세 오류 코드 */}
            {error && (
              <p className="text-xs text-red-600 text-center mt-2 font-mono">
                오류 코드: {error}
              </p>
            )}
          </div>

          {/* 행동 버튼 */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium text-center transition"
            >
              다시 로그인하기
            </Link>

            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 font-medium text-center transition"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* 도움말 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              문제가 계속되면 다시 시도하거나 홈으로 돌아가세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
