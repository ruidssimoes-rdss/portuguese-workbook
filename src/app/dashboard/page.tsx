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
  conjugations: {
    bg: "#F2F9FF",
    border: "#80BCFF",
    title: "#80BCFF",
    track: "#3B82F6",
  },
  vocabulary: {
    bg: "#ECFBF0",
    border: "#6DD49E",
    title: "#6DD49E",
    track: "#22C55E",
  },
  grammar: {
    bg: "#FFFBEB",
    border: "#F5C542",
    title: "#F5C542",
    track: "#F59E0B",
  },
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

        {/* Progress track — 3 rows, 15 segments (5+5+5) with band gaps */}
        <section className="pb-12">
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <div className="inline-flex flex-col min-w-0">
              {/* Band labels: min-width 120px label column, then 3 groups over segments */}
              <div className="flex items-center mb-3">
                <span className="min-w-[120px] w-[120px] shrink-0" aria-hidden />
                <div className="flex flex-1 min-w-0 gap-2">
                  <span className="flex-1 text-center text-xs font-medium uppercase tracking-wide text-gray-400">A1</span>
                  <span className="flex-1 text-center text-xs font-medium uppercase tracking-wide text-gray-400">A2</span>
                  <span className="flex-1 text-center text-xs font-medium uppercase tracking-wide text-gray-400">B1</span>
                </div>
                <span className="w-12 shrink-0" aria-hidden />
              </div>
              <div className="space-y-4">
                {SECTION_ORDER.map((sec) => {
                  const currentIdx = getLevelIndex(progress[sec].level);
                  const trackColor = SECTION_COLORS[sec].track;
                  return (
                    <div
                      key={sec}
                      className="flex items-center gap-3"
                    >
                      <span className="text-[14px] font-medium text-text capitalize min-w-[120px] w-[120px] shrink-0">
                        {sec}
                      </span>
                      <div className="flex flex-1 min-w-0 gap-2">
                        {[0, 1, 2].map((band) => (
                          <div key={band} className="flex flex-1 gap-[3px] min-w-0">
                            {SUB_LEVEL_ORDER.slice(band * 5, band * 5 + 5).map((levelKey, j) => {
                              const i = band * 5 + j;
                              const filled = i <= currentIdx;
                              const info = getLevelInfo(sec, levelKey);
                              const tooltip = `${levelKey} — ${info.label}`;
                              return (
                                <span
                                  key={levelKey}
                                  className="relative flex-1 min-w-0 h-2 md:h-2.5 rounded transition-all duration-150 group/seg"
                                  style={{
                                    background: filled
                                      ? `linear-gradient(to right, ${trackColor}CC, ${trackColor})`
                                      : "#F3F4F6",
                                  }}
                                  title={tooltip}
                                >
                                  <span
                                    className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-[12px] text-white whitespace-nowrap opacity-0 group-hover/seg:opacity-100 transition-opacity duration-200 delay-200 z-10"
                                    style={{ backgroundColor: "#1F2937" }}
                                  >
                                    {tooltip}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <span
                        className="text-[12px] font-semibold shrink-0 px-2 py-0.5 rounded text-white ml-3"
                        style={{ backgroundColor: trackColor }}
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

        {/* Section cards — Figma-style tinted cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12 items-stretch">
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
                className="rounded-[12px] border p-5 transition-all duration-150 hover:shadow-md flex flex-col"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <h2
                  className="text-[17px] font-normal capitalize"
                  style={{ color: colors.title }}
                >
                  {section}
                </h2>
                <p
                  className="mt-1 text-[15px]"
                  style={{ color: colors.title, opacity: 0.5 }}
                >
                  {level} · {info.label}
                </p>
                <p
                  className="mt-2 text-[14px]"
                  style={{ color: colors.title, opacity: 0.5 }}
                >
                  {info.description}
                </p>
                <div className="mt-4">
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: `${colors.track}26` }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: colors.track,
                      }}
                    />
                  </div>
                  <p className="text-[12px] text-text-3 mt-1">
                    {levelIdx + 1} / 15
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-border-l flex flex-col flex-1">
                  {!grammarDisabled ? (
                    <Link
                      href={`/dashboard/test/${section}`}
                      className="inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-full text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
                      style={{ backgroundColor: colors.track }}
                    >
                      {hasTested ? "Retake Test" : "Take Placement Test"}
                    </Link>
                  ) : (
                    <div
                      className="inline-block w-full text-center text-[14px] font-medium py-2.5 rounded-full border cursor-not-allowed"
                      style={{ borderColor: colors.border, color: colors.title }}
                      title="Coming soon — grammar content needed"
                    >
                      Coming soon
                    </div>
                  )}
                  {hasTested && progress[section].completedAt && progress[section].testScore != null && (
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
              </div>
            );
          })}
        </section>

        {/* Quick stats — match section card aesthetic */}
        <section className="border-t border-border-l pt-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-[12px] border p-5 transition-all duration-150"
              style={{
                backgroundColor: SECTION_COLORS[bestSection.key].bg,
                borderColor: SECTION_COLORS[bestSection.key].border,
                borderWidth: 1,
              }}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                Best Section
              </p>
              <p className="text-[18px] font-medium text-text mt-0.5 capitalize">
                {bestSection.key} {progress[bestSection.key].level}
              </p>
            </div>
            <div
              className="rounded-[12px] border border-[#E5E7EB] p-5 bg-[#F9FAFB] transition-all duration-150"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                Total Tests Taken
              </p>
              <p className="text-[18px] font-medium text-text mt-0.5">
                {totalTests}
              </p>
            </div>
            <div
              className="rounded-[12px] border border-[#E5E7EB] p-5 bg-[#F9FAFB] transition-all duration-150"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                Last Tested
              </p>
              <p className="text-[18px] font-medium text-text mt-0.5">
                {lastTested ?? "Never"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
