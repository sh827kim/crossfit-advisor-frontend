'use client';

import { CareTimeSelector } from '@/app/components/CareTimeSelector';

interface CareBottomPanelProps {
    selectedTime: number;
    onTimeChange: (time: number) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    error: string | null;
    buttonText: string;
    themeColor: string; // Hex color for button/accents
    gradientOverlay?: string; // Optional custom gradient override
}

export function CareBottomPanel({
    selectedTime,
    onTimeChange,
    onGenerate,
    isGenerating,
    error,
    buttonText,
    themeColor,
    gradientOverlay
}: CareBottomPanelProps) {
    // Convert hex to rgb for opacity handling if needed, or just use themeColor directly.
    // Assuming themeColor is a valid CSS color string.

    return (
        <div className="flex-shrink-0 relative w-full mt-auto">
            <div className="absolute top-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-transparent to-black pointer-events-none"></div>

            <div className="w-full bg-[#1F1F1F] rounded-t-[32px] border-t border-white/10 shadow-[0_-6px_44px_rgba(0,0,0,0.8)] relative overflow-hidden pb-6 pt-2">
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: gradientOverlay || `linear-gradient(121deg, ${themeColor}20 0%, rgba(10, 10, 10, 0.2) 100%)` }}
                ></div>

                <div className="relative z-10 flex flex-col items-center">
                    <CareTimeSelector value={selectedTime} onChange={onTimeChange} />

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="px-4 py-2 mb-2 w-full max-w-xs bg-red-900/50 border border-red-700/50 rounded-lg text-xs text-red-200 text-center">
                            {error}
                        </div>
                    )}

                    <div className="px-6 w-full max-w-sm mt-2">
                        <button
                            onClick={onGenerate}
                            disabled={isGenerating}
                            className="w-full h-[58px] text-black font-extrabold rounded-2xl transition-all active:scale-95 text-[17px] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-lg"
                            style={{
                                backgroundColor: themeColor,
                                boxShadow: `0 10px 15px -3px ${themeColor}33` // 20% opacity approx for hex shorthand if simple, but here let's rely on solid color or rgba if passed. 
                                // Note: The original code used specific rgba shadows. Here we try to approximate or use valid CSS.
                                // To support transparency in shadow properly, themeColor should ideally be passed or we accept shadowColor.
                                // For now, let's keep it simple.
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                                    생성 중...
                                </>
                            ) : (
                                buttonText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
