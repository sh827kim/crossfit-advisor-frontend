'use client';

import { ReactNode } from 'react';

interface CarePageLayoutProps {
    title: string;
    subtitle: string;
    description: string;
    onBack: () => void;
    children: ReactNode;
    bottomControls?: ReactNode;
}

export function CarePageLayout({
    title,
    subtitle,
    description,
    onBack,
    children,
    bottomControls
}: CarePageLayoutProps) {
    return (
        <main className="flex flex-col h-screen bg-black text-white">
            {/* 헤더 섹션 */}
            <div className="flex-shrink-0 px-4 pt-4 pb-6">
                <button
                    onClick={onBack}
                    aria-label="이전으로"
                    type="button"
                    className="w-11 h-11 mb-4 flex items-center justify-center text-white/80 hover:text-white transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                    <i aria-hidden="true" className="fa-solid fa-angle-left text-2xl"></i>
                </button>
                <h1 className="text-3xl font-black text-white">{title}</h1>
                <h2 className="text-3xl font-black text-white">{subtitle}</h2>
                <p className="text-xs text-gray-500 font-medium mt-2">{description}</p>
            </div>

            {/* Main Content Area */}
            {children}

            {/* Bottom Controls Area */}
            {bottomControls}
        </main>
    );
}
