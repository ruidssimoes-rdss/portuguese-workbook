interface ProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  completed,
  total,
  showLabel = true,
  size = "sm",
  className,
}: ProgressBarProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const barHeight = size === "md" ? "h-2" : "h-1.5";

  return (
    <div className={`flex items-center gap-3${className ? ` ${className}` : ""}`}>
      <div
        className={`flex-1 ${barHeight} bg-[#F3F4F6] rounded-full overflow-hidden`}
      >
        <div
          className="h-full bg-[#111827] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[13px] font-medium text-[#9CA3AF] shrink-0">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}
