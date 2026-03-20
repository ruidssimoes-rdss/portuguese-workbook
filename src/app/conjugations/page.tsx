"use client";

import { useState, useMemo } from "react";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import { PageLayout, IntroBlock, FilterBlock } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";
import type { CEFRLevel } from "@/components/smart-bloco";

const data = verbData as unknown as VerbDataSet;

export default function ConjugationsPage() {
  const [groupFilter, setGroupFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.order.filter((v) => {
      const m = data.verbs[v]?.meta;
      if (!m) return false;
      if (groupFilter !== "all") {
        if (groupFilter === "ar" && !m.group.includes("-AR")) return false;
        if (groupFilter === "er" && !m.group.includes("-ER")) return false;
        if (groupFilter === "ir" && !m.group.includes("-IR")) return false;
      }
      if (levelFilter !== "all" && m.cefr !== levelFilter) return false;
      if (q && !v.toLowerCase().includes(q) && !m.english.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [groupFilter, levelFilter, search]);

  return (
    <PageLayout>
      <IntroBlock
        title="Conjugations"
        subtitle="Conjugações"
        description="Practice conjugating European Portuguese verbs across all tenses."
        pills={[{ label: `${data.order.length} verbs` }]}
      />
      <FilterBlock
        pills={{
          options: [
            { label: "All", value: "all" },
            { label: "-ar", value: "ar" },
            { label: "-er", value: "er" },
            { label: "-ir", value: "ir" },
          ],
          value: groupFilter,
          onChange: setGroupFilter,
        }}
        dropdown={{
          label: "Level",
          options: [
            { label: "All levels", value: "all" },
            { label: "A1", value: "A1" },
            { label: "A2", value: "A2" },
            { label: "B1", value: "B1" },
          ],
          value: levelFilter,
          onChange: setLevelFilter,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search verbs..." }}
        count={{ showing: filtered.length, total: data.order.length }}
      />
      <BlocoGrid>
        {filtered.map((v) => {
          const m = data.verbs[v].meta;
          return (
            <SmartBloco
              key={v}
              title={v.toLowerCase()}
              subtitle={m.english}
              hasAudio
              cefrLevel={m.cefr as CEFRLevel}
              metaBadge={m.group.startsWith("Irregular") ? "Irreg." : m.group.replace("Regular ", "")}
              footer={{ label: m.priority }}
              href={`/conjugations/${v.toLowerCase()}`}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-[14px] text-[#9CA3AF]">No verbs match your filter.</p>
          </div>
        )}
      </BlocoGrid>
    </PageLayout>
  );
}
