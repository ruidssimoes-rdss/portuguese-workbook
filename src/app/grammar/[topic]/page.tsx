"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic, GrammarRule } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

type CrossLink = { label: string; href: string };

function createInitialOpenRules(ruleCount: number): Set<number> {
  if (ruleCount <= 3) return new Set(Array.from({ length: ruleCount }, (_, i) => i));
  if (ruleCount > 0) return new Set([0]);
  return new Set();
}

function getCefrBadgeClass(level: string): string {
  if (level === "A1") return "border-[#0144C0]/20 text-[#0144C0]";
  if (level === "A2") return "border-[#7C3AED]/20 text-[#7C3AED]";
  if (level === "B1") return "border-[#4B5563]/20 text-[#4B5563]";
  return "border-[#E5E7EB] text-[#6B7280]";
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
          className="text-[#0144C0] hover:underline font-medium transition-all duration-200 ease-out"
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

function RuleItem({
  rule,
  index,
  isOpen,
  onToggle,
}: {
  rule: GrammarRule;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
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
  const hasLeftColumn = noteTexts.length > 0 || dedupedLinks.length > 0;

  return (
    <div
      className={[
        "border rounded-xl overflow-hidden bg-white transition-all duration-200 ease-out",
        isOpen ? "border-[#0144C0]/20" : "border-[#E5E7EB] hover:border-[#0144C0]/30",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full min-h-[44px] text-left p-4 sm:p-5 xl:p-6 cursor-pointer transition-all duration-200 ease-out"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <span className="text-[#0144C0] font-bold text-base sm:text-lg flex-shrink-0 w-6 sm:w-8 text-right leading-6">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[#111827] font-semibold text-sm sm:text-base leading-snug break-words">
              {renderWithLinks(rule.rule)}
            </p>
            <p className="text-xs sm:text-sm italic mt-0.5 text-[#0144C0]/60 break-words">{rule.rulePt}</p>
          </div>
          <svg
            className={[
              "text-[#6B7280] transition-all duration-200 ease-out flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-0.5",
              isOpen ? "rotate-180" : "rotate-0",
            ].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 sm:px-5 sm:pb-5 xl:px-6 xl:pb-6">
            <div
              className={[
                "mt-4 grid grid-cols-1 gap-4",
                hasLeftColumn ? "sm:grid-cols-[1fr_auto] sm:gap-8" : "sm:grid-cols-1",
              ].join(" ")}
            >
              {rule.examples.length > 0 && (
                <div className="order-1 sm:order-2 sm:min-w-[280px] sm:max-w-[360px] lg:min-w-[320px] lg:max-w-[420px]">
                  <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#6B7280]/40 mb-2">
                    Examples
                  </p>
                  <div className="bg-[#FAFAFA]/50 rounded-lg p-3 sm:p-4">
                    {rule.examples.map((example, i) => (
                      <div
                        key={i}
                        className="py-2 sm:py-2.5 border-b border-[#F3F4F6] last:border-0 transition-all duration-200 ease-out"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <PronunciationButton
                            text={example.pt}
                            size="sm"
                            variant="muted"
                            className="shrink-0 mt-0.5"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="sm:flex sm:items-start sm:gap-4 sm:justify-between">
                              <p className="font-mono text-[13px] sm:text-[15px] text-[#111827] font-medium break-words">
                                {example.pt}
                              </p>
                              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 ml-9 sm:ml-0 sm:mt-0 sm:text-right sm:max-w-[45%] break-words">
                                {example.en}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasLeftColumn && (
                <div className="order-2 sm:order-1">
                  {noteTexts.length > 0 && (
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#6B7280]/40 mb-2">
                        Note
                      </p>
                      <div className="mt-3">
                        {noteTexts.map((note, i) => (
                          <p key={i} className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-2 last:mb-0">
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {dedupedLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#F3F4F6]">
                      {dedupedLinks.map((link, i) => (
                        <Link
                          key={`${link.href}-${i}`}
                          href={link.href}
                          className="inline-flex min-h-[44px] items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#0144C0]/15 text-[#0144C0] text-xs sm:text-sm font-medium hover:bg-[#0144C0]/5 transition-all duration-200 ease-out"
                        >
                          {link.label}
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GrammarTopicPage() {
  const params = useParams();
  const topicId = params.topic as string;
  const topic: GrammarTopic | undefined = topicId ? data.topics[topicId] : undefined;

  const [introExpanded, setIntroExpanded] = useState(false);
  const [openRules, setOpenRules] = useState<Set<number>>(
    createInitialOpenRules(topic?.rules.length ?? 0),
  );

  useEffect(() => {
    if (!topic) return;
    setOpenRules(createInitialOpenRules(topic.rules.length));
    setIntroExpanded(false);
  }, [topicId, topic]);

  if (!topic) {
    return (
      <>
        <Topbar />
        <main className="mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:max-w-3xl xl:max-w-4xl">
          <p className="text-[#6B7280] text-sm">Topic not found.</p>
          <Link
            href="/grammar"
            className="text-sm text-[#6B7280] hover:text-[#0144C0] transition-all duration-200 ease-out mt-4 inline-block min-h-[44px]"
          >
            ← Grammar
          </Link>
        </main>
      </>
    );
  }

  const introIsLong = topic.intro.length > 240;
  const allExpanded = openRules.size === topic.rules.length && topic.rules.length > 0;

  const toggleRule = (index: number) => {
    setOpenRules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const expandAll = () => setOpenRules(new Set(topic.rules.map((_, i) => i)));
  const collapseAll = () => setOpenRules(new Set());

  return (
    <>
      <Topbar />
      <main className="mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:max-w-3xl xl:max-w-4xl">
        <header>
          <Link
            href="/grammar"
            className="inline-flex items-center min-h-[44px] text-sm text-[#6B7280] hover:text-[#0144C0] transition-all duration-200 ease-out"
          >
            ← Grammar
          </Link>

          <div className="flex items-start justify-between gap-4 mt-1">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] break-words">{topic.title}</h1>
              <p className="text-base sm:text-lg text-[#0144C0]/60 italic mt-0.5 break-words">{topic.titlePt}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCefrBadgeClass(topic.cefr)}`}
            >
              {topic.cefr}
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#6B7280] mt-2 max-w-2xl leading-relaxed">{topic.summary}</p>
        </header>

        <section className="bg-[#FAFAFA] rounded-xl p-4 sm:p-6 mt-6 sm:mt-8">
          {!introExpanded && (
            <p className="text-sm sm:text-[15px] text-[#6B7280] leading-relaxed line-clamp-3 sm:line-clamp-3">
              {topic.intro}
            </p>
          )}
          <div
            className="grid transition-all duration-300 ease-out"
            style={{ gridTemplateRows: introExpanded ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <p className="text-sm sm:text-[15px] text-[#6B7280] leading-relaxed">{topic.intro}</p>
            </div>
          </div>
          {introIsLong && (
            <button
              type="button"
              onClick={() => setIntroExpanded((prev) => !prev)}
              className="min-h-[44px] text-[#0144C0] text-sm font-medium cursor-pointer hover:underline mt-2 transition-all duration-200 ease-out"
            >
              {introExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between gap-4 mt-8 sm:mt-10 mb-4">
            <h2 className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#6B7280]/40 sm:text-[#6B7280]/50">
              Rules
            </h2>
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="min-h-[44px] text-xs text-[#6B7280] hover:text-[#0144C0] cursor-pointer transition-all duration-200 ease-out"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <div className="space-y-3">
            {topic.rules.map((rule, index) => (
              <RuleItem
                key={index}
                rule={rule}
                index={index}
                isOpen={openRules.has(index)}
                onToggle={() => toggleRule(index)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#6B7280]/40 sm:text-[#6B7280]/50 mt-8 sm:mt-10 mb-4">
            Tips & Tricks
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {topic.tips.map((tip, i) => (
              <div key={i} className="pl-3 sm:pl-4 border-l-2 border-[#0144C0]/20 py-2 sm:py-3">
                <p className="text-xs sm:text-sm text-[#111827] leading-relaxed break-words">
                  {renderWithLinks(tip)}
                </p>
                {topic.tipsPt[i] && (
                  <p className="text-xs sm:text-sm text-[#6B7280] italic mt-1 break-words">
                    {renderWithLinks(topic.tipsPt[i])}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
