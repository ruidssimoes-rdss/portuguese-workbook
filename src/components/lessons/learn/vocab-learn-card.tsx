"use client";

import { PronunciationButton } from "@/components/pronunciation-button";

interface VocabLearnCardProps {
  word: string;
  translation: string;
  pronunciation?: string;
  example?: { pt: string; en: string };
}

export function VocabLearnCard({
  word,
  translation,
  pronunciation,
  example,
}: VocabLearnCardProps) {
  return (
    <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)]">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PronunciationButton text={word} size="sm" variant="muted" />
          <p className="text-[24px] font-bold text-[var(--text-primary)]">{word}</p>
        </div>
        {pronunciation && (
          <p className="text-[13px] font-mono text-[var(--text-muted)]">{pronunciation}</p>
        )}
      </div>

      <p className="text-[16px] text-[var(--text-secondary)] text-center mb-4">
        {translation}
      </p>

      {example && (
        <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3 mt-4">
          <p className="text-[14px] font-medium text-[var(--text-primary)] italic">
            &ldquo;{example.pt}&rdquo;
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1">{example.en}</p>
        </div>
      )}
    </div>
  );
}
