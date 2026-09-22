"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import {
  SegmentedFilter,
  SearchInput,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

export interface VerbSummary {
  key: string;
  english: string;
  group: string;
  cefr: string;
}

export interface VerbGroupView {
  label: string;
  labelPt?: string;
  verbKeys: string[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function simplifyGroup(group: string): string {
  if (group.startsWith("Regular -AR")) return "Regular -AR";
  if (group.startsWith("Regular -ER")) return "Regular -ER";
  if (group.startsWith("Regular -IR")) return "Regular -IR";
  return "Irregular";
}

/** Strip prefixes for short dropdown labels */
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
const groupFilterOptions = [
  { value: "All", label: "All" },
  { value: "Regular -AR", label: "Regular -AR" },
  { value: "Regular -ER", label: "Regular -ER" },
  { value: "Regular -IR", label: "Regular -IR" },
  { value: "Irregular", label: "Irregular" },
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

function VerbRow({ verb }: { verb: VerbSummary }) {
  const verbKey = verb.key;
  const meta = verb;
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
      </ListRow>
    </Link>
  );
}

// ─── Verb Card (Grid View) ──────────────────────────────────────────────────

function VerbCard({ verb }: { verb: VerbSummary }) {
  const verbKey = verb.key;
  const meta = verb;
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

// ─── Browser ────────────────────────────────────────────────────────────────

export function VerbBrowser({ verbs, groups }: { verbs: VerbSummary[]; groups: VerbGroupView[] }) {
  const [cefr, setCefr] = useState("All");
  const [groupFilter, setGroupFilter] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "alpha">("default");
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("conj-view") as "list" | "grid" | null;
      if (saved === "list" || saved === "grid") setView(saved);
    } catch {
      /* private mode */
    }
  }, []);

  function changeView(v: "list" | "grid") {
    setView(v);
    try {
      localStorage.setItem("conj-view", v);
    } catch {
      /* private mode */
    }
  }

  const activeFilterCount = groupFilter !== "All" ? 1 : 0;

  const matches = (v: VerbSummary) => {
    if (cefr !== "All" && v.cefr !== cefr) return false;
    if (groupFilter !== "All") {
      const group = v.group.toLowerCase();
      const ok =
        groupFilter === "Regular -AR" ? group.includes("-ar") :
        groupFilter === "Regular -ER" ? group.includes("-er") && !group.includes("-ir") :
        groupFilter === "Regular -IR" ? group.includes("-ir") :
        groupFilter === "Irregular" ? group.startsWith("irregular") || group.includes("impersonal") :
        true;
      if (!ok) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return v.key.toLowerCase().includes(q) || v.english.toLowerCase().includes(q);
    }
    return true;
  };

  const sortedVerbs = useMemo(() => {
    const list = verbs.filter(matches);
    if (sortBy === "alpha") list.sort((a, b) => a.key.localeCompare(b.key, "pt"));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verbs, cefr, groupFilter, search, sortBy]);

  const visibleGroups = useMemo(() => {
    if (sortBy === "alpha" || search) return null;
    const byKey = new Map(sortedVerbs.map((v) => [v.key, v]));
    const result = groups
      .map((g) => ({ ...g, verbs: g.verbKeys.map((k) => byKey.get(k)).filter((v): v is VerbSummary => !!v) }))
      .filter((g) => g.verbs.length > 0);
    return result.length > 0 ? result : null;
  }, [groups, sortedVerbs, sortBy, search]);

  const hasGroups = visibleGroups && visibleGroups.length > 1;

