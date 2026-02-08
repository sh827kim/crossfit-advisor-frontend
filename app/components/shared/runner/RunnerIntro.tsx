import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { VerticalStepper } from '@/app/components/shared/VerticalStepper';
import { TimeIcon } from '@/app/components/shared/icons/TimeIcon';
import { EquipmentIcon } from '@/app/components/shared/icons/EquipmentIcon';
import { analytics } from '@/app/lib/analytics';
import { cn } from '@/app/lib/utils';

interface Exercise {
    movementId?: string;
    name: string;
    minCount?: number | null;
    maxCount?: number | null;
    unit?: string;
    equipment?: string;
}

interface GeneratedPlan {
    rounds?: number;
    duration: number;
    exercises: Exercise[];
}

interface RunnerIntroProps {
    title: string;
    plan: GeneratedPlan;
    themeColor: string;
    themeDarkColor: string;
    themeShadow: string;
    onStart: () => void;
    onBack: () => void;
}

export function RunnerIntro({
    title,
    plan,
    themeColor,
    themeDarkColor,
    themeShadow,
    onStart,
    onBack
}: RunnerIntroProps) {

    // Equipment Translation
    const getEquipmentSummary = () => {
        const uniqueEquipment = Array.from(new Set(plan.exercises.map(ex => ex.equipment)))
            .filter((eq): eq is string => !!eq && eq !== 'BODYWEIGHT');

        if (uniqueEquipment.length === 0) return '맨몸';

        const equipmentMap: Record<string, string> = {
            'BAR': '철봉',
            'BAND': '밴드',
            'RINGS': '링',
            'BARBELL': '바벨',
            'BOX': '박스',
            'DUMBBELL': '덤벨',
            'KETTLEBELL': '케틀벨',
            'WALLBALL': '월볼',
            'WALL': '벽',
            'ASSAULT_BIKE': '어썰트 바이크',
            'ROWING': '로잉',
            'GHD': 'GHD'
        };

        return uniqueEquipment.map(eq => equipmentMap[eq] || eq).join(', ');
    };

    // Round Target Time Calculation
    const getRoundTargetTime = () => {
        const totalSeconds = plan.duration * 60;
        const roundSeconds = Math.floor(totalSeconds / (plan.rounds || 1));
        const m = Math.floor(roundSeconds / 60);
        const s = roundSeconds % 60;
        return `${m}분 ${s > 0 ? `${s}초` : ''} `;
    };

    const handleStart = () => {
        // Analytics
        const screenName = 'workout_ready';

        analytics.logEvent('click', {
            screen_name: screenName,
            event_category: 'start_workout',
            target: 'start_button',
            time_select: plan?.duration
        });

        onStart();
    };

    return (
        <div className="flex flex-col h-full p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 min-h-[28px]">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const screenName = 'workout_ready';

                            analytics.logEvent('click', {
                                screen_name: screenName,
                                event_category: 'header',
                                target: 'back'
                            });
                            onBack();
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition"
                    >
                        <i className="fa-solid fa-chevron-left text-white text-xl"></i>
                    </button>
                </div>
            </div>

            {/* Title & Summary */}
            <div className="text-left mb-6 z-10 pl-2">
                <h2 className="font-extrabold text-[20px] mb-2" style={{ color: themeColor }}>{title}</h2>
                <p className="text-[40px] font-black text-white leading-none font-barlow mb-6">
                    {plan.rounds || 1} Rounds Quality
                </p>

                <div className="flex flex-col gap-2">
                    {/* Total Time */}
                    <div className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                            <TimeIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-[16px] font-medium">
                            총 {plan.duration}분
                        </span>
                    </div>

                    {/* Equipment Summary */}
                    <div className="flex items-center gap-3">
                        <div className="w-6 flex justify-center">
                            <EquipmentIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-[16px] font-medium truncate">
                            {getEquipmentSummary()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 mb-6"></div>

            {/* Round Target Time */}
            <div className="text-left mb-2 pl-2 flex items-center gap-4">
                <p className="text-xl font-bold text-white uppercase tracking-wider">
                    1라운드당 목표
                </p>
                <p className="text-xl font-bold text-white">
                    {getRoundTargetTime()}
                </p>
            </div>

            {/* Stepper Content */}
            <div className="flex-1 flex flex-col items-center relative overflow-y-auto no-scrollbar mask-gradient-b">
                <div className="w-full max-w-sm z-10 space-y-8 relative pt-4 pb-4">
                    <VerticalStepper
                        steps={plan.exercises.map((ex, idx) => ({
                            id: ex.movementId || `ex - ${idx} `,
                            title: ex.name,
                            description: `${ex.minCount || 10} - ${ex.maxCount || 15} ${ex.unit || 'reps'} `
                        }))}
                        themeColor={themeColor}
                        themeDarkColor={themeDarkColor}
                        themeShadow={themeShadow}
                        enableTextAnimation={false}
                    />
                </div>
            </div>

            <div className="mt-4 pb-8 pt-4">
                <button
                    onClick={handleStart}
                    className="w-full text-black font-bold h-[62px] rounded-2xl text-[18px] hover:brightness-110 active:scale-95 transition shadow-lg relative z-20"
                    style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeShadow}` }}
                >
                    운동 시작하기
                </button>
            </div>
        </div>
    );
}
