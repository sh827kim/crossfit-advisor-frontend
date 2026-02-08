'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ErrorType = 'NETWORK' | 'UNKNOWN';

interface ErrorContextType {
    showError: (type: ErrorType, onRetry?: () => void) => void;
    hideError: () => void;
    errorState: {
        isOpen: boolean;
        type: ErrorType | null;
        onRetry?: () => void;
    };
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [errorState, setErrorState] = useState<{
        isOpen: boolean;
        type: ErrorType | null;
        onRetry?: () => void;
    }>({
        isOpen: false,
        type: null,
    });

    const showError = useCallback((type: ErrorType, onRetry?: () => void) => {
        setErrorState({
            isOpen: true,
            type,
            onRetry,
        });
    }, []);

    const hideError = useCallback(() => {
        setErrorState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ErrorContext.Provider value={{ showError, hideError, errorState }}>
            {children}
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}
