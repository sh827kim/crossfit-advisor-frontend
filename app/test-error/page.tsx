'use client';

import React from 'react';
import { useError } from '@/app/context/ErrorContext';
import { useRouter, notFound } from 'next/navigation';

export default function TestErrorPage() {
    // Prevent access in production
    if (process.env.NODE_ENV === 'production') {
        notFound();
    }

    const { showError } = useError();
    const router = useRouter();

    const handleNetworkError = () => {
        showError('NETWORK', () => {
            alert('네트워크 오류 재시도 로직이 실행되었습니다! (실제로는 API 재호출 등)');
        });
    };

    const handleUnknownError = () => {
        showError('UNKNOWN', () => {
            alert('일시적 오류 재시도 로직이 실행되었습니다!');
        });
    };

    const handleDefaultRetryError = () => {
        // onRetry가 undefined이면 (기본 동작) 페이지 새로고침이 수행됨
        showError('UNKNOWN', undefined);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">에러 모달 테스트</h1>
            <p className="text-gray-600 mb-8 text-center max-w-sm">
                각 버튼을 클릭하여 정의된 에러 모달이 정상적으로 뜨는지,
                그리고 "다시 시도" 버튼 동작이 올바른지 확인하세요.
            </p>

            <button
                onClick={handleNetworkError}
                className="w-full max-w-xs px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition active:scale-95"
            >
                네트워크 에러 발생 (재시도: Alert)
            </button>

            <button
                onClick={handleUnknownError}
                className="w-full max-w-xs px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-sm hover:bg-red-700 transition active:scale-95"
            >
                일시적 에러 발생 (재시도: Alert)
            </button>

            <button
                onClick={handleDefaultRetryError}
                className="w-full max-w-xs px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow-sm hover:bg-gray-700 transition active:scale-95"
            >
                일시적 에러 (재시도: 새로고침)
            </button>

            <div className="mt-8 border-t border-gray-200 pt-8 w-full max-w-xs flex justify-center">
                <button
                    onClick={() => router.push('/')}
                    className="text-gray-500 hover:text-gray-900 underline text-sm"
                >
                    메인으로 돌아가기
                </button>
            </div>
        </div>
    );
}
