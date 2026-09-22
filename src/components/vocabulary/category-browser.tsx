"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterBar, CardShell, BadgePill, CountLabel } from "@/components/primitives";

export interface CategoryCard {
  id: string;
  title: string;
  description: string;
  cefrCounts: Record<string, number>;
  /** Minimal word list so the search box can match words inside a category */
  words: Array<{ portuguese: string; english: string; cefr: string }>;
}

const cefrOptions = ["All", "A1", "A2", "B1"];

export function CategoryBrowser({ categories }: { categories: CategoryCard[] }) {
  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return categories.filter((cat) => {
      if (cefr !== "All" && !cat.words.some((w) => w.cefr === cefr)) return false;
      if (search) {
        const q = search.toLowerCase();
        const categoryMatch =
          cat.title.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
        const wordMatch = cat.words.some(
          (w) => w.portuguese.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)
        );
        return categoryMatch || wordMatch;
      }
      return true;
    });
  }, [categories, cefr, search]);

  return (
    <>
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
          const wordCount = cefr !== "All" ? cat.cefrCounts[cefr] || 0 : cat.words.length;
          const query = [
            cefr !== "All" ? `level=${cefr}` : "",
            search ? `search=${encodeURIComponent(search)}` : "",
          ].filter(Boolean);

          return (
            <Link
              key={cat.id}
              href={`/vocabulary/${cat.id}${query.length ? "?" + query.join("&") : ""}`}
              className="block"
            >
              <CardShell interactive>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="text-[14px] font-medium text-[#111111]">{cat.title}</div>
                  <span className="text-[12px] text-[#9B9DA3] flex-shrink-0 ml-3">{wordCount} words</span>
                </div>
                <div className="text-[12px] text-[#6C6B71] leading-relaxed mb-3">{cat.description}</div>
                <div className="flex gap-1">
                  {Object.entries(cat.cefrCounts)
                    .sort()
                    .map(([level, count]) => (
                      <BadgePill key={level} level={level} label={`${level}: ${count}`} />
                    ))}
                </div>
                {search && (() => {
                  const q = search.toLowerCase();
                  const matchingWords = cat.words.filter(
                    (w) => w.portuguese.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)
                  );
                  if (matchingWords.length === 0) return null;
                  const shown = matchingWords.slice(0, 3);
                  return (
                    <div className="mt-2 pt-2 border-t-[0.5px] border-[rgba(0,0,0,0.06)]">
                      <div className="text-[11px] text-[#9B9DA3] mb-1">
                        {matchingWords.length} matching word{matchingWords.length !== 1 ? "s" : ""}
                      </div>
                      {shown.map((w, i) => (
                        <div key={i} className="text-[12px] text-[#6C6B71]">
                          <span className="font-medium text-[#111111]">{w.portuguese}</span>
                          {" — "}{w.english}
                        </div>
                      ))}
                      {matchingWords.length > 3 && (
                        <div className="text-[11px] text-[#9B9DA3] mt-0.5">+{matchingWords.length - 3} more</div>
                      )}
                    </div>
                  );
                })()}
              </CardShell>
            </Link>
          );
        })}
      </div>

      <CountLabel showing={filtered.length} total={categories.length} noun="categories" />
    </>
  );
}
