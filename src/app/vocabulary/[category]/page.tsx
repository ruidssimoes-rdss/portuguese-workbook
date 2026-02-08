"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import vocabData from "@/data/vocab.json";
import type { VocabData } from "@/types/vocab";

const data = vocabData as unknown as VocabData;

function stripEmoji(s: string): string {
  return s.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, "").replace(/\s+/g, " ").trim();
}

export default function VocabCategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  const category = data.categories.find((c) => c.id === slug);

  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState("All");
  const [subFilter, setSubFilter] = useState("All");

  if (!category) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1100px] mx-auto px-10 py-16">
          <p className="text-text-2">Category not found.</p>
          <Link href="/vocabulary" className="text-text-2 underline mt-2 block">
            ← Back to vocabulary
          </Link>
        </main>
      </>
    );
  }

  const subcategories = useMemo(() => {
    const subs = new Set(category.words.map((w) => w.subcategory));
    return ["All", ...Array.from(subs).sort()];
  }, [category]);

  const q = search.toLowerCase();
  const filtered = category.words.filter((w) => {
    if (cefrFilter !== "All" && w.cefr !== cefrFilter) return false;
    if (subFilter !== "All" && w.subcategory !== subFilter) return false;
    if (
      q &&
      !w.portuguese.toLowerCase().includes(q) &&
      !w.english.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  return (
    <>
      <Topbar />
      <main className="px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col gap-2 py-5">
          <Link
            href="/vocabulary"
            className="text-text-2 hover:text-text text-[14px] transition-colors w-fit"
          >
            ← {stripEmoji(category.title)}
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-[22px] font-bold tracking-tight">
              {stripEmoji(category.title)}
            </h1>
            <input
            type="text"
            placeholder="Search words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-[13px] bg-white text-text outline-none focus:border-[#999] w-[180px] transition-colors"
          />
          </div>
          <p className="text-[13px] text-text-3">{category.words.length} words</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap mb-4 pb-3 border-b border-border-l">
          <div className="flex gap-1.5 flex-wrap">
            {["All", "A1", "A2", "B1"].map((l) => (
              <button
                key={l}
                onClick={() => setCefrFilter(l)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap ${
                  cefrFilter === l
                    ? "bg-text text-white border-text"
                    : "bg-white text-text-2 border-border hover:bg-bg-s hover:border-[#ccc]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-border shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {subcategories.map((s) => (
              <button
                key={s}
                onClick={() => setSubFilter(s)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap capitalize ${
                  subFilter === s
                    ? "bg-text text-white border-text"
                    : "bg-white text-text-2 border-border hover:bg-bg-s hover:border-[#ccc]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: card layout */}
        <div className="md:hidden space-y-2 mb-12">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-text-3 text-[14px]">
              No words match your filter.
            </p>
          ) : (
            filtered.map((w, i) => (
              <div
                key={i}
                className="border border-border-l rounded-lg p-4 bg-white"
              >
                <p className="text-[16px] font-bold tracking-tight text-text">
                  {w.portuguese}
                  {w.gender && (
                    <span className="text-[13px] font-normal text-text-2 ml-1">
                      ({w.gender === "m" ? "m." : "f."})
                    </span>
                  )}
                </p>
                <p className="text-[14px] text-text-2 mt-0.5">{w.english}</p>
                {w.example && (
                  <p className="text-[13px] text-text-2 italic mt-2">
                    {w.example}
                  </p>
                )}
                {w.exampleTranslation && (
                  <p className="text-[12px] text-text-3 mt-0.5">
                    {w.exampleTranslation}
                  </p>
                )}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <Badge variant={cefrVariant[w.cefr] || "gray"}>{w.cefr}</Badge>
                  <Badge variant="gray" className="capitalize">
                    {w.subcategory}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto mb-12 border border-border rounded-xl bg-white">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {[
                  "Portuguese",
                  "English",
                  "Gender",
                  "Example",
                  "Translation",
                  "CEFR",
                  "Topic",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-border bg-bg-s sticky top-0 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={i} className="hover:bg-bg-s">
                  <td className="px-3.5 py-2.5 border-b border-border-l font-bold tracking-tight whitespace-nowrap">
                    {w.portuguese}
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l text-text-2 whitespace-nowrap">
                    {w.english}
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l text-text-3 whitespace-nowrap">
                    {w.gender === "m"
                      ? "masc."
                      : w.gender === "f"
                        ? "fem."
                        : "—"}
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l text-text-2 italic text-[12.5px] whitespace-nowrap">
                    {w.example}
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l text-text-3 text-[12px] whitespace-nowrap">
                    {w.exampleTranslation}
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l whitespace-nowrap">
                    <Badge variant={cefrVariant[w.cefr] || "gray"}>
                      {w.cefr}
                    </Badge>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-border-l text-text-3 text-[12px] capitalize whitespace-nowrap">
                    {w.subcategory}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-text-3 text-[14px]"
                  >
                    No words match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
