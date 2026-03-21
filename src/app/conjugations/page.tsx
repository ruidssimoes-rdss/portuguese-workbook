"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

const groupExplainers: Record<string, { title: string; description: string }> = {
  "Regular -AR": {
    title: "Regular -AR verbs",
    description:
      "The largest verb group in Portuguese. Remove -ar and add: -o, -as, -a, -amos, -am (present tense). Examples: falar, morar, trabalhar. Once you learn the pattern, you can conjugate hundreds of verbs.",
  },
  "Regular -ER": {
    title: "Regular -ER verbs",
    description:
      "The second conjugation group. Remove -er and add: -o, -es, -e, -emos, -em (present tense). Examples: comer, beber, viver. Fewer verbs than -AR but same predictable pattern.",
  },
  "Regular -IR": {
    title: "Regular -IR verbs",
    description:
      "The third conjugation group. Remove -ir and add: -o, -es, -e, -imos, -em (present tense). Examples: partir, abrir, decidir. Very similar to -ER endings except for nós (-imos).",
  },
  Irregular: {
    title: "Irregular verbs",
    description:
      "Verbs that don't follow standard conjugation patterns. Includes the most common Portuguese verbs: ser, estar, ter, ir, fazer, poder, dizer. Each has unique forms that must be memorised individually.",
  },
};

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
        const metaMatch =
          key.toLowerCase().includes(q) ||
          meta.english.toLowerCase().includes(q);
        const conjMatch = ((verbData as any).verbs[key].conjugations || []).some(
          (c: any) => (c.Conjugation || "").toLowerCase().includes(q)
        );
        return metaMatch || conjMatch;
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

      {group !== "All" && groupExplainers[group] && (
        <div className="bg-[#F7F7F5] rounded-lg px-4 py-3 mb-6">
          <div className="text-[13px] font-medium text-[#111111] mb-1">
            {groupExplainers[group].title}
          </div>
          <div className="text-[12px] text-[#6C6B71] leading-relaxed">
            {groupExplainers[group].description}
          </div>
        </div>
      )}

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
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-3">
                  <span className="text-[14px] font-medium text-[#111111]">
                    {key.toLowerCase()}
                  </span>
                  <span className="text-[13px] text-[#6C6B71]">
                    {meta.english}
                  </span>
                  <BadgePill label={simplifyGroup(meta.group)} variant="neutral" />
                  <BadgePill level={meta.cefr} />
                  <ChevronRight size={16} className="text-[#9B9DA3]" />
                </div>
                {search && (() => {
                  const q = search.toLowerCase();
                  const metaMatch = key.toLowerCase().includes(q) || meta.english.toLowerCase().includes(q);
                  if (metaMatch) return null;
                  const matchingConj = ((verbData as any).verbs[key].conjugations || []).find(
                    (c: any) => (c.Conjugation || "").toLowerCase().includes(q)
                  );
                  if (!matchingConj) return null;
                  return (
                    <div className="text-[11px] text-[#9B9DA3] mt-1">
                      &ldquo;{matchingConj.Conjugation}&rdquo; — {matchingConj.Person}, {matchingConj.Tense}
                    </div>
                  );
                })()}
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
