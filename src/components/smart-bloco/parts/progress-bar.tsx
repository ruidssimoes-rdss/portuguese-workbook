import type { BlocoProgress } from "../smart-bloco.types";

interface ProgressBarProps {
  progress: BlocoProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { percent, isLocked } = progress;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full">
      <div
        className="w-full h-[8px] rounded-[var(--bloco-radius-pill)] overflow-hidden"
        style={{ backgroundColor: "var(--color-bloco-border-track)" }}
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-[var(--bloco-radius-pill)] transition-all duration-300"
          style={{
            width: `${clampedPercent}%`,
            backgroundColor: isLocked
              ? "rgba(119, 149, 232, 0.1)"
              : "var(--color-bloco-progress)",
          }}
        />
      </div>
      <div className="flex justify-end mt-[8px]">
        <span className="font-[family-name:var(--font-sans)] text-[13px] font-normal text-[var(--color-bloco-text-muted)]">
          {clampedPercent}%
        </span>
      </div>
    </div>
  );
}
