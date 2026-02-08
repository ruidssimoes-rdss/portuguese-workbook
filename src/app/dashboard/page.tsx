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
const BAND_LABELS = ["A1", "A2", "B1"] as const;
const BAND_RANGES = [
  { start: 0, end: 5 },
  { start: 5, end: 10 },
  { start: 10, end: 15 },
];

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

  useEffect(() => {
    setProgress(getProgress());
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

        {/* Level track — 15 sub-levels, 3 section dots per position */}
        <section className="pb-12">
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
            <div className="min-w-[520px] md:min-w-0">
              <div className="flex justify-between text-[11px] font-semibold text-text-3 mb-2">
                {BAND_LABELS.map((band, i) => (
                  <span
                    key={band}
                    style={{
                      width: `${((BAND_RANGES[i].end - BAND_RANGES[i].start) / 15) * 100}%`,
                    }}
                    className="text-center"
                  >
                    {band}
                  </span>
                ))}
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border">
                {BAND_RANGES.map((range, bandIdx) => (
                  <div
                    key={BAND_LABELS[bandIdx]}
                    className="flex items-center justify-between py-3 px-0.5 gap-0"
                    style={{
                      width: `${((range.end - range.start) / 15) * 100}%`,
                      backgroundColor:
                        bandIdx === 0
                          ? "#EFF6FF"
                          : bandIdx === 1
                            ? "#F0FDF4"
                            : "#FFFBEB",
                    }}
                  >
                    {SUB_LEVEL_ORDER.slice(range.start, range.end).map(
                      (levelKey, i) => {
                        const globalIndex = range.start + i;
                        return (
                          <div
                            key={levelKey}
                            className="flex flex-col items-center"
                          >
                            <div className="flex gap-0.5">
                              {SECTION_ORDER.map((sec) => {
                                const currentIdx = getLevelIndex(
                                  progress[sec].level
                                );
                                const filled =
                                  globalIndex <= currentIdx;
                                const color = SECTION_COLORS[sec];
                                return (
                                  <div
                                    key={sec}
                                    className="w-2 h-2 rounded-full border shrink-0"
                                    style={{
                                      backgroundColor: filled
                                        ? color.border
                                        : "transparent",
                                      borderColor: color.border,
                                      borderWidth: filled ? 0 : 1,
                                    }}
                                    title={`${sec}: ${progress[sec].level}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-6 mt-3 justify-center flex-wrap text-[12px] text-text-2">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SECTION_COLORS.conjugations.border }}
                  />
                  Conjugations
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SECTION_COLORS.vocabulary.border }}
                  />
                  Vocabulary
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SECTION_COLORS.grammar.border }}
                  />
                  Grammar
                </span>
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
                className="border border-border rounded-xl p-6 bg-white transition-all duration-200 hover:border-[#ccc] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-px"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: colors.border,
                }}
              >
                <h2 className="text-lg font-bold tracking-tight text-text capitalize">
                  {section}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: colors.border }}
                  >
                    {level}
                  </span>
                  <span className="text-[13px] text-text-2">{info.label}</span>
                </div>
                <p className="text-[13px] text-text-2 mt-2 line-clamp-2">
                  {info.description}
                </p>
                <div className="mt-3">
                  <div className="h-1.5 bg-bg-s rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
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
                {!grammarDisabled ? (
                  <Link
                    href={`/dashboard/test/${section}`}
                    className={`mt-4 inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-lg transition-colors ${
                      hasTested
                        ? "border border-border text-text-2 hover:bg-bg-s"
                        : "text-white hover:opacity-90"
                    }`}
                    style={
                      hasTested
                        ? {}
                        : { backgroundColor: colors.border }
                    }
                  >
                    {hasTested ? "Retake Test" : "Take Placement Test"}
                  </Link>
                ) : (
                  <div
                    className="mt-4 inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-lg border border-border text-text-3 cursor-not-allowed bg-bg-s"
                    title="Coming soon — grammar content needed"
                  >
                    Take Placement Test (coming soon)
                  </div>
                )}
                {hasTested && progress[section].testScore != null && (
                  <p className="text-[12px] text-text-3 mt-2">
                    Last score: {Math.round(progress[section].testScore!)}% ·{" "}
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
            );
          })}
        </section>

        {/* Quick stats */}
        <section className="border-t border-border-l pt-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider">
                Best Section
              </p>
              <p className="text-[15px] font-semibold text-text mt-0.5 capitalize">
                {bestSection.key} {progress[bestSection.key].level}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider">
                Total Tests Taken
              </p>
              <p className="text-[15px] font-semibold text-text mt-0.5">
                {totalTests}
              </p>
            </div>
            <div>
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
