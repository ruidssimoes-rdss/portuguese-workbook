"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageLayout, IntroBlock } from "@/components/blocos";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";
import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";
import { NumberedRules } from "@/components/smart-bloco-inserts";
import type { CEFRLevel } from "@/components/smart-bloco";

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

// ── Tip-to-rule matching ─────────────────────────────────

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

  return { ruleTipsMap: map };
}

// ── Page Component ──────────────────────────────────────

export default function GrammarTopicPage() {
  const params = useParams();
  const topicId = params.topic as string;
  const topic: GrammarTopic | undefined = topicId ? data.topics[topicId] : undefined;

  const rulesData = useMemo(() => {
    if (!topic) return [];
    const { ruleTipsMap } = matchTipsToRules(topic);

    return topic.rules.map((rule, i) => {
      const rawExceptions = Array.isArray((rule as unknown as { exceptions?: unknown }).exceptions)
        ? ((rule as unknown as { exceptions?: unknown[] }).exceptions ?? [])
        : [];
      const exceptions: string[] = [];
      for (const ex of rawExceptions) {
        const rawText = normalizeExceptionText(ex);
        if (!rawText) continue;
        const { cleanText } = extractCrossLinks(rawText);
        if (cleanText) exceptions.push(cleanText);
      }

      // Map to NumberedRules format
      const calloutText = ruleTipsMap[i]?.tips[0];
      const exceptionText = exceptions.length > 0 ? exceptions.join("; ") : undefined;

      return {
        number: i + 1,
        text: stripLinks(rule.rule),
        textPt: rule.rulePt,
        example: rule.examples[0] ? { pt: rule.examples[0].pt, en: rule.examples[0].en } : undefined,
        callout: calloutText
          ? { type: "tip" as const, text: stripLinks(calloutText) }
          : exceptionText
            ? { type: "why" as const, text: exceptionText }
            : undefined,
      };
    });
  }, [topic]);

  const relatedTopics = useMemo(() => {
    if (!topic) return [];
    return getRelatedTopics(topic, topicId).map((t) => ({
      slug: t.id,
      title: t.title,
      titlePt: t.titlePt,
      cefr: t.cefr,
    }));
  }, [topic, topicId]);

  if (!topic) {
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
        pills={[{ label: `${topic.rules.length} ${topic.rules.length === 1 ? "rule" : "rules"}` }]}
      />

      <SmartBloco
        title={topic.title}
        description={topic.summary}
        expandedContent={
          <NumberedRules rules={rulesData} />
        }
        footer={{ ruleCount: topic.rules.length }}
      />

      {/* Related topics */}
      {relatedTopics.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#E5E7EB]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">Tópicos relacionados</p>
          <BlocoGrid>
            {relatedTopics.map((t) => (
              <SmartBloco
                key={t.slug}
                title={t.title}
                subtitle={t.titlePt}
                cefrLevel={t.cefr as CEFRLevel}
                href={`/grammar/${t.slug}`}
              />
            ))}
          </BlocoGrid>
        </div>
      )}
    </PageLayout>
  );
}
