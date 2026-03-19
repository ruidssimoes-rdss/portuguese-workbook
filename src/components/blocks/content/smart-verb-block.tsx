"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PronunciationButton, ResponsiveSwitcher } from "../primitives";
import { patterns, cefrBadgeClasses, verbGroupBadgeClasses } from "@/lib/design-tokens";

// ── Types ────────────────────────────────────────────────

export interface SmartVerbBlockData {
  verb: string;
  verbTranslation: string;
  verbSlug: string;
  pronunciation?: string;
  verbGroup: string;
  cefr: string;
  priority?: string;
  tenses: Array<{
    name: string;
    label: string;
    cefr: string;
    conjugations: Array<{
      pronoun: string;
      form: string;
      example?: string;
      translation?: string;
      note?: string;
      isException?: boolean;
    }>;
  }>;
}

interface SmartVerbBlockProps {
  data: SmartVerbBlockData;
  variant?: "expanded" | "collapsed" | "drill";
  className?: string;
}

const TENSE_COLORS: Record<string, { text: string; bg: string }> = {
  Present: { text: "text-emerald-700", bg: "bg-emerald-50" },
  Preterite: { text: "text-amber-800", bg: "bg-orange-50" },
  Imperfect: { text: "text-violet-700", bg: "bg-violet-50" },
  Future: { text: "text-blue-700", bg: "bg-blue-50" },
  Conditional: { text: "text-amber-700", bg: "bg-amber-50" },
  "Present Subjunctive": { text: "text-pink-700", bg: "bg-pink-50" },
};

const ALL_TENSES = ["All", "Present", "Preterite", "Imperfect", "Future", "Conditional", "Present Subjunctive"];

// ── Expanded Variant ────────────────────────────────────

