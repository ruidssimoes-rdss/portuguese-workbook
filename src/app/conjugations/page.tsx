"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
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

import verbData from "@/data/verbs.json";
import { getGroupedVerbs } from "@/data/verb-groups";

// ─── Helpers ────────────────────────────────────────────────────────────────

function simplifyGroup(group: string): string {
  if (group.startsWith("Regular -AR")) return "Regular -AR";
  if (group.startsWith("Regular -ER")) return "Regular -ER";
  if (group.startsWith("Regular -IR")) return "Regular -IR";
  return "Irregular";
}

/** Strip prefixes for short jump nav labels */
function shortLabel(label: string): string {
  return label
    .replace(/^Regular -[A-Z]{2}: /, "")
    .replace(/^Irregular -[A-Z]{2}: /, "")
    .replace(/^Irregular: /, "");
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function SortIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h7M3 12h5M3 18h3M16 6l4 4M16 6v14" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={active ? "text-[#111111]" : "text-[#9B9DA3]"}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={active ? "text-[#111111]" : "text-[#9B9DA3]"}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];
const groupFilterOptions = ["All", "Regular -AR", "Regular -ER", "Regular -IR", "Irregular"];

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

// ─── Section Header ─────────────────────────────────────────────────────────

function GroupHeader({ label, labelPt }: { label: string; labelPt?: string }) {
  return (
    <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-2">
      {label}
      {labelPt && (
        <span className="ml-2 normal-case tracking-normal italic font-normal">
          {labelPt}
        </span>
      )}
    </div>
  );
}

// ─── Verb Row (List View) ───────────────────────────────────────────────────

function VerbRow({ verbKey, search }: { verbKey: string; search: string }) {
  const meta = (verbData as any).verbs[verbKey].meta;
  return (
    <Link href={`/conjugations/${verbKey.toLowerCase()}`} className="block">
      <ListRow>
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-3">
          <span className="text-[14px] font-medium text-[#111111]">
            {verbKey.toLowerCase()}
          </span>
          <span className="text-[13px] text-[#6C6B71]">{meta.english}</span>
          <BadgePill label={simplifyGroup(meta.group)} variant="neutral" />
          <BadgePill level={meta.cefr} />
          <ChevronRight size={16} className="text-[#9B9DA3]" />
        </div>
        {search &&
          (() => {
            const q = search.toLowerCase();
            const metaMatch =
              verbKey.toLowerCase().includes(q) ||
              meta.english.toLowerCase().includes(q);
            if (metaMatch) return null;
            const matchingConj = (
              (verbData as any).verbs[verbKey].conjugations || []
            ).find((c: any) => (c.Conjugation || "").toLowerCase().includes(q));
            if (!matchingConj) return null;
            return (
              <div className="text-[11px] text-[#9B9DA3] mt-1">
                &ldquo;{matchingConj.Conjugation}&rdquo; —{" "}
                {matchingConj.Person}, {matchingConj.Tense}
              </div>
            );
          })()}
      </ListRow>
    </Link>
  );
}

// ─── Verb Card (Grid View) ──────────────────────────────────────────────────

function VerbCard({ verbKey }: { verbKey: string }) {
  const meta = (verbData as any).verbs[verbKey].meta;
  return (
    <Link href={`/conjugations/${verbKey.toLowerCase()}`} className="block">
      <div className="group border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2.5 hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#111111]">
            {verbKey.toLowerCase()}
          </span>
          <BadgePill level={meta.cefr} />
        </div>
        <div className="text-[12px] text-[#9B9DA3] mt-0.5">{meta.english}</div>
        <div className="text-[10px] text-[#9B9DA3] font-mono mt-0.5">
          {simplifyGroup(meta.group)}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ConjugationsPage() {
  const [cefr, setCefr] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "alpha">("default");
  const [view, setView] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("conj-view") as "list" | "grid") || "list";
    }
    return "list";
  });

  useEffect(() => {
    localStorage.setItem("conj-view", view);
  }, [view]);

  const activeFilterCount = groupFilter !== "All" ? 1 : 0;

  // Filter by CEFR
  const cefrFiltered = useMemo(() => {
    return (verbData as any).order.filter((key: string) => {
      const meta = (verbData as any).verbs[key].meta;
      if (cefr !== "All" && meta.cefr !== cefr) return false;
      return true;
    });
  }, [cefr]);

  // Filter by conjugation group
  const groupFiltered = useMemo(() => {
    if (groupFilter === "All") return cefrFiltered;
    return cefrFiltered.filter((key: string) => {
      const group = (verbData as any).verbs[key].meta.group.toLowerCase();
      if (groupFilter === "Regular -AR")
        return group.includes("-ar");
      if (groupFilter === "Regular -ER")
        return group.includes("-er") && !group.includes("-ir");
      if (groupFilter === "Regular -IR")
        return group.includes("-ir");
      if (groupFilter === "Irregular")
        return group.startsWith("irregular") || group.includes("impersonal");
      return true;
    });
  }, [cefrFiltered, groupFilter]);

  // Search (includes deep conjugation search)
  const searchFiltered = useMemo(() => {
    if (!search) return groupFiltered;
    const q = search.toLowerCase();
    return groupFiltered.filter((key: string) => {
      const meta = (verbData as any).verbs[key].meta;
      const metaMatch =
        key.toLowerCase().includes(q) ||
        meta.english.toLowerCase().includes(q);
      const conjMatch = (
        (verbData as any).verbs[key].conjugations || []
      ).some((c: any) => (c.Conjugation || "").toLowerCase().includes(q));
      return metaMatch || conjMatch;
    });
  }, [groupFiltered, search]);

  // Sort
  const sortedVerbs = useMemo(() => {
    const verbs = [...searchFiltered];
    if (sortBy === "alpha") {
      verbs.sort((a: string, b: string) => a.localeCompare(b, "pt"));
    }
    return verbs;
  }, [searchFiltered, sortBy]);

  // Group into sections (only when not searching and not sorting A-Z)
  const groups = useMemo(() => {
    if (sortBy === "alpha") return null;
    if (search) return null;
    const result = getGroupedVerbs(sortedVerbs);
    return result.length > 0 ? result : null;
  }, [sortedVerbs, sortBy, search]);

  return (
    <PageShell>
      <PageHeader
        title="Conjugações"
        subtitle={`${(verbData as any).order.length} verbs · 6 tenses`}
      />

      {/* ─── Filter bar (standard layout) ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <SegmentedFilter
          options={cefrOptions}
          value={cefr}
          onChange={setCefr}
        />

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg border-[0.5px] transition-colors ${
              activeFilterCount > 0
                ? "border-[#111111] text-[#111111] bg-[#F7F7F5]"
                : "border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71]"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 text-[10px] bg-[#111111] text-white rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg shadow-md p-3 min-w-[200px]">
                <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-1">
                  Conjugation type
                </div>
                <div className="space-y-0.5">
                  {groupFilterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setGroupFilter(opt);
                        setFilterOpen(false);
                      }}
                      className={`block w-full text-left px-2 py-1.5 rounded text-[12px] transition-colors ${
                        groupFilter === opt
                          ? "bg-[#F7F7F5] text-[#111111]"
                          : "text-[#6C6B71] hover:bg-[#F7F7F5]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Sort + View toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setSortBy((s) => (s === "default" ? "alpha" : "default"))
            }
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[12px] transition-colors ${
              sortBy === "alpha"
                ? "bg-[#F7F7F5] text-[#111111]"
                : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
          >
            <SortIcon />
            A-Z
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "list" ? "bg-[#F7F7F5] text-[#111111]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
            aria-label="List view"
          >
            <ListIcon active={view === "list"} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "grid" ? "bg-[#F7F7F5] text-[#111111]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
            aria-label="Grid view"
          >
            <GridIcon active={view === "grid"} />
          </button>
        </div>

        <SearchInput
          placeholder="Search verbs..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* ─── Group Explainer ─────────────────────────────────────────── */}
      {groupFilter !== "All" && groupExplainers[groupFilter] && (
        <div className="bg-[#F7F7F5] rounded-lg px-4 py-3 mb-3">
          <div className="text-[13px] font-medium text-[#111111] mb-1">
            {groupExplainers[groupFilter].title}
          </div>
          <div className="text-[12px] text-[#6C6B71] leading-relaxed">
            {groupExplainers[groupFilter].description}
          </div>
        </div>
      )}

      {/* ─── Jump Nav pills ──────────────────────────────────────────── */}
      {groups && groups.length > 1 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                document
                  .getElementById(`vgroup-${i}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-2 py-0.5 rounded text-[10px] text-[#9B9DA3] hover:text-[#6C6B71] hover:bg-[rgba(0,0,0,0.03)] transition-colors"
            >
              {shortLabel(g.label)}
              <span className="ml-0.5 text-[#C8C8CC]">{g.verbs.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── List View with Sections ─────────────────────────────────── */}
      {view === "list" && groups && (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={gi} id={`vgroup-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <ListContainer>
                {group.verbs.map((key: string) => (
                  <VerbRow key={key} verbKey={key} search={search} />
                ))}
              </ListContainer>
            </div>
          ))}
        </div>
      )}

      {/* ─── List View flat ──────────────────────────────────────────── */}
      {view === "list" && !groups && (
        <ListContainer>
          {sortedVerbs.map((key: string) => (
            <VerbRow key={key} verbKey={key} search={search} />
          ))}
        </ListContainer>
      )}

      {/* ─── Grid View with Sections ─────────────────────────────────── */}
      {view === "grid" && groups && (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={gi} id={`vgroup-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.verbs.map((key: string) => (
                  <VerbCard key={key} verbKey={key} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Grid View flat ──────────────────────────────────────────── */}
      {view === "grid" && !groups && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedVerbs.map((key: string) => (
            <VerbCard key={key} verbKey={key} />
          ))}
        </div>
      )}

      <CountLabel
        showing={sortedVerbs.length}
        total={(verbData as any).order.length}
        noun="verbs"
      />
    </PageShell>
  );
}
