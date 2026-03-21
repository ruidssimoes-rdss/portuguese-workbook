"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  BadgePill,
  SegmentedFilter,
  SectionLabel,
} from "@/components/primitives";

import verbData from "@/data/verbs.json";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ConjugationDetailPage() {
  const params = useParams();
  const slug = params.verb as string;
  const verbKey = slug.toUpperCase();
  const verb = (verbData as any).verbs[verbKey];

  const tenses: string[] = useMemo(() => {
    if (!verb) return [];
    return [
      ...new Set(verb.conjugations.map((c: any) => c.Tense)),
    ] as string[];
  }, [verb]);

  const [tenseFilter, setTenseFilter] = useState("All");

  const filteredConj = useMemo(() => {
    if (!verb) return [];
    if (tenseFilter === "All") return verb.conjugations;
    return verb.conjugations.filter((c: any) => c.Tense === tenseFilter);
  }, [verb, tenseFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredConj.forEach((c: any) => {
      if (!groups[c.Tense]) groups[c.Tense] = [];
      groups[c.Tense].push(c);
    });
    return groups;
  }, [filteredConj]);

  if (!verb) {
    return (
      <PageShell>
        <PageHeader title="Verb not found" />
      </PageShell>
    );
  }

  const meta = verb.meta;

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link
          href="/conjugations"
          className="hover:text-[#6C6B71] transition-colors"
        >
          Conjugations
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{slug.toLowerCase()}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em]">
          {slug.toLowerCase()}
        </h1>
        <div className="text-[13px] text-[#6C6B71] mt-1">{meta.english}</div>
        <div className="flex gap-1.5 mt-3">
          <BadgePill level={meta.cefr} />
          <BadgePill label={meta.group} variant="neutral" />
          {meta.priority && (
            <BadgePill label={meta.priority} variant="neutral" />
          )}
        </div>
      </div>

      {/* Tense filter */}
      <div className="mb-6 overflow-x-auto">
        <SegmentedFilter
          options={["All", ...tenses]}
          value={tenseFilter}
          onChange={setTenseFilter}
        />
      </div>

      {/* Conjugation tables grouped by tense */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([tense, rows]) => (
          <div key={tense}>
            <SectionLabel>{tense}</SectionLabel>
            <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden">
              {(rows as any[]).map((row, i) => {
                const person = row.Person.split(" (")[0];
                return (
                  <div
                    key={i}
                    className={`grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr] items-center px-4 py-2.5 text-[13px] ${
                      i > 0
                        ? "border-t-[0.5px] border-[rgba(0,0,0,0.06)]"
                        : ""
                    }`}
                  >
                    <span className="text-[#9B9DA3] text-[12px]">
                      {person}
                    </span>
                    <span className="text-[#111111] font-medium">
                      {row.Conjugation}
                    </span>
                    <span className="text-[#6C6B71] text-[12px] hidden md:block">
                      {row["Example Sentence"]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
