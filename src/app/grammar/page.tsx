"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  SegmentedFilter,
  SearchInput,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

import grammarData from "@/data/grammar.json";
import { getGrammarGroups } from "@/data/grammar-groups";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GrammarTopic {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary: string;
  rules: any[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Section Header ─────────────────────────────────────────────────────────

function GroupHeader({ label, labelPt }: { label: string; labelPt: string }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-2">
      {label}
      <span className="ml-2 normal-case tracking-normal italic font-normal">
        {labelPt}
      </span>
    </div>
  );
}

// ─── Topic Row ──────────────────────────────────────────────────────────────

function TopicRow({ topic, search }: { topic: GrammarTopic; search: string }) {
  return (
    <Link href={`/grammar/${topic.id}`} className="block">
      <ListRow>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-[#111111]">
              {topic.title}
            </div>
            <div className="text-[12px] text-[#9B9DA3] mt-0.5">
              {topic.titlePt}
            </div>
            {search && (() => {
              const q = search.toLowerCase();
              const topicMatch =
                topic.title.toLowerCase().includes(q) ||
                topic.titlePt.toLowerCase().includes(q);
              if (topicMatch) return null;
              const matchingRule = (topic.rules || []).find(
                (r: any) =>
                  (r.rule || "").toLowerCase().includes(q) ||
                  (r.examples || []).some((ex: any) => (ex.pt || "").toLowerCase().includes(q))
              );
              if (!matchingRule) return null;
              return (
                <div className="mt-1 text-[11px] text-[#9B9DA3] truncate">
                  Match: &ldquo;{(matchingRule as any).rule}&rdquo;
                </div>
              );
            })()}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <BadgePill level={topic.cefr} />
            <ChevronRight size={16} className="text-[#9B9DA3]" />
          </div>
        </div>
      </ListRow>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function GrammarPage() {
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const allTopics: GrammarTopic[] = useMemo(() => {
    return Object.entries(grammarData.topics).map(([id, t]: [string, any]) => ({
      id,
      title: t.title,
      titlePt: t.titlePt,
      cefr: t.cefr,
      summary: t.summary,
      rules: t.rules || [],
    }));
  }, []);

  const filtered = useMemo(() => {
    return allTopics.filter((topic) => {
      if (cefr !== "All" && topic.cefr !== cefr) return false;
      if (search) {
        const q = search.toLowerCase();
        const topicMatch =
          topic.title.toLowerCase().includes(q) ||
          topic.titlePt.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q);
        const ruleMatch = (topic.rules || []).some(
          (r: any) =>
            (r.rule || "").toLowerCase().includes(q) ||
            (r.rulePt || "").toLowerCase().includes(q) ||
            (r.examples || []).some(
              (ex: any) =>
                (ex.pt || "").toLowerCase().includes(q) ||
                (ex.en || "").toLowerCase().includes(q)
            )
        );
        return topicMatch || ruleMatch;
      }
      return true;
    });
  }, [allTopics, cefr, search]);

  // Group into sections (only when not searching)
  const groups = useMemo(() => {
    if (search) return null;
    return getGrammarGroups(filtered);
  }, [filtered, search]);

  return (
    <PageShell>
      <PageHeader
        title="Gramática"
        subtitle={`${allTopics.length} topics across A1, A2, and B1`}
      />

      {/* ─── Filter bar (standard layout) ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <SegmentedFilter
          options={cefrOptions}
          value={cefr}
          onChange={setCefr}
        />

        {/* Filter dropdown */}
        {groups && (
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg border-[0.5px] transition-colors ${
                filterOpen
                  ? "border-[rgba(0,0,0,0.12)] text-[#111111]"
                  : "border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71]"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filter</span>
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg shadow-lg w-[260px] max-h-[400px] overflow-y-auto">
                  {/* Header with close */}
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <span className="text-[11px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em]">Sections</span>
                    <button onClick={() => setFilterOpen(false)} className="text-[#9B9DA3] hover:text-[#6C6B71]">
                      <X size={14} />
                    </button>
                  </div>
                  {/* Section groups */}
                  {groups.map((g, i) => (
                    <div key={i} className="px-3 pb-2">
                      <div className="text-[10px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">{g.label}</div>
                      <div className="space-y-0.5">
                        {g.topics.map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              document.getElementById(`grammar-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                              setFilterOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-2 py-1.5 rounded text-[12px] text-[#6C6B71] hover:bg-[#F7F7F5] transition-colors text-left"
                          >
                            <span className="truncate">{t.title}</span>
                            <span className="text-[10px] text-[#9B9DA3] ml-2 flex-shrink-0">{t.cefr}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />
        <SearchInput
          placeholder="Search topics..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* ─── Grouped view ──────────────────────────────────────────────── */}
      {groups ? (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={gi} id={`grammar-group-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <ListContainer>
                {group.topics.map((topic: any) => (
                  <div key={topic.id} id={`grammar-${topic.id}`}>
                    <TopicRow topic={topic} search={search} />
                  </div>
                ))}
              </ListContainer>
            </div>
          ))}
        </div>
      ) : (
        <ListContainer>
          {filtered.map((topic) => (
            <div key={topic.id} id={`grammar-${topic.id}`}>
              <TopicRow topic={topic} search={search} />
            </div>
          ))}
        </ListContainer>
      )}

      <CountLabel
        showing={filtered.length}
        total={allTopics.length}
        noun="topics"
      />
    </PageShell>
  );
}
