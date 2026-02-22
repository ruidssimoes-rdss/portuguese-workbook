"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import { cefrPillClass } from "@/lib/cefr";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic, GrammarRule } from "@/types/grammar";
import type { ReactNode } from "react";

const data = grammarData as unknown as GrammarData;
const allTopicIds = new Set(Object.keys(data.topics));

type CrossLink = { label: string; href: string };

function getCefrBadgeClass(level: string): string {
  if (level === "A1") return "border-cefr-a1/20 text-cefr-a1";
  if (level === "A2") return "border-cefr-a2/20 text-cefr-a2";
  if (level === "B1") return "border-cefr-b1/20 text-cefr-b1";
  return "border-border text-text-secondary";
}

function renderWithLinks(text: string): ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <Link
          key={i}
          href={match[2]}
          className="text-[#3C5E95] hover:underline font-medium"
        >
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function extractCrossLinks(text: string): { cleanText: string; links: CrossLink[] } {
  const links: CrossLink[] = [];
  const cleanText = text
    .replace(/→\s*See:\s*\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
      links.push({ label, href });
      return "";
    })
    .replace(/\s+and\s*$/, "")
    .trim();
  return { cleanText, links };
}

function normalizeExceptionText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const candidate = value as { pt?: unknown; en?: unknown };
    if (typeof candidate.pt === "string") return candidate.pt;
    if (typeof candidate.en === "string") return candidate.en;
  }
  return "";
}

/** Collect all unique grammar topic slugs referenced via markdown links in rule text + exceptions */
function collectCrossLinkedTopicIds(topic: GrammarTopic): string[] {
  const ids = new Set<string>();
  const linkPattern = /\]\(\/grammar\/([^)]+)\)/g;

  for (const rule of topic.rules) {
    for (const m of rule.rule.matchAll(linkPattern)) {
      if (allTopicIds.has(m[1])) ids.add(m[1]);
    }
    const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
      ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
      : [];
    for (const ex of rawExceptions) {
      const text = normalizeExceptionText(ex);
      for (const m of text.matchAll(linkPattern)) {
        if (allTopicIds.has(m[1])) ids.add(m[1]);
      }
    }
  }
  for (const tip of topic.tips) {
    for (const m of tip.matchAll(linkPattern)) {
      if (allTopicIds.has(m[1])) ids.add(m[1]);
    }
  }

  return Array.from(ids);
}

function getRelatedTopics(topic: GrammarTopic, topicId: string): GrammarTopic[] {
  const crossLinkedIds = collectCrossLinkedTopicIds(topic);
  const related = crossLinkedIds
    .filter((id) => id !== topicId)
    .map((id) => data.topics[id])
    .filter(Boolean);

  if (related.length >= 3) return related.slice(0, 6);

  const sameCefr = Object.entries(data.topics)
    .filter(([id, t]) => id !== topicId && t.cefr === topic.cefr && !crossLinkedIds.includes(id))
    .map(([, t]) => t);

  return [...related, ...sameCefr].slice(0, 3);
}

