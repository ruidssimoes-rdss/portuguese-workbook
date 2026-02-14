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
        {/* Compact header */}
        <div className="flex items-center justify-between gap-4 flex-wrap py-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/conjugations"
              className="text-text-2 hover:text-text text-[14px] transition-colors w-fit"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <span className="text-[22px] font-bold tracking-tight">{slug}</span>
            <PronunciationButton text={slug} size="md" className="shrink-0" />
            {m.pronunciation && (
              <span className="text-sm text-[#9CA3AF] font-mono">{m.pronunciation}</span>
            )}
            <span className="text-[13px] text-text-3 ml-1">
              · {m.english} · {m.group}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
              m.priority === "Essential" ? "text-red-700 bg-red-50"
              : m.priority === "Core" ? "text-blue-700 bg-blue-50"
              : "text-[#6B7280] bg-[#F3F4F6]"
            }`}>{m.priority}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(m.cefr)}`}>
              CEFR {m.cefr}
            </span>
          </div>
        </div>

        {/* Tense filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]">
          {tenses.map((t) => (
            <button
              key={t}
              onClick={() => setTenseFilter(t)}
              className={
                tenseFilter === t
                  ? "bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full"
                  : "bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200 whitespace-nowrap"
              }
            >
              {t}
            </button>
          ))}
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
                className={`border rounded-[14px] p-4 ${
                  r.Type === "Exception" ? "border-amber-200 bg-amber-50" : "border-[#E9E9E9] bg-white"
                } ${isHighlight && flashHighlight ? "ring-2 ring-blue-400 bg-sky-50" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                    r.Tense === "Present" ? "text-emerald-700 bg-emerald-50"
                    : r.Tense === "Preterite" ? "text-amber-800 bg-orange-50"
                    : r.Tense === "Imperfect" ? "text-violet-700 bg-violet-50"
                    : r.Tense === "Future" ? "text-blue-700 bg-blue-50"
                    : r.Tense === "Conditional" ? "text-amber-700 bg-amber-50"
                    : r.Tense === "Present Subjunctive" ? "text-pink-700 bg-pink-50"
                    : "text-[#6B7280] bg-[#F3F4F6]"
                  }`}>{r.Tense}</span>
                  <span className="text-[13px] text-text-2">{person}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-bold tracking-tight text-text">
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
        <div className="hidden md:block mb-12 border border-[#E5E5E5] rounded-[14px] bg-white">
          <table className="w-full text-[13px] border-collapse table-auto">
            <thead>
              <tr>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] whitespace-nowrap">
                  Tense
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] whitespace-nowrap">
                  Person
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] whitespace-nowrap">
                  Conjugation
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] min-w-0">
                  Example
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] min-w-0">
                  Translation
                </th>
                {tenseFilter !== "All" && (
                  <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] min-w-0">
                    Notes
                  </th>
                )}
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] whitespace-nowrap">
                  CEFR
                </th>
                <th className="text-left text-[12px] font-semibold text-text-2 px-3.5 py-2.5 border-b border-[#E9E9E9] bg-[#FAFAFA] whitespace-nowrap">
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
                    className={`hover:bg-[#FAFAFA] ${newTense ? "border-t-2 border-[#E9E9E9]" : ""} ${
                      isHighlight && flashHighlight ? "bg-blue-100" : ""
                    }`}
                  >
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                        r.Tense === "Present" ? "text-emerald-700 bg-emerald-50"
                        : r.Tense === "Preterite" ? "text-amber-800 bg-orange-50"
                        : r.Tense === "Imperfect" ? "text-violet-700 bg-violet-50"
                        : r.Tense === "Future" ? "text-blue-700 bg-blue-50"
                        : r.Tense === "Conditional" ? "text-amber-700 bg-amber-50"
                        : r.Tense === "Present Subjunctive" ? "text-pink-700 bg-pink-50"
                        : "text-[#6B7280] bg-[#F3F4F6]"
                      }`}>{r.Tense}</span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] font-medium whitespace-nowrap">
                      {person}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tracking-tight">{r.Conjugation}</span>
                        <PronunciationButton text={r.Conjugation} size="sm" variant="muted" />
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] text-text-2 italic text-[12.5px] min-w-0 break-words">
                      {r["Example Sentence"]}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] text-text-3 text-[12px] min-w-0 break-words">
                      {r["English Translation"]}
                    </td>
                    {tenseFilter !== "All" && (
                      <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] text-text-2 text-[12px] min-w-0 break-words">
                        {r.Notes}
                      </td>
                    )}
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(r["CEFR (Tense)"])}`}>
                        {r["CEFR (Tense)"]}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E9E9E9] whitespace-nowrap">
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
