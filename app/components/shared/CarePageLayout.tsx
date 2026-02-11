'use client';

import { ReactNode } from 'react';

interface CarePageLayoutProps {
    title: string;
    subtitle: string;
    description: string;
    onBack: () => void;
    children: ReactNode;
    bottomControls?: ReactNode;
    overlayNode?: ReactNode;
}

export function CarePageLayout({
    title,
    subtitle,
    description,
    onBack,
    children,
    bottomControls,
    overlayNode
}: CarePageLayoutProps) {
    return (
        <div className="flex flex-col h-full bg-black text-white relative">
            {/* 헤더 섹션 - z-index 제거하여 버튼의 z-50이 글로벌하게(혹은 상위 컨텍스트에서) 동작하도록 함. */
                /* 단, main이 relative이므로 그 안에서의 순서가 중요. */
                /* Overlay가 fixed이므로, fixed인 Overlay(z-40)보다 높으려면 버튼이 z-50이어야 함. */
                /* relative 부모(z-10)가 있으면 그 안의 z-50은 부모의 z-10 레벨에 갇힘. */
                /* 따라서 부모의 z-index를 제거함. */
            }
            <div className="flex-shrink-0 px-4 pt-4 pb-6 relative">
                <button
                    onClick={onBack}
                    aria-label="이전으로"
                    type="button"
                    className="w-11 h-11 mb-4 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 relative z-50"
                >
                    <i aria-hidden="true" className="fa-solid fa-angle-left text-2xl"></i>
                </button>
                <h1 className="text-3xl font-black text-white">{title}</h1>
                <h2 className="text-3xl font-black text-white">{subtitle}</h2>
                <p className="text-xs text-gray-500 font-medium mt-2">{description}</p>
            </div>

            {/* Main Content Area */}
            {children}

            {/* Overlay Area */}
            {overlayNode}

            {/* Bottom Controls Area */}
            {bottomControls}
        </div>
    );
}
