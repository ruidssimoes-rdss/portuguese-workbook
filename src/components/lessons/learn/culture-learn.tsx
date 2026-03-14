"use client";

import { PronunciationButton } from "@/components/pronunciation-button";
import type { CultureLearnData } from "@/lib/exercise-generator";

interface CultureLearnProps {
  data: CultureLearnData;
}

export function CultureLearn({ data }: CultureLearnProps) {
  return (
    <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)]">
      <div className="flex items-start gap-3 mb-5">
        <PronunciationButton
          text={data.expression}
          size="sm"
          variant="muted"
          className="shrink-0 mt-0.5"
        />
        <p className="text-[20px] font-bold text-[var(--text-primary)] italic leading-relaxed">
          &ldquo;{data.expression}&rdquo;
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
            Significado
          </p>
          <p className="text-[15px] font-medium text-[var(--text-primary)]">
            {data.meaning}
          </p>
        </div>

        {data.literal && (
          <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Tradução literal
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">{data.literal}</p>
          </div>
        )}

        {data.tip && (
          <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Quando usar
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">{data.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