/** Strip markdown links from text for keyword matching */
function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function RuleCard({
  rule,
  index,
  tips,
  tipsPt,
  isNoteExpanded,
  onToggleNote,
}: {
  rule: GrammarRule;
  index: number;
  tips: string[];
  tipsPt: string[];
  isNoteExpanded: boolean;
  onToggleNote: () => void;
}) {
  const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
    ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
    : [];

  const noteTexts: string[] = [];
  const allLinks: CrossLink[] = [];

  for (const exception of rawExceptions) {
    const rawText = normalizeExceptionText(exception);
    if (!rawText) continue;
    const { cleanText, links } = extractCrossLinks(rawText);
    if (cleanText) noteTexts.push(cleanText);
    allLinks.push(...links);
  }

  const dedupedLinks = allLinks.filter(
    (link, i, arr) => arr.findIndex((other) => other.label === link.label && other.href === link.href) === i,
  );

  return (
    <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
      {/* 1. Rule header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-[13px] font-semibold text-[#9CA3AF] mt-0.5">{index + 1}</span>
        <div>
          <p className="text-[15px] font-semibold text-[#111827]">
            {renderWithLinks(rule.rule)}
          </p>
          <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">{rule.rulePt}</p>
        </div>
      </div>

      {/* 2. Examples — THE PRIMARY CONTENT */}
      {rule.examples.length > 0 && (
        <div className="space-y-0">
          {rule.examples.map((ex, i) => (
            <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-[#F3F4F6]" : ""}`}>
              <PronunciationButton
                text={ex.pt}
                size="sm"
                variant="muted"
                className="shrink-0"
              />
              <div className="flex-1 flex items-baseline justify-between gap-4 min-w-0">
                <span className="text-[15px] font-semibold text-[#111827] font-mono break-words">{ex.pt}</span>
                <span className="text-[13px] font-medium text-[#9CA3AF] text-right shrink-0">{ex.en}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Tip callouts */}
      {tips.map((tip, i) => (
        <div key={i} className="mt-4 px-4 py-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Tip</p>
          <p className="text-[13px] font-medium text-[#6B7280]">{renderWithLinks(tip)}</p>
          {tipsPt[i] && (
            <p className="text-[13px] text-[#9CA3AF] italic mt-1">{renderWithLinks(tipsPt[i])}</p>
          )}
        </div>
      ))}

      {/* 4. "Why?" collapsible note */}
      {noteTexts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={onToggleNote}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer"
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isNoteExpanded ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Why?
          </button>
          {isNoteExpanded && (
            <div className="mt-3 space-y-2">
              {noteTexts.map((note, i) => (
                <p key={i} className="text-[13px] text-[#9CA3AF] leading-relaxed">
                  {renderWithLinks(note)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Cross-links */}
      {dedupedLinks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
          {dedupedLinks.map((link, i) => (
            <Link
              key={`${link.href}-${i}`}
              href={link.href}
              className="text-[13px] font-medium text-[#3C5E95] hover:underline mr-4"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GrammarTopicPage() {
  const params = useParams();
  const topicId = params.topic as string;
  const topic: GrammarTopic | undefined = topicId ? data.topics[topicId] : undefined;
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);

  const toggleNote = (ruleIndex: number) => {
    setExpandedNoteId((prev) => (prev === ruleIndex ? null : ruleIndex));
  };

  // Match tips to rules by keyword overlap
  const { ruleTipsMap, unmatchedTips, unmatchedTipsPt } = useMemo(() => {
    if (!topic) return { ruleTipsMap: {} as Record<number, { tips: string[]; tipsPt: string[] }>, unmatchedTips: [] as string[], unmatchedTipsPt: [] as string[] };

    const map: Record<number, { tips: string[]; tipsPt: string[] }> = {};
    const matched = new Set<number>();

    topic.tips.forEach((tip, tipIdx) => {
      const tipText = stripLinks(tip + " " + (topic.tipsPt[tipIdx] || "")).toLowerCase();
      let bestMatch = -1;
      let bestScore = 0;

      topic.rules.forEach((rule, ruleIdx) => {
        // Build searchable text from rule title, PT title, and exception notes
        const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
          ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
          : [];
        const noteText = rawExceptions.map((ex) => normalizeExceptionText(ex)).join(" ");
        const ruleText = stripLinks(
          rule.rule + " " + rule.rulePt + " " + noteText
        ).toLowerCase();

        const tipWords = tipText.split(/\s+/).filter((w) => w.length > 3);
        const score = tipWords.filter((w) => ruleText.includes(w)).length;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = ruleIdx;
        }
      });

      if (bestMatch >= 0 && bestScore >= 2) {
        if (!map[bestMatch]) map[bestMatch] = { tips: [], tipsPt: [] };
        map[bestMatch].tips.push(tip);
        map[bestMatch].tipsPt.push(topic.tipsPt[tipIdx] || "");
        matched.add(tipIdx);
      }
    });

    const unTips: string[] = [];
    const unTipsPt: string[] = [];
    topic.tips.forEach((tip, i) => {
      if (!matched.has(i)) {
        unTips.push(tip);
        unTipsPt.push(topic.tipsPt[i] || "");
      }
    });

    return { ruleTipsMap: map, unmatchedTips: unTips, unmatchedTipsPt: unTipsPt };
  }, [topic]);

  if (!topic) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
          <p className="text-[13px] text-[#6B7280]">Topic not found.</p>
          <Link
            href="/grammar"
            className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors mt-4 inline-block"
          >
            ← Grammar
          </Link>
        </main>
      </>
    );
  }

  const relatedTopics = getRelatedTopics(topic, topicId);

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8 py-5">
          <Link
            href="/grammar"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
          >
            ← Grammar
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">{topic.title}</h1>
              <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">{topic.titlePt}</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">
                {topic.rules.length} rules
              </p>
              <p className="text-[15px] text-[#6B7280] mt-2 max-w-2xl leading-relaxed line-clamp-2">
                {topic.summary}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${getCefrBadgeClass(topic.cefr)}`}
            >
              {topic.cefr}
            </span>
          </div>
        </div>

        <div className="border-t border-[#F3F4F6]" />

        {/* Rules */}
        <div className="space-y-4 mt-8">
          {topic.rules.map((rule, index) => (
            <RuleCard
              key={index}
              rule={rule}
              index={index}
              tips={ruleTipsMap[index]?.tips ?? []}
              tipsPt={ruleTipsMap[index]?.tipsPt ?? []}
              isNoteExpanded={expandedNoteId === index}
              onToggleNote={() => toggleNote(index)}
            />
          ))}
        </div>

        {/* Unmatched tips fallback */}
        {unmatchedTips.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">More Tips</p>
            <div className="space-y-3">
              {unmatchedTips.map((tip, i) => (
                <div key={i} className="px-4 py-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Tip</p>
                  <p className="text-[13px] font-medium text-[#6B7280]">{renderWithLinks(tip)}</p>
                  {unmatchedTipsPt[i] && (
                    <p className="text-[13px] text-[#9CA3AF] italic mt-1">{renderWithLinks(unmatchedTipsPt[i])}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Topics */}
        {relatedTopics.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F3F4F6] mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">Related Topics</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTopics.map((related) => (
                <Link key={related.id} href={`/grammar/${related.id}`} className="block group">
                  <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-semibold text-[#111827]">{related.title}</p>
                        <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">{related.titlePt}</p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(related.cefr)}`}>
                        {related.cefr}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
