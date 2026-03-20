"use client";

import { Volume2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────

interface ExpressionQuote {
  pt: string;
  en: string;
}

interface ExpressionProps {
  meaning: string;
  usage?: string;
  quote: ExpressionQuote;
  hasAudio?: boolean;
}

// ── Expression ───────────────────────────────────────────

export function Expression({ meaning, usage, quote, hasAudio }: ExpressionProps) {
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
    <div className="flex flex-col gap-[16px]">
      {/* Meaning */}
      <div>
        <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] text-[var(--color-bloco-text-muted)] mb-[4px]">
          Meaning
        </p>
        <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-body)]">
          {meaning}
        </p>
      </div>

      {/* Usage */}
      {usage && (
        <div>
          <p className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] text-[var(--color-bloco-text-muted)] mb-[4px]">
            Usage
          </p>
          <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-body)]">
            {usage}
          </p>
        </div>
      )}

      {/* Quote */}
      <div
        className="rounded-[var(--bloco-radius-example)] p-[var(--bloco-example-padding)] border"
        style={{
          backgroundColor: "var(--color-bloco-surface-recessed)",
          borderColor: "var(--color-bloco-border-content)",
        }}
      >
        <div className="flex items-start justify-between gap-[8px]">
          <div className="flex-1">
            <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)]">
              &ldquo;{quote.pt}&rdquo;
            </p>
            <p
              className="font-[family-name:var(--font-content)] text-[12px] font-normal italic mt-[var(--bloco-example-gap)]"
              style={{ color: "var(--color-bloco-primary)" }}
            >
              {quote.en}
            </p>
          </div>
          {hasAudio && (
            <button
              onClick={() => speak(quote.pt)}
              className="shrink-0 flex items-center justify-center w-[40px] h-[24px] rounded-[var(--bloco-radius-badge)] cursor-pointer transition-colors duration-150"
              style={{
                backgroundColor: "rgba(22, 62, 164, 0.1)",
                border: "0.8px solid var(--color-bloco-primary)",
                color: "var(--color-bloco-primary)",
              }}
              aria-label="Play expression audio"
              type="button"
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
