import React from 'react';

interface TokenUsageIndicatorProps {
  tokenCount: number;
}

// Using a practical max for visualization; the actual model limit is much higher.
const VISUAL_MAX_TOKENS = 32768;

const TokenUsageIndicator: React.FC<TokenUsageIndicatorProps> = ({ tokenCount }) => {
    if (tokenCount === 0) {
        return <div className="h-2.5 w-full"></div>; // Render nothing or a placeholder if count is 0
    }

    const usage = Math.min((tokenCount / VISUAL_MAX_TOKENS) * 100, 100);

    let barColor = 'bg-green-500';
    if (usage > 85) {
        barColor = 'bg-red-500';
    } else if (usage > 60) {
        barColor = 'bg-yellow-500';
    }

    return (
        <div className="flex items-center gap-3 w-full">
            <div className="text-sm font-mono whitespace-nowrap text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-text)]">{tokenCount.toLocaleString()}</span> Tokens
            </div>
            <div className="w-full bg-[var(--color-surface)] rounded-full h-2.5 overflow-hidden">
                <div
                    className={`${barColor} h-2.5 rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${usage}%` }}
                    role="progressbar"
                    aria-valuenow={tokenCount}
                    aria-valuemin={0}
                    aria-valuemax={VISUAL_MAX_TOKENS}
                ></div>
            </div>
        </div>
    );
};

export default TokenUsageIndicator;
