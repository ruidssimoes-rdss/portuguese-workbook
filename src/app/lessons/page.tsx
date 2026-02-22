"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { MigrationBanner } from "@/components/migration-banner";
import { useAuth } from "@/components/auth-provider";
import { cefrBadgeClasses } from "@/lib/design-tokens";
import { lessons, getLessonItemCount } from "@/data/lessons";
import { getAllLessonProgress } from "@/lib/lesson-progress";
import { getProgress } from "@/lib/progress-service";
import { PROGRESS_STORAGE_KEY } from "@/types/levels";
import type { UserProgress } from "@/types/levels";
import {
  SUB_LEVEL_ORDER,
  getLevelIndex,
  type LevelsData,
  type ConjugationSubLevel,
  type VocabSubLevel,
  type GrammarSubLevel,
} from "@/types/levels";
import levelsDataRaw from "@/data/levels.json";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { CEFRBadge } from "@/components/ui/badge";

const levelsData = levelsDataRaw as unknown as LevelsData;

// ═══════════════════════════════════════════════════
// Level Tests — helpers (moved from dashboard)
// ═══════════════════════════════════════════════════

const SECTION_COLORS = {
  conjugations: {
    primary: "#111827",
    bg: "#FFFFFF",
    border: "#E5E7EB",
    text: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
  vocabulary: {
    primary: "#111827",
    bg: "#FFFFFF",
    border: "#E5E7EB",
    text: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
  grammar: {
    primary: "#111827",
    bg: "#FFFFFF",
    border: "#E5E7EB",
    text: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
} as const;

function getCefrBand(level: string): string {
  if (level.startsWith("A1")) return "A1";
  if (level.startsWith("A2")) return "A2";
  if (level.startsWith("B1")) return "B1";
  return "A1";
}

const SECTION_ORDER = ["conjugations", "vocabulary", "grammar"] as const;

function getLevelInfo(
  section: keyof typeof SECTION_COLORS,
  level: string
): { label: string; description: string; targetAccuracy?: number } {
  const data = levelsData[section] as Record<
    string,
    ConjugationSubLevel | VocabSubLevel | GrammarSubLevel
  >;
  const info = data[level];
  if (!info) return { label: level, description: "" };
  const acc = "targetAccuracy" in info ? info.targetAccuracy : undefined;
  return { label: info.label, description: info.description, targetAccuracy: acc };
}

// ═══════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();

  // Lesson progress
  const [lessonProgressMap, setLessonProgressMap] = useState<
    Record<string, { completed: number; total: number }>
  >({});

  useEffect(() => {
    getAllLessonProgress().then(setLessonProgressMap).catch(() => {});
  }, []);

  // Level test progress
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const refreshProgress = async () => {
    const p = await getProgress(user?.id);
    setProgress(p);
  };

  useEffect(() => {
    refreshProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const onFocus = () => refreshProgress();
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refreshProgress();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_STORAGE_KEY && !user) refreshProgress();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  // Level tests stats (when logged in and progress loaded)
  const levelsPassedTotal =
    progress
      ? (progress.conjugations.highestPassed ? getLevelIndex(progress.conjugations.highestPassed) + 1 : 0) +
        (progress.vocabulary.highestPassed ? getLevelIndex(progress.vocabulary.highestPassed) + 1 : 0) +
        (progress.grammar.highestPassed ? getLevelIndex(progress.grammar.highestPassed) + 1 : 0)
      : 0;
  const totalLevels = 15 * 3;

  const lastTestDates = progress
    ? SECTION_ORDER
        .map((sec) => progress[sec].lastTestDate)
        .filter(Boolean) as string[]
    : [];
  const lastTested =
    lastTestDates.length > 0
      ? new Date(
          lastTestDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        ).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const focusSection = progress
    ? SECTION_ORDER.reduce((lowest, sec) =>
        getLevelIndex(progress[sec].currentLevel) < getLevelIndex(progress[lowest].currentLevel)
          ? sec
          : lowest
      )
    : null;

  const isLoggedIn = !authLoading && !!user;

  return (
    <>
      <Topbar />
      <PageContainer>
        {/* ─── Page Header ─── */}
        <div className="py-5">
          <PageHeader
            title="Revision"
            titlePt="Revisão"
            subtitle={<>{lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} · 3 test sections · A1–B1</>}
          />
          <Divider className="mt-4 mb-6" />
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 1: GUIDED LESSONS                      */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <SectionHeader className="mb-4">
            Guided Lessons · Lições
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((lesson) => {
              const prog = lessonProgressMap[lesson.id];
              const completed = prog?.completed ?? 0;
              const total = getLessonItemCount(lesson);

              return (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="block group"
                >
                  <Card interactive className="h-full flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                        Lesson {lesson.order}
                      </p>
                      <CEFRBadge level={lesson.cefr} className="shrink-0" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-[#111827] mt-2">
                      {lesson.title}
                    </h3>
                    <p className="text-[13px] text-[#6B7280] italic mt-0.5">
                      {lesson.ptTitle}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] mt-2 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="mt-auto pt-3">
                      <p className="text-[12px] text-[#9CA3AF]">
                        ~{lesson.estimatedMinutes} min · {lesson.stages.length}{" "}
                        stages
                      </p>
                      <ProgressBar completed={completed} total={total} className="mt-3" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {lessons.length <= 1 && (
            <p className="text-[13px] text-[#9CA3AF] mt-4">
              More lessons coming soon.
            </p>
          )}
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* SECTION 2: LEVEL TESTS                         */}
        {/* ═══════════════════════════════════════════════ */}
        <section id="level-tests" className="mt-16">
          <Divider className="mb-8" />
          <SectionHeader className="mb-4">
            Level Tests · Testes de Nível
          </SectionHeader>

          {/* Auth gate */}
          {!isLoggedIn ? (
            <div className="border border-[#E5E7EB] rounded-xl p-8 bg-[#FAFAFA] text-center">
              <p className="text-[15px] font-semibold text-[#111827]">
                Sign in to access level tests and track your progress
              </p>
              <p className="text-[13px] text-[#6B7280] italic mt-1">
                Inicia sessão para aceder aos testes de nível
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center h-[36px] px-5 bg-[#111827] border border-[#111827] rounded-[12px] text-[13px] font-medium text-white hover:bg-[#1F2937] transition-all duration-150 ease-out mt-5"
              >
                Entrar
              </Link>
            </div>
          ) : progress === null ? (
            <p className="text-text-2">Loading...</p>
          ) : (
            <>
              <MigrationBanner onMigrationComplete={refreshProgress} />

              {/* Progress track */}
              <div className="space-y-4">
                {/* Band headers */}
                <div className="flex items-center gap-3">
                  <span className="min-w-[120px] w-[120px] shrink-0" aria-hidden />
                  <div className="flex flex-1 gap-2">
                    {["A1", "A2", "B1"].map((band) => (
                      <div key={band} className="flex-1 text-center">
                        <span className="text-[12px] font-medium uppercase tracking-wide text-text-2">
                          {band}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="w-14 shrink-0" aria-hidden />
                </div>

                {/* Section rows */}
                {SECTION_ORDER.map((sec) => {
                  const currentLevel = progress[sec].currentLevel;
                  const highestPassed = progress[sec].highestPassed;
                  const passedIdx = highestPassed ? getLevelIndex(highestPassed) : -1;
                  const currentIdx = getLevelIndex(currentLevel);
                  const colors = SECTION_COLORS[sec];
                  return (
                    <div key={sec} className="flex items-center gap-3">
                      <span className="text-[13px] font-medium text-text capitalize min-w-[120px] w-[120px] shrink-0">
                        {sec}
                      </span>
                      <div className="flex flex-1 gap-2">
                        {[0, 1, 2].map((band) => (
                          <div
                            key={band}
                            className="flex flex-1 gap-[3px] rounded-sm overflow-hidden"
                          >
                            {SUB_LEVEL_ORDER.slice(band * 5, band * 5 + 5).map((levelKey, j) => {
                              const i = band * 5 + j;
                              const passed = i <= passedIdx;
                              const isCurrent = i === currentIdx;
                              const info = getLevelInfo(sec, levelKey);
                              const tooltip = `${levelKey} — ${info.label}`;
                              return (
                                <span
                                  key={levelKey}
                                  className={`relative flex-1 h-2.5 rounded-sm transition-all duration-150 group/seg ${
                                    isCurrent ? "animate-pulse" : ""
                                  }`}
                                  style={{
                                    background: passed
                                      ? colors.barFill
                                      : isCurrent
                                        ? `${colors.primary}44`
                                        : "#E5E7EB",
                                    minWidth: "12px",
                                  }}
                                  title={tooltip}
                                >
                                  <span
                                    className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md text-[11px] text-white whitespace-nowrap opacity-0 group-hover/seg:opacity-100 transition-opacity duration-200 z-10"
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
                        className={`text-[12px] font-semibold shrink-0 px-2.5 py-0.5 rounded-full w-14 text-center ${cefrBadgeClasses(getCefrBand(currentLevel))}`}
                      >
                        {currentLevel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Section cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {SECTION_ORDER.map((section) => {
                  const s = progress[section];
                  const currentLevel = s.currentLevel;
                  const highestPassed = s.highestPassed;
                  const isComplete = highestPassed === "B1.5";
                  const info = getLevelInfo(section, currentLevel);
                  const targetAccuracy = info.targetAccuracy ?? 70;
                  const passedCount = highestPassed != null ? getLevelIndex(highestPassed) + 1 : 0;
                  const progressPct = Math.max(4, (passedCount / 15) * 100);
                  const colors = SECTION_COLORS[section];
                  const failedLast = s.lastTestScore != null && s.lastTestScore < targetAccuracy;

                  const lastTestedStr = s.lastTestDate
                    ? new Date(s.lastTestDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  const sectionLabels: Record<string, string> = {
                    conjugations: "Conjugations",
                    vocabulary: "Vocab",
                    grammar: "Grammar",
                  };

                  return (
                    <div
                      key={section}
                      className="rounded-xl border flex flex-col"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                        padding: "19px 20px 20px",
                        gap: "20px",
                      }}
                    >
                      {/* Row 1: Title + Score pill */}
                      <div className="flex items-start justify-between gap-5">
                        <h2 className="text-[18px] font-normal text-[#111827] leading-[42px]">
                          {section.charAt(0).toUpperCase() + section.slice(1)}
                        </h2>
                        {!isComplete && (
                          <div
                            className="flex items-center h-[36px] px-2.5 bg-white border rounded-[12px] shrink-0"
                            style={{ borderColor: colors.border }}
                          >
                            <span
                              className="text-[13px] font-medium whitespace-nowrap"
                              style={{ color: colors.text }}
                            >
                              Score {targetAccuracy}% or higher
                            </span>
                          </div>
                        )}
                        {isComplete && (
                          <div
                            className="flex items-center h-[36px] px-2.5 bg-white border rounded-[12px] shrink-0"
                            style={{ borderColor: colors.border }}
                          >
                            <span
                              className="text-[13px] font-medium whitespace-nowrap"
                              style={{ color: colors.text }}
                            >
                              Complete
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Row 2: Level + label */}
                      <p
                        className="text-[15px] font-normal leading-[22px]"
                        style={{ color: colors.text }}
                      >
                        {currentLevel} · {info.label}
                      </p>

                      {/* Row 3: Description */}
                      <p
                        className="text-[13px] font-normal leading-[21px]"
                        style={{ color: colors.text }}
                      >
                        {info.description}
                      </p>

                      {/* Row 4: Progress bar + count */}
                      <div className="flex flex-col gap-1">
                        <div
                          className="h-[6px] rounded-full overflow-hidden"
                          style={{ backgroundColor: colors.barTrack }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progressPct}%`,
                              backgroundColor: colors.barFill,
                            }}
                          />
                        </div>
                        <span className="text-[13px] font-normal text-[#9FA5AD]">
                          {passedCount} / 15
                        </span>
                      </div>

                      {/* Row 5: CTA button + Last tested */}
                      <div className="flex items-center justify-between mt-auto">
                        {isComplete ? (
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: colors.text }}
                          >
                            All levels passed
                          </span>
                        ) : (
                          <Link
                            href={`/lessons/test/${section}`}
                            className="inline-flex items-center justify-center h-[36px] px-5 bg-[#111827] border border-[#111827] rounded-[12px] text-[13px] font-medium text-white hover:bg-[#1F2937] transition-all duration-150 ease-out"
                          >
                            {failedLast
                              ? `Retry ${sectionLabels[section]} Test`
                              : `Start ${sectionLabels[section]} Test`}
                          </Link>
                        )}
                        {lastTestedStr && (
                          <span className="text-[13px] font-normal text-[#9FA5AD] text-right leading-5">
                            Last tested<br />{lastTestedStr}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick stats */}
              <div className="border-t border-[#E5E7EB] mt-8 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-[14px] border border-[#E5E7EB] p-4 md:p-5 bg-[#FAFAFA] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                      Current Focus
                    </p>
                    <p className="text-[18px] font-medium text-text mt-0.5 capitalize">
                      {focusSection} · {focusSection ? progress[focusSection].currentLevel : ""}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[#E5E7EB] p-4 md:p-5 bg-[#FAFAFA] transition-all duration-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                      Levels Passed
                    </p>
                    <p className="text-[18px] font-medium text-text mt-0.5">
                      {levelsPassedTotal} / {totalLevels}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[#E5E7EB] p-4 md:p-5 bg-[#FAFAFA] transition-all duration-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-text-3">
                      Last Tested
                    </p>
                    <p className="text-[18px] font-medium text-text mt-0.5">
                      {lastTested ?? "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="pb-16" />
      </PageContainer>
    </>
  );
}
