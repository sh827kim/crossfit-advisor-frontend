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
    // Layout: "FirstWord" on line 1. "RestWords Title" on line 2 (flex-wrap).

    const [firstWord, ...restWords] = label.split(' ');
    const restLabel = restWords.join(' ');

    return (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col pt-[140px] px-6 animate-fadeIn pointer-events-auto cursor-default">
            {/* First Line */}
            <span className="text-3xl font-black text-white block">
                {firstWord}
            </span>

            {/* Second Line Container */}
            <div className="flex flex-row flex-wrap items-baseline gap-x-3">
                {/* Rest of Label */}
                {restLabel && (
                    <span className="text-3xl font-black text-white">
                        {restLabel}
                    </span>
                )}

                {/* Title - Theme Color */}
                <h1
                    className="text-3xl font-black uppercase"
                    style={{ color: themeColor }}
                >
                    {title}
                </h1>
            </div>
        </div>
    );
}
