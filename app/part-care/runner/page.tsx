'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { defineStepper } from '@/components/ui/stepper';
import { cn } from '@/app/lib/utils';

type Stage = 'intro' | 'countdown' | 'workout' | 'paused' | 'done';

export default function PartRunnerPage() {
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

    // Intro Stage Stepper
    const IntroStepper = useMemo(() => {
        if (!generatedPlan?.exercises) return null;

        const steps = generatedPlan.exercises.map((ex, idx) => ({
            id: ex.movementId || `ex-${idx}`,
            title: ex.name,
            description: `${ex.minReps || 10} - ${ex.maxReps || 15} reps`,
        }));

        return defineStepper(...steps);
    }, [generatedPlan]);

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

    if (!generatedPlan || !IntroStepper) {
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
                planId: 'part-care-custom',
                mode: 'PART',
                rounds: currentRound
            } as any);
        } catch (e) {
            console.error(e);
        }
        router.push('/history');
    };

    // Theme Colors for Part Care (Cyan)
    const THEME_COLOR = '#00DCEB'; // Cyan
    const THEME_DARK_COLOR = '#006B72'; // Dark Cyan
    const THEME_SHADOW = 'rgba(0, 220, 235, 0.5)';

    return (
        <main className="relative flex flex-col h-screen bg-black text-white overflow-hidden font-sans">

            {/* STAGE 1: INTRO */}
            {stage === 'intro' && (
                <div className="flex flex-col h-full p-6 animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 min-h-[28px]">
                        <div className="flex gap-2"></div>
                    </div>

                    {/* Rounds Quality Header */}
                    <div className="text-left mb-6 z-10 pl-2">
                        <h2 className="font-extrabold text-[20px] mb-2" style={{ color: THEME_COLOR }}>타겟 집중 운동</h2>
                        <p className="text-[40px] font-black italic text-white leading-none font-sf-pro mb-4">
                            {generatedPlan.rounds || 1} Rounds Quality
                        </p>

                        <div className="flex items-center gap-2">
                            <i className="fa-regular fa-clock text-white text-lg"></i>
                            <span className="text-white text-[15px] font-medium">
                                {generatedPlan.duration}분
                            </span>
                        </div>
                    </div>

                    {/* Stepper Content */}
                    <div className="flex-1 flex flex-col justify-center items-center relative">
                        <div className="w-full max-w-sm z-10 space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[17px] top-4 bottom-4 w-[2px] z-0" style={{ backgroundColor: THEME_DARK_COLOR }}></div>

                            <IntroStepper.Stepper.Provider
                                initialStep={generatedPlan.exercises[0]?.movementId || '0'}
                                variant="vertical"
                                indicatorClassName={`w-9 h-9 text-black font-bold italic`}
                                separatorClassName={`bg-[${THEME_DARK_COLOR}]`}
                                separatorCompletedClassName={`bg-[${THEME_DARK_COLOR}]`}
                            >
                                {() => (
                                    <div className="flex flex-col gap-6">
                                        {generatedPlan.exercises.map((ex, idx) => (
                                            <div key={idx} className="flex items-center gap-4 relative z-10">
                                                <div
                                                    className="relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-black font-black italic text-lg transition-all"
                                                    style={{ backgroundColor: THEME_COLOR, boxShadow: `0 0 10px ${THEME_SHADOW}` }}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-bold text-white leading-tight">{ex.name}</span>
                                                    <span className="text-sm text-gray-400 opacity-60 font-medium">
                                                        {ex.minReps || 10} - {ex.maxReps || 15} reps
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </IntroStepper.Stepper.Provider>
                        </div>
                    </div>

                    <div className="mt-4 pb-8">
                        <button
                            onClick={handleStartCountdown}
                            className="w-full text-black font-bold py-4 rounded-2xl text-lg transition active:scale-95 hover:brightness-110"
                            style={{ backgroundColor: THEME_COLOR }}
                        >
                            시작하기
                        </button>
                    </div>
                </div>
            )}

            {/* STAGE 2: COUNTDOWN */}
            {stage === 'countdown' && (
                <div className="flex flex-col items-center justify-center h-full bg-black">
                    <div className="text-[160px] font-black italic animate-bounce" style={{ color: THEME_COLOR }}>
                        {countdown}
                    </div>
                </div>
            )}

            {/* STAGE 3: WORKOUT */}
            {stage === 'workout' && (
                <div className="flex flex-col h-full bg-black p-6 relative">
                    {/* Header: Rounds Status */}
                    <div className="flex justify-between items-center z-10 mb-8">
                        <div className="text-white font-bold opacity-0">Placeholder</div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-sm tracking-widest uppercase" style={{ color: THEME_COLOR }}>ROUND</span>
                            <span className="text-white font-bold text-xl font-sf-pro italic">
                                {currentRound} <span className="text-gray-500 text-sm not-italic">/ {generatedPlan.rounds || 1}</span>
                            </span>
                        </div>
                        <div className="w-10"></div>
                    </div>

                    {/* Big Timer */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className="text-[80px] font-black text-white leading-none tracking-tight font-sf-pro">
                            {formatTime(timer)}
                        </div>
                    </div>

                    {/* Exercise List */}
                    <div className="flex-1 flex flex-col items-center relative overflow-y-auto w-full no-scrollbar">
                        <div className="w-full pl-0 z-10 space-y-6 relative">
                            {/* Continuous Line */}
                            <div className="absolute left-[30px] top-[18px] bottom-[30px] w-[2px] z-0" style={{ backgroundColor: THEME_DARK_COLOR }}></div>

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
                                                    "w-9 h-9 rounded-full flex items-center justify-center text-black font-black italic text-lg transition-all",
                                                    isActive ? "" : "brightness-50"
                                                )}
                                                style={{ backgroundColor: THEME_COLOR, boxShadow: `0 0 10px ${THEME_SHADOW}` }}
                                            >
                                                {isCompleted ? <i className="fa-solid fa-check text-sm" /> : idx + 1}
                                            </div>
                                        </div>

                                        <div className={cn("flex flex-col transition-opacity duration-300", isActive ? "opacity-100" : "opacity-40")}>
                                            <span
                                                className={cn("text-2xl font-bold leading-tight", isActive ? "" : "text-white")}
                                                style={{ color: isActive ? THEME_COLOR : undefined }}
                                            >
                                                {ex.name}
                                            </span>
                                            <span className="text-base text-gray-400 font-medium">
                                                {ex.minReps || 10} - {ex.maxReps || 15} reps
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Controls Area (Inline) */}
                    <div className="mt-6 z-20 flex gap-3 h-[72px]">
                        {isTimerRunning ? (
                            <>
                                {/* Pause Button */}
                                <button
                                    onClick={() => setIsTimerRunning(false)}
                                    className="w-[72px] h-full bg-[#333] hover:bg-[#444] rounded-2xl flex items-center justify-center transition active:scale-95"
                                >
                                    <i className="fa-solid fa-pause text-white text-2xl"></i>
                                </button>

                                {/* Next Button */}
                                <button
                                    onClick={handleNextExercise}
                                    className="flex-1 text-black font-bold rounded-2xl text-xl transition active:scale-95 shadow-lg"
                                    style={{ backgroundColor: THEME_COLOR, boxShadow: `0 10px 15px -3px ${THEME_SHADOW}` }}
                                >
                                    {(currentRound === (generatedPlan.rounds || 1) && currentExerciseIndex === generatedPlan.exercises.length - 1)
                                        ? '운동 완료'
                                        : '다음 운동'
                                    }
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Resume Button */}
                                <button
                                    onClick={() => setIsTimerRunning(true)}
                                    className="flex-1 text-black font-bold rounded-2xl text-xl transition active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                    style={{ backgroundColor: THEME_COLOR, boxShadow: `0 10px 15px -3px ${THEME_SHADOW}` }}
                                >
                                    <i className="fa-solid fa-play"></i>
                                    <span>재시작</span>
                                </button>

                                {/* Stop/Finish Button */}
                                <button
                                    onClick={handleRequestFinish}
                                    className="w-[72px] h-full bg-[#333] hover:bg-[#444] rounded-2xl flex items-center justify-center transition active:scale-95"
                                >
                                    <i className="fa-solid fa-flag-checkered text-white text-2xl"></i>
                                </button>
                            </>
                        )}
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
                <div className="h-full flex flex-col items-center p-6 pt-12 overflow-y-auto" style={{ background: `linear-gradient(to bottom, #000000, ${THEME_COLOR})` }}>
                    <h1 className="text-[32px] font-extrabold text-white text-center mb-2 leading-[40px]">
                        오늘도<br />수고많으셨습니다!
                    </h1>
                    <p className="text-white/60 text-sm font-bold mb-8">
                        {dateString}
                    </p>

                    <div className="relative w-full max-w-sm bg-[#1F1F1F] border border-white/10 rounded-[30px] h-[424px] pt-8 px-8 pb-8 overflow-hidden mb-8 shadow-2xl flex flex-col">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${THEME_COLOR}33, #00000033)` }}></div>

                        <div className="relative z-10 flex flex-col items-start flex-1 w-full min-h-0">
                            <div className="flex flex-col items-start mb-4 flex-none">
                                <div className="text-[72px] font-black text-white leading-none tracking-tight font-sf-pro">
                                    {formatTime(timer)}
                                </div>
                                <div className="text-[15px] font-bold text-white mt-1">운동시간</div>
                            </div>

                            <div className="w-full h-[1px] bg-white/10 mb-4 flex-none"></div>

                            <div className="text-left mb-4 flex-none">
                                <h2 className="font-extrabold text-[15px] mb-1" style={{ color: THEME_COLOR }}>파트 케어 운동</h2>
                                <p className="text-[32px] font-black text-white italic font-sf-pro whitespace-nowrap">
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

                    <div className="flex flex-col w-full max-w-sm gap-4 items-center pb-8">
                        <button
                            onClick={handleSaveAndExit}
                            className="w-full text-black font-bold h-[58px] rounded-2xl shadow-xl active:scale-95 transition hover:brightness-110 text-[17px]"
                            style={{ backgroundColor: THEME_COLOR }}
                        >
                            기록하기
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="text-white/80 font-bold text-[17px] hover:text-white transition"
                        >
                            처음으로 돌아가기
                        </button>
                    </div>
                </div>
            )}

        </main>
    );
}
