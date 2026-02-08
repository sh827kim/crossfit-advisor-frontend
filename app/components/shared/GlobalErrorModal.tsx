'use client';

import React from 'react';
import { useError } from '@/app/context/ErrorContext';
import { AlertDialog } from '@/app/components/shared/AlertDialog';

export function GlobalErrorModal() {
    const { errorState, hideError } = useError();

    const { isOpen, type, onRetry } = errorState;

    // Error messages and content
    // Spec:
    // 네트워크 에러 : "네트워크 연결에 실패했습니다. 다시 시도해 주세요."
    // 그 외 에러 : "일시적인 오류가 발생했습니다. 다시 시도해주세요"
    const isNetworkError = type === 'NETWORK';
    const title = isNetworkError ? '네트워크 오류' : '일시적 오류';
    const message = isNetworkError
        ? '네트워크 연결에 실패했습니다. 다시 시도해 주세요.'
        : '일시적인 오류가 발생했습니다. 다시 시도해주세요.';

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            // Default retry: Reload current page
            window.location.reload();
        }
        hideError();
    };

    return (
        <AlertDialog
            isOpen={isOpen}
            title={title}
            description={message}
            confirmText="다시 시도"
            onConfirm={handleRetry}
            confirmColor="#f43000"
        />
    );
}
