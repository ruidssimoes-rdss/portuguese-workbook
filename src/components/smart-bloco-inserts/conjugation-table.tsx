"use client";

import { Volume2 } from "lucide-react";
import { CEFR_COLORS, type CEFRLevel } from "@/components/smart-bloco/smart-bloco.types";

// ── Types ────────────────────────────────────────────────

interface Conjugation {
  pronoun: string;
  form: string;
  example?: string;
  hasAudio?: boolean;
}

interface ConjugationTableProps {
  tense: string;
  tensePt?: string;
  cefrLevel?: CEFRLevel;
  /** Hide the tense header when already shown by SmartBloco shell */
  hideHeader?: boolean;
  conjugations: Conjugation[];
}

// ── ConjugationTable ─────────────────────────────────────

export function ConjugationTable({
  tense,
  tensePt,
  cefrLevel,
  hideHeader,
  conjugations,
}: ConjugationTableProps) {
  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-PT";
    u.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice =
      voices.find((v) => v.lang === "pt-PT") ??
      voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) u.voice = ptVoice;
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="flex flex-col gap-[12px]">
      {/* Header (hidden when SmartBloco already shows title) */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-[8px]">
            <span className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] text-[var(--color-bloco-text-muted)]">
              {tense}
            </span>
            {tensePt && (
              <span
                className="font-[family-name:var(--font-content)] text-[12px] font-normal italic"
                style={{ color: "var(--color-bloco-primary)" }}
              >
                {tensePt}
              </span>
            )}
          </div>
          {cefrLevel && (
            <span
              className="inline-flex items-center justify-center min-w-[40px] h-[24px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[12px] font-normal px-[10px]"
              style={{
                backgroundColor: `color-mix(in srgb, ${CEFR_COLORS[cefrLevel]} 10%, transparent)`,
                border: `0.8px solid ${CEFR_COLORS[cefrLevel]}`,
                color: CEFR_COLORS[cefrLevel],
              }}
            >
              {cefrLevel}
            </span>
          )}
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col">
        {conjugations.map((conj) => (
          <div
            key={conj.pronoun}
            className="flex items-center min-h-[36px] py-[4px] transition-colors duration-150 motion-reduce:transition-none hover:bg-[rgba(0,0,0,0.02)]"
            style={{
              borderBottom: "1px solid var(--color-bloco-border-divider)",
            }}
          >
            {/* Audio */}
            {conj.hasAudio && (
              <button
                onClick={() => speak(`${conj.pronoun} ${conj.form}`)}
                className="shrink-0 mr-[8px] text-[var(--color-bloco-primary)] opacity-50 hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                aria-label={`Play pronunciation for ${conj.pronoun} ${conj.form}`}
                type="button"
              >
                <Volume2 size={14} />
              </button>
            )}

            {/* Pronoun */}
            <span className="w-[80px] shrink-0 font-[family-name:var(--font-sans)] text-[14px] font-normal text-[var(--color-bloco-text-muted)]">
              {conj.pronoun}
            </span>

            {/* Form */}
            <span className="w-[100px] shrink-0 font-[family-name:var(--font-sans)] text-[13px] font-bold text-[var(--color-bloco-text)]">
              {conj.form}
            </span>

            {/* Example */}
            {conj.example && (
              <span className="flex-1 text-right font-[family-name:var(--font-sans)] text-[13px] font-normal italic text-[var(--color-bloco-text-secondary)] hidden sm:block">
                {conj.example}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
