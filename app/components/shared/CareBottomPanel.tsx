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
    isDisabled?: boolean;
}

export function CareBottomPanel({
    selectedTime,
    onTimeChange,
    onGenerate,
    isGenerating,
    error,
    buttonText,
    themeColor,
    gradientOverlay,
    isDisabled = false
}: CareBottomPanelProps) {
    // Convert hex to rgb for opacity handling if needed, or just use themeColor directly.
    // Assuming themeColor is a valid CSS color string.

    return (
        <div className="flex-shrink-0 relative w-full mt-auto z-50">
            <div className="absolute top-[-30px] left-0 right-0 h-[30px] bg-gradient-to-b from-transparent to-black pointer-events-none"></div>

            <div className="w-full bg-[#1F1F1F] rounded-t-[32px] border-t border-white/10 shadow-[0_-6px_44px_rgba(0,0,0,0.8)] relative overflow-hidden pb-6 pt-2">
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: gradientOverlay || `linear-gradient(121deg, ${themeColor}20 0%, rgba(10, 10, 10, 0.2) 100%)` }}
                ></div>

                <div className="relative z-10 flex flex-col items-center pb-8">
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
                            disabled={isGenerating || isDisabled}
                            className={`w-full h-[58px] font-extrabold rounded-2xl transition-all text-[17px] flex justify-center items-center shadow-lg
                                ${isDisabled
                                    ? 'cursor-not-allowed'
                                    : 'active:scale-95 hover:brightness-110'
                                }
                                ${isGenerating ? 'opacity-80 cursor-wait' : ''}
                            `}
                            style={{
                                backgroundColor: isDisabled ? '#333333' : themeColor,
                                color: isDisabled ? '#717171' : '#000000',
                                boxShadow: isDisabled ? 'none' : `0 10px 15px -3px ${themeColor}33`
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
