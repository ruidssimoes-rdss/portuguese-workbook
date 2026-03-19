"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PronunciationButton, ExpandableSection, CrossLinkText } from "../primitives";
import { patterns, cefrBadgeClasses } from "@/lib/design-tokens";

// ── Types ────────────────────────────────────────────────

export interface SmartGrammarBlockData {
  topicSlug: string;
  topicTitle: string;
  topicTitlePt: string;
  cefr: string;
  summary?: string;
  rules: Array<{
    rule: string;
    rulePt: string;
    examples: Array<{ pt: string; en: string }>;
    tip?: string;
    tipPt?: string;
    exceptions?: string[];
    crossLinks?: Array<{ label: string; href: string }>;
  }>;
  unmatchedTips?: Array<{ en: string; pt?: string }>;
}

interface SmartGrammarBlockProps {
  data: SmartGrammarBlockData;
  variant?: "expanded" | "summary";
  relatedTopics?: Array<{ slug: string; title: string; titlePt: string; cefr: string }>;
  className?: string;
}

// ── Expanded Variant ────────────────────────────────────

function RuleCard({
  rule,
  index,
  expandedNoteIdx,
  onToggleNote,
}: {
  rule: SmartGrammarBlockData["rules"][number];
  index: number;
  expandedNoteIdx: number | null;
  onToggleNote: (idx: number) => void;
}) {
  const hasExceptions = rule.exceptions && rule.exceptions.length > 0;
  const isNoteOpen = expandedNoteIdx === index;

  return (
    <div className={patterns.card.base}>
      {/* Rule number + text */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#003399] text-white text-[13px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#111827] leading-snug">
            <CrossLinkText text={rule.rule} />
          </p>
          <p className="text-[13px] text-[#9CA3AF] italic mt-1">{rule.rulePt}</p>
        </div>
      </div>

      {/* Examples with pronunciation */}
      {rule.examples.length > 0 && (
        <div className="bg-[#F9FAFB] rounded-lg p-4 ml-10 mt-4 space-y-2">
          {rule.examples.map((ex, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 flex items-baseline justify-between gap-4 min-w-0">
                <span className="text-[14px] font-medium text-[#111827] break-words">{ex.pt}</span>
                <span className="text-[13px] text-[#9CA3AF] text-right shrink-0">{ex.en}</span>
              </div>
              <PronunciationButton text={ex.pt} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Matched tip */}
      {rule.tip && (
        <div className="bg-[#FFFBEB] rounded-lg p-4 border border-[#FEF3C7] mt-4">
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#B45309] mb-1">Dica</p>
          <p className="text-[13px] text-amber-700">
            <CrossLinkText text={rule.tip} />
          </p>
          {rule.tipPt && (
            <p className="text-[13px] text-amber-600 italic mt-1">
              <CrossLinkText text={rule.tipPt} />
            </p>
          )}
        </div>
      )}

      {/* Porquê? collapsible exception notes */}
      {hasExceptions && (
        <div className="pt-3 mt-3 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={() => onToggleNote(index)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#003399] hover:text-[#002277] transition-colors cursor-pointer"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isNoteOpen ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Porquê?
          </button>
          {isNoteOpen && (
            <div className="bg-[#FAFAFA] rounded-lg p-3 mt-2 space-y-2">
              {rule.exceptions!.map((note, i) => (
                <p key={i} className="text-[13px] text-[#6B7280] leading-relaxed">
                  <CrossLinkText text={note} />
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cross-links */}
      {rule.crossLinks && rule.crossLinks.length > 0 && (
        <div className="pt-3 mt-3 border-t border-[#F3F4F6] flex flex-wrap gap-3">
          {rule.crossLinks.map((link, i) => (
            <Link key={i} href={link.href} className="text-[13px] font-medium text-[#003399] hover:underline">
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedVariant({ data, relatedTopics, className }: SmartGrammarBlockProps) {
  const [expandedNoteIdx, setExpandedNoteIdx] = useState<number | null>(null);

  const toggleNote = (idx: number) => {
    setExpandedNoteIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className={className}>
      {/* Summary */}
      {data.summary && (
        <p className="text-[15px] text-[#6B7280] leading-relaxed mb-6">{data.summary}</p>
      )}

      {/* Rules */}
      <div className="space-y-6">
        {data.rules.map((rule, i) => (
          <RuleCard key={i} rule={rule} index={i} expandedNoteIdx={expandedNoteIdx} onToggleNote={toggleNote} />
        ))}
      </div>

      {/* Unmatched tips */}
      {data.unmatchedTips && data.unmatchedTips.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Mais dicas</p>
          <div className="space-y-4">
            {data.unmatchedTips.map((tip, i) => (
              <div key={i} className="bg-amber-50 rounded-lg p-3">
                <p className="text-[11px] font-semibold uppercase text-amber-600 mb-1">Dica</p>
                <p className="text-[13px] text-amber-700"><CrossLinkText text={tip.en} /></p>
                {tip.pt && <p className="text-[13px] text-amber-600 italic mt-1"><CrossLinkText text={tip.pt} /></p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related topics */}
      {relatedTopics && relatedTopics.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Tópicos relacionados</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTopics.map((t) => (
              <Link key={t.slug} href={`/grammar/${t.slug}`} className="block group">
                <div className={patterns.card.interactive}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">{t.title}</p>
                      <p className="text-[13px] text-[#6B7280] italic mt-0.5">{t.titlePt}</p>
                    </div>
                    <span className={`${patterns.badge} ${cefrBadgeClasses(t.cefr)} shrink-0`}>{t.cefr}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summary Variant ─────────────────────────────────────

function SummaryVariant({ data, className }: SmartGrammarBlockProps) {
  return (
    <div className={`${patterns.card.interactive} ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-semibold text-[#111827]">{data.topicTitle}</p>
          <p className="text-[12px] text-[#9CA3AF] italic mt-0.5">{data.topicTitlePt}</p>
        </div>
        <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)} shrink-0`}>{data.cefr}</span>
      </div>
      {data.summary && (
        <p className="text-[12px] text-[#6B7280] mt-2 line-clamp-2">{data.summary}</p>
      )}
      <p className="text-[12px] text-[#9CA3AF] mt-2">
        {data.rules.length} {data.rules.length === 1 ? "rule" : "rules"}
      </p>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────

export function SmartGrammarBlock(props: SmartGrammarBlockProps) {
  const { variant = "expanded" } = props;
  if (variant === "summary") return <SummaryVariant {...props} />;
  return <ExpandedVariant {...props} />;
}