  return (
    <>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <SegmentedFilter options={cefrOptions} value={cefr} onChange={setCefr} />

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg border-[0.5px] transition-colors ${
              activeFilterCount > 0 || filterOpen
                ? "border-[rgba(0,0,0,0.12)] text-[#111111]"
                : "border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71]"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] bg-[#111111] text-white rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg shadow-lg w-[260px] max-h-[400px] overflow-y-auto">
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <span className="text-[11px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em]">Filters</span>
                  <button onClick={() => setFilterOpen(false)} className="text-[#9B9DA3] hover:text-[#6C6B71]">
                    <X size={14} />
                  </button>
                </div>

                {hasGroups && (
                  <div className="px-3 pb-3">
                    <div className="text-[10px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em] mb-1.5">Sections</div>
                    <div className="space-y-0.5">
                      {visibleGroups.map((g, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            document.getElementById(`vgroup-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            setFilterOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-2 py-1.5 rounded text-[12px] text-[#6C6B71] hover:bg-[#F7F7F5] transition-colors text-left"
                        >
                          <span className="truncate">{shortLabel(g.label)}</span>
                          <span className="text-[10px] text-[#9B9DA3] ml-2 flex-shrink-0">{g.verbs.length}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasGroups && <div className="border-t-[0.5px] border-[rgba(0,0,0,0.06)] mx-3" />}

                <div className="px-3 py-3">
                  <div className="text-[10px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em] mb-1.5">
                    Conjugation type
                  </div>
                  <div className="space-y-0.5">
                    {groupFilterOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setGroupFilter(opt.value)}
                        className={`flex items-center w-full px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                          groupFilter === opt.value
                            ? "bg-[#F7F7F5] text-[#111111] font-medium"
                            : "text-[#6C6B71] hover:bg-[#F7F7F5]"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border mr-2 flex-shrink-0 flex items-center justify-center ${
                          groupFilter === opt.value ? "border-[#111111] bg-[#111111]" : "border-[rgba(0,0,0,0.15)]"
                        }`}>
                          {groupFilter === opt.value && <span className="block w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div className="border-t-[0.5px] border-[rgba(0,0,0,0.06)] px-3 py-2">
                    <button
                      onClick={() => { setGroupFilter("All"); setFilterOpen(false); }}
                      className="text-[11px] text-[#9B9DA3] hover:text-[#6C6B71]"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortBy((s) => (s === "default" ? "alpha" : "default"))}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[12px] transition-colors ${
              sortBy === "alpha" ? "bg-[#F7F7F5] text-[#111111]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
          >
            <SortIcon />
            A-Z
          </button>
          <button
            onClick={() => changeView("list")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "list" ? "bg-[#F7F7F5] text-[#111111]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
            aria-label="List view"
          >
            <ListIcon active={view === "list"} />
          </button>
          <button
            onClick={() => changeView("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "grid" ? "bg-[#F7F7F5] text-[#111111]" : "text-[#9B9DA3] hover:text-[#6C6B71]"
            }`}
            aria-label="Grid view"
          >
            <GridIcon active={view === "grid"} />
          </button>
        </div>

        <SearchInput placeholder="Search verbs..." value={search} onChange={setSearch} />
      </div>

      {groupFilter !== "All" && groupExplainers[groupFilter] && (
        <div className="bg-[#F7F7F5] rounded-lg px-4 py-3 mb-3">
          <div className="text-[13px] font-medium text-[#111111] mb-1">{groupExplainers[groupFilter].title}</div>
          <div className="text-[12px] text-[#6C6B71] leading-relaxed">{groupExplainers[groupFilter].description}</div>
        </div>
      )}

      {view === "list" && visibleGroups && (
        <div className="space-y-6">
          {visibleGroups.map((group, gi) => (
            <div key={gi} id={`vgroup-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <ListContainer>
                {group.verbs.map((v) => (
                  <VerbRow key={v.key} verb={v} />
                ))}
              </ListContainer>
            </div>
          ))}
        </div>
      )}

      {view === "list" && !visibleGroups && (
        <ListContainer>
          {sortedVerbs.map((v) => (
            <VerbRow key={v.key} verb={v} />
          ))}
        </ListContainer>
      )}

      {view === "grid" && visibleGroups && (
        <div className="space-y-6">
          {visibleGroups.map((group, gi) => (
            <div key={gi} id={`vgroup-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.verbs.map((v) => (
                  <VerbCard key={v.key} verb={v} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "grid" && !visibleGroups && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedVerbs.map((v) => (
            <VerbCard key={v.key} verb={v} />
          ))}
        </div>
      )}

      <CountLabel showing={sortedVerbs.length} total={verbs.length} noun="verbs" />
    </>
  );
}
