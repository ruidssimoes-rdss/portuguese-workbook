"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  FilterBar,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

import grammarData from "@/data/grammar.json";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GrammarTopic {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function GrammarPage() {
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const allTopics: GrammarTopic[] = useMemo(() => {
    return Object.entries(grammarData.topics).map(([id, t]: [string, any]) => ({
      id,
      title: t.title,
      titlePt: t.titlePt,
      cefr: t.cefr,
      summary: t.summary,
    }));
  }, []);

  const filtered = useMemo(() => {
    return allTopics.filter((topic) => {
      if (cefr !== "All" && topic.cefr !== cefr) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          topic.title.toLowerCase().includes(q) ||
          topic.titlePt.toLowerCase().includes(q) ||
          topic.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTopics, cefr, search]);

  return (
    <PageShell>
      <PageHeader
        title="Gramática"
        subtitle={`${allTopics.length} topics across A1, A2, and B1`}
      />

      <FilterBar
        filterOptions={cefrOptions}
        filterValue={cefr}
        onFilterChange={setCefr}
        searchPlaceholder="Search topics..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ListContainer>
        {filtered.map((topic) => (
          <Link key={topic.id} href={`/grammar/${topic.id}`} className="block">
            <ListRow>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#111111]">
                    {topic.title}
                  </div>
                  <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                    {topic.titlePt}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <BadgePill level={topic.cefr} />
                  <ChevronRight size={16} className="text-[#9B9DA3]" />
                </div>
              </div>
            </ListRow>
          </Link>
        ))}
      </ListContainer>

      <CountLabel
        showing={filtered.length}
        total={allTopics.length}
        noun="topics"
      />
    </PageShell>
  );
}
