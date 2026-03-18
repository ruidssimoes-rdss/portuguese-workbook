"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { Divider } from "@/components/ui/divider";
import { CEFRBadge } from "@/components/ui/badge";
import { StudyLogButton } from "@/components/study-log-button";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";
import { SmartGrammarBlock, type SmartGrammarBlockData } from "@/components/blocks/content/smart-grammar-block";

const data = grammarData as unknown as GrammarData;
const allTopicIds = new Set(Object.keys(data.topics));

// ── Utilities (kept from original) ────────────────────────

function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
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

function extractCrossLinks(text: string): { cleanText: string; links: Array<{ label: string; href: string }> } {
  const links: Array<{ label: string; href: string }> = [];
  const cleanText = text
    .replace(/→\s*See:\s*\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
      links.push({ label, href });
      return "";
    })
    .replace(/\s+and\s*$/, "")
    .trim();
  return { cleanText, links };
}

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

function getRelatedTopics(topic: GrammarTopic, topicId: string) {
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

// ── Tip-to-rule matching (extracted from original) ─────────

function matchTipsToRules(topic: GrammarTopic) {
  const map: Record<number, { tips: string[]; tipsPt: string[] }> = {};
  const matched = new Set<number>();

  topic.tips.forEach((tip, tipIdx) => {
    const tipText = stripLinks(tip + " " + (topic.tipsPt[tipIdx] || "")).toLowerCase();
    let bestMatch = -1;
    let bestScore = 0;
    topic.rules.forEach((rule, ruleIdx) => {
      const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
        ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
        : [];
      const noteText = rawExceptions.map((ex) => normalizeExceptionText(ex)).join(" ");
      const ruleText = stripLinks(rule.rule + " " + rule.rulePt + " " + noteText).toLowerCase();
      const tipWords = tipText.split(/\s+/).filter((w) => w.length > 3);
      const score = tipWords.filter((w) => ruleText.includes(w)).length;
      if (score > bestScore) { bestScore = score; bestMatch = ruleIdx; }
    });
    if (bestMatch >= 0 && bestScore >= 2) {
      if (!map[bestMatch]) map[bestMatch] = { tips: [], tipsPt: [] };
      map[bestMatch].tips.push(tip);
      map[bestMatch].tipsPt.push(topic.tipsPt[tipIdx] || "");
      matched.add(tipIdx);
    }
  });

  const unmatchedTips: Array<{ en: string; pt?: string }> = [];
  topic.tips.forEach((tip, i) => {
    if (!matched.has(i)) unmatchedTips.push({ en: tip, pt: topic.tipsPt[i] || undefined });
  });

  return { ruleTipsMap: map, unmatchedTips };
}

// ── Map topic to SmartGrammarBlockData ──────────────────

function mapTopicToSmartData(topic: GrammarTopic, topicId: string): SmartGrammarBlockData {
  const { ruleTipsMap, unmatchedTips } = matchTipsToRules(topic);

  return {
    topicSlug: topicId,
    topicTitle: topic.title,
    topicTitlePt: topic.titlePt,
    cefr: topic.cefr,
    summary: topic.summary,
    rules: topic.rules.map((rule, i) => {
      const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
        ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
        : [];
      const exceptions: string[] = [];
      const crossLinks: Array<{ label: string; href: string }> = [];
      for (const ex of rawExceptions) {
        const rawText = normalizeExceptionText(ex);
        if (!rawText) continue;
        const { cleanText, links } = extractCrossLinks(rawText);
        if (cleanText) exceptions.push(cleanText);
        crossLinks.push(...links);
      }

      return {
        rule: rule.rule,
        rulePt: rule.rulePt,
        examples: rule.examples,
        tip: ruleTipsMap[i]?.tips[0],
        tipPt: ruleTipsMap[i]?.tipsPt[0],
        exceptions: exceptions.length > 0 ? exceptions : undefined,
        crossLinks: crossLinks.length > 0 ? crossLinks.filter((l, j, arr) =>
          arr.findIndex((o) => o.label === l.label && o.href === l.href) === j
        ) : undefined,
      };
    }),
    unmatchedTips: unmatchedTips.length > 0 ? unmatchedTips : undefined,
  };
}

// ── Page Component ──────────────────────────────────────

export default function GrammarTopicPage() {
  const params = useParams();
  const topicId = params.topic as string;
  const topic: GrammarTopic | undefined = topicId ? data.topics[topicId] : undefined;

  const smartData = useMemo(() => {
    if (!topic) return null;
    return mapTopicToSmartData(topic, topicId);
  }, [topic, topicId]);

  const relatedTopics = useMemo(() => {
    if (!topic) return [];
    return getRelatedTopics(topic, topicId).map((t) => ({
      slug: t.id,
      title: t.title,
      titlePt: t.titlePt,
      cefr: t.cefr,
    }));
  }, [topic, topicId]);

  if (!topic || !smartData) {
    return (
      <>
        <Topbar />
        <PageContainer>
          <p className="text-[13px] text-[#6B7280]">Topic not found.</p>
          <Link href="/grammar" className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-all duration-150 ease-out mt-4 inline-block">
            ← Gramática
          </Link>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <PageContainer>
        {/* Header */}
        <div className="mb-8 py-5">
          <Link href="/grammar" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-all duration-150 ease-out mb-4">
            ← Gramática
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">{topic.title}</h1>
              <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">{topic.titlePt}</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">{topic.rules.length} {topic.rules.length === 1 ? "regra" : "regras"}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap shrink-0">
              <NoteContextActions contextType="grammar" contextId={topicId} contextLabel={topic.title} />
              <ContentCalendarInfo contentType="grammar" contentId={topicId} />
              <StudyLogButton contextTitle={topic.title} contextType="Grammar" />
              <CEFRBadge level={topic.cefr} />
            </div>
          </div>
        </div>

        <Divider />

        {/* SmartGrammarBlock renders all rules, tips, exceptions, and related topics */}
        <div className="mt-8 pb-12">
          <SmartGrammarBlock data={smartData} variant="expanded" relatedTopics={relatedTopics} />
        </div>
      </PageContainer>
    </>
  );
}
