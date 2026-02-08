import React from 'react';
import { cn } from '@/app/lib/utils';

interface RunnerControlsProps {
    isRunning: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
    isLastExercise: boolean;
    isLastRound: boolean;
    isFirstLevel: boolean;
    themeColor: string;
    className?: string;
}

export function RunnerControls({
    isRunning,
    onTogglePlay,
    onNext,
    onPrev,
    onFinish,
    isLastExercise,
    isLastRound,
    isFirstLevel,
    themeColor,
    className
}: RunnerControlsProps) {
    const isWorkoutComplete = isLastRound && isLastExercise;

    return (
        <div className={cn("flex items-center justify-center gap-6 w-full", className)}>
            {/* Previous Button (Left) */}
            <button
                onClick={onPrev}
                disabled={isFirstLevel}
                className={cn(
                    "w-14 h-14 rounded-full bg-black flex items-center justify-center active:scale-95 transition-all",
                    isFirstLevel ? "opacity-20 pointer-events-none" : "opacity-100"
                )}
                aria-label="Previous Exercise"
            >
                {/* Skip Backward Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 20L9 12L19 4V20Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 19V5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Play/Pause Button (Center, Large) */}
            <button
                onClick={onTogglePlay}
                className="w-[88px] h-[88px] rounded-full bg-[#010101] flex items-center justify-center active:scale-95 transition-transform relative overflow-hidden group"
                aria-label={isRunning ? "Pause" : "Play"}
            >
                {/* Colored Overlay on Hover/Active could be added here if needed, but keeping it simple/premium black for now */}

                {isRunning ? (
                    // Pause Icon (Double Bar)
                    <div className="flex gap-1">
                        <div className="w-3 h-[30px] rounded-[3px]" style={{ backgroundColor: themeColor }}></div>
                        <div className="w-3 h-[30px] rounded-[3px]" style={{ backgroundColor: themeColor }}></div>
                    </div>
                ) : (
                    // Play Icon (Triangle)
                    <div className="ml-2">
                        <svg width="30" height="34" viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M28.5 15.4019C30.5 16.5566 30.5 19.4434 28.5 20.5981L3 35.3205C1 36.4752 -1.58686e-06 35.0318 -1.48596e-06 32.7224L-1.98774e-07 3.27757C-9.78284e-08 0.968168 2 -0.475241 4 0.679493L28.5 15.4019Z" fill={themeColor} />
                        </svg>
                    </div>
                )}
            </button>

            {/* Next Button (Right) - Always visible, handles finish on last step */}
            <button
                onClick={onNext}
                disabled={!isRunning}
                className={cn(
                    "w-14 h-14 rounded-full bg-black flex items-center justify-center active:scale-95 transition-all",
                    !isRunning ? "opacity-20 pointer-events-none" : "opacity-100"
                )}
                aria-label={isWorkoutComplete ? "Finish Workout" : "Next Exercise"}
            >
                {/* Skip Forward Icon (Music Player Style) */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4L15 12L5 20V4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
