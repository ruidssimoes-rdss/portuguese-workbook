"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/components/auth-provider";
import { getResolvedLessons } from "@/data/resolve-lessons";
import {
  getLessonProgressMap,
  type LessonAttemptResult,
} from "@/lib/lesson-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { CEFRBadge } from "@/components/ui/badge";

const lessons = getResolvedLessons();
const A1_LESSONS = lessons.filter((l) => l.cefr === "A1");
const A2_LESSONS = lessons.filter((l) => l.cefr === "A2");
const B1_LESSONS = lessons.filter((l) => l.cefr === "B1");
const A1_TOTAL = A1_LESSONS.length;
const A2_TOTAL = A2_LESSONS.length;
const B1_TOTAL = B1_LESSONS.length;

type LessonCardState = "completed" | "current" | "attempted" | "locked";

function getLessonState(
  lesson: (typeof lessons)[0],
  progressMap: Record<string, LessonAttemptResult>,
  sortedLessons: (typeof lessons)
): LessonCardState {
  const progress = progressMap[lesson.id];
  if (progress?.completed) return "completed";

  const prevLesson = sortedLessons.find((l) => l.order === lesson.order - 1);
  const prevCompleted = !prevLesson || progressMap[prevLesson.id]?.completed;
  if (!prevCompleted) return "locked";

  if (progress && progress.attempts > 0) return "attempted";
  return "current";
}

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const [progressMap, setProgressMap] = useState<
    Record<string, LessonAttemptResult>
  >({});

  useEffect(() => {
    getLessonProgressMap()
      .then(setProgressMap)
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AulaPT] Lesson progress fetch failed:", err);
        }
      });
  }, []);

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const a1Completed = A1_LESSONS.filter((l) => progressMap[l.id]?.completed).length;
  const a2Completed = A2_LESSONS.filter((l) => progressMap[l.id]?.completed).length;
  const b1Completed = B1_LESSONS.filter((l) => progressMap[l.id]?.completed).length;
  const a1ProgressPct =
    A1_TOTAL > 0 ? Math.round((a1Completed / A1_TOTAL) * 100) : 0;
  const a2ProgressPct =
    A2_TOTAL > 0 ? Math.round((a2Completed / A2_TOTAL) * 100) : 0;
  const b1ProgressPct =
    B1_TOTAL > 0 ? Math.round((b1Completed / B1_TOTAL) * 100) : 0;
  const a2Unlocked = A1_TOTAL > 0 && a1Completed >= A1_TOTAL;
  const b1Unlocked = A2_TOTAL > 0 && a2Completed >= A2_TOTAL;

  const isLoggedIn = !authLoading && !!user;

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Lessons"
            titlePt="Lições"
            section="REVISION"
            sectionPt="Revisão"
            tagline="Structured lessons with vocabulary, verbs, grammar, and practice. Pass with 60% or more to unlock the next lesson and earn progression."
            stats={[
              { value: String(A1_TOTAL), label: "A1 lessons" },
              { value: `${a1Completed}/${A1_TOTAL}`, label: "complete" },
              { value: "A1", label: "level" },
            ]}
          />
          <Divider className="mt-4 mb-6" />
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* A1 — Foundation                                */}
        {/* ═══════════════════════════════════════════════ */}
        <section>
          <SectionHeader className="mb-4">
            A1 — Foundation · {a1Completed}/{A1_TOTAL} complete
          </SectionHeader>
          <div className="h-2 rounded-full bg-border-light overflow-hidden mb-6">
            <div
              className="h-full bg-[var(--color-cefr-a1)] transition-all duration-300"
              style={{ width: `${a1ProgressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted
              .filter((l) => l.cefr === "A1")
              .map((lesson) => {
                const state = getLessonState(lesson, progressMap, sorted);
                const progress = progressMap[lesson.id];
                const isLocked = state === "locked";

                const cardContent = (
                  <Card
                    interactive={!isLocked}
                    className={`h-full flex flex-col transition-all ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed border-l-4 border-border"
                        : state === "completed"
                          ? "border-l-4 border-green-500"
                          : state === "current"
                            ? "border-l-4 border-[var(--color-primary)] shadow-sm"
                            : state === "attempted"
                              ? "border-l-4 border-amber-500"
                              : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                        Lesson {lesson.order}
                      </p>
                      <CEFRBadge level={lesson.cefr} className="shrink-0" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-text mt-2">
                      {lesson.title}
                    </h3>
                    <p className="text-[13px] text-text-secondary italic mt-0.5">
                      {lesson.ptTitle}
                    </p>
                    <p className="text-[12px] text-text-muted mt-2 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="mt-auto pt-3">
                      {state === "completed" && progress && (
                        <p className="text-[12px] text-green-600 font-medium">
                          ✓ {Math.round(progress.accuracy_score)}%
                        </p>
                      )}
                      {state === "attempted" && progress && (
                        <p className="text-[12px] text-amber-600">
                          Best: {Math.round(progress.best_score)}% — Try again
                        </p>
                      )}
                      {state === "locked" && (
                        <p className="text-[12px] text-text-muted flex items-center gap-1">
                          <span aria-hidden>🔒</span> Complete previous lesson to unlock
                        </p>
                      )}
                      {state === "current" && (
                        <p className="text-[12px] text-[var(--color-primary)] font-medium">
                          Start Lesson →
                        </p>
                      )}
                    </div>
                  </Card>
                );

                if (isLocked) {
                  return <div key={lesson.id}>{cardContent}</div>;
                }
                return (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block group">
                    {cardContent}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* A2 — Elementar                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="mt-16">
          <Divider className="mb-8" />
          <SectionHeader className="mb-4">
            A2 — Elementar · {a2Completed}/{A2_TOTAL} completo
          </SectionHeader>
          <div className="h-2 rounded-full bg-border-light overflow-hidden mb-6">
            <div
              className="h-full bg-[var(--color-cefr-a2)] transition-all duration-300"
              style={{ width: `${a2ProgressPct}%` }}
            />
          </div>
          {!a2Unlocked && A2_TOTAL > 0 && (
            <p className="text-[13px] text-text-muted mb-4">
              Completa as {A1_TOTAL} lições A1 para desbloqueares o A2.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted
              .filter((l) => l.cefr === "A2")
              .map((lesson) => {
                const state = getLessonState(lesson, progressMap, sorted);
                const progress = progressMap[lesson.id];
                const isLocked = state === "locked" || !a2Unlocked;

                const cardContent = (
                  <Card
                    interactive={!isLocked}
                    className={`h-full flex flex-col transition-all ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed border-l-4 border-border"
                        : state === "completed"
                          ? "border-l-4 border-green-500"
                          : state === "current"
                            ? "border-l-4 border-[var(--color-primary)] shadow-sm"
                            : state === "attempted"
                              ? "border-l-4 border-amber-500"
                              : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                        Lição {lesson.order}
                      </p>
                      <CEFRBadge level={lesson.cefr} className="shrink-0" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-text mt-2">
                      {lesson.title}
                    </h3>
                    <p className="text-[13px] text-text-secondary italic mt-0.5">
                      {lesson.ptTitle}
                    </p>
                    <p className="text-[12px] text-text-muted mt-2 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="mt-auto pt-3">
                      {state === "completed" && progress && (
                        <p className="text-[12px] text-green-600 font-medium">
                          ✓ {Math.round(progress.accuracy_score)}%
                        </p>
                      )}
                      {state === "attempted" && progress && (
                        <p className="text-[12px] text-amber-600">
                          Melhor: {Math.round(progress.best_score)}% — Tenta outra vez
                        </p>
                      )}
                      {isLocked && (
                        <p className="text-[12px] text-text-muted">
                          {!a2Unlocked
                            ? "Completa o A1 para desbloquear"
                            : "Completa a lição anterior"}
                        </p>
                      )}
                      {state === "current" && a2Unlocked && (
                        <p className="text-[12px] text-[var(--color-primary)] font-medium">
                          Começar →
                        </p>
                      )}
                    </div>
                  </Card>
                );

                if (isLocked) {
                  return <div key={lesson.id}>{cardContent}</div>;
                }
                return (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block group">
                    {cardContent}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ */}
        {/* B1 — Intermédio                                 */}
        {/* ═══════════════════════════════════════════════ */}
        <section className="mt-10">
          <SectionHeader className="mb-4">
            B1 — Intermédio · {b1Completed}/{B1_TOTAL} completo
          </SectionHeader>
          <div className="h-2 rounded-full bg-border-light overflow-hidden mb-6">
            <div
              className="h-full bg-[var(--color-cefr-b1)] transition-all duration-300"
              style={{ width: `${b1ProgressPct}%` }}
            />
          </div>
          {!b1Unlocked && B1_TOTAL > 0 && (
            <p className="text-[13px] text-text-muted mb-4">
              Completa as {A2_TOTAL} lições A2 para desbloqueares o B1.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted
              .filter((l) => l.cefr === "B1")
              .map((lesson) => {
                const state = getLessonState(lesson, progressMap, sorted);
                const progress = progressMap[lesson.id];
                const isLocked = state === "locked" || !b1Unlocked;

                const cardContent = (
                  <Card
                    interactive={!isLocked}
                    className={`h-full flex flex-col transition-all ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed border-l-4 border-border"
                        : state === "completed"
                          ? "border-l-4 border-green-500"
                          : state === "current"
                            ? "border-l-4 border-[var(--color-primary)] shadow-sm"
                            : state === "attempted"
                              ? "border-l-4 border-amber-500"
                              : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                        Lição {lesson.order}
                      </p>
                      <CEFRBadge level={lesson.cefr} className="shrink-0" />
                    </div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-text mt-2">
                      {lesson.title}
                    </h3>
                    <p className="text-[13px] text-text-secondary italic mt-0.5">
                      {lesson.ptTitle}
                    </p>
                    <p className="text-[12px] text-text-muted mt-2 line-clamp-2">
                      {lesson.description}
                    </p>
                    <div className="mt-auto pt-3">
                      {state === "completed" && progress && (
                        <p className="text-[12px] text-green-600 font-medium">
                          ✓ {Math.round(progress.accuracy_score)}%
                        </p>
                      )}
                      {state === "attempted" && progress && (
                        <p className="text-[12px] text-amber-600">
                          Melhor: {Math.round(progress.best_score)}% — Tenta outra vez
                        </p>
                      )}
                      {isLocked && (
                        <p className="text-[12px] text-text-muted">
                          {!b1Unlocked
                            ? "Completa o A2 para desbloquear"
                            : "Completa a lição anterior"}
                        </p>
                      )}
                      {state === "current" && b1Unlocked && (
                        <p className="text-[12px] text-[var(--color-primary)] font-medium">
                          Começar →
                        </p>
                      )}
                    </div>
                  </Card>
                );

                if (isLocked) {
                  return <div key={lesson.id}>{cardContent}</div>;
                }
                return (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="block group">
                    {cardContent}
                  </Link>
                );
              })}
          </div>
        </section>

        {!isLoggedIn && (
          <div className="mt-12 border border-border rounded-xl p-8 bg-surface text-center">
            <p className="text-[15px] font-semibold text-text">
              Sign in to save your progress and unlock lessons
            </p>
            <p className="text-[13px] text-text-secondary italic mt-1">
              Inicia sessão para guardar o teu progresso
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-[36px] px-5 bg-text border border-text rounded-[12px] text-[13px] font-medium text-bg hover:bg-[#1F2937] transition-colors duration-200 mt-5"
            >
              Entrar
            </Link>
          </div>
        )}

        <div className="pb-16" />
      </PageContainer>
    </>
  );
}
