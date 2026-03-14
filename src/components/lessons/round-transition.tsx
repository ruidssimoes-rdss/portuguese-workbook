"use client";

interface RoundTransitionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onContinue: () => void;
}

export function RoundTransition({
  title,
  subtitle,
  buttonText,
  onContinue,
}: RoundTransitionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-[24px] font-bold text-[var(--text-primary)] mb-3">
        {title}
      </h2>
      <p className="text-[15px] text-[var(--text-secondary)] max-w-md mb-8">
        {subtitle}
      </p>
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
