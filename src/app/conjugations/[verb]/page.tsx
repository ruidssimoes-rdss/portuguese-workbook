"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { cefrPillClass } from "@/lib/cefr";
import { PronunciationButton } from "@/components/pronunciation-button";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";

const data = verbData as unknown as VerbDataSet;

const tenses = [
  "All",
  "Present",
  "Preterite",
  "Imperfect",
  "Future",
  "Conditional",
  "Present Subjunctive",
];

export default function VerbPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.verb as string).toUpperCase();
  const verb = data.verbs[slug];
  const initialTense = searchParams.get("tense");
  const highlightConjugation = searchParams.get("highlight");
  const [tenseFilter, setTenseFilter] = useState(initialTense || "All");
  const [flashHighlight, setFlashHighlight] = useState(false);
  const highlightedRowRef = useRef<HTMLTableRowElement | HTMLDivElement | null>(null);

  // Sync initial tense from URL (e.g. from search result)
  useEffect(() => {
    if (initialTense && tenses.includes(initialTense)) setTenseFilter(initialTense);
  }, [initialTense]);

  // Scroll to and flash conjugation row when ?highlight= is set
  useEffect(() => {
    if (!highlightConjugation || !verb) return;
    setFlashHighlight(true);
    const t = setTimeout(() => {
      highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    const t2 = setTimeout(() => setFlashHighlight(false), 2000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [highlightConjugation, verb]);

  if (!verb) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto w-full px-4 md:px-6 lg:px-10 py-16">
          <p className="text-text-2">Verb not found.</p>
          <Link href="/conjugations" className="text-text-2 underline mt-2 block">
            ← Back to all verbs
          </Link>
        </main>
      </>
    );
  }

  const m = verb.meta;
  const rows =
    tenseFilter === "All"
      ? verb.conjugations
      : verb.conjugations.filter((r) => r.Tense === tenseFilter);

  let lastTense = "";

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto w-full px-4 md:px-6 lg:px-10">
        {/* Header */}
        <div className="py-5">
          <Link
            href="/conjugations"
            className="text-text-2 hover:text-text text-[13px] transition-colors w-fit"
          >
            ← Conjugations
          </Link>
          <div className="flex items-start justify-between gap-4 mt-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#111827]">{slug}</h1>
                <PronunciationButton text={slug} size="md" className="shrink-0" />
                {m.pronunciation && (
                  <span className="text-sm text-text-muted font-mono">{m.pronunciation}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                {m.english} · {m.group}
              </p>
            </div>
            <div className="flex gap-1.5 flex-wrap shrink-0">
              <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                m.priority === "Essential" ? "text-red-700 bg-red-50"
                : m.priority === "Core" ? "text-blue-700 bg-blue-50"
                : "text-text-secondary bg-border-light"
              }`}>{m.priority}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(m.cefr)}`}>
                {m.cefr}
              </span>
            </div>
          </div>

          {/* Tense filters */}
          <div className="flex flex-wrap items-center gap-1.5 mt-6">
            {tenses.map((t) => (
              <button
                key={t}
                onClick={() => setTenseFilter(t)}
                className={
                  tenseFilter === t
                    ? "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer"
                    : "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer bg-white whitespace-nowrap"
                }
              >
                {t}
              </button>
            ))}
          </div>
          <div className="border-t border-[#F3F4F6] mt-4" />
        </div>

        {/* Mobile: card layout */}
        <div className="md:hidden space-y-2 mb-12">
          {rows.map((r, i) => {
            const person = r.Person.split(" (")[0];
            const isHighlight = highlightConjugation && r.Conjugation === decodeURIComponent(highlightConjugation);
            return (
              <div
                key={i}
                ref={isHighlight ? (highlightedRowRef as React.RefObject<HTMLDivElement>) : undefined}
                className={`border rounded-xl p-4 ${
                  r.Type === "Exception" ? "border-amber-200 bg-amber-50" : "border-[#E5E7EB] bg-white"
                } ${isHighlight && flashHighlight ? "ring-2 ring-[#111827] ring-offset-2" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                    r.Tense === "Present" ? "text-emerald-700 bg-emerald-50"
                    : r.Tense === "Preterite" ? "text-amber-800 bg-orange-50"
                    : r.Tense === "Imperfect" ? "text-violet-700 bg-violet-50"
                    : r.Tense === "Future" ? "text-blue-700 bg-blue-50"
                    : r.Tense === "Conditional" ? "text-amber-700 bg-amber-50"
                    : r.Tense === "Present Subjunctive" ? "text-pink-700 bg-pink-50"
                    : "text-text-secondary bg-border-light"
                  }`}>{r.Tense}</span>
                  <span className="text-[13px] text-text-2">{person}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold tracking-tight text-text">
                    {r.Conjugation}
                  </p>
                  <PronunciationButton text={r.Conjugation} size="sm" variant="muted" />
                </div>
                {r["Example Sentence"] && (
                  <p className="text-[13px] text-text-2 italic mt-1.5 break-words">
                    {r["Example Sentence"]}
                  </p>
                )}
                {r["English Translation"] && (
                  <p className="text-[12px] text-text-3 mt-0.5 break-words">
                    {r["English Translation"]}
                  </p>
                )}
                {r.Notes && (
                  <p className={`text-[12px] mt-1 break-words ${r.Type === "Exception" ? "text-amber-800" : "text-text-3"}`}>
                    {r.Notes}
                  </p>
                )}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(r["CEFR (Tense)"])}`}>
                    {r["CEFR (Tense)"]}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                    r.Type === "Exception" ? "text-amber-700 bg-amber-50"
                    : "text-emerald-700 bg-emerald-50"
                  }`}>
                    {r.Type === "Exception" ? "Irreg." : "Reg."}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table — full width, no scroll, text wraps; Notes only when a tense is selected */}
        <div className="hidden md:block mb-12 border border-[#E5E7EB] rounded-xl bg-white">
          <table className="w-full text-[13px] border-collapse table-auto">
            <thead>
              <tr>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface whitespace-nowrap">
                  Tense
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface whitespace-nowrap">
                  Person
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface whitespace-nowrap">
                  Conjugation
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface min-w-0">
                  Example
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface min-w-0">
                  Translation
                </th>
                {tenseFilter !== "All" && (
                  <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface min-w-0">
                    Notes
                  </th>
                )}
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface whitespace-nowrap">
                  CEFR
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E5E7EB] bg-surface whitespace-nowrap">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const newTense =
                  tenseFilter === "All" && r.Tense !== lastTense && lastTense !== "";
                lastTense = r.Tense;
                const person = r.Person.split(" (")[0];
                const isHighlight = highlightConjugation && r.Conjugation === decodeURIComponent(highlightConjugation);

                return (
                  <tr
                    key={i}
                    ref={isHighlight ? (highlightedRowRef as React.RefObject<HTMLTableRowElement>) : undefined}
                    className={`hover:bg-surface ${newTense ? "border-t-2 border-[#E5E7EB]" : ""} ${
                      isHighlight && flashHighlight ? "bg-[#F3F4F6]" : ""
                    }`}
                  >
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                        r.Tense === "Present" ? "text-emerald-700 bg-emerald-50"
                        : r.Tense === "Preterite" ? "text-amber-800 bg-orange-50"
                        : r.Tense === "Imperfect" ? "text-violet-700 bg-violet-50"
                        : r.Tense === "Future" ? "text-blue-700 bg-blue-50"
                        : r.Tense === "Conditional" ? "text-amber-700 bg-amber-50"
                        : r.Tense === "Present Subjunctive" ? "text-pink-700 bg-pink-50"
                        : "text-text-secondary bg-border-light"
                      }`}>{r.Tense}</span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] font-medium whitespace-nowrap">
                      {person}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold tracking-tight">{r.Conjugation}</span>
                        <PronunciationButton text={r.Conjugation} size="sm" variant="muted" />
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] text-text-2 italic text-[12px] min-w-0 break-words">
                      {r["Example Sentence"]}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] text-text-3 text-[12px] min-w-0 break-words">
                      {r["English Translation"]}
                    </td>
                    {tenseFilter !== "All" && (
                      <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] text-text-2 text-[12px] min-w-0 break-words">
                        {r.Notes}
                      </td>
                    )}
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(r["CEFR (Tense)"])}`}>
                        {r["CEFR (Tense)"]}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E5E7EB] whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                        r.Type === "Exception" ? "text-amber-700 bg-amber-50"
                        : "text-emerald-700 bg-emerald-50"
                      }`}>
                        {r.Type === "Exception" ? "Irreg." : "Reg."}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
