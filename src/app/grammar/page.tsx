"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { SmartGrammarBlock } from "@/components/blocks/content/smart-grammar-block";
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
            section="LIBRARY"
            sectionPt="Biblioteca"
            tagline={`${Object.keys(data.topics).length} grammar topics with clear rules and real examples — from A1 articles and contractions to B1 conditionals and the subjunctive.`}
            stats={[
              { value: String(totalTopics), label: "topics" },
              { value: "A1–B1", label: "levels" },
            ]}
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
            <Link key={topic.id} href={`/grammar/${topic.id}`} className="block group">
              <SmartGrammarBlock
                data={{
                  topicSlug: topic.id,
                  topicTitle: topic.title,
                  topicTitlePt: topic.titlePt,
                  cefr: topic.cefr,
                  summary: topic.summary,
                  rules: topic.rules.map((r) => ({
                    rule: r.rule,
                    rulePt: r.rulePt,
                    examples: r.examples,
                  })),
                }}
                variant="summary"
              />
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
