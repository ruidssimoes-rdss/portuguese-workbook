"use client";

import { useState, useMemo } from "react";
import grammarData from "@/data/grammar.json";
import type { GrammarData } from "@/types/grammar";
import { PageLayout, IntroBlock, FilterBlock } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";
import type { CEFRLevel } from "@/components/smart-bloco";

const data = grammarData as unknown as GrammarData;
const allTopics = Object.values(data.topics).sort((a, b) => a.title.localeCompare(b.title));

export default function GrammarPage() {
  const [cefrFilter, setCefrFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allTopics.filter((t) => {
      if (cefrFilter !== "All" && t.cefr !== cefrFilter) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.titlePt.toLowerCase().includes(q) && !(t.summary || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cefrFilter, search]);

  return (
    <PageLayout>
      <IntroBlock
        title="Grammar"
        subtitle="Gramática"
        description="European Portuguese grammar topics from A1 to B1."
        pills={[{ label: `${allTopics.length} topics` }]}
      />
      <FilterBlock
        pills={{
          options: [{ label: "All", value: "All" }, { label: "A1", value: "A1" }, { label: "A2", value: "A2" }, { label: "B1", value: "B1" }],
          value: cefrFilter,
          onChange: setCefrFilter,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search grammar topics..." }}
        count={{ showing: filtered.length, total: allTopics.length }}
      />
      <BlocoGrid>
        {filtered.map((topic) => (
          <SmartBloco
            key={topic.id}
            title={topic.title}
            subtitle={topic.titlePt}
            cefrLevel={topic.cefr as CEFRLevel}
            description={topic.summary}
            footer={{ ruleCount: topic.rules?.length || 0, questionCount: topic.questions?.length || 0 }}
            href={`/grammar/${topic.id}`}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-[14px] text-[#9CA3AF]">No topics match your filter.</p>
          </div>
        )}
      </BlocoGrid>
    </PageLayout>
  );
}
