'use client';

import { ReactNode } from 'react';

interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    label: string;
    subLabel?: ReactNode; // Optional checkmark or other elements
    icon?: string; // FontAwesome icon class
    themeColor: string; // Hex color for active state
    children?: ReactNode; // Custom content if needed
}

export function SelectionCard({
    selected,
    onClick,
    label,
    subLabel,
    icon,
    themeColor,
    children
}: SelectionCardProps) {
    // We need to handle dynamic styles for border and shadow based on themeColor
    // Since we can't easily do hex-to-rgba in pure CSS without tailored functions, 
    // we might assume themeColor is valid. Ideally, we use style prop for colors.

    return (
        <button
            onClick={onClick}
            className={`relative w-full h-[60px] rounded-xl px-4 flex flex-row items-center transition-all border ${selected
                ? 'bg-[#1F1F1F]'
                : 'bg-[#1F1F1F] border-white/5 hover:border-white/20'
                }`}
            style={selected ? {
                borderColor: themeColor,
                boxShadow: `0 0 15px ${themeColor}4D` // ~30% alpha
            } : undefined}
        >
            {/* Icon */}
            <div className={`text-xl flex-shrink-0 ${selected ? 'opacity-100' : 'opacity-40'} ${icon ? 'w-8 text-center' : ''}`}>
                {icon ? <i className={`fa-solid ${icon}`} /> : children}
                {/* If children is provided as icon slot equivalent, render it. 
                 But usually children might be used for something else. 
                 Let's stick to icon prop or fallback to children if no icon.
             */}
            </div>

            <span
                className={`text-[15px] font-bold text-left ml-3 leading-tight truncate pr-6 ${selected ? '' : 'text-white/60'}`}
                style={selected ? { color: themeColor } : undefined}
            >
                {label}
            </span>

            {selected && (
                <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColor }}
                >
                    <i className="fa-solid fa-check text-black text-xs" />
                </div>
            )}

            {/* Render extra subLabel if needed (e.g. checkmark was passed as subLabel in original code?) 
            Actually original code had specific checkmark div. 
            We included checkmark above. subLabel might be used for other things.
        */}
            {subLabel}
        </button>
    );
}
