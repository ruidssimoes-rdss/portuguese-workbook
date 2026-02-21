"use client";

interface PracticeProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function PracticeProgressBar({ current, total, className = "" }: PracticeProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  return (
    <div className={`h-1.5 bg-gray-100 rounded-full overflow-hidden ${className}`} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div
        className="h-full bg-[#111827] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
