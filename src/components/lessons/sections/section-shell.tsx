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
        <p className="text-[10px] text-[#98988F] uppercase tracking-[0.05em] mb-1">
          Secção {sectionIndex + 1} de {totalSections}
        </p>
        <h2 className="text-[18px] font-medium text-[#1F1F1F]">
          {sectionNamePt}
        </h2>
        {showEnglish && sectionNameEn && (
          <p className="text-[13px] text-[#98988F]">{sectionNameEn}</p>
        )}

        {/* Progress bar */}
        <div className="h-1.5 bg-[#E6E6E4] rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#1B2B61] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="border-[0.5px] border-[#E6E6E4] mb-6" />

      {/* Section content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-[#E6E6E4]">
        {state === "answering" && (
          <button
            type="button"
            onClick={onVerify}
            disabled={!canVerify}
            className={`w-full py-3.5 text-[14px] font-medium rounded-lg transition-all ${
              canVerify
                ? "bg-[#1B2B61] text-white hover:bg-[#14214C] cursor-pointer"
                : "bg-[#F7F7F6] text-[#98988F] cursor-not-allowed"
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
              <p className="text-[14px] font-medium text-[#1F1F1F]">
                {score.correct} de {score.total} corretas
                {showEnglish && (
                  <span className="text-[12px] text-[#98988F] ml-2">
                    ({score.correct} of {score.total} correct)
                  </span>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2 bg-[#1B2B61] text-white text-[13px] font-medium rounded-lg hover:bg-[#14214C] transition-colors cursor-pointer"
            >
              {sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
