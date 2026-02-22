"use client";

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
    // Check rule text
    for (const m of rule.rule.matchAll(linkPattern)) {
      if (allTopicIds.has(m[1])) ids.add(m[1]);
    }
    // Check exceptions
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
  // Check tips
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

  // Fall back to same-CEFR topics
  const sameCefr = Object.entries(data.topics)
    .filter(([id, t]) => id !== topicId && t.cefr === topic.cefr && !crossLinkedIds.includes(id))
    .map(([, t]) => t);

  return [...related, ...sameCefr].slice(0, 3);
}

function RuleCard({ rule, index }: { rule: GrammarRule; index: number }) {
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
      {/* Rule header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-[13px] font-semibold text-[#9CA3AF] mt-0.5">{index + 1}</span>
        <div>
          <p className="text-[15px] font-semibold text-[#111827]">
            {renderWithLinks(rule.rule)}
          </p>
          <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">{rule.rulePt}</p>
        </div>
      </div>

      {/* Note/explanation — from exceptions */}
      {noteTexts.length > 0 && (
        <div className="mb-4">
          {noteTexts.map((note, i) => (
            <p key={i} className="text-[15px] text-[#6B7280] mb-2 last:mb-0">
              {renderWithLinks(note)}
            </p>
          ))}
        </div>
      )}

      {/* Examples — always shown, single column */}
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

      {/* Cross-links — subtle inline links */}
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

        {/* Rules — no accordions, all visible */}
        <div className="space-y-4 mt-8">
          {topic.rules.map((rule, index) => (
            <RuleCard key={index} rule={rule} index={index} />
          ))}
        </div>

        {/* Tips */}
        {topic.tips.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">Tips</p>
            <div className="space-y-3">
              {topic.tips.map((tip, i) => (
                <div key={i} className="border border-[#E5E7EB] rounded-xl p-4 bg-white">
                  <p className="text-[15px] text-[#111827]">{renderWithLinks(tip)}</p>
                  {topic.tipsPt[i] && (
                    <p className="text-[13px] font-medium text-[#6B7280] italic mt-2">
                      {renderWithLinks(topic.tipsPt[i])}
                    </p>
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
