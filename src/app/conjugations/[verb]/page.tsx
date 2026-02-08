"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import {
  Badge,
  tenseVariant,
  cefrVariant,
  priorityVariant,
} from "@/components/ui/badge";
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
  const slug = (params.verb as string).toUpperCase();
  const verb = data.verbs[slug];
  const [tenseFilter, setTenseFilter] = useState("All");

  if (!verb) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1100px] mx-auto px-10 py-16">
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
      <main className="px-6 md:px-10">
        {/* Compact header */}
        <div className="flex items-center justify-between gap-4 flex-wrap py-5">
          <div className="flex items-center gap-2">
            <Link
              href="/conjugations"
              className="text-text-3 hover:text-text transition-colors"
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
            <span className="text-[13px] text-text-3 ml-1">
              · {m.english} · {m.group}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Badge variant={priorityVariant[m.priority]}>{m.priority}</Badge>
            <Badge variant={cefrVariant[m.cefr]}>CEFR {m.cefr}</Badge>
          </div>
        </div>

        {/* Tense filters */}
        <div className="flex gap-1.5 flex-wrap mb-4 pb-3 border-b border-border-l">
          {tenses.map((t) => (
            <button
              key={t}
              onClick={() => setTenseFilter(t)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap ${
                tenseFilter === t
                  ? "bg-text text-white border-text"
                  : "bg-white text-text-2 border-border hover:bg-bg-s hover:border-[#ccc]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mobile: card layout */}
        <div className="md:hidden space-y-2 mb-12">
          {rows.map((r, i) => {
            const person = r.Person.split(" (")[0];
            return (
              <div
                key={i}
                className="border border-border-l rounded-lg p-4 bg-white"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant={tenseVariant[r.Tense] || "gray"}>
                    {r.Tense}
                  </Badge>
                  <span className="text-[13px] text-text-2">{person}</span>
                </div>
                <p className="text-[16px] font-bold tracking-tight text-text">
                  {r.Conjugation}
                </p>
                {r["Example Sentence"] && (
                  <p className="text-[13px] text-text-2 italic mt-1.5">
                    {r["Example Sentence"]}
                  </p>
                )}
                {r["English Translation"] && (
                  <p className="text-[12px] text-text-3 mt-0.5">
                    {r["English Translation"]}
                  </p>
                )}
                {r.Notes && (
                  <p className="text-[12px] text-text-3 mt-1 truncate" title={r.Notes}>
                    {r.Notes}
                  </p>
                )}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  <Badge variant={cefrVariant[r["CEFR (Tense)"]] || "gray"}>
                    {r["CEFR (Tense)"]}
                  </Badge>
                  <Badge variant={r.Type === "Exception" ? "orange" : "green"}>
                    {r.Type === "Exception" ? "Irreg." : "Reg."}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto mb-12 border border-border rounded-xl bg-white">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {[
                  "Tense",
                  "Person",
                  "Conjugation",
                  "Example",
                  "Translation",
                  "Notes",
                  "CEFR",
                  "Type",
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
              {rows.map((r, i) => {
                const newTense =
                  tenseFilter === "All" && r.Tense !== lastTense && lastTense !== "";
                lastTense = r.Tense;
                const person = r.Person.split(" (")[0];

                return (
                  <tr
                    key={i}
                    className={`hover:bg-bg-s ${newTense ? "border-t-2 border-border" : ""}`}
                  >
                    <td className="px-3.5 py-2.5 border-b border-border-l whitespace-nowrap">
                      <Badge variant={tenseVariant[r.Tense] || "gray"}>
                        {r.Tense}
                      </Badge>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l font-medium whitespace-nowrap">
                      {person}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l font-bold tracking-tight whitespace-nowrap">
                      {r.Conjugation}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l text-text-2 italic text-[12.5px] whitespace-nowrap">
                      {r["Example Sentence"]}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l text-text-3 text-[12px] whitespace-nowrap">
                      {r["English Translation"]}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l text-text-2 text-[12px] whitespace-nowrap">
                      {r.Notes}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l whitespace-nowrap">
                      <Badge variant={cefrVariant[r["CEFR (Tense)"]] || "gray"}>
                        {r["CEFR (Tense)"]}
                      </Badge>
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-border-l whitespace-nowrap">
                      <Badge variant={r.Type === "Exception" ? "orange" : "green"}>
                        {r.Type === "Exception" ? "Irreg." : "Reg."}
                      </Badge>
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
