interface RoundTargetInfoProps {
    duration: number;
    rounds: number;
    currentRound: number;
}

export function RoundTargetInfo({ duration, rounds, currentRound }: RoundTargetInfoProps) {
    const getRoundTargetTime = () => {
        const totalSeconds = duration * 60;
        const roundSeconds = Math.floor(totalSeconds / (rounds || 1));
        const m = Math.floor(roundSeconds / 60);
        const s = roundSeconds % 60;
        return `${m}분 ${s > 0 ? `${s}초` : ''}`;
    };

    return (
        <div className="w-full">
            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 mb-6"></div>

            {/* Round Target Time */}
            <div className="text-left mb-2 pl-2 flex items-center gap-2">
                <p className="text-xl font-bold text-white uppercase tracking-wider">
                    1라운드당 목표
                </p>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-white">
                        {getRoundTargetTime()}
                    </p>
                    <p className="text-xl font-bold text-gray-500">
                        ({currentRound}/{rounds || 1})
                    </p>
                </div>
            </div>
        </div>
    );
}
