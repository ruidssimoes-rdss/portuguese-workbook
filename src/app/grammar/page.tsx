"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { CEFRBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

export default function GrammarPage() {
  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");

  const filteredTopics = useMemo(() => {
    let list = Object.values(data.topics);

    if (cefrFilter !== "All") {
      list = list.filter((t) => t.cefr === cefrFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.titlePt.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [search, cefrFilter]);

  const totalTopics = Object.keys(data.topics).length;

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Grammar"
            titlePt="Gramática"
            subtitle={`${totalTopics} topics · A1–B1`}
          />
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {CEFR_LEVELS.map((level) => (
                <FilterPill
                  key={level}
                  active={cefrFilter === level}
                  onClick={() => setCefrFilter(level)}
                >
                  {level}
                </FilterPill>
              ))}
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
              <SearchInput
                value={search}
                onChange={(v) => setSearch(v)}
                placeholder="Search topics..."
              />
            </div>
          </div>
          <Divider className="mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/grammar/${topic.id}`}
              className="block group"
            >
              <Card interactive className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold tracking-tight text-text">
                    {topic.title}
                  </h3>
                  <CEFRBadge level={topic.cefr} />
                </div>
                <p className="text-[13px] text-text-secondary mt-1">
                  {topic.titlePt}
                </p>
                <p className="text-[12px] text-text-muted mt-2 line-clamp-2">
                  {topic.summary}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <EmptyState message="No topics match your filter." />
        )}
      </PageContainer>
    </>
  );
}
