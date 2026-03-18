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
import { TutorTabV2 } from "@/components/lessons/tutor-tab";
import { patterns } from "@/lib/design-tokens";

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

const LESSON_SECTIONS = [
  { namePt: "Vocabulário", nameEn: "Vocabulary", descPt: "Traduz palavras novas", descEn: "Translate new words" },
  { namePt: "Conjugação", nameEn: "Conjugation", descPt: "Conjuga verbos no tempo correto", descEn: "Conjugate verbs in the correct tense" },
  { namePt: "Gramática", nameEn: "Grammar", descPt: "Testa regras gramaticais", descEn: "Test grammar rules" },
  { namePt: "Completa as frases", nameEn: "Complete the sentences", descPt: "Preenche os espaços em branco", descEn: "Fill in the blanks" },
  { namePt: "Tradução", nameEn: "Translation", descPt: "Traduz frases do inglês para português", descEn: "Translate sentences from English to Portuguese" },
  { namePt: "Constrói a frase", nameEn: "Build the sentence", descPt: "Ordena palavras para formar frases", descEn: "Order words to form sentences" },
  { namePt: "Texto com lacunas", nameEn: "Text with gaps", descPt: "Completa um parágrafo com um banco de palavras", descEn: "Complete a paragraph with a word bank" },
  { namePt: "Corrige os erros", nameEn: "Correct the errors", descPt: "Encontra e corrige erros em frases", descEn: "Find and fix errors in sentences" },
];

function LessonInfoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] px-5 py-4 hover:border-[#003399] transition-colors cursor-pointer"
      >
        <div>
          <p className="text-[14px] font-medium text-[var(--text-primary)] text-left">
            Como funcionam as lições
          </p>
          <p className="text-[12px] text-[var(--text-muted)] text-left">
            How do lessons work
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] px-5 py-5 space-y-4">
          <div className="space-y-3">
            {LESSON_SECTIONS.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#003399] text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">
                    {s.namePt} — {s.descPt}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    {s.nameEn} — {s.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border-light)] pt-4 space-y-2">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Precisas de 80% para passar cada lição.
              <span className="block text-[12px] text-[var(--text-muted)]">You need 80% to pass each lesson.</span>
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">
              As lições são sequenciais — completa cada uma para desbloquear a seguinte.
              <span className="block text-[12px] text-[var(--text-muted)]">Lessons are sequential — complete each one to unlock the next.</span>
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Podes rever o material antes de começar os exercícios.
              <span className="block text-[12px] text-[var(--text-muted)]">You can review the material before starting the exercises.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"curriculum" | "tutor">("curriculum");
  const [progressMap, setProgressMap] = useState<
    Record<string, LessonAttemptResult>
  >({});

  useEffect(() => {
    getLessonProgressMap()
      .then((map) => {
        setProgressMap(map);
      })
      .catch((err) => {
        console.error("[LESSONS PAGE] Lesson progress fetch failed:", err);
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
            tagline="Aprende português passo a passo com lições estruturadas de A1 a B1."
            stats={[
              { value: String(A1_TOTAL + A2_TOTAL + B1_TOTAL), label: "lições" },
              { value: `${a1Completed + a2Completed + b1Completed}`, label: "completas" },
            ]}
          />
          <p className="text-[13px] text-[var(--text-muted)] mt-1 mb-4">
            Learn Portuguese step by step with structured lessons from A1 to B1.
          </p>
          <Divider className="mb-6" />

          {/* Tab switcher */}
          <div className="flex gap-1 mb-10">
            <button
              onClick={() => setActiveTab("curriculum")}
              className={activeTab === "curriculum" ? patterns.pill.active : patterns.pill.inactive}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab("tutor")}
              className={activeTab === "tutor" ? patterns.pill.active : patterns.pill.inactive}
            >
              Tutor
            </button>
          </div>

          {activeTab === "curriculum" && <LessonInfoSection />}
        </div>

        {/* Tutor tab */}
        {activeTab === "tutor" && (
          <TutorTabV2 />
        )}

        {/* Curriculum tab */}
        {activeTab === "curriculum" && (
        <>
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

                const glowStyle = isLocked ? {} : state === "completed"
                  ? { borderColor: "rgba(22, 163, 74, 0.2)", boxShadow: "0 0 12px rgba(22, 163, 74, 0.08)" }
                  : state === "current"
                    ? { borderColor: "rgba(0, 51, 153, 0.2)", boxShadow: "0 0 12px rgba(0, 51, 153, 0.08)" }
                    : state === "attempted"
                      ? { borderColor: "rgba(245, 158, 11, 0.2)", boxShadow: "0 0 12px rgba(245, 158, 11, 0.08)" }
                      : {};

                const cardContent = (
                  <div
                    className={`rounded-[12px] transition-shadow duration-200 ${
                      isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                    }`}
                    style={glowStyle}
                  >
                  <Card
                    interactive={!isLocked}
                    className="h-full flex flex-col"
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
                  </div>
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

                const glowStyle = isLocked ? {} : state === "completed"
                  ? { borderColor: "rgba(22, 163, 74, 0.2)", boxShadow: "0 0 12px rgba(22, 163, 74, 0.08)" }
                  : state === "current"
                    ? { borderColor: "rgba(0, 51, 153, 0.2)", boxShadow: "0 0 12px rgba(0, 51, 153, 0.08)" }
                    : state === "attempted"
                      ? { borderColor: "rgba(245, 158, 11, 0.2)", boxShadow: "0 0 12px rgba(245, 158, 11, 0.08)" }
                      : {};

                const cardContent = (
                  <div
                    className={`rounded-[12px] transition-shadow duration-200 ${
                      isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                    }`}
                    style={glowStyle}
                  >
                  <Card
                    interactive={!isLocked}
                    className="h-full flex flex-col"
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
                  </div>
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

                const glowStyle = isLocked ? {} : state === "completed"
                  ? { borderColor: "rgba(22, 163, 74, 0.2)", boxShadow: "0 0 12px rgba(22, 163, 74, 0.08)" }
                  : state === "current"
                    ? { borderColor: "rgba(0, 51, 153, 0.2)", boxShadow: "0 0 12px rgba(0, 51, 153, 0.08)" }
                    : state === "attempted"
                      ? { borderColor: "rgba(245, 158, 11, 0.2)", boxShadow: "0 0 12px rgba(245, 158, 11, 0.08)" }
                      : {};

                const cardContent = (
                  <div
                    className={`rounded-[12px] transition-shadow duration-200 ${
                      isLocked ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
                    }`}
                    style={glowStyle}
                  >
                  <Card
                    interactive={!isLocked}
                    className="h-full flex flex-col"
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
                  </div>
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
        </>
        )}

        <div className="pb-16" />
      </PageContainer>
    </>
  );
}
