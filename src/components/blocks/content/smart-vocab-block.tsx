"use client";

import { useState } from "react";
import { PronunciationButton, ContentPopover } from "../primitives";
import { patterns, cefrBadgeClasses } from "@/lib/design-tokens";

// ── Types ────────────────────────────────────────────────

export interface SmartVocabBlockData {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  gender?: string | null;
  cefr?: string;
  category?: string;
  example?: { pt: string; en: string } | null;
  exampleTranslation?: string;
  relatedWords?: Array<{ word: string; meaning: string }>;
  tip?: string;
  familiarity?: "new" | "learning" | "known" | "mastered";
}

interface SmartVocabBlockProps {
  data: SmartVocabBlockData;
  variant?: "card" | "row" | "flashcard" | "inline";
  isHighlighted?: boolean;
  className?: string;
}

// ── Card Variant ────────────────────────────────────────

function CardVariant({ data, isHighlighted, className }: SmartVocabBlockProps) {
  // Resolve example object
  const exPt = typeof data.example === "object" && data.example?.pt ? data.example.pt : (typeof data.example === "string" ? data.example : null);
  const exEn = typeof data.example === "object" && data.example?.en ? data.example.en : data.exampleTranslation || null;

  return (
    <div
      id={data.id}
      className={`group ${patterns.card.interactive} flex flex-col gap-3 ${
        isHighlighted ? "url-highlight" : ""
      } ${className ?? ""}`}
    >
      {/* Word + pronunciation */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-semibold leading-tight text-[#111827] break-words">{data.word}</h3>
        <PronunciationButton text={data.word} size="md" className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150" />
      </div>

      {/* Phonetic */}
      {data.pronunciation && (
        <span className="font-mono text-[12px] text-[#9CA3AF] -mt-1.5">/{data.pronunciation}/</span>
      )}

      {/* Translation */}
      <span className="text-[15px] font-medium text-[#374151] break-words">{data.translation}</span>

      {/* Example */}
      {exPt && (
        <div className="bg-[#F9FAFB] rounded-lg p-4 flex items-start gap-2">
          <PronunciationButton text={exPt} size="sm" className="mt-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150" />
          <div className="min-w-0">
            <span className="text-[13px] italic leading-snug text-[#1F2937] break-words">
              &ldquo;{exPt}&rdquo;
            </span>
            {exEn && (
              <span className="text-[11px] text-[#9CA3AF] block mt-0.5 break-words">{exEn}</span>
            )}
          </div>
        </div>
      )}

      {/* Badges + popovers row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {data.cefr && (
          <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>
        )}
        {data.gender && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            data.gender === "m" ? "text-blue-700 bg-blue-50" : "text-pink-700 bg-pink-50"
          }`}>
            {data.gender}
          </span>
        )}

        {/* Related words popover */}
        {data.relatedWords && data.relatedWords.length > 0 && (
          <ContentPopover
            trigger={
              <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F3F4F6] px-2.5 py-[3px] rounded-full hover:bg-[#E5E7EB] transition-colors duration-150">
                Related ({data.relatedWords.length})
              </span>
            }
            side="top"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium mb-1">Related Words</span>
              {data.relatedWords.map((rw, j) => (
                <div key={j} className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-medium text-[#111827]">{rw.word}</span>
                  <span className="text-[12px] text-[#9CA3AF]">— {rw.meaning}</span>
                </div>
              ))}
            </div>
          </ContentPopover>
        )}

        {/* Pro tip popover */}
        {data.tip && (
          <ContentPopover
            trigger={
              <span className="text-[12px] font-normal text-[#B45309] bg-[#FFFBEB] border border-[#FEF3C7] px-2.5 py-1 rounded-full hover:bg-[#FEF3C7] transition-colors duration-150">
                Pro Tip
              </span>
            }
            side="top"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.08em] text-amber-600 font-semibold">Pro Tip</span>
              <p className="text-[13px] text-[#374151] leading-relaxed mt-1">{data.tip}</p>
            </div>
          </ContentPopover>
        )}
      </div>
    </div>
  );
}

// ── Row Variant ─────────────────────────────────────────

function RowVariant({ data, className }: SmartVocabBlockProps) {
  return (
    <div className={`flex items-center justify-between py-3 px-1 border-b border-[#F3F4F6] ${className ?? ""}`}>
      <div className="flex items-baseline gap-2 min-w-0 flex-1">
        <span className="text-[14px] font-semibold text-[#111827]">{data.word}</span>
        {data.gender && (
          <span className={`text-[11px] ${data.gender === "m" ? "text-blue-600" : "text-pink-600"}`}>({data.gender})</span>
        )}
        <span className="text-[13px] text-[#6B7280]">{data.translation}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {data.cefr && <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>}
        <PronunciationButton text={data.word} size="sm" />
      </div>
    </div>
  );
}

// ── Flashcard Variant ────────────────────────────────────

function FlashcardVariant({ data, className }: SmartVocabBlockProps) {
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
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden" }}>
          <p className="text-2xl font-bold text-[#111827]">{data.word}</p>
          {data.pronunciation && <p className="text-[13px] text-[#9CA3AF] italic mt-2">/{data.pronunciation}/</p>}
          <PronunciationButton text={data.word} size="md" className="mt-2" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-xl font-semibold text-[#111827]">{data.translation}</p>
        </div>
      </div>
    </div>
  );
}

// ── Inline Variant ───────────────────────────────────────

function InlineVariant({ data, className }: SmartVocabBlockProps) {
  return (
    <span className={`text-[14px] ${className ?? ""}`}>
      <span className="font-semibold text-[#111827]">{data.word}</span>
      <span className="text-[#6B7280]"> ({data.translation})</span>
    </span>
  );
}

// ── Main Export ──────────────────────────────────────────

export function SmartVocabBlock(props: SmartVocabBlockProps) {
  const { variant = "card" } = props;
  switch (variant) {
    case "row": return <RowVariant {...props} />;
    case "flashcard": return <FlashcardVariant {...props} />;
    case "inline": return <InlineVariant {...props} />;
    default: return <CardVariant {...props} />;
  }
}
