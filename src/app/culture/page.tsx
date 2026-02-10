"use client";

import { useMemo, useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import sayingsData from "@/data/sayings.json";
import type { SayingsData, Saying } from "@/types/saying";
import { PronunciationButton } from "@/components/pronunciation-button";
import { normalizeForSearch } from "@/lib/search";

const data = sayingsData as unknown as SayingsData;
const sayings = data.sayings;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

const THEMES = [
  "All",
  "Life",
  "Wisdom",
  "Patience",
  "Character",
  "Relationships",
  "Food",
  "Weather",
  "Money",
  "Work",
  "Humor",
] as const;
type ThemeFilter = (typeof THEMES)[number];

const THEME_TO_KEY: Record<string, string> = {
  Life: "life",
  Wisdom: "wisdom",
  Patience: "patience",
  Character: "character",
  Relationships: "relationships",
  Food: "food",
  Weather: "weather",
  Money: "money",
  Work: "work",
  Humor: "humor",
};

function countByCefr() {
  const a1 = sayings.filter((s) => s.cefr === "A1").length;
  const a2 = sayings.filter((s) => s.cefr === "A2").length;
  const b1 = sayings.filter((s) => s.cefr === "B1").length;
  return { a1, a2, b1 };
}

const counts = countByCefr();

function SayingCard({
  saying,
  isHighlighted,
}: {
  saying: Saying;
  isHighlighted?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(saying.portuguese).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [saying.portuguese]);

  const hasExample = !!saying.example;

  return (
    <article
      id={saying.id}
      className={`bg-white border rounded-lg p-6 mb-4 hover:border-[#5B4FA0]/30 hover:shadow-sm transition-all duration-200 ${
        isHighlighted ? "ring-2 ring-[#5B4FA0]/40 border-[#5B4FA0]/30" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-gray-900 italic">
            &quot;{saying.portuguese}&quot;
          </p>
          <p className="text-sm font-mono text-gray-400 mt-1">{saying.pronunciation}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PronunciationButton text={saying.portuguese} size="sm" />
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {saying.cefr}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-[#5B4FA0] px-2 py-1 rounded border border-gray-200 hover:border-[#5B4FA0]/30 transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-3">
        <p className="text-sm font-semibold text-gray-500 mb-0.5">Literal:</p>
        <p className="text-sm text-gray-700">{saying.literal}</p>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-3">
        <p className="text-sm font-semibold text-gray-700 mb-0.5">Meaning:</p>
        <p className="text-sm text-gray-700">{saying.meaning}</p>
      </div>

      <div className="border-t border-gray-100 pt-3 mt-3">
        <p className="text-sm font-semibold text-gray-500 mb-0.5">When to use:</p>
        <p className="text-sm text-gray-700">{saying.usage}</p>
      </div>

      {hasExample && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <button
            type="button"
            onClick={() => setExampleOpen((o) => !o)}
            className="text-sm font-semibold text-gray-500 hover:text-[#5B4FA0]"
          >
            Example {exampleOpen ? "–" : "+"}
          </button>
          {exampleOpen && (
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <p className="text-sm text-gray-900 italic">{saying.example}</p>
              {saying.exampleTranslation && (
                <p className="text-sm text-gray-500 mt-1">{saying.exampleTranslation}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 mt-3">
        <span className="inline-block bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs">
          {THEMES.find((t) => t !== "All" && THEME_TO_KEY[t] === saying.theme) ?? saying.theme}
        </span>
      </div>
    </article>
  );
}

function CultureContent() {
  const searchParams = useSearchParams();
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>("All");
  const [search, setSearch] = useState("");
  const highlightId = searchParams.get("highlight");

  const filtered = useMemo(() => {
    let list = sayings;
    if (cefrFilter !== "All") list = list.filter((s) => s.cefr === cefrFilter);
    if (themeFilter !== "All") {
      const key = THEME_TO_KEY[themeFilter];
      list = list.filter((s) => s.theme === key);
    }
    if (search.trim()) {
      const q = normalizeForSearch(search.trim());
      list = list.filter((s) => {
        const pt = normalizeForSearch(s.portuguese);
        const lit = normalizeForSearch(s.literal);
        const mean = normalizeForSearch(s.meaning);
        const use = normalizeForSearch(s.usage);
        return pt.includes(q) || lit.includes(q) || mean.includes(q) || use.includes(q);
      });
    }
    return list;
  }, [cefrFilter, themeFilter, search]);

  useEffect(() => {
    if (!highlightId || filtered.length === 0) return;
    const inFiltered = filtered.some((s) => s.id === highlightId);
    if (!inFiltered) return;
    const t = setTimeout(() => {
      document.getElementById(highlightId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
    return () => clearTimeout(t);
  }, [highlightId, filtered]);

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-12 md:py-16">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-[36px] font-bold tracking-tight text-gray-900">
                Culture & Expressions
              </h1>
              <p className="text-lg text-[#5B4FA0]/70 font-medium -mt-1">
                Cultura e Expressões
              </p>
              <p className="text-[14px] text-gray-500 mt-1">
                {sayings.length} sayings & proverbs · A1–B1
              </p>
              <div className="flex gap-6 text-sm text-gray-400 mt-2">
                <span>
                  A1: <span className="font-medium text-gray-600">{counts.a1} sayings</span>
                </span>
                <span>
                  A2: <span className="font-medium text-gray-600">{counts.a2} sayings</span>
                </span>
                <span>
                  B1: <span className="font-medium text-gray-600">{counts.b1} sayings</span>
                </span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search sayings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#5B4FA0]/50 w-[200px] transition-colors"
            />
          </div>
        </section>

        <div className="flex flex-col gap-4 pb-6 border-t border-gray-200 pt-5">
          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="flex items-center gap-2 flex-wrap">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setThemeFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  themeFilter === t
                    ? "bg-[#5B4FA0] text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {sayings.length}
          </p>
        </div>

        <div className="pb-16">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 py-8">No sayings match your filters.</p>
          ) : (
            <div className="max-w-none">
              {filtered.map((saying) => (
                <SayingCard
                  key={saying.id}
                  saying={saying}
                  isHighlighted={highlightId === saying.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function CulturePage() {
  return (
    <Suspense
      fallback={
        <>
          <Topbar />
          <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10 py-12">
            <p className="text-gray-500">Loading...</p>
          </main>
        </>
      }
    >
      <CultureContent />
    </Suspense>
  );
}
