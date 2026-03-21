"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  FilterBar,
  SegmentedFilter,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

import verbData from "@/data/verbs.json";

// ─── Helpers ────────────────────────────────────────────────────────────────

function simplifyGroup(group: string): string {
  if (group.startsWith("Regular -AR")) return "Regular -AR";
  if (group.startsWith("Regular -ER")) return "Regular -ER";
  if (group.startsWith("Regular -IR")) return "Regular -IR";
  return "Irregular";
}

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];
const groupOptions = [
  "All",
  "Regular -AR",
  "Regular -ER",
  "Regular -IR",
  "Irregular",
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ConjugationsPage() {
  const [cefr, setCefr] = useState("All");
  const [group, setGroup] = useState("All");
  const [search, setSearch] = useState("");

  const filteredVerbs = useMemo(() => {
    return (verbData as any).order.filter((key: string) => {
      const meta = (verbData as any).verbs[key].meta;
      if (cefr !== "All" && meta.cefr !== cefr) return false;
      if (group !== "All" && simplifyGroup(meta.group) !== group) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          key.toLowerCase().includes(q) ||
          meta.english.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [cefr, group, search]);

  return (
    <PageShell>
      <PageHeader
        title="Conjugações"
        subtitle={`${(verbData as any).order.length} verbs · 6 tenses`}
      />

      <FilterBar
        filterOptions={cefrOptions}
        filterValue={cefr}
        onFilterChange={setCefr}
        searchPlaceholder="Search verbs..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      <div className="mb-6 -mt-3">
        <SegmentedFilter
          options={groupOptions}
          value={group}
          onChange={setGroup}
        />
      </div>

      <ListContainer>
        {filteredVerbs.map((key: string) => {
          const meta = (verbData as any).verbs[key].meta;
          return (
            <Link
              key={key}
              href={`/conjugations/${key.toLowerCase()}`}
              className="block"
            >
              <ListRow>
                <div className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3">
                  <span className="text-[14px] font-medium text-[#111111]">
                    {key.toLowerCase()}
                  </span>
                  <span className="text-[13px] text-[#6C6B71]">
                    {meta.english}
                  </span>
                  <BadgePill label={simplifyGroup(meta.group)} variant="neutral" />
                  <BadgePill level={meta.cefr} />
                </div>
              </ListRow>
            </Link>
          );
        })}
      </ListContainer>

      <CountLabel
        showing={filteredVerbs.length}
        total={(verbData as any).order.length}
        noun="verbs"
      />
    </PageShell>
  );
}
