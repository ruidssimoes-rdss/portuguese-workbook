"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import { PronunciationButton } from "@/components/pronunciation-button";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

const GRAMMAR_COLORS = {
  track: "#3C5E95",
  border: "#A5B4FC",
  bg: "#EEF2FF",
  title: "#3C5E95",
};

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
          <Link href="/grammar" className="text-[14px] text-text-2 hover:text-text underline mt-4 inline-block">
            Back to Grammar
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="max-w-[800px] mx-auto px-6 md:px-10">
        <header className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Link
              href="/grammar"
              className="text-[13px] text-text-2 hover:text-text transition-colors inline-block mb-3"
            >
              ← Grammar
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">
              {topic.title}
            </h1>
            <p className="text-[15px] text-text-2 mt-0.5">
              {topic.titlePt}
            </p>
            <p className="text-[14px] text-text-3 mt-2">
              {topic.summary}
            </p>
          </div>
          <Badge variant={cefrVariant[topic.cefr] || "gray"} className="shrink-0">
            {topic.cefr}
          </Badge>
        </header>

        <section className="pb-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-text-2 mb-3" style={{ color: GRAMMAR_COLORS.title }}>
            Introduction
          </h2>
          <div className="prose prose-sm max-w-none text-[15px] text-text leading-relaxed whitespace-pre-line">
            {topic.intro}
          </div>
        </section>

        <section className="pb-8">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-text-2 mb-3" style={{ color: GRAMMAR_COLORS.title }}>
            Rules
          </h2>
          <div className="space-y-6">
            {topic.rules.map((rule, i) => (
              <div
                key={i}
                className="rounded-lg border p-4 md:p-5"
                style={{ backgroundColor: GRAMMAR_COLORS.bg, borderColor: GRAMMAR_COLORS.border }}
              >
                <p className="font-semibold text-text text-[15px]" style={{ color: GRAMMAR_COLORS.title }}>
                  {i + 1}. {rule.rule}
                </p>
                <p className="text-[14px] italic text-text-2 mt-1">
                  {rule.rulePt}
                </p>
                {rule.examples.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-[12px] font-medium uppercase tracking-wide text-text-3 mb-1">Examples</p>
                    <ul className="list-disc list-inside text-[14px] text-text-2 space-y-1">
                      {rule.examples.map((ex, j) => (
                        <li key={j}>
                          <span className="inline-flex items-center gap-2">
                            <PronunciationButton text={ex.pt} size="sm" className="shrink-0" />
                            <span className="font-semibold text-text font-mono text-[13px]">{ex.pt}</span>
                            <span className="text-text-2">— {ex.en}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rule.exceptions && rule.exceptions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[12px] font-medium uppercase tracking-wide text-text-3 mb-1">Exceptions</p>
                    <ul className="list-disc list-inside text-[14px] text-text-2 space-y-0.5">
                      {rule.exceptions.map((ex, j) => (
                        <li key={j}>
                          <span className="font-medium text-text">{ex.pt}</span>
                          {" — "}
                          {ex.en}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-text-2 mb-3" style={{ color: GRAMMAR_COLORS.title }}>
            Tips & Tricks
          </h2>
          <ul className="space-y-3">
            {topic.tips.map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-text-3 shrink-0">•</span>
                <div>
                  <p className="text-[14px] text-text">{tip}</p>
                  {topic.tipsPt[i] && (
                    <p className="text-[13px] italic text-text-2 mt-0.5">{topic.tipsPt[i]}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
