'use client';

import { ReactNode } from 'react';

interface AlertDialogProps {
    isOpen: boolean;
    title: ReactNode;
    description: ReactNode;
    confirmText?: string;
    onConfirm: () => void;
    confirmColor?: string;
}

export function AlertDialog({
    isOpen,
    title,
    description,
    confirmText = '확인',
    onConfirm,
    confirmColor = '#f43000'
}: AlertDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
            <div className="w-[280px] bg-[#1F1F1F] border border-white/10 rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl">
                <h2 className="text-white text-[18px] font-bold leading-[26px] mb-3">
                    {title}
                </h2>
                <p className="text-[#888] text-[13px] mb-8 leading-relaxed">
                    {description}
                </p>

                <button
                    onClick={onConfirm}
                    className="w-full text-black font-bold h-[52px] rounded-2xl text-[15px] hover:brightness-110 active:scale-95 transition"
                    style={{ backgroundColor: confirmColor }}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    );
}
