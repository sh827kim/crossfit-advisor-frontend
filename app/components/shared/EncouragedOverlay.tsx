import { ReactNode } from 'react';

interface EncouragedOverlayProps {
    label: string;
    title: string;
    themeColor: string;
}

export function EncouragedOverlay({
    label,
    title,
    themeColor
}: EncouragedOverlayProps) {
    // Interaction: Block clicks on grid (pointer-events-auto).
    // Layout: Label on line 1. Title on line 2.

    return (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col pt-[140px] px-6 animate-fadeIn pointer-events-auto cursor-default">
            {/* First Line: Label */}
            <span className="text-3xl font-black text-white block mb-1">
                {label}
            </span>

            {/* Second Line: Title */}
            <h1
                className="text-3xl font-black uppercase"
                style={{ color: themeColor }}
            >
                {title}
            </h1>
        </div>
    );
}
