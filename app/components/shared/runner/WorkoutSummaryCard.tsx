import React, { forwardRef } from 'react';
import { cn } from '@/app/lib/utils';

interface Exercise {
    name: string;
    // other props can be added if needed for rendering
}

export interface WorkoutSummaryCardProps {
    mode: 'PART' | 'BALANCE' | 'GOAL';
    rounds: number;
    durationSeconds: number;
    dateString: string;
    exercises: Exercise[];
    theme: {
        color: string;
        gradientStart: string; // e.g., 'rgba(0, 220, 235, 0.2)'
        textColor?: string; // default is theme color
    };
    dateTimeString?: string;
}

export const WorkoutSummaryCard = forwardRef<HTMLDivElement, WorkoutSummaryCardProps>(
    ({ mode, rounds, durationSeconds, dateString, exercises, theme, dateTimeString }, ref) => {

        const formatTime = (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const getModeTitle = (mode: string) => {
            switch (mode) {
                case 'PART': return '파트 케어 운동';
                case 'BALANCE': return '밸런스 케어 운동';
                case 'GOAL': return '골 케어 운동';
                default: return '운동 완료';
            }
        };

        // Conic gradient border style
        const borderStyle = {
            background: `conic-gradient(from 180deg at 50% 50%, 
                #707070 0deg, 
                #FFFFFF 45deg, 
                #9E9E9E 110deg, 
                #FFFFFF 160deg, 
                #707070 210deg, 
                #FFFFFF 260deg, 
                #9E9E9E 310deg, 
                #FFFFFF 360deg)`
        };

        const cardBgStyle = {
            background: `linear-gradient(134.49deg, ${theme.gradientStart} 3.24%, rgba(0, 0, 0, 0.2) 35.53%), #1F1F1F`
        };

        return (
            <div
                ref={ref}
                className="relative w-full max-w-[325px] rounded-[32px] p-[3px] mb-8"
                style={borderStyle}
            >
                <div className="w-full h-[424px] rounded-[29px] flex flex-col items-start relative overflow-hidden bg-[#1F1F1F] px-8 py-8"
                    style={cardBgStyle}>

                    <div className="relative z-10 flex flex-col items-start flex-1 w-full min-h-0">
                        <div className="flex flex-col items-start mb-4 flex-none">
                            <div className="text-[60px] font-black text-white leading-none tracking-tight font-barlow">
                                {formatTime(durationSeconds)}
                            </div>
                            <div className="text-[15px] font-bold text-white mt-1">운동시간</div>
                        </div>

                        <div className="w-full h-[1px] bg-white/10 mb-4 flex-none"></div>

                        <div className="text-left mb-4 flex-none">
                            <h2 className="font-extrabold text-[15px] mb-1" style={{ color: theme.textColor || theme.color }}>
                                {getModeTitle(mode)}
                            </h2>
                            <p className="text-[32px] font-black text-white font-barlow whitespace-nowrap">
                                {rounds} Rounds Quality
                            </p>
                        </div>

                        <div className="text-left mb-4 flex flex-col gap-1 flex-1 overflow-y-auto w-full no-scrollbar min-h-0">
                            {exercises.map((ex, i) => (
                                <span key={i} className="text-white text-[15px] font-normal leading-relaxed flex-shrink-0">
                                    {ex.name}
                                </span>
                            ))}
                        </div>

                        {dateTimeString && (
                            <div className="text-left flex-none">
                                <p className="text-white text-[13px] font-normal opacity-55">
                                    {dateTimeString}
                                </p>
                            </div>
                        )}

                        {/* Watermark for shared image (optional, initially hidden or handle in CSS if needed only for capture) 
                            For now, keeping it simple as per original design. 
                        */}
                    </div>
                </div>
            </div>
        );
    }
);

WorkoutSummaryCard.displayName = 'WorkoutSummaryCard';
