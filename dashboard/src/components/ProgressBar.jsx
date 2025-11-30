import { useEffect, useState } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function ProgressBar({
    progress = 0,           // 0-100
    estimatedMs = 3000,     // Estimated total time in ms
    elapsedMs = 0,          // Time elapsed in ms
    status = 'Processing...' // Current status text
}) {
    const [remainingTime, setRemainingTime] = useState('');

    useEffect(() => {
        const remaining = Math.max(0, estimatedMs - elapsedMs);
        const seconds = Math.ceil(remaining / 1000);

        if (seconds < 1) {
            setRemainingTime('Almost done...');
        } else if (seconds === 1) {
            setRemainingTime('~1 second remaining');
        } else {
            setRemainingTime(`~${seconds} seconds remaining`);
        }
    }, [estimatedMs, elapsedMs]);

    return (
        <div className="glass rounded-2xl p-6 border border-purple-500/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                        <div className="absolute inset-0 blur-sm bg-purple-400/50 animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {remainingTime}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <div
                    className={clsx(
                        "h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 transition-all duration-300 ease-out",
                        "shadow-lg shadow-purple-500/50"
                    )}
                    style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s linear infinite'
                    }}
                />

                {/* Glow effect */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"
                    style={{
                        width: `${Math.min(progress, 100)}%`,
                        transition: 'width 0.3s ease-out'
                    }}
                />
            </div>

            {/* Percentage */}
            <div className="mt-3 text-center">
                <span className="text-2xl font-bold gradient-text">
                    {Math.round(progress)}%
                </span>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
