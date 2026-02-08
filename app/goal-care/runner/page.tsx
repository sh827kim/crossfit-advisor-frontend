'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { cn } from '@/app/lib/utils';
import { RunnerIntro } from '@/app/components/shared/runner/RunnerIntro';
import { RunnerControls } from '@/app/components/shared/runner/RunnerControls';
import { RoundTargetInfo } from '@/app/components/shared/runner/RoundTargetInfo';

type Stage = 'intro' | 'countdown' | 'workout' | 'paused' | 'done';

export default function GoalRunnerPage() {
    const router = useRouter();
    const { generatedPlan, addWorkoutRecord } = useApp();
    const [stage, setStage] = useState<Stage>('intro');
    const [countdown, setCountdown] = useState(3);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [showQuitModal, setShowQuitModal] = useState(false);

    // Hydration fix: Date strings
    const [dateString, setDateString] = useState<string>('');
    const [dateTimeString, setDateTimeString] = useState<string>('');

    useEffect(() => {
        const now = new Date();
        setDateString(now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
        setDateTimeString(now.toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true }));
    }, []);

    const handleStartCountdown = () => {
        setStage('countdown');
    };

    const handleStartWorkout = () => {
        setStage('workout');
        setIsTimerRunning(true);
    };

    // Handlers for Quit/Finish
    const handleRequestFinish = () => {
        setIsTimerRunning(false);
        setShowQuitModal(true);
    };

    const handleConfirmFinish = () => {
        setShowQuitModal(false);
        setStage('done');
    };

    const handleCancelFinish = () => {
        setShowQuitModal(false);
        setIsTimerRunning(true);
    };

    const handleNextExercise = () => {
        if (!generatedPlan) return;

        // Exercise Loop
        if (currentExerciseIndex < generatedPlan.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            // Round Loop
            const totalRounds = generatedPlan.rounds || 1;
            if (currentRound < totalRounds) {
                setCurrentRound(prev => prev + 1);
                setCurrentExerciseIndex(0);
            } else {
                // All rounds finished
                setStage('done');
                setIsTimerRunning(false);
            }
        }
    };

    const handlePrevExercise = () => {
        if (!generatedPlan) return;

        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
        } else if (currentRound > 1) {
            setCurrentRound(prev => prev - 1);
            setCurrentExerciseIndex(generatedPlan.exercises.length - 1);
        }
    };

    // Timer Effect
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isTimerRunning]);

    // Countdown Effect
    useEffect(() => {
        if (stage === 'countdown') {
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleStartWorkout();
                        return 3;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [stage]);

    if (!generatedPlan) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                Loading...
            </div>
        );
    }

    // Format Timer
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSaveAndExit = async () => {
        if (!generatedPlan) return;

        try {
            console.log('Saving workout record...');
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            await addWorkoutRecord({
                id: crypto.randomUUID(),
                date: dateStr,
                duration: timer,
                exercises: generatedPlan.exercises.map(ex => ex.name),
                planId: 'goal-care-custom',
                mode: 'GOAL',
                rounds: currentRound
            } as any);
        } catch (e) {
            console.error(e);
        }
        router.push('/history');
    };

    // Theme Colors for Goal Care (Yellow)
    const THEME_COLOR = '#EEFD32'; // Yellow
    const THEME_DARK_COLOR = '#4A5500'; // Dark Yellow/Green
    const THEME_SHADOW = 'rgba(238, 253, 50, 0.5)';

    return (
        <main className="relative flex flex-col h-screen bg-black text-white overflow-hidden font-sans">

            {/* STAGE 1: INTRO */}
            {stage === 'intro' && (
                <RunnerIntro
                    title="목표 달성 운동"
                    plan={generatedPlan}
                    themeColor={THEME_COLOR}
                    themeDarkColor={THEME_DARK_COLOR}
                    themeShadow={THEME_SHADOW}
                    onStart={handleStartCountdown}
                    onBack={() => router.back()}
                />
            )}

            {/* STAGE 2: COUNTDOWN */}
            {stage === 'countdown' && (
                <div className="flex flex-col items-center justify-center h-full bg-black">
                    <div className="text-[160px] font-black animate-bounce-subtle font-barlow" style={{ color: THEME_COLOR }}>
                        {countdown}
                    </div>
                </div>
            )}

            {/* STAGE 3: WORKOUT */}
            {stage === 'workout' && (
                <div className="flex flex-col h-full p-6 relative" style={{ background: `linear-gradient(to bottom, #000000 0%, #000000 50%, ${THEME_COLOR} 100%)` }}>
                    {/* Header: X Button */}
                    <div className="absolute top-6 left-6 z-50">
                        <button
                            onClick={handleRequestFinish}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-white/20 transition"
                        >
                            <i className="fa-solid fa-xmark text-xl" />
                        </button>
                    </div>

                    <div className="w-full h-8"></div>

                    {/* Big Timer */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="text-[120px] font-bold text-white leading-none tracking-tight font-barlow">
                            {formatTime(timer)}
                        </div>
                    </div>

                    {/* Round Target Info */}
                    <div className="mb-12">
                        <RoundTargetInfo
                            duration={generatedPlan.duration}
                            rounds={generatedPlan.rounds || 1}
                            currentRound={currentRound}
                        />
                    </div>

                    {/* Exercise List */}
                    <div className="flex-1 flex flex-col items-center relative overflow-y-auto w-full no-scrollbar">
                        <div className="w-full pl-0 z-10 space-y-6 relative">
                            {/* Continuous Line */}
                            <div className="absolute left-[30px] top-[18px] bottom-[10px] w-[2px] z-0" style={{ backgroundColor: THEME_DARK_COLOR }}></div>

                            {generatedPlan.exercises.map((ex, idx) => {
                                const isActive = idx === currentExerciseIndex;
                                const isCompleted = idx < currentExerciseIndex;

                                return (
                                    <div key={idx} className={cn("flex items-center gap-6 relative transition-all duration-300")}>
                                        <div className={cn(
                                            "relative z-10 flex-shrink-0 w-[60px] flex justify-center transition-all duration-300"
                                        )}>
                                            <div
                                                className={cn(
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-lg transition-all",
                                                    isActive ? "" : "brightness-50"
                                                )}
                                                style={{ backgroundColor: THEME_COLOR, boxShadow: `0 0 10px ${THEME_SHADOW}` }}
                                            >
                                                {isCompleted ? <i className="fa-solid fa-check text-sm" /> : idx + 1}
                                            </div>
                                        </div>

                                        <div className={cn("flex flex-col transition-opacity duration-300", isActive ? "opacity-100" : "opacity-40")}>
                                            <span
                                                className={cn("text-xl font-bold leading-tight", isActive ? "" : "text-white")}
                                                style={{ color: isActive ? THEME_COLOR : undefined }}
                                            >
                                                {ex.name}
                                            </span>
                                            <span className="text-base text-gray-400 font-medium">
                                                {ex.minCount || 10} - {ex.maxCount || 15} {ex.unit || 'reps'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="mt-8 z-20 pb-8">
                        <RunnerControls
                            isRunning={isTimerRunning}
                            onTogglePlay={() => setIsTimerRunning(!isTimerRunning)}
                            onNext={handleNextExercise}
                            onPrev={handlePrevExercise}
                            onFinish={handleRequestFinish}
                            isLastExercise={currentExerciseIndex === generatedPlan.exercises.length - 1}
                            isLastRound={currentRound === (generatedPlan.rounds || 1)}
                            isFirstLevel={currentRound === 1 && currentExerciseIndex === 0}
                            themeColor={THEME_COLOR}
                        />
                    </div>

                    {/* Quit Confirmation Modal */}
                    {showQuitModal && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
                            <div className="w-[275px] bg-[#1F1F1F] border border-white/5 rounded-[32px] p-6 shadow-2xl flex flex-col items-center">
                                <h2 className="text-white text-[18px] font-bold text-center leading-[28px] mt-4 mb-8">
                                    운동을<br />종료하시겠습니까?
                                </h2>

                                <button
                                    onClick={handleConfirmFinish}
                                    className="w-full text-black font-bold h-[54px] rounded-2xl text-[15px] hover:brightness-110 active:scale-95 transition mb-3"
                                    style={{ backgroundColor: THEME_COLOR }}
                                >
                                    종료하기
                                </button>

                                <button
                                    onClick={handleCancelFinish}
                                    className="text-white font-bold text-[15px] opacity-80 hover:opacity-100 p-2"
                                >
                                    계속하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STAGE 5: DONE */}
            {stage === 'done' && (
                <div className="h-full flex flex-col items-center p-6 pt-12 overflow-y-auto" style={{ background: `linear-gradient(to bottom, #000000 70%, ${THEME_DARK_COLOR} 100%)` }}>
                    <h1 className="text-[32px] font-extrabold text-white text-center mb-2 leading-[40px]">
                        오늘도<br />수고많으셨습니다!
                    </h1>
                    <p className="text-white/60 text-sm font-bold mb-12">
                        {dateString}
                    </p>

                    <div className="relative w-full max-w-[325px] rounded-[32px] p-[3px] mb-8"
                        style={{
                            background: `conic-gradient(from 180deg at 50% 50%, 
                               #707070 0deg, 
                               #FFFFFF 45deg, 
                               #9E9E9E 110deg, 
                               #FFFFFF 160deg, 
                               #707070 210deg, 
                               #FFFFFF 260deg, 
                               #9E9E9E 310deg, 
                               #FFFFFF 360deg)`
                        }}
                    >
                        <div className="w-full h-[424px] rounded-[29px] flex flex-col items-start relative overflow-hidden bg-[#1F1F1F] px-8 py-8"
                            style={{ background: 'linear-gradient(134.49deg, rgba(238, 253, 50, 0.2) 3.24%, rgba(0, 0, 0, 0.2) 35.53%), #1F1F1F' }}>

                            <div className="relative z-10 flex flex-col items-start flex-1 w-full min-h-0">
                                <div className="flex flex-col items-start mb-4 flex-none">
                                    <div className="text-[60px] font-black text-white leading-none tracking-tight font-barlow">
                                        {formatTime(timer)}
                                    </div>
                                    <div className="text-[15px] font-bold text-white mt-1">운동시간</div>
                                </div>

                                <div className="w-full h-[1px] bg-white/10 mb-4 flex-none"></div>

                                <div className="text-left mb-4 flex-none">
                                    <h2 className="font-extrabold text-[15px] mb-1" style={{ color: THEME_COLOR }}>골 케어 운동</h2>
                                    <p className="text-[32px] font-black text-white font-barlow whitespace-nowrap">
                                        {generatedPlan.rounds || 1} Rounds Quality
                                    </p>
                                </div>

                                <div className="text-left mb-4 flex flex-col gap-1 flex-1 overflow-y-auto w-full no-scrollbar min-h-0">
                                    {generatedPlan.exercises.map((ex, i) => (
                                        <span key={i} className="text-white text-[15px] font-normal leading-relaxed flex-shrink-0">
                                            {ex.name}
                                        </span>
                                    ))}
                                </div>

                                <div className="text-left flex-none">
                                    <p className="text-white text-[13px] font-normal opacity-55">
                                        {dateTimeString}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full max-w-sm gap-4 items-center pb-8">
                        <button
                            onClick={handleSaveAndExit}
                            className="w-full text-black font-bold h-[58px] rounded-2xl shadow-xl active:scale-95 transition hover:brightness-110 text-[17px]"
                            style={{ backgroundColor: THEME_COLOR }}
                        >
                            기록하기
                        </button>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="text-white/80 font-bold text-[17px] hover:text-white transition"
                    >
                        처음으로 돌아가기
                    </button>
                </div>
            )}

        </main>
    );
}
