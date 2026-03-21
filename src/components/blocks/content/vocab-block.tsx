"use client";

import { useState } from "react";
import type { VocabBlockData, VocabVariant, FamiliarityState } from "@/types/blocks";

interface VocabBlockProps {
  data: VocabBlockData;
  variant?: VocabVariant;
  className?: string;
}

const FAMILIARITY_LABEL: Record<FamiliarityState, { text: string; color: string }> = {
  new: { text: "New", color: "text-[#9B9DA3]" },
  learning: { text: "Learning", color: "text-[#185FA5]" },
  known: { text: "Known", color: "text-[#0F6E56]" },
  mastered: { text: "Mastered", color: "text-[#0F6E56]" },
};

function CardVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <p className="text-[18px] font-medium text-[#111111]">{data.word}</p>
          {data.gender && (
            <span className="text-[12px] text-[#9B9DA3]">
              ({data.gender === "masculine" ? "m." : "f."})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {data.category && (
            <span className="text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F7F7F5] text-[#6C6B71]">
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
      <p className="text-[13px] text-[#6C6B71] mt-1">{data.translation}</p>
      <p className="text-[12px] text-[#9B9DA3] italic mt-0.5">{data.pronunciation}</p>
      {data.example.pt && (
        <div className="mt-3 pt-3 border-t border-[0.5px] border-[rgba(0,0,0,0.06)]">
          <p className="text-[13px] text-[#111111]">{data.example.pt}</p>
          <p className="text-[13px] text-[#6C6B71] italic mt-0.5">{data.example.en}</p>
        </div>
      )}
    </div>
  );
}

function RowVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-3 px-1 border-b border-[0.5px] border-[rgba(0,0,0,0.06)] ${className ?? ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-[14px] font-medium text-[#111111]">{data.word}</span>
        {data.gender && (
          <span className="text-[11px] text-[#9B9DA3]">({data.gender === "masculine" ? "m." : "f."})</span>
        )}
        <span className="text-[13px] text-[#6C6B71]">{data.translation}</span>
      </div>
      <span className="text-[12px] text-[#9B9DA3] italic shrink-0 ml-3">{data.pronunciation}</span>
    </div>
  );
}

function FlashcardVariant({ data, className }: { data: VocabBlockData; className?: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white hover:border-[rgba(0,0,0,0.12)] transition-all duration-150 ease-out cursor-pointer select-none ${className ?? ""}`}
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
          <p className="text-2xl font-medium text-[#111111]">{data.word}</p>
          <p className="text-[13px] text-[#9B9DA3] italic mt-2">{data.pronunciation}</p>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-xl font-medium text-[#111111]">{data.translation}</p>
          {data.example.pt && (
            <div className="mt-3 text-center max-w-[280px]">
              <p className="text-[13px] text-[#111111]">{data.example.pt}</p>
              <p className="text-[13px] text-[#6C6B71] italic mt-0.5">{data.example.en}</p>
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
      <span className="font-medium text-[#111111]">{data.word}</span>
      <span className="text-[#6C6B71]"> ({data.translation})</span>
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
