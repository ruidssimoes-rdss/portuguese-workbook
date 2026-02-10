"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabCategory } from "@/types/vocab";
import Link from "next/link";

const data = vocabData as unknown as VocabData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

const SECTIONS: { label: string; categoryIds: string[] }[] = [
  {
    label: "Essentials",
    categoryIds: ["greetings-expressions", "numbers-time", "colours-weather"],
  },
  {
    label: "Daily Life",
    categoryIds: [
      "food-drink",
      "home-rooms",
      "family-daily-routine",
      "shopping-money",
    ],
  },
  {
    label: "World & Self",
    categoryIds: [
      "travel-directions",
      "work-education",
      "health-body",
      "nature-animals",
      "emotions-personality",
      "colloquial-slang",
    ],
  },
];

function countByLevel(categories: VocabCategory[]) {
  const a1 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "A1").length,
    0
  );
  const a2 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "A2").length,
    0
  );
  const b1 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "B1").length,
    0
  );
  return { a1, a2, b1, total: a1 + a2 + b1 };
}

function categoryLevelCount(cat: VocabCategory, level: Exclude<CefrFilter, "All">) {
  return cat.words.filter((w) => w.cefr === level).length;
}

function categoryMatchesSearch(cat: VocabCategory, q: string): number {
  if (!q.trim()) return -1;
  const lower = q.toLowerCase();
  if (
    cat.title.toLowerCase().includes(lower) ||
    cat.description.toLowerCase().includes(lower)
  )
    return -1;
  const inWords = cat.words.filter(
    (w) =>
      w.portuguese.toLowerCase().includes(lower) ||
      w.english.toLowerCase().includes(lower)
  ).length;
  return inWords > 0 ? inWords : -1;
}

export default function VocabularyPage() {
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");
  const [search, setSearch] = useState("");

  const levelCounts = useMemo(() => countByLevel(data.categories), []);

  const categoriesBySection = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SECTIONS.map((section) => {
      let cats = data.categories.filter((c) =>
        section.categoryIds.includes(c.id)
      );

      if (cefrFilter !== "All") {
        cats = cats.filter(
          (c) => categoryLevelCount(c, cefrFilter as "A1" | "A2" | "B1") > 0
        );
      }

      if (q) {
        cats = cats.filter((c) => {
          const titleOrDesc =
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q);
          const wordMatches = categoryMatchesSearch(c, search);
          return titleOrDesc || wordMatches > 0;
        });
      }

      return { ...section, categories: cats };
    }).filter((s) => s.categories.length > 0);
  }, [cefrFilter, search]);

  const displayTotalWords =
    cefrFilter === "All"
      ? levelCounts.total
      : levelCounts[cefrFilter.toLowerCase() as "a1" | "a2" | "b1"];
  const displayCategoryCount = categoriesBySection.reduce(
    (s, sec) => s + sec.categories.length,
    0
  );

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-12 md:py-16">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-[36px] font-bold tracking-tight text-gray-900">
                Vocabulary
              </h1>
              <p className="text-[14px] text-gray-500 mt-1">
                {displayTotalWords.toLocaleString()} words · {displayCategoryCount} categories · A1–B1
              </p>
              <div className="flex gap-6 text-sm text-gray-400 mt-2">
                <span>
                  A1: <span className="font-medium text-gray-600">{levelCounts.a1} words</span>
                </span>
                <span>
                  A2: <span className="font-medium text-gray-600">{levelCounts.a2} words</span>
                </span>
                <span>
                  B1: <span className="font-medium text-gray-600">{levelCounts.b1} words</span>
                </span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#5B4FA0]/50 w-[200px] transition-colors"
            />
          </div>
        </section>

        <div className="flex items-center gap-2 flex-wrap pb-6 border-t border-gray-200 pt-5">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setCefrFilter(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                cefrFilter === level
                  ? "bg-[#5B4FA0] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {categoriesBySection.map((section, sectionIndex) => (
            <div key={section.label}>
              <h2
                className={`text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 ${
                  sectionIndex === 0 ? "" : "mt-8"
                }`}
              >
                {section.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.categories.map((cat) => {
                  const wordCount =
                    cefrFilter === "All"
                      ? cat.words.length
                      : categoryLevelCount(
                          cat,
                          cefrFilter as "A1" | "A2" | "B1"
                        );
                  const matchCount = search.trim()
                    ? categoryMatchesSearch(cat, search)
                    : -1;
                  const showMatchNote =
                    matchCount > 0 &&
                    !cat.title.toLowerCase().includes(search.trim().toLowerCase()) &&
                    !cat.description
                      .toLowerCase()
                      .includes(search.trim().toLowerCase());

                  return (
                    <Link
                      key={cat.id}
                      href={`/vocabulary/${cat.id}`}
                      className="group bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:border-[#5B4FA0]/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 min-w-0">
                          {cat.title}
                        </h3>
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {wordCount} word{wordCount !== 1 ? "s" : ""}
                          {showMatchNote && ` · ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {cat.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {categoriesBySection.length === 0 && (
            <p className="text-sm text-gray-500 py-8">
              No categories match your filter.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
