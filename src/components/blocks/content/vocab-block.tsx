"use client";

import { useState } from "react";
import type { VocabBlockData, VocabVariant, FamiliarityState } from "@/types/blocks";
import { patterns, typography } from "@/lib/design-tokens";

interface VocabBlockProps {
  data: VocabBlockData;
  variant?: VocabVariant;
  className?: string;
}

const FAMILIARITY_LABEL: Record<FamiliarityState, { text: string; color: string }> = {
  new: { text: "New", color: "text-[#9CA3AF]" },
  learning: { text: "Learning", color: "text-blue-600" },
  known: { text: "Known", color: "text-emerald-600" },
  mastered: { text: "Mastered", color: "text-emerald-700" },
};

function CardVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <p className="text-[18px] font-semibold text-[#111827]">{data.word}</p>
          {data.gender && (
            <span className="text-[12px] text-[#9CA3AF]">
              ({data.gender === "masculine" ? "m." : "f."})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data.category && (
            <span className={`${patterns.badge} bg-[#F3F4F6] text-[#6B7280]`}>
              {data.category}
            </span>
          )}
          {data.familiarity && (
            <span className={`text-[11px] font-medium ${FAMILIARITY_LABEL[data.familiarity].color}`}>
              {FAMILIARITY_LABEL[data.familiarity].text}
            </span>
          )}
        </div>
      </div>
      <p className="text-[13px] text-[#6B7280] mt-1">{data.translation}</p>
      <p className="text-[12px] text-[#9CA3AF] italic mt-0.5">{data.pronunciation}</p>
      {data.example.pt && (
        <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
          <p className="text-[13px] text-[#111827]">{data.example.pt}</p>
          <p className="text-[13px] text-[#6B7280] italic mt-0.5">{data.example.en}</p>
        </div>
      )}
    </div>
  );
}

function RowVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-3 px-1 border-b border-[#F3F4F6] ${className ?? ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-semibold text-[#111827]">{data.word}</span>
        {data.gender && (
          <span className="text-[11px] text-[#9CA3AF]">({data.gender === "masculine" ? "m." : "f."})</span>
        )}
        <span className="text-[13px] text-[#6B7280]">{data.translation}</span>
      </div>
      <span className="text-[12px] text-[#9CA3AF] italic shrink-0 ml-3">{data.pronunciation}</span>
    </div>
  );
}

function FlashcardVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`${patterns.card.interactive} cursor-pointer select-none ${className ?? ""}`}
      style={{ perspective: "1000px", aspectRatio: "3/2" }}
      onClick={() => setFlipped(!flipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped(!flipped); }}
    >
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-2xl font-bold text-[#111827]">{data.word}</p>
          <p className="text-[13px] text-[#9CA3AF] italic mt-2">{data.pronunciation}</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-xl font-semibold text-[#111827]">{data.translation}</p>
          {data.example.pt && (
            <div className="mt-3 text-center max-w-[280px]">
              <p className="text-[13px] text-[#111827]">{data.example.pt}</p>
              <p className="text-[13px] text-[#6B7280] italic mt-0.5">{data.example.en}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  return (
    <span className={`text-[14px] ${className ?? ""}`}>
      <span className="font-semibold text-[#111827]">{data.word}</span>
      <span className="text-[#6B7280]"> ({data.translation})</span>
    </span>
  );
}

export function VocabBlock({ data, variant = "card", className }: VocabBlockProps) {
  switch (variant) {
    case "card": return <CardVariant data={data} className={className} />;
    case "row": return <RowVariant data={data} className={className} />;
    case "flashcard": return <FlashcardVariant data={data} className={className} />;
    case "inline": return <InlineVariant data={data} className={className} />;
  }
}