function ExpandedVariant({ data, className }: SmartVerbBlockProps) {
  const searchParams = useSearchParams();
  const initialTense = searchParams.get("tense");
  const highlightForm = searchParams.get("highlight");

  const [tenseFilter, setTenseFilter] = useState(initialTense || "All");
  const [flashHighlight, setFlashHighlight] = useState(false);

  useEffect(() => {
    if (initialTense && ALL_TENSES.includes(initialTense)) setTenseFilter(initialTense);
  }, [initialTense]);

  useEffect(() => {
    if (!highlightForm) return;
    setFlashHighlight(true);
    const t1 = setTimeout(() => {
      document.getElementById(`conj-${highlightForm}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    const t2 = setTimeout(() => setFlashHighlight(false), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [highlightForm]);

  const tenses = Array.isArray(data.tenses) ? data.tenses : [];
  const filteredTenses = tenseFilter === "All"
    ? tenses
    : tenses.filter((t) => t.name === tenseFilter);

  // Flatten all conjugations with tense context
  const rows = filteredTenses.flatMap((t) =>
    (Array.isArray(t.conjugations) ? t.conjugations : []).map((c) => ({ ...c, tense: t.name, tenseLabel: t.label, tenseCefr: t.cefr }))
  );

  return (
    <div className={className}>
      {/* Tense filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {ALL_TENSES.filter((t) => t === "All" || tenses.some((dt) => dt.name === t)).map((t) => (
          <button
            key={t}
            onClick={() => setTenseFilter(t)}
            className={tenseFilter === t ? patterns.pill.active : patterns.pill.inactive}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Mobile card layout */}
      <ResponsiveSwitcher
        mobileContent={
          <div className="space-y-2">
            {rows.map((r, i) => {
              const tc = TENSE_COLORS[r.tense] ?? { text: "text-[#6B7280]", bg: "bg-[#F3F4F6]" };
              const isHL = highlightForm && r.form === decodeURIComponent(highlightForm);
              return (
                <div
                  key={i}
                  id={isHL ? `conj-${r.form}` : undefined}
                  className={`border rounded-xl p-4 ${
                    r.isException ? "border-amber-200 bg-amber-50" : "border-[#E5E7EB] bg-white"
                  } ${isHL && flashHighlight ? "url-highlight" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`${patterns.badge} ${tc.text} ${tc.bg}`}>{r.tense}</span>
                    <span className="text-[13px] text-[#6B7280]">{r.pronoun}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#111827]">{r.form}</p>
                    <PronunciationButton text={r.form} size="sm" />
                  </div>
                  {r.example && <p className="text-[13px] text-[#6B7280] italic mt-1.5">{r.example}</p>}
                  {r.translation && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{r.translation}</p>}
                  {r.note && <p className={`text-[12px] mt-1 ${r.isException ? "text-amber-800" : "text-[#9CA3AF]"}`}>{r.note}</p>}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    <span className={`${patterns.badge} ${cefrBadgeClasses(r.tenseCefr)}`}>{r.tenseCefr}</span>
                    <span className={`${patterns.badge} ${r.isException ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50"}`}>
                      {r.isException ? "Irreg." : "Reg."}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        }
        desktopContent={
          <div className="rounded-xl bg-white overflow-hidden">
            <table className="w-full text-[14px] border-collapse table-auto">
              <thead>
                <tr>
                  <th className="text-left text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] px-4 py-3 border-b border-[#F3F4F6]">Tense</th>
                  <th className="text-left text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] px-4 py-3 border-b border-[#F3F4F6]">Person</th>
                  <th className="text-left text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] px-4 py-3 border-b border-[#F3F4F6]">Form</th>
                  <th className="text-left text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] px-4 py-3 border-b border-[#F3F4F6]">Example</th>
                  <th className="text-left text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] px-4 py-3 border-b border-[#F3F4F6]">CEFR</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const tc = TENSE_COLORS[r.tense] ?? { text: "text-[#6B7280]", bg: "bg-[#F3F4F6]" };
                  const isHL = highlightForm && r.form === decodeURIComponent(highlightForm);
                  return (
                    <tr
                      key={i}
                      id={isHL ? `conj-${r.form}` : undefined}
                      className={`hover:bg-[#F9FAFB] transition-colors duration-100 ${isHL && flashHighlight ? "bg-[#F3F4F6]" : ""} ${
                        r.isException ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-4 border-b border-[#F9FAFB]">
                        <span className={`${patterns.badge} ${tc.text} ${tc.bg}`}>{r.tense}</span>
                      </td>
                      <td className="px-4 py-4 border-b border-[#F9FAFB] font-medium text-[#111827]">{r.pronoun}</td>
                      <td className="px-4 py-4 border-b border-[#F9FAFB]">
                        <div className="flex items-center gap-1.5 group">
                          <span className="font-semibold text-[#111827]">{r.form}</span>
                          <PronunciationButton text={r.form} size="sm" className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150" />
                        </div>
                      </td>
                      <td className="px-4 py-4 border-b border-[#F9FAFB] text-[#6B7280] italic text-[13px]">
                        {r.example}
                        {r.translation && <span className="block text-[#9CA3AF] not-italic mt-0.5">{r.translation}</span>}
                      </td>
                      <td className="px-4 py-4 border-b border-[#F9FAFB]">
                        <span className={`${patterns.badge} ${cefrBadgeClasses(r.tenseCefr)}`}>{r.tenseCefr}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
}

// ── Collapsed Variant ────────────────────────────────────

function CollapsedVariant({ data, className }: SmartVerbBlockProps) {
  return (
    <div className={`${patterns.card.interactive} ${className ?? ""}`}>
      <div className="text-[15px] font-semibold text-[#111827] mb-1">{data.verb}</div>
      <div className="text-[13px] text-[#6B7280] leading-relaxed flex-1">{data.verbTranslation}</div>
      <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
        <span className={`${patterns.badge} ${verbGroupBadgeClasses(data.verbGroup)}`}>
          {data.verbGroup.startsWith("Regular -") ? data.verbGroup.replace("Regular ", "") : data.verbGroup.startsWith("Irregular") ? "Irregular" : data.verbGroup}
        </span>
        <span className={`${patterns.badge} ${cefrBadgeClasses(data.cefr)}`}>{data.cefr}</span>
      </div>
    </div>
  );
}

// ── Drill Variant ────────────────────────────────────────

function DrillVariant({ data, className }: SmartVerbBlockProps) {
  const firstTense = Array.isArray(data.tenses) ? data.tenses[0] : undefined;
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {firstTense?.label ?? ""}
      </p>
      <p className="text-[16px] font-bold text-[#111827] mt-1">{data.verb}</p>
      <p className="text-[13px] text-[#6B7280] mt-0.5">{data.verbTranslation}</p>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────

export function SmartVerbBlock(props: SmartVerbBlockProps) {
  const { variant = "expanded" } = props;
  switch (variant) {
    case "collapsed": return <CollapsedVariant {...props} />;
    case "drill": return <DrillVariant {...props} />;
    default: return <ExpandedVariant {...props} />;
  }
}
