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
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-[24px] font-bold text-[var(--text-primary)] mb-1">
        {title}
      </h2>
      {englishTitle && (
        <p className="text-[14px] text-[var(--text-muted)] mb-3">{englishTitle}</p>
      )}
      {!englishTitle && <div className="mb-2" />}
      <p className="text-[15px] text-[var(--text-secondary)] max-w-md mb-1">
        {subtitle}
      </p>
      {englishSubtitle && (
        <p className="text-[13px] text-[var(--text-muted)] max-w-md mb-8">{englishSubtitle}</p>
      )}
      {!englishSubtitle && <div className="mb-7" />}
      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-3 bg-[#003399] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  );
}
