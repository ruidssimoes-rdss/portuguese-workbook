"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  SegmentedFilter,
  SearchInput,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
  AudioButton,
} from "@/components/primitives";

import vocabData from "@/data/vocab.json";
import { getWordGroups } from "@/data/vocab-groups";

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Icons ──────────────────────────────────────────────────────────────────

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={active ? "text-[#111111]" : "text-[#9B9DA3]"}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      className={active ? "text-[#111111]" : "text-[#9B9DA3]"}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h7M3 12h5M3 18h3M16 6l4 4M16 6v14" />
    </svg>
  );
}

// ─── Word Row (List View) ───────────────────────────────────────────────────

function WordRow({ word }: { word: any }) {
  return (
    <ListRow className="group">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-medium text-[#111111]">
              {word.portuguese}
            </span>
            <AudioButton text={word.portuguese} className="md:opacity-0 md:group-hover:opacity-100" />
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

function WordCard({ word }: { word: any }) {
  return (
    <div className="group border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2.5 hover:border-[rgba(0,0,0,0.12)] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#111111]">{word.portuguese}</span>
        <div className="flex items-center gap-1">
          <BadgePill level={word.cefr} />
          <AudioButton
            text={word.portuguese}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
          />
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

// ─── Page Content ───────────────────────────────────────────────────────────

function VocabularyDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.category as string;
  const category = vocabData.categories.find((c) => c.id === slug);
  const initialLevel = searchParams.get("level") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [cefr, setCefr] = useState(initialLevel);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<"default" | "alpha">("default");
  const [view, setView] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("vocab-view") as "list" | "grid") || "list";
    }
    return "list";
  });

  useEffect(() => {
    localStorage.setItem("vocab-view", view);
  }, [view]);

  // Filter words by CEFR and search
  const filteredWords = useMemo(() => {
    if (!category) return [];
    return category.words.filter((word) => {
      if (cefr !== "All" && word.cefr !== cefr) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          word.portuguese.toLowerCase().includes(q) ||
          word.english.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, cefr, search]);

  // Sort
  const sortedWords = useMemo(() => {
    const words = [...filteredWords];
    if (sortBy === "alpha") {
      words.sort((a, b) => a.portuguese.localeCompare(b.portuguese, "pt"));
    }
    return words;
  }, [filteredWords, sortBy]);

  // Group (only when not searching and not sorting alphabetically)
  const groups = useMemo(() => {
    if (sortBy === "alpha") return null;
    if (search) return null;
    return getWordGroups(slug, sortedWords);
  }, [slug, sortedWords, sortBy, search]);

  if (!category) {
    return (
      <PageShell>
        <PageHeader
          title="Category not found"
          subtitle="This vocabulary category doesn't exist."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link
          href="/vocabulary"
          className="hover:text-[#6C6B71] transition-colors"
        >
          Vocabulary
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{category.title}</span>
      </div>

      <PageHeader
        title={category.title}
        subtitle={`${category.words.length} words — ${category.description}`}
      />

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <SegmentedFilter
          options={cefrOptions}
          value={cefr}
          onChange={setCefr}
        />
        <div className="flex-1" />
        <button
          onClick={() => setSortBy((s) => (s === "default" ? "alpha" : "default"))}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[12px] transition-colors ${
            sortBy === "alpha"
              ? "bg-[#F7F7F5] text-[#111111]"
              : "text-[#9B9DA3] hover:text-[#6C6B71]"
          }`}
        >
          <SortIcon />
          A-Z
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "list" ? "bg-[#F7F7F5]" : "hover:bg-[rgba(0,0,0,0.03)]"
            }`}
            aria-label="List view"
          >
            <ListIcon active={view === "list"} />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "grid" ? "bg-[#F7F7F5]" : "hover:bg-[rgba(0,0,0,0.03)]"
            }`}
            aria-label="Grid view"
          >
            <GridIcon active={view === "grid"} />
          </button>
        </div>
        <SearchInput
          placeholder="Search words..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* Jump nav — only when groups exist and more than 1 */}
      {groups && groups.length > 1 && (
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                document.getElementById(`group-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="px-2.5 py-1 rounded-md text-[11px] text-[#6C6B71] bg-[#F7F7F5] hover:bg-[rgba(0,0,0,0.08)] transition-colors"
            >
              {g.label}
              <span className="text-[#9B9DA3] ml-1">{g.words.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* ─── List View ─────────────────────────────────────────────────── */}
      {view === "list" && groups && (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={gi} id={`group-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <ListContainer>
                {group.words.map((word: any, wi: number) => (
                  <WordRow key={wi} word={word} />
                ))}
              </ListContainer>
            </div>
          ))}
        </div>
      )}

      {view === "list" && !groups && (
        <ListContainer>
          {sortedWords.map((word, i) => (
            <WordRow key={i} word={word} />
          ))}
        </ListContainer>
      )}

      {/* ─── Grid View ─────────────────────────────────────────────────── */}
      {view === "grid" && groups && (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={gi} id={`group-${gi}`}>
              <GroupHeader label={group.label} labelPt={group.labelPt} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {group.words.map((word: any, wi: number) => (
                  <WordCard key={wi} word={word} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "grid" && !groups && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sortedWords.map((word, i) => (
            <WordCard key={i} word={word} />
          ))}
        </div>
      )}

      <CountLabel
        showing={sortedWords.length}
        total={category.words.length}
        noun="words"
      />
    </PageShell>
  );
}

export default function VocabularyDetailPage() {
  return (
    <Suspense fallback={<PageShell><PageHeader title="Loading..." /></PageShell>}>
      <VocabularyDetailContent />
    </Suspense>
  );
}
