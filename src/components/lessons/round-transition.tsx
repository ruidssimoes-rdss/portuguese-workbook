"use client";

interface RoundTransitionProps {
  title: string;
  englishTitle?: string;
  subtitle: string;
  englishSubtitle?: string;
  buttonText: string;
  onContinue: () => void;
}

export function RoundTransition({
  title,
  englishTitle,
  subtitle,
  englishSubtitle,
  buttonText,
  onContinue,
}: RoundTransitionProps) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full mb-4">
        <div className="w-2 h-2 rounded-full bg-[#003399]" />
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {title}
        </span>
      </div>
      {englishTitle && (
        <p className="text-[13px] text-[var(--text-muted)] mb-2">{englishTitle}</p>
      )}
      <p className="text-[15px] text-[var(--text-secondary)] max-w-sm mx-auto mb-1">
        {subtitle}
      </p>
      {englishSubtitle && (
        <p className="text-[13px] text-[var(--text-muted)] max-w-sm mx-auto mb-6">{englishSubtitle}</p>
      )}
      {!englishSubtitle && <div className="mb-5" />}
      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-3 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:opacity-90 transition-opacity cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  );
}
