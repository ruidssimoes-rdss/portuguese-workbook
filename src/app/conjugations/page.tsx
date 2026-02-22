"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { CEFRBadge, VerbGroupBadge } from "@/components/ui/badge";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import Link from "next/link";

const data = verbData as unknown as VerbDataSet;

const totalConjugations = data.order.reduce(
  (sum, key) => sum + (data.verbs[key]?.conjugations?.length ?? 0),
  0
);

function matchFilters(
  meta: { group: string; cefr: string; priority: string },
  typeFilter: string,
  levelFilter: string | null,
  priorityFilter: string | null
): boolean {
  if (typeFilter !== "All") {
    if (typeFilter === "Irregular" && !meta.group.startsWith("Irregular")) return false;
    if (typeFilter === "Regular -AR" && !meta.group.startsWith("Regular -AR")) return false;
    if (typeFilter === "Regular -ER" && !meta.group.startsWith("Regular -ER")) return false;
    if (typeFilter === "Regular -IR" && !meta.group.startsWith("Regular -IR")) return false;
  }
  if (levelFilter && meta.cefr !== levelFilter) return false;
  if (priorityFilter && meta.priority !== priorityFilter) return false;
  return true;
}

function shortGroup(group: string): string {
  if (group.startsWith("Irregular")) return "Irregular";
  if (group.startsWith("Regular -AR")) return "-AR";
  if (group.startsWith("Regular -ER")) return "-ER";
  if (group.startsWith("Regular -IR")) return "-IR";
  return group;
}

export default function ConjugationsPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const verbs = data.order.filter((v) => {
    const m = data.verbs[v].meta;
    if (!matchFilters(m, typeFilter, levelFilter, priorityFilter)) return false;
    if (q && !v.toLowerCase().includes(q) && !m.english.toLowerCase().includes(q))
      return false;
    return true;
  });

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Conjugations"
            titlePt="Conjugações"
            subtitle={<>{data.order.length} verbs · {totalConjugations.toLocaleString()} conjugations · 6 tenses</>}
          />
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {["All", "Irregular", "Regular -AR", "Regular -ER", "Regular -IR"].map((f) => (
                <FilterPill
                  key={f}
                  active={typeFilter === f}
                  onClick={() => setTypeFilter(f)}
                >
                  {f === "Regular -AR" ? "-AR" : f === "Regular -ER" ? "-ER" : f === "Regular -IR" ? "-IR" : f}
                </FilterPill>
              ))}
            </div>
            <div className="w-px h-5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              {["A1", "A2", "B1"].map((f) => (
                <FilterPill
                  key={f}
                  active={levelFilter === f}
                  onClick={() => setLevelFilter((prev) => (prev === f ? null : f))}
                >
                  {f}
                </FilterPill>
              ))}
            </div>
            <div className="w-px h-5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              {["Essential", "Core", "Useful"].map((f) => (
                <FilterPill
                  key={f}
                  active={priorityFilter === f}
                  onClick={() => setPriorityFilter((prev) => (prev === f ? null : f))}
                >
                  {f}
                </FilterPill>
              ))}
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
              <SearchInput
                value={search}
                onChange={(v) => setSearch(v)}
                placeholder="Search verbs..."
              />
            </div>
          </div>
          <Divider className="mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-16">
          {verbs.map((v) => {
            const m = data.verbs[v].meta;
            return (
              <Link
                key={v}
                href={`/conjugations/${v.toLowerCase()}`}
                className="block group"
              >
                <Card interactive className="flex flex-col min-h-[140px] h-full">
                  <div className="text-[15px] font-semibold text-text mb-1">
                    {v}
                  </div>
                  <div className="text-[13px] text-text-secondary leading-relaxed flex-1">
                    {m.english}
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
                    <VerbGroupBadge group={m.group} label={shortGroup(m.group)} />
                    <CEFRBadge level={m.cefr} />
                  </div>
                </Card>
              </Link>
            );
          })}
          {verbs.length === 0 && (
            <EmptyState message="No verbs match your filter." className="col-span-full text-center" />
          )}
        </div>
      </PageContainer>
    </>
  );
}
