"use client";

import Link from "next/link";
import { PronunciationButton } from "@/components/pronunciation-button";
import type { VerbLearnData } from "@/lib/exercise-generator";

interface VerbLearnProps {
  data: VerbLearnData;
}

export function VerbLearn({ data }: VerbLearnProps) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <PronunciationButton text={data.verb} size="sm" variant="muted" />
          <h3 className="text-[20px] font-bold text-[var(--text-primary)]">
            {data.verb}
          </h3>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">
          {data.verbTranslation}
        </p>
        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
          {data.tenseLabel}
        </p>
      </div>

      <div className="border border-[var(--border-primary)] rounded-[12px] overflow-hidden bg-[var(--bg-card)]">
        {(data.conjugations ?? []).map((conj, i) => (
          <div
            key={conj.pronoun}
            className={`flex items-center gap-4 px-5 py-3.5 ${
              i > 0 ? "border-t border-[var(--border-light)]" : ""
            }`}
          >
            <span className="text-[14px] font-medium text-[var(--text-muted)] w-20 shrink-0">
              {conj.pronoun}
            </span>
            <div className="flex items-center gap-2">
              <PronunciationButton text={conj.form} size="sm" variant="muted" />
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                {conj.form}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Link
          href={`/conjugations/${data.verbSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-[#003399] hover:underline"
        >
          Ver todos os tempos →
        </Link>
      </div>
    </div>
  );
}
