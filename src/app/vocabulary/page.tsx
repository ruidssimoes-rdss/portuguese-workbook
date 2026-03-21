"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  FilterBar,
  CardShell,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

import vocabData from "@/data/vocab.json";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCefrCounts(words: typeof vocabData.categories[number]["words"]) {
  const counts: Record<string, number> = {};
  words.forEach((w) => {
    counts[w.cefr] = (counts[w.cefr] || 0) + 1;
  });
  return counts;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VocabularyPage() {
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const totalWords = useMemo(
    () => vocabData.categories.reduce((s, c) => s + c.words.length, 0),
    []
  );

  const filtered = useMemo(() => {
    return vocabData.categories.filter((cat) => {
      // CEFR filter: category matches if it has any words at that level
      if (cefr !== "All") {
        const hasLevel = cat.words.some((w) => w.cefr === cefr);
        if (!hasLevel) return false;
      }

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        return (
          cat.title.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [cefr, search]);

  return (
    <PageShell>
      <PageHeader
        title="Vocabulário"
        subtitle={`${totalWords} words across ${vocabData.categories.length} categories`}
      />

      <FilterBar
        filterOptions={cefrOptions}
        filterValue={cefr}
        onFilterChange={setCefr}
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cat) => {
          const cefrCounts = getCefrCounts(cat.words);
          const wordCount =
            cefr !== "All"
              ? cefrCounts[cefr] || 0
              : cat.words.length;

          return (
            <Link
              key={cat.id}
              href={cefr !== "All" ? `/vocabulary/${cat.id}?level=${cefr}` : `/vocabulary/${cat.id}`}
              className="block"
            >
              <CardShell interactive>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="text-[14px] font-medium text-[#111111]">
                    {cat.title}
                  </div>
                  <span className="text-[12px] text-[#9B9DA3] flex-shrink-0 ml-3">
                    {wordCount} words
                  </span>
                </div>
                <div className="text-[12px] text-[#6C6B71] leading-relaxed mb-3">
                  {cat.description}
                </div>
                <div className="flex gap-1">
                  {Object.entries(cefrCounts)
                    .sort()
                    .map(([level, count]) => (
                      <BadgePill
                        key={level}
                        level={level}
                        label={`${level}: ${count}`}
                      />
                    ))}
                </div>
              </CardShell>
            </Link>
          );
        })}
      </div>

      <CountLabel
        showing={filtered.length}
        total={vocabData.categories.length}
        noun="categories"
      />
    </PageShell>
  );
}
