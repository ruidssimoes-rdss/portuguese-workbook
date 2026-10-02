"use client";

import { useCallback } from "react";
import type { PronunciationBlockData, PronunciationVariant } from "@/types/blocks";

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
      className={`${sz} rounded-full bg-[#1B2B61] hover:bg-[#1B2B61]/90 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0`}
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
      <span className="text-[13px] text-[#98988F] italic">{data.phonetic}</span>
      {data.audioAvailable && <PlayButton text={data.word} size="sm" />}
    </span>
  );
}

function ExpandedVariant({ data, className }: { data: PronunciationBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[18px] font-medium text-[#1F1F1F]">{data.word}</p>
          <p className="text-[13px] text-[#6B6B69] mt-0.5">{data.translation}</p>
        </div>
        {data.audioAvailable && <PlayButton text={data.word} size="md" />}
      </div>

      <div className="mt-3 space-y-1">
        {data.ipa && (
          <p className="text-[14px] text-[#6B6B69] font-mono">{data.ipa}</p>
        )}
        <p className="text-[14px] text-[#98988F] italic">{data.phonetic}</p>
      </div>

      {data.soundCategory && (
        <span className="text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F7F7F6] text-[#6B6B69] mt-3 inline-block">
          {data.soundCategory}
        </span>
      )}

      {data.tips && data.tips.length > 0 && (
        <div className="bg-[#ECE8F8] border-[0.5px] border-[#E6E6E4] rounded-lg p-3 mt-3">
          <p className="text-[11px] font-medium uppercase text-[#5B45B8] mb-1">Pronunciation tip</p>
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#5B45B8]">{tip}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideVariant({ data, className }: { data: PronunciationBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white ${className ?? ""}`}>
      {data.soundCategory && (
        <p className="text-[16px] font-medium text-[#1F1F1F] mb-3">
          The &quot;{data.soundCategory}&quot; Sound
        </p>
      )}
      <div className="flex items-center gap-3 mb-3">
        <p className="text-[18px] font-medium text-[#1F1F1F]">{data.word}</p>
        {data.audioAvailable && <PlayButton text={data.word} size="md" />}
      </div>
      <p className="text-[14px] text-[#6B6B69] font-mono">{data.ipa}</p>
      <p className="text-[14px] text-[#98988F] italic mt-1">{data.phonetic}</p>
      <p className="text-[13px] text-[#6B6B69] mt-1">{data.translation}</p>

      {data.tips && data.tips.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#6B6B69]">{tip}</p>
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
