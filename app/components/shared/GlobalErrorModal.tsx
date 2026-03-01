'use client';

import React from 'react';
import { useError } from '@/app/context/ErrorContext';

const NetworkErrorIcon = () => (
    <svg viewBox="165 305 60 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[60px] h-[50px]">
        <path d="M180.984 338.248L182.532 336.7C190.226 329.005 202.701 329.005 210.396 336.7L211.944 338.248M174.792 332.056L176.34 330.508C187.454 319.394 205.474 319.394 216.588 330.508L218.136 332.056M168.6 325.864L170.148 324.316C184.682 309.782 208.246 309.782 222.78 324.316L224.328 325.864M200.334 342.118C202.471 344.255 202.471 347.72 200.334 349.858C198.197 351.995 194.731 351.995 192.594 349.858C190.457 347.72 190.457 344.255 192.594 342.118C194.731 339.98 198.197 339.98 200.334 342.118Z" stroke="#F43000" strokeWidth="3.28" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CommonErrorIcon = () => (
    <svg viewBox="170 305 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[55px] h-[55px]">
        <path d="M197.197 334.61C195.823 334.61 195.096 333.783 195.062 332.376L194.798 320.928C194.798 320.763 194.781 320.564 194.781 320.432C194.781 318.91 195.724 318 197.213 318C198.686 318 199.612 318.91 199.612 320.432C199.612 320.564 199.612 320.763 199.595 320.928L199.347 332.376C199.298 333.783 198.57 334.61 197.197 334.61ZM197.197 342.65C195.691 342.65 194.5 341.509 194.5 340.053C194.5 338.597 195.691 337.455 197.197 337.455C198.702 337.455 199.893 338.597 199.893 340.053C199.893 341.509 198.702 342.65 197.197 342.65Z" fill="#F43000" />
        <circle cx="197" cy="330.5" r="22.5" stroke="#F43000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export function GlobalErrorModal() {
    const { errorState, hideError } = useError();

    if (!errorState.isOpen) return null;

    const { type, onRetry } = errorState;
    const isNetworkError = type === 'NETWORK';

    const message = isNetworkError
        ? '네트워크 연결에\n실패했습니다.'
        : '일시적인 오류가\n발생했습니다.';

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
        <div className="fixed inset-0 z-[100] bg-[#010101] flex flex-col items-center justify-center p-6 animate-fadeIn pb-24">
            {/* SVG Icon Space */}
            <div className="mb-8 mt-12">
                {isNetworkError ? <NetworkErrorIcon /> : <CommonErrorIcon />}
            </div>

            {/* Error Message */}
            <h2 className="text-white text-[20px] font-bold text-center leading-relaxed tracking-tight mb-12">
                {message.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </h2>

            {/* Action Button */}
            <button
                onClick={handleRetry}
                className="w-[100px] h-[52px] bg-white text-black font-extrabold text-[15px] rounded-full active:scale-95 transition flex items-center justify-center"
                style={{
                    boxShadow: '0px 4px 24px rgba(255, 255, 255, 0.15)'
                }}
            >
                재시도
            </button>
        </div>
    );
}
