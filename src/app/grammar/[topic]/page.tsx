"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLayout, IntroBlock } from "@/components/blocos";
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
      <PageLayout>
        <IntroBlock title="Topic not found" backLink={{ label: "Grammar", href: "/grammar" }} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <IntroBlock
        title={topic.title}
        subtitle={topic.titlePt}
        badge={{ label: topic.cefr, level: topic.cefr as "A1" | "A2" | "B1" }}
        backLink={{ label: "Grammar", href: "/grammar" }}
        meta={`${topic.rules.length} ${topic.rules.length === 1 ? "rule" : "rules"}`}
      />
      <SmartGrammarBlock data={smartData} variant="expanded" relatedTopics={relatedTopics} />
    </PageLayout>
  );
}
