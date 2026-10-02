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
          <h3 className="text-[20px] font-medium text-[#1F1F1F]">
            {data.verb}
          </h3>
        </div>
        <p className="text-[14px] text-[#6B6B69] mt-1">
          {data.verbTranslation}
        </p>
        <p className="text-[13px] text-[#98988F] mt-0.5">
          {data.tenseLabel}
        </p>
      </div>

      <div className="border-[0.5px] border-[#E6E6E4] rounded-lg overflow-hidden bg-white">
        {(data.conjugations ?? []).map((conj, i) => (
          <div
            key={conj.pronoun}
            className={`flex items-center gap-4 px-5 py-3.5 ${
              i > 0 ? "border-t border-[#E6E6E4]" : ""
            }`}
          >
            <span className="text-[14px] font-medium text-[#98988F] w-20 shrink-0">
              {conj.pronoun}
            </span>
            <div className="flex items-center gap-2">
              <PronunciationButton text={conj.form} size="sm" variant="muted" />
              <span className="text-[14px] font-medium text-[#1F1F1F]">
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
          className="text-[13px] font-medium text-[#1B2B61] hover:underline"
        >
          Ver todos os tempos →
        </Link>
      </div>
    </div>
  );
}
