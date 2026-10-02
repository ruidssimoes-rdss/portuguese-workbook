"use client";

import { useState } from "react";
import { PronunciationButton, ContentPopover } from "../primitives";
import { cefrClasses } from "@/lib/design-system/tokens";

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
      className={`group border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white hover:border-[#CFCFCB] transition-all duration-150 ease-out cursor-pointer flex flex-col gap-3 ${
        isHighlighted ? "url-highlight" : ""
      } ${className ?? ""}`}
    >
      {/* Word + pronunciation */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-medium leading-tight text-[#1F1F1F] break-words">{data.word}</h3>
        <PronunciationButton text={data.word} size="md" />
      </div>

      {/* Phonetic */}
      {data.pronunciation && (
        <span className="font-mono text-[12px] text-[#98988F] -mt-1.5">/{data.pronunciation}/</span>
      )}

      {/* Translation */}
      <span className="text-[14px] font-medium text-[#6B6B69] break-words">{data.translation}</span>

      {/* Example */}
      {exPt && (
        <div className="bg-[#F7F7F6] rounded-lg p-4 flex items-start gap-2">
          <PronunciationButton text={exPt} size="sm" className="mt-0.5" />
          <div className="min-w-0">
            <span className="text-[13px] italic leading-snug text-[#1F1F1F] break-words">
              &ldquo;{exPt}&rdquo;
            </span>
            {exEn && (
              <span className="text-[11px] text-[#98988F] block mt-0.5 break-words">{exEn}</span>
            )}
          </div>
        </div>
      )}

      {/* Badges + popovers row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {data.cefr && (
          <span className={`text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${cefrClasses(data.cefr).text} ${cefrClasses(data.cefr).bg}`}>{data.cefr}</span>
        )}
        {data.gender && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            data.gender === "m" ? "text-[#1B2B61] bg-[#E8ECF6]" : "text-[#5B45B8] bg-[#ECE8F8]"
          }`}>
            {data.gender}
          </span>
        )}

        {/* Related words popover */}
        {data.relatedWords && data.relatedWords.length > 0 && (
          <ContentPopover
            trigger={
              <span className="text-[11px] font-medium text-[#6B6B69] bg-[#F7F7F6] px-2.5 py-[3px] rounded-full hover:bg-[#E6E6E4] transition-colors duration-150">
                Related ({data.relatedWords.length})
              </span>
            }
            side="top"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#98988F] font-medium mb-1">Related Words</span>
              {data.relatedWords.map((rw, j) => (
                <div key={j} className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-medium text-[#1F1F1F]">{rw.word}</span>
                  <span className="text-[12px] text-[#98988F]">— {rw.meaning}</span>
                </div>
              ))}
            </div>
          </ContentPopover>
        )}

        {/* Pro tip popover */}
        {data.tip && (
          <ContentPopover
            trigger={
              <span className="text-[12px] font-normal text-[#5B45B8] bg-[#ECE8F8] border-[0.5px] border-[#E6E6E4] px-2.5 py-1 rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-150">
                Pro Tip
              </span>
            }
            side="top"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.08em] text-[#5B45B8] font-medium">Pro Tip</span>
              <p className="text-[13px] text-[#6B6B69] leading-relaxed mt-1">{data.tip}</p>
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
    <div className={`flex items-center justify-between py-3 px-1 border-b border-[0.5px] border-[#E6E6E4] ${className ?? ""}`}>
      <div className="flex items-baseline gap-2 min-w-0 flex-1">
        <span className="text-[14px] font-medium text-[#1F1F1F]">{data.word}</span>
        {data.gender && (
          <span className={`text-[11px] ${data.gender === "m" ? "text-[#1B2B61]" : "text-[#5B45B8]"}`}>({data.gender})</span>
        )}
        <span className="text-[13px] text-[#6B6B69]">{data.translation}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {data.cefr && <span className={`text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${cefrClasses(data.cefr)}`}>{data.cefr}</span>}
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
      className={`border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white hover:border-[#CFCFCB] transition-all duration-150 ease-out cursor-pointer select-none ${className ?? ""}`}
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
          <p className="text-[22px] font-medium text-[#1F1F1F] tracking-[-0.02em]">{data.word}</p>
          {data.pronunciation && <p className="text-[13px] text-[#98988F] italic mt-2">/{data.pronunciation}/</p>}
          <PronunciationButton text={data.word} size="md" className="mt-2" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p className="text-[18px] font-medium text-[#1F1F1F]">{data.translation}</p>
        </div>
      </div>
    </div>
  );
}

// ── Inline Variant ───────────────────────────────────────

function InlineVariant({ data, className }: SmartVocabBlockProps) {
  return (
    <span className={`text-[14px] ${className ?? ""}`}>
      <span className="font-medium text-[#1F1F1F]">{data.word}</span>
      <span className="text-[#6B6B69]"> ({data.translation})</span>
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
