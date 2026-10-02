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
    <div className="border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <PronunciationButton text={word} size="sm" variant="muted" />
          <p className="text-[24px] font-medium text-[#1F1F1F]">{word}</p>
        </div>
        {pronunciation && (
          <p className="text-[13px] font-mono text-[#98988F]">{pronunciation}</p>
        )}
      </div>

      <p className="text-[16px] text-[#6B6B69] text-center mb-4">
        {translation}
      </p>

      {example && (
        <div className="bg-[#F7F7F6] rounded-lg px-4 py-3 mt-4">
          <p className="text-[14px] font-medium text-[#1F1F1F] italic">
            &ldquo;{example.pt}&rdquo;
          </p>
          <p className="text-[12px] text-[#98988F] mt-1">{example.en}</p>
        </div>
      )}
    </div>
  );
}
