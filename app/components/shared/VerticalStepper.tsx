import React, { useState, useEffect } from 'react';
import { cn } from '@/app/lib/utils';

export interface StepItem {
    id: string;
    title: string;
    description: string;
}

interface VerticalStepperProps {
    steps: StepItem[];
    themeColor: string;
    themeDarkColor: string;
    themeShadow?: string;
    enableTextAnimation?: boolean;
}

export function VerticalStepper({
    steps,
    themeColor,
    themeDarkColor,
    themeShadow,
    enableTextAnimation = false
}: VerticalStepperProps) {
    const [animatingStepIndex, setAnimatingStepIndex] = useState<number>(enableTextAnimation ? -1 : steps.length);

    useEffect(() => {
        if (!enableTextAnimation) {
            setAnimatingStepIndex(steps.length);
            return;
        }

        setAnimatingStepIndex(-1);

        const timer = setInterval(() => {
            setAnimatingStepIndex(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                clearInterval(timer);
                return prev;
            });
        }, 500);

        return () => clearInterval(timer);
    }, [enableTextAnimation, steps.length]);

    return (
        <div className="flex flex-col gap-8 relative z-10 w-full">
            {steps.map((step, idx) => {
                const isHighlighted = idx <= animatingStepIndex;
                const isLast = idx === steps.length - 1;

                return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                        {/* Connecting Line (drawn for all except last item) */}
                        {!isLast && (
                            <div
                                className="absolute left-[17px] top-[18px] w-[2px] -z-10"
                                style={{
                                    backgroundColor: themeDarkColor,
                                    height: 'calc(100% + 32px)'
                                }}
                            />
                        )}

                        {/* Circle */}
                        <div
                            className={cn(
                                "relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-black font-bold text-lg transition-all z-10"
                            )}
                            style={{
                                backgroundColor: themeColor,
                                boxShadow: themeShadow ? `0 0 10px ${themeShadow}` : `0 0 10px ${themeColor}80`
                            }}
                        >
                            {idx + 1}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col pt-1">
                            <h3
                                className={cn(
                                    "text-xl font-bold transition-colors duration-500 leading-tight",
                                    enableTextAnimation
                                        ? (isHighlighted ? 'text-white' : 'text-gray-600')
                                        : 'text-white'
                                )}
                            >
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium whitespace-pre-line leading-relaxed mt-1 opacity-80">
                                {step.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
