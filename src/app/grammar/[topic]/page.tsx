"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic, GrammarRule } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

function extractRuleTitle(text: string): string {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 40) return text.substring(0, colonIdx);
  return text;
}

function ContractionTable({ text }: { text: string }) {
  const pattern = /([a-záàâãéèêíóôõúüç]+)\s*\+\s*([a-záàâãéèêíóôõúüç\/]+)\s*=\s*([a-záàâãéèêíóôõúüç\/]+)/gi;
  const pairs: { left: string; right: string; result: string }[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    pairs.push({ left: match[1], right: match[2], result: match[3] });
  }

  if (pairs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {pairs.map((p, i) => (
        <div key={i} className="bg-[#F9FAFB] rounded-lg px-3 py-2 text-center">
          <p className="text-[12px] text-[#6B7280]">
            {p.left} + {p.right}
          </p>
          <p className="text-[14px] font-semibold text-[#111827] font-mono">
            {p.result}
          </p>
        </div>
      ))}
    </div>
  );
}

function ExamplesList({ examples }: { examples: { pt: string; en: string }[] }) {
  return (
    <div className="space-y-2">
      {examples.map((ex, j) => (
        <div key={j} className="flex items-center gap-2">
          <PronunciationButton text={ex.pt} size="sm" variant="muted" className="shrink-0" />
          <span className="font-semibold text-[#111827] font-mono text-[13px]">{ex.pt}</span>
          <span className="text-[#9CA3AF] text-[13px]">— {ex.en}</span>
        </div>
      ))}
    </div>
  );
}

function CollapsibleIntro({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
      <div
        className={`text-[14px] text-[#374151] leading-relaxed whitespace-pre-line ${!expanded && isLong ? "line-clamp-3" : ""}`}
      >
        {text}
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[13px] font-medium text-[#3C5E95] hover:text-[#2E4A75] mt-2 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function RuleCard({ rule, index }: { rule: GrammarRule; index: number }) {
  const equalsCount = (rule.rule.match(/=/g) || []).length;
  const isContractionRule = equalsCount >= 3;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
      {isContractionRule ? (
        <div>
          <div className="mb-4">
            <p className="font-semibold text-[#111827] text-[15px]">
              {index + 1}. {extractRuleTitle(rule.rule)}
            </p>
            <p className="text-[13px] italic text-[#6B7280] mt-1">{rule.rulePt}</p>
          </div>
          <ContractionTable text={rule.rule} />
          {rule.examples.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
                Examples
              </p>
              <ExamplesList examples={rule.examples} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="md:w-[55%] shrink-0">
            <p className="font-semibold text-[#111827] text-[15px]">
              {index + 1}. {rule.rule}
            </p>
            <p className="text-[13px] italic text-[#6B7280] mt-1">{rule.rulePt}</p>
          </div>
          {rule.examples.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F0F0F0] md:mt-0 md:pt-0 md:border-t-0 md:border-l md:border-[#F0F0F0] md:pl-6 md:w-[45%]">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
                Examples
              </p>
              <ExamplesList examples={rule.examples} />
            </div>
          )}
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
        <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-12">
          <p className="text-text-2">Topic not found.</p>
          <Link
            href="/grammar"
            className="text-[14px] text-text-2 hover:text-text underline mt-4 inline-block"
          >
            Back to Grammar
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="max-w-[960px] mx-auto px-4 md:px-6 lg:px-10">
        <header className="flex flex-col gap-2 py-5">
          <Link
            href="/grammar"
            className="text-text-2 hover:text-text text-[14px] transition-colors w-fit"
          >
            ← Grammar
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">{topic.title}</h1>
              <p className="text-[14px] text-[#3C5E95] font-medium mt-0.5">{topic.titlePt}</p>
            </div>
            <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full shrink-0">
              {topic.cefr}
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-1">{topic.summary}</p>
        </header>

        <section className="pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Introduction
          </h2>
          <CollapsibleIntro text={topic.intro} />
        </section>

        <section className="pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Rules
          </h2>
          <div className="space-y-4">
            {topic.rules.map((rule, i) => (
              <RuleCard key={i} rule={rule} index={i} />
            ))}
          </div>
        </section>

        <section className="pb-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Tips & Tricks
          </h2>
          <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
            <ul className="space-y-4">
              {topic.tips.map((tip, i) => (
                <li key={i}>
                  <p className="text-[14px] text-[#111827] leading-relaxed">{tip}</p>
                  {topic.tipsPt[i] && (
                    <p className="text-[13px] italic text-[#9CA3AF] mt-1">{topic.tipsPt[i]}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
