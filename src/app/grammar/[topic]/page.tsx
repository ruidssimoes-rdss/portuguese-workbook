"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

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
      <main className="max-w-[800px] mx-auto px-4 md:px-6 lg:px-10">
        <header className="flex flex-col gap-2 py-5">
          <Link
            href="/grammar"
            className="text-text-2 hover:text-text text-[14px] transition-colors w-fit"
          >
            ← Grammar
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">
                {topic.title}
              </h1>
              <p className="text-[14px] text-[#3C5E95] font-medium mt-0.5">
                {topic.titlePt}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full shrink-0">
              {topic.cefr}
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-1">
            {topic.summary}
          </p>
        </header>

        <section className="pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Introduction
          </h2>
          <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
            <div className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-line">
              {topic.intro}
            </div>
          </div>
        </section>

        <section className="pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Rules
          </h2>
          <div className="space-y-6">
            {topic.rules.map((rule, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E5E5] rounded-[14px] p-5"
              >
                <p className="font-semibold text-[#111827] text-[15px]">
                  {i + 1}. {rule.rule}
                </p>
                <p className="text-[13px] italic text-[#6B7280] mt-1">
                  {rule.rulePt}
                </p>
                {rule.examples.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">Examples</p>
                    <ul className="space-y-2">
                      {rule.examples.map((ex, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <PronunciationButton text={ex.pt} size="sm" variant="muted" className="shrink-0" />
                          <span className="font-semibold text-[#111827] font-mono text-[13px]">{ex.pt}</span>
                          <span className="text-[#9CA3AF] text-[13px]">— {ex.en}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {rule.exceptions && rule.exceptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">Exceptions</p>
                    <ul className="space-y-1.5">
                      {rule.exceptions.map((ex, j) => (
                        <li key={j} className="text-[13px] text-[#374151]">
                          <span className="font-medium text-[#111827]">{ex.pt}</span>
                          <span className="text-[#9CA3AF]"> — {ex.en}</span>
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
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
            Tips & Tricks
          </h2>
          <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
            <ul className="space-y-3">
              {topic.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#9CA3AF] shrink-0 text-[13px]">•</span>
                  <div>
                    <p className="text-[14px] text-[#111827]">{tip}</p>
                    {topic.tipsPt[i] && (
                      <p className="text-[13px] italic text-[#9CA3AF] mt-0.5">{topic.tipsPt[i]}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
