"use client";

import Link from "next/link";
import { PronunciationButton } from "@/components/pronunciation-button";
import type { GrammarLearnData } from "@/lib/exercise-generator";

interface GrammarLearnProps {
  data: GrammarLearnData;
}

export function GrammarLearn({ data }: GrammarLearnProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-[18px] font-medium text-[#111111]">
          {data.topicTitle}
        </h3>
        <p className="text-[14px] text-[#6C6B71] italic mt-0.5">
          {data.topicTitlePt}
        </p>
      </div>

      {/* Rules */}
      <div className="space-y-4 mb-6">
        {data.rules.map((rule, i) => (
          <div
            key={i}
            className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5 bg-white"
          >
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#185FA5] text-white text-[13px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-medium text-[#111111]">
                  {rule.rule}
                </p>
                {rule.rulePt && (
                  <p className="text-[13px] text-[#6C6B71] italic mt-1">
                    {rule.rulePt}
                  </p>
                )}
              </div>
            </div>

            {/* Examples */}
            {rule.examples.length > 0 && (
              <div className="mt-4 ml-10 space-y-2">
                {rule.examples.map((ex, j) => (
                  <div
                    key={j}
                    className="border-l-2 border-[#185FA5]/20 pl-4 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <PronunciationButton text={ex.pt} size="sm" variant="muted" />
                      <p className="text-[14px] font-medium text-[#111111]">
                        {ex.pt}
                      </p>
                    </div>
                    <p className="text-[13px] text-[#9B9DA3] mt-0.5 ml-7">
                      {ex.en}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      {data.tipsPt.length > 0 && (
        <div className="bg-[#FAEEDA] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-4 mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#854F0B] mb-2">
            Dica
          </p>
          {data.tipsPt.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#854F0B]">
              {tip}
            </p>
          ))}
        </div>
      )}

      {/* Deep link */}
      <Link
        href={`/grammar/${data.topicSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[13px] font-medium text-[#185FA5] hover:underline"
      >
        Aprofundar: {data.topicTitle} →
      </Link>
    </div>
  );
}
