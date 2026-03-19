"use client";

import { useState, useMemo } from "react";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import Link from "next/link";
import { PageLayout, IntroBlock, FilterBlock, ContentGrid, SmartBlock } from "@/components/blocos";
import type { SmartBlockBadge } from "@/components/blocos";

const data = verbData as unknown as VerbDataSet;

function cefrColor(level: string): SmartBlockBadge["color"] {
  if (level === "A1") return "emerald";
  if (level === "A2") return "blue";
  return "amber";
}

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
      <ContentGrid>
        {filtered.map((v) => {
          const m = data.verbs[v].meta;
          return (
            <SmartBlock
              key={v}
              title={v}
              subtitle={m.english}
              pronunciationButton
              pronunciationText={v}
              badges={[
                { label: m.cefr, color: cefrColor(m.cefr) },
                { label: m.group.startsWith("Irregular") ? "Irreg." : m.group.replace("Regular ", ""), color: "neutral" },
              ]}
              meta={m.priority}
              interactive
              href={`/conjugations/${v.toLowerCase()}`}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-[14px] text-[#9CA3AF]">No verbs match your filter.</p>
          </div>
        )}
      </ContentGrid>
    </PageLayout>
  );
}
