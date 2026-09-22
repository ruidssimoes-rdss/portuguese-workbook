"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  SegmentedFilter,
  SearchInput,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
  AudioButton,
} from "@/components/primitives";

export interface Word {
  portuguese: string;
  english: string;
  cefr: string;
  gender?: string | null;
  pronunciation?: string;
}

export interface WordGroup {
  label: string;
  labelPt?: string;
  words: Word[];
}

const cefrOptions = ["All", "A1", "A2", "B1"];

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

// ─── Word Row (List View) ───────────────────────────────────────────────────

function WordRow({ word }: { word: Word }) {
  return (
    <ListRow className="group">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-medium text-[#111111]">
              {word.portuguese}
            </span>
            <AudioButton text={word.portuguese} />
            {word.gender && (
              <span className="text-[11px] text-[#9B9DA3] ml-0.5 italic">
                ({word.gender})
              </span>
            )}
          </div>
          {word.pronunciation && (
            <span className="text-[11px] text-[#9B9DA3] font-mono">
              /{word.pronunciation}/
            </span>
          )}
        </div>
        <span className="text-[13px] text-[#6C6B71]">
          {word.english}
        </span>
        <BadgePill level={word.cefr} />
      </div>
    </ListRow>
  );
}

// ─── Word Card (Grid View) ──────────────────────────────────────────────────

function WordCard({ word }: { word: Word }) {
  return (
    <div className="group border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2.5 hover:border-[rgba(0,0,0,0.12)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#111111]">{word.portuguese}</span>
        <div className="flex items-center gap-1">
          <BadgePill level={word.cefr} />
          <AudioButton text={word.portuguese} />
        </div>
      </div>
      {word.pronunciation && (
        <div className="text-[10px] text-[#9B9DA3] font-mono mt-0.5">
          /{word.pronunciation}/
        </div>
      )}
      <div className="text-[12px] text-[#9B9DA3] mt-0.5">{word.english}</div>
    </div>
  );
}

// ─── Section Label ──────────────────────────────────────────────────────────

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

// ─── Browser ────────────────────────────────────────────────────────────────

export function WordBrowser({
  words,
  groups,
  storageKey,
}: {
  words: Word[];
  /** Server-computed grouping (null when the category has no sections) */
  groups: WordGroup[] | null;
  storageKey: string;
}) {
  const searchParams = useSearchParams();
  const initialLevel = searchParams.get("level") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [cefr, setCefr] = useState(initialLevel);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"default" | "alpha">("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) as "list" | "grid" | null;
      if (saved === "list" || saved === "grid") setView(saved);
    } catch {
      /* private mode */
    }
  }, [storageKey]);

  function changeView(v: "list" | "grid") {
    setView(v);
    try {
      localStorage.setItem(storageKey, v);
    } catch {
      /* private mode */
    }
  }

  const matches = (word: Word) => {
    if (cefr !== "All" && word.cefr !== cefr) return false;
    if (search) {
      const q = search.toLowerCase();
      return word.portuguese.toLowerCase().includes(q) || word.english.toLowerCase().includes(q);
    }
    return true;
  };

  const sortedWords = useMemo(() => {
    const list = words.filter(matches);
    if (sortBy === "alpha") list.sort((a, b) => a.portuguese.localeCompare(b.portuguese, "pt"));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, cefr, search, sortBy]);

  const visibleGroups = useMemo(() => {
    if (!groups || sortBy === "alpha" || search) return null;
    return groups
      .map((g) => ({ ...g, words: g.words.filter(matches) }))
      .filter((g) => g.words.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, cefr, search, sortBy]);

  const hasGroups = visibleGroups && visibleGroups.length > 1;

  return (
    <>
      {/* ─── Filter bar (standard layout) ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <SegmentedFilter options={cefrOptions} value={cefr} onChange={setCefr} />

        {hasGroups && (
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-lg border-[0.5px] transition-colors ${
                filterOpen
                  ? "border-[rgba(0,0,0,0.12)] text-[#111111]"
                  : "border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71]"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filter</span>
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg shadow-lg w-[260px] max-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-between px-3 pt-3 pb-2">
                    <span className="text-[11px] font-medium text-[#9B9DA3] uppercase tracking-[0.05em]">Sections</span>
                    <button onClick={() => setFilterOpen(false)} className="text-[#9B9DA3] hover:text-[#6C6B71]">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="space-y-0.5">
                      {visibleGroups.map((g, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            document.getElementById(`group-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            setFilterOpen(false);
                          }}
                          className="flex items-center justify-between w-full px-2 py-1.5 rounded text-[12px] text-[#6C6B71] hover:bg-[#F7F7F5] transition-colors text-left"
                        >
                          <span className="truncate">{g.label}</span>
                          <span className="text-[10px] text-[#9B9DA3] ml-2 flex-shrink-0">{g.words.length}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

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
        <SearchInput placeholder="Search words..." value={search} onChange={setSearch} />
      </div>

      {view === "list" && visibleGroups && (
        <div className="space-y-6">
          {visibleGroups.map((group, gi) => (
            <div key={gi} id={`group-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <ListContainer>
                {group.words.map((word, wi) => (
                  <WordRow key={wi} word={word} />
                ))}
              </ListContainer>
            </div>
          ))}
        </div>
      )}

      {view === "list" && !visibleGroups && (
        <ListContainer>
          {sortedWords.map((word, i) => (
            <WordRow key={i} word={word} />
          ))}
        </ListContainer>
      )}

      {view === "grid" && visibleGroups && (
        <div className="space-y-6">
          {visibleGroups.map((group, gi) => (
            <div key={gi} id={`group-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.words.map((word, wi) => (
                  <WordCard key={wi} word={word} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "grid" && !visibleGroups && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedWords.map((word, i) => (
            <WordCard key={i} word={word} />
          ))}
        </div>
      )}

      <CountLabel showing={sortedWords.length} total={words.length} noun="words" />
    </>
  );
}
