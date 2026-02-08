'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { useError } from '@/app/context/ErrorContext';

interface UseWorkoutGeneratorReturn {
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    generateWorkout: (url: string, body: any, redirectPath: string) => Promise<void>;
}

export function useWorkoutGenerator(): UseWorkoutGeneratorReturn {
    const router = useRouter();
    const { setGeneratedPlan } = useApp();
    const { showError } = useError();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateWorkout = useCallback(async (url: string, body: any, redirectPath: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                // Logical error from API
                setIsLoading(false);
                setError(data.message || '운동 계획 생성에 실패했습니다.');
                showError('UNKNOWN', () => generateWorkout(url, body, redirectPath));
                return;
            }

            setGeneratedPlan(data.data);
            router.push(redirectPath);
        } catch (err) {
            console.error('Error generating workout:', err);
            setIsLoading(false);
            setError('운동 계획 생성 중 오류가 발생했습니다.');

            // Determine error type
            // Fetch failures usually throw TypeError
            const isNetworkError = err instanceof TypeError;
            const errorType = isNetworkError ? 'NETWORK' : 'UNKNOWN';

            showError(errorType, () => generateWorkout(url, body, redirectPath));
        }
    }, [router, setGeneratedPlan, showError]);

    return { isLoading, error, setError, generateWorkout };
}
