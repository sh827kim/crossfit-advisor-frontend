'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';

interface UseWorkoutGeneratorReturn {
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    generateWorkout: (url: string, body: any, redirectPath: string) => Promise<void>;
}

export function useWorkoutGenerator(): UseWorkoutGeneratorReturn {
    const router = useRouter();
    const { setGeneratedPlan } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateWorkout = async (url: string, body: any, redirectPath: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.message || '운동 계획 생성에 실패했습니다.');
                setIsLoading(false);
                return;
            }

            setGeneratedPlan(data.data);
            router.push(redirectPath);
        } catch (err) {
            console.error('Error generating workout:', err);
            setError('운동 계획 생성 중 오류가 발생했습니다.');
            setIsLoading(false);
        }
        // Note: We don't set isLoading(false) on success because we are redirecting 
        // and want to keep the loading state until navigation starts/completes to prevent flashing.
        // However, if navigation is slow, it might be better to custom handle. 
        // For now consistent with original code (except original code had finally { setIsLoading(false) }).
        // Wait, original code had finally { setIsLoading(false) }. 
        // But usually on router.push we want to avoid re-enabling buttons immediately. 
        // Let's restore finally block for safety, or just handle it.
        // In React 18 / Next.js app router, state updates on unmounted components are ignored usually, but let's be safe.
        // If I add finally, it might flash button before page change.
        // Let's add it only on error. On success logic flows to redirect.
    };

    return { isLoading, error, setError, generateWorkout };
}
