"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { getProgress } from "@/lib/progress";
import type { UserProgress } from "@/types/levels";
import {
  SUB_LEVEL_ORDER,
  type LevelsData,
  type ConjugationSubLevel,
  type VocabSubLevel,
  type GrammarSubLevel,
} from "@/types/levels";
import levelsDataRaw from "@/data/levels.json";

const levelsData = levelsDataRaw as unknown as LevelsData;

const SECTION_COLORS = {
  conjugations: { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8" },
  vocabulary: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D" },
  grammar: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309" },
} as const;

const SECTION_ORDER = ["conjugations", "vocabulary", "grammar"] as const;

function getLevelIndex(level: string): number {
  const i = SUB_LEVEL_ORDER.indexOf(level as (typeof SUB_LEVEL_ORDER)[number]);
  return i >= 0 ? i : 0;
}

function getLevelInfo(
  section: keyof typeof SECTION_COLORS,
  level: string
): { label: string; description: string } {
  const data = levelsData[section] as Record<
    string,
    ConjugationSubLevel | VocabSubLevel | GrammarSubLevel
  >;
  const info = data[level];
  if (!info) return { label: level, description: "" };
  return { label: info.label, description: info.description };
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const refreshProgress = () => setProgress(getProgress());

  useEffect(() => {
    refreshProgress();
  }, []);

  useEffect(() => {
    const onFocus = () => refreshProgress();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (progress === null) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-12">
          <p className="text-text-2">Loading...</p>
        </main>
      </>
    );
  }

  const totalTests =
    (progress.conjugations.completedAt ? 1 : 0) +
    (progress.vocabulary.completedAt ? 1 : 0) +
    (progress.grammar.completedAt ? 1 : 0);
  const lastTested = progress.lastTestDate
    ? new Date(progress.lastTestDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const sectionLevels = [
    { key: "conjugations" as const, level: progress.conjugations.level },
    { key: "vocabulary" as const, level: progress.vocabulary.level },
    { key: "grammar" as const, level: progress.grammar.level },
  ];
  const bestSection = sectionLevels.reduce((best, s) =>
    getLevelIndex(s.level) > getLevelIndex(best.level) ? s : best
  );

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10">
        <header className="pt-12 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text">
            Your Progress
          </h1>
          <p className="text-text-2 mt-1 text-[15px]">
            Track your European Portuguese journey from A1 to B1
          </p>
        </header>

        {/* Progress track — 3 rows, 15 segments per row (A1 / A2 / B1 bands) */}
        <section className="pb-12">
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <div className="inline-flex flex-col min-w-0">
              {/* Band labels: same width as label column, then 3 equal columns over the track */}
              <div className="flex items-center mb-3 text-[11px] font-semibold text-text-3">
                <span className="w-[6.5rem] min-w-[6.5rem] shrink-0" aria-hidden />
                <div className="flex w-[388px] md:w-[628px] shrink-0">
                  <span className="flex-1 text-center">A1</span>
                  <span className="flex-1 text-center">A2</span>
                  <span className="flex-1 text-center">B1</span>
                </div>
                <span className="w-12 shrink-0" aria-hidden />
              </div>
              <div className="space-y-4">
                {SECTION_ORDER.map((sec) => {
                  const currentIdx = getLevelIndex(progress[sec].level);
                  const color = SECTION_COLORS[sec].border;
                  return (
                    <div
                      key={sec}
                      className="flex items-center gap-3"
                    >
                      <span className="text-[13px] font-medium text-text capitalize w-[6.5rem] min-w-[6.5rem] shrink-0">
                        {sec}
                      </span>
                      <div className="flex gap-0.5 w-[388px] md:w-[628px] shrink-0">
                        {SUB_LEVEL_ORDER.map((levelKey, i) => {
                          const filled = i <= currentIdx;
                          const info = getLevelInfo(sec, levelKey);
                          const tooltip = `${levelKey} — ${info.label}`;
                          return (
                            <span
                              key={levelKey}
                              className="relative h-2 w-6 md:w-10 shrink-0 rounded-sm transition-all duration-150 group/seg"
                              style={{
                                background: filled
                                  ? `linear-gradient(to right, ${color}, ${color}E6)`
                                  : "#E5E7EB",
                              }}
                              title={tooltip}
                            >
                              <span
                                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-[12px] text-white whitespace-nowrap opacity-0 group-hover/seg:opacity-100 transition-opacity duration-200 delay-200 z-10"
                                style={{ backgroundColor: "#1F2937" }}
                              >
                                {tooltip}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      <span
                        className="text-[12px] font-semibold shrink-0 px-2 py-0.5 rounded text-white ml-3"
                        style={{ backgroundColor: color }}
                      >
                        {progress[sec].level}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12">
          {SECTION_ORDER.map((section) => {
            const level = progress[section].level;
            const info = getLevelInfo(section, level);
            const levelIdx = getLevelIndex(level);
            const progressPct = ((levelIdx + 1) / 15) * 100;
            const hasTested = !!progress[section].completedAt;
            const grammarDisabled = section === "grammar";
            const colors = SECTION_COLORS[section];

            return (
              <div
                key={section}
                className="border border-border rounded-xl p-6 bg-white transition-all duration-150 overflow-hidden hover:border-[#ccc] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-px"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: colors.border,
                }}
              >
                <div
                  className="h-1 -mx-6 -mt-6 mb-4"
                  style={{ background: `linear-gradient(to bottom, ${colors.border}0D, transparent)` }}
                />
                <h2 className="text-lg font-bold tracking-tight text-text capitalize">
                  {section}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: colors.border }}
                  >
                    {level}
                  </span>
                  {hasTested && progress[section].testScore != null && (
                    <span className="text-[12px] text-text-3">
                      {Math.round(progress[section].testScore!)}%
                    </span>
                  )}
                  <span className="text-[13px] text-text-2">{info.label}</span>
                </div>
                <p className="text-[13px] text-text-2 mt-2">
                  {info.description}
                </p>
                <div className="mt-3">
                  <div className="h-1.5 bg-bg-s rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: colors.border,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-text-3 mt-1">
                    {levelIdx + 1} / 15
                  </p>
                </div>
                <div className="border-t border-border-l mt-4 pt-4">
                  {!grammarDisabled ? (
                    <Link
                      href={`/dashboard/test/${section}`}
                      className={`inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        hasTested
                          ? "border-2 bg-transparent hover:bg-bg-s"
                          : "text-white hover:opacity-90"
                      }`}
                      style={
                        hasTested
                          ? { borderColor: colors.border, color: colors.border }
                          : { backgroundColor: colors.border }
                      }
                    >
                      {hasTested ? "Retake Test" : "Take Placement Test"}
                    </Link>
                  ) : (
                    <div
                      className="inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-xl border border-border text-text-3 cursor-not-allowed bg-bg-s"
                      title="Coming soon — grammar content needed"
                    >
                      Take Placement Test (coming soon)
                    </div>
                  )}
                  {hasTested && progress[section].completedAt && (
                    <p className="text-[11px] text-text-3 mt-2">
                      {new Date(
                        progress[section].completedAt!
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick stats */}
        <section className="border-t border-border-l pt-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="border border-border rounded-xl p-4 bg-white"
              style={{ borderTopWidth: 3, borderTopColor: SECTION_COLORS.conjugations.border }}
            >
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider">
                Best Section
              </p>
              <p className="text-[15px] font-semibold text-text mt-0.5 capitalize">
                {bestSection.key} {progress[bestSection.key].level}
              </p>
            </div>
            <div
              className="border border-border rounded-xl p-4 bg-white"
              style={{ borderTopWidth: 3, borderTopColor: SECTION_COLORS.vocabulary.border }}
            >
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider">
                Total Tests Taken
              </p>
              <p className="text-[15px] font-semibold text-text mt-0.5">
                {totalTests}
              </p>
            </div>
            <div
              className="border border-border rounded-xl p-4 bg-white"
              style={{ borderTopWidth: 3, borderTopColor: SECTION_COLORS.grammar.border }}
            >
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider">
                Last Tested
              </p>
              <p className="text-[15px] font-semibold text-text mt-0.5">
                {lastTested ?? "Never"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
