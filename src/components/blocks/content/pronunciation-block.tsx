"use client";

import { useCallback } from "react";
import type { PronunciationBlockData, PronunciationVariant } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

interface PronunciationBlockProps {
  data: PronunciationBlockData;
  variant?: PronunciationVariant;
  className?: string;
}

function PlayButton({ text, size = "sm" }: { text: string; size?: "sm" | "md" }) {
  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-PT";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const sz = size === "md" ? "w-8 h-8" : "w-6 h-6";

  return (
    <button
      onClick={speak}
      className={`${sz} rounded-full bg-[#003399] hover:bg-[#002277] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0`}
      aria-label={`Play "${text}"`}
    >
      <svg width={size === "md" ? 14 : 10} height={size === "md" ? 14 : 10} viewBox="0 0 14 14" fill="white">
        <path d="M3 2v10l9-5z" />
      </svg>
    </button>
  );
}

function InlineVariant({ data, className }: { data: PronunciationBlockData; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span className="text-[13px] text-[#9CA3AF] italic">{data.phonetic}</span>
      {data.audioAvailable && <PlayButton text={data.word} size="sm" />}
    </span>
  );
}

function ExpandedVariant({ data, className }: { data: PronunciationBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} ${className ?? ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[18px] font-semibold text-[#111827]">{data.word}</p>
          <p className="text-[13px] text-[#6B7280] mt-0.5">{data.translation}</p>
        </div>
        {data.audioAvailable && <PlayButton text={data.word} size="md" />}
      </div>

      <div className="mt-3 space-y-1">
        {data.ipa && (
          <p className="text-[14px] text-[#6B7280] font-mono">{data.ipa}</p>
        )}
        <p className="text-[14px] text-[#9CA3AF] italic">{data.phonetic}</p>
      </div>

      {data.soundCategory && (
        <span className={`${patterns.badge} bg-[#F3F4F6] text-[#6B7280] mt-3 inline-block`}>
          {data.soundCategory}
        </span>
      )}

      {data.tips && data.tips.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-3 mt-3">
          <p className="text-[11px] font-semibold uppercase text-amber-600 mb-1">Pronunciation tip</p>
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-amber-700">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideVariant({ data, className }: { data: PronunciationBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} ${className ?? ""}`}>
      {data.soundCategory && (
        <p className="text-[16px] font-semibold text-[#111827] mb-3">
          The &quot;{data.soundCategory}&quot; Sound
        </p>
      )}
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[18px] font-bold text-[#111827]">{data.word}</p>
        {data.audioAvailable && <PlayButton text={data.word} size="md" />}
      </div>
      <p className="text-[14px] text-[#6B7280] font-mono">{data.ipa}</p>
      <p className="text-[14px] text-[#9CA3AF] italic mt-1">{data.phonetic}</p>
      <p className="text-[13px] text-[#6B7280] mt-1">{data.translation}</p>

      {data.tips && data.tips.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#374151]">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function PronunciationBlock({ data, variant = "expanded", className }: PronunciationBlockProps) {
  switch (variant) {
    case "inline": return <InlineVariant data={data} className={className} />;
    case "expanded": return <ExpandedVariant data={data} className={className} />;
    case "guide": return <GuideVariant data={data} className={className} />;
  }
}
