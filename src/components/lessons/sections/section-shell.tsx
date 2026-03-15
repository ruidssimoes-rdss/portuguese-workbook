"use client";

interface SectionShellProps {
  sectionIndex: number;
  totalSections: number;
  sectionNamePt: string;
  sectionNameEn?: string;
  showEnglish: boolean;
  children: React.ReactNode;
  state: "answering" | "reviewed";
  onVerify: () => void;
  onNext: () => void;
  canVerify: boolean;
  score?: { correct: number; total: number };
}

export function SectionShell({
  sectionIndex,
  totalSections,
  sectionNamePt,
  sectionNameEn,
  showEnglish,
  children,
  state,
  onVerify,
  onNext,
  canVerify,
  score,
}: SectionShellProps) {
  const progress = ((sectionIndex + 1) / totalSections) * 100;

  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
          Secção {sectionIndex + 1} de {totalSections}
        </p>
        <h2 className="text-[18px] font-bold text-[var(--text-primary)]">
          {sectionNamePt}
        </h2>
        {showEnglish && sectionNameEn && (
          <p className="text-[13px] text-[var(--text-muted)]">{sectionNameEn}</p>
        )}

        {/* Progress bar */}
        <div className="h-1 bg-[var(--border-light)] rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#003399] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="border-t border-[var(--border-light)] mb-6" />

      {/* Section content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[var(--border-light)]">
        {state === "answering" && (
          <button
            type="button"
            onClick={onVerify}
            disabled={!canVerify}
            className={`w-full py-3.5 text-[15px] font-semibold rounded-[12px] transition-all ${
              canVerify
                ? "bg-[#003399] text-white hover:opacity-90 cursor-pointer"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            Verificar secção
            {showEnglish && (
              <span className="block text-[11px] font-normal opacity-75 mt-0.5">Check section</span>
            )}
          </button>
        )}

        {state === "reviewed" && (
          <div className="flex items-center justify-between">
            {score && (
              <p className="text-[14px] font-medium text-[var(--text-primary)]">
                {score.correct} de {score.total} corretas
                {showEnglish && (
                  <span className="text-[12px] text-[var(--text-muted)] ml-2">
                    ({score.correct} of {score.total} correct)
                  </span>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={onNext}
              className="px-8 py-3 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:opacity-90 transition-opacity cursor-pointer"
            >
              {sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
