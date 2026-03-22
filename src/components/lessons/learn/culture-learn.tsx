"use client";

import { PronunciationButton } from "@/components/pronunciation-button";
import type { CultureLearnData } from "@/lib/exercise-generator";

interface CultureLearnProps {
  data: CultureLearnData;
}

export function CultureLearn({ data }: CultureLearnProps) {
  return (
    <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white">
      <div className="flex items-start gap-3 mb-5">
        <PronunciationButton
          text={data.expression}
          size="sm"
          variant="muted"
          className="shrink-0 mt-0.5"
        />
        <p className="text-[20px] font-medium text-[#111111] italic leading-relaxed">
          &ldquo;{data.expression}&rdquo;
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-[#F7F7F5] rounded-lg px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3] mb-1">
            Significado
          </p>
          <p className="text-[14px] font-medium text-[#111111]">
            {data.meaning}
          </p>
        </div>

        {data.literal && (
          <div className="bg-[#F7F7F5] rounded-lg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3] mb-1">
              Tradução literal
            </p>
            <p className="text-[13px] text-[#6C6B71]">{data.literal}</p>
          </div>
        )}

        {data.tip && (
          <div className="bg-[#F7F7F5] rounded-lg px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3] mb-1">
              Quando usar
            </p>
            <p className="text-[13px] text-[#6C6B71]">{data.tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}
