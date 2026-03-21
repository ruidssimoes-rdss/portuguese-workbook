"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader, BadgePill, TipBox, AudioButton } from "@/components/primitives";

import grammarData from "@/data/grammar.json";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function GrammarDetailPage() {
  const params = useParams();
  const slug = params.topic as string;
  const topic = (grammarData.topics as Record<string, any>)[slug];

  const rules: any[] = topic?.rules || [];

  const [expandedRule, setExpandedRule] = useState<number | null>(
    rules.length <= 3 ? -1 : 0
  );

  function isExpanded(index: number) {
    if (expandedRule === -1) return true;
    return expandedRule === index;
  }

  function toggleRule(index: number) {
    if (expandedRule === -1) {
      setExpandedRule(index);
    } else if (expandedRule === index) {
      setExpandedRule(null);
    } else {
      setExpandedRule(index);
    }
  }

  if (!topic) {
    return (
      <PageShell>
        <PageHeader title="Topic not found" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link
          href="/grammar"
          className="hover:text-[#6C6B71] transition-colors"
        >
          Grammar
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{topic.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em]">
          {topic.title}
        </h1>
        <div className="text-[13px] text-[#9B9DA3] mt-1 italic">
          {topic.titlePt}
        </div>
        <div className="mt-2">
          <BadgePill level={topic.cefr} />
        </div>
      </div>

      {/* Introduction */}
      {topic.intro && (
        <div className="text-[13px] text-[#6C6B71] leading-relaxed mb-8 max-w-[640px]">
          {topic.intro}
        </div>
      )}

      {/* Rules accordion */}
      {rules.length > 0 && (
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden mb-8">
          {rules.map((rule: any, index: number) => (
            <div
              key={index}
              className={
                index > 0
                  ? "border-t-[0.5px] border-[rgba(0,0,0,0.06)]"
                  : ""
              }
            >
              {/* Rule header */}
              <div
                onClick={() => toggleRule(index)}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#F7F7F5] transition-colors"
              >
                <span className="text-[11px] font-medium text-[#185FA5] bg-[#E6F1FB] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-[13px] font-medium text-[#111111] flex-1">
                  {rule.rule}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#9B9DA3] transition-transform duration-150 ${
                    isExpanded(index) ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Expanded content */}
              {isExpanded(index) && (
                <div className="px-4 pb-4 border-t-[0.5px] border-[rgba(0,0,0,0.06)] mx-4 pt-3.5">
                  {/* Rule in Portuguese */}
                  {rule.rulePt && (
                    <div className="text-[12px] text-[#9B9DA3] italic mb-3">
                      {rule.rulePt}
                    </div>
                  )}

                  {/* Examples */}
                  {rule.examples && rule.examples.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {rule.examples.map((ex: any, i: number) => (
                        <div
                          key={i}
                          className="bg-[#F7F7F5] rounded-lg px-3.5 py-2.5 group"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] text-[#111111]">
                              {ex.pt}
                            </span>
                            <AudioButton text={ex.pt} className="md:opacity-0 md:group-hover:opacity-100" />
                          </div>
                          <div className="text-[12px] text-[#9B9DA3] italic mt-0.5">
                            {ex.en}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Exceptions */}
                  {rule.exceptions && rule.exceptions.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {rule.exceptions.map((exc: string, i: number) => (
                        <div
                          key={i}
                          className="text-[12px] text-[#6C6B71] italic"
                        >
                          Note: {exc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips section */}
      {topic.tips && topic.tips.length > 0 && (
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-3">
            Tips
          </div>
          <div className="space-y-2">
            {topic.tips.map((tip: string, i: number) => (
              <TipBox key={i}>{tip}</TipBox>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
