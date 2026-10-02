/*
 * /lessons/[id] — curriculum lessons, /lessons/next|review and Elísio's
 * AI sessions. Rendering is the shared LearnPlayer; this page loads the
 * lesson, resumes a session left half-way, and saves the result.
 */
"use client";

import { useState, use, useEffect, useRef, useCallback } from "react";

import { ProtectedRoute } from "@/components/protected-route";
import { PageShell } from "@/components/layout/page-shell";
import {
  getResolvedLesson,
} from "@/data/resolve-lessons";
// Exam unlock config (was MOCK_EXAM_UNLOCKS from old curriculum — simplified inline)
const EXAM_LESSON_THRESHOLDS: Record<number, string> = {
  6: "exam-01", 12: "exam-02", 18: "exam-03",
  24: "exam-04", 30: "exam-05", 34: "exam-06",
  38: "exam-07", 42: "exam-08", 44: "exam-09",
};
import type { Lesson } from "@/data/lessons";
import {
  saveLessonAttempt,
  getLessonProgressMap,
  type WrongItem,
} from "@/lib/lesson-progress";
import { logLessonCompletion } from "@/lib/calendar-service";
import { updateStreak } from "@/lib/streak-service";
import { updateGoalProgress } from "@/lib/goals-service";
import {
  generateLessonExercises,
  type GeneratedLesson,
} from "@/lib/exercise-generator";
import {
  generateLesson as generateDynamicLesson,
  generateReviewSession,
  adaptGeneratedLesson,
  adaptReviewSession,
  getCurrentStudyLevel,
  batchUpdateMastery,
  type PracticeItem as LearningPracticeItem,
} from "@/lib/learning-engine";
import { createClient } from "@/lib/supabase/client";
import type { SectionResult } from "@/lib/exercise-types";

import { LearnPlayer, type PlayerSnapshot } from "@/components/learn/learn-player";


import Link from "next/link";

/* ─── Session persistence ─── */

const SESSION_KEY_PREFIX = "aula-pt-lesson-v4-";

type LessonState = "intro" | "learn" | "sections" | "results";

interface LessonSessionData {
  lessonState: LessonState;
  currentSection: number;
  sectionResults: SectionResult[];
  generatedLesson: GeneratedLesson;
  skippedLearn: boolean;
  learnIndex: number;
}

function getSessionKey(id: string): string { return `${SESSION_KEY_PREFIX}${id}`; }
function saveSession(id: string, data: LessonSessionData): void {
  try { sessionStorage.setItem(getSessionKey(id), JSON.stringify(data)); } catch { /* */ }
}
function restoreSession(id: string): LessonSessionData | null {
  try {
    const raw = sessionStorage.getItem(getSessionKey(id));
    if (raw) return JSON.parse(raw) as LessonSessionData;
  } catch { /* */ }
  return null;
}
function clearSession(id: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(id));
    sessionStorage.removeItem(`aula-pt-lesson-v2-${id}`);
    sessionStorage.removeItem(`aula-pt-lesson-${id}`);
  } catch { /* */ }
}

function loadAILesson(id: string): { lesson: Lesson; exercises: GeneratedLesson } | null {
  try {
    const raw = sessionStorage.getItem(`aula-pt-ai-lesson-${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.lesson && data?.exercises) return { lesson: data.lesson, exercises: data.exercises };
    return null;
  } catch { return null; }
}

function LessonContent({ id }: { id: string }) {
  const isDynamic = id === "next" || id === "review";
  const isAISession = id.startsWith("ai-session-");
  const aiData = isAISession ? loadAILesson(id) : null;

  // Dynamic lesson state (for "next" / "review" routes)
  const [dynamicLesson, setDynamicLesson] = useState<Lesson | null>(null);
  const [dynamicPracticeItems, setDynamicPracticeItems] = useState<LearningPracticeItem[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(isDynamic);

  const lesson = isDynamic
    ? dynamicLesson
    : isAISession
      ? (aiData?.lesson ?? null)
      : getResolvedLesson(id);
  const showEnglish = lesson?.cefr === "A1" || lesson?.cefr === "A2";

  // State
  const [lessonState, setLessonState] = useState<LessonState>("intro");
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(
    isAISession && aiData?.exercises ? aiData.exercises : null,
  );

  // Progress & session
  const [savedSession, setSavedSession] = useState<LessonSessionData | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Save state
  const [saveError, setSaveError] = useState(false);
  const hasSaved = useRef(false);
  const [levelCounts, setLevelCounts] = useState<{ a1: number; a2: number; b1: number; total: number } | null>(null);

  // Dynamic lesson generation (for /lessons/next and /lessons/review)
  useEffect(() => {
    if (!isDynamic) return;
    let cancelled = false;

    async function loadDynamic() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        if (id === "next") {
          const cefr = await getCurrentStudyLevel(user.id);
          const generated = await generateDynamicLesson(user.id, cefr);
          if (cancelled) return;
          const { lesson: adapted, practiceItems } = adaptGeneratedLesson(generated);
          setDynamicLesson(adapted);
          setDynamicPracticeItems(practiceItems);
        } else if (id === "review") {
          const review = await generateReviewSession(user.id);
          if (cancelled) return;
          const { lesson: adapted, practiceItems } = adaptReviewSession(review);
          setDynamicLesson(adapted);
          setDynamicPracticeItems(practiceItems);
        }
      } catch (e) {
        console.error("[LESSON] Dynamic generation failed:", e);
      } finally {
        if (!cancelled) setDynamicLoading(false);
      }
    }

    loadDynamic();
    return () => { cancelled = true; };
  }, [isDynamic, id]);

  // Initialize
  useEffect(() => {
    getLessonProgressMap().then((map) => {
      const session = restoreSession(id);
      setSavedSession(session);
      if (session && !map[id]?.completed) {
        setShowRestorePrompt(true);
      } else if (session && map[id]?.completed) {
        clearSession(id);
      }
    });
  }, [id]);

  // Generate on first render (skip for AI sessions — exercises are pre-generated)
  useEffect(() => {
    if (isAISession || !lesson || showRestorePrompt || generatedLesson) return;
    if (isDynamic && dynamicLoading) return; // wait for dynamic lesson to load
    setGeneratedLesson(generateLessonExercises(lesson, showEnglish));
  }, [isAISession, isDynamic, dynamicLoading, lesson, showRestorePrompt, generatedLesson, showEnglish]);

  // Resume point handed to the player after "Continuar de onde parei".
  const [resume, setResume] = useState<PlayerSnapshot | undefined>(undefined);

  // Persist the player's position so a reload can resume mid-lesson.
  const persist = useCallback(
    (snap: PlayerSnapshot) => {
      if (!generatedLesson || snap.state === "intro" || snap.state === "results") return;
      saveSession(id, {
        lessonState: snap.state,
        currentSection: snap.currentSection,
        sectionResults: snap.sectionResults,
        generatedLesson,
        skippedLearn: false,
        learnIndex: snap.learnIndex,
      });
    },
    [id, generatedLesson],
  );

  const handleRestore = () => {
    if (savedSession) {
      setGeneratedLesson(savedSession.generatedLesson);
      setResume({
        state: savedSession.lessonState,
        currentSection: savedSession.currentSection,
        sectionResults: savedSession.sectionResults,
        learnIndex: savedSession.learnIndex,
      });
    }
    setShowRestorePrompt(false);
  };
  const handleStartFresh = () => { clearSession(id); setSavedSession(null); setShowRestorePrompt(false); };

  // Save
  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const passed = accuracy >= 80;

  const doSave = useCallback(async () => {
    if (!lesson || !generatedLesson) return;
    setSaveError(false);

    const wrongItems: WrongItem[] = [];
    for (const sr of sectionResults) {
      for (const a of sr.answers) {
        if (!a.correct) {
          wrongItems.push({ type: sr.sectionKey === "conjugation" ? "verb" : "practice", userAnswer: a.userAnswer, correctAnswer: a.correctAnswer });
        }
      }
    }

    const title = lesson.ptTitle ? `${lesson.title} (${lesson.ptTitle})` : lesson.title;

    try {
      const ok = await saveLessonAttempt(lesson.id, accuracy, passed, wrongItems);
      if (!ok) { setSaveError(true); return; }

      clearSession(id);
      logLessonCompletion(lesson.id, title, accuracy, passed).catch(() => {});
      updateStreak().catch(() => {});

      // Track mastery for dynamic lessons
      if (isDynamic && dynamicPracticeItems.length > 0) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Build a set of wrong answers from section results
            const wrongAnswerSet = new Set<string>();
            for (const sr of sectionResults) {
              for (const a of sr.answers) {
                if (!a.correct) wrongAnswerSet.add(a.correctAnswer.toLowerCase());
              }
            }

            // Map practice items to mastery updates
            // Items not directly tested are marked as "seen" (correct=true for introduction)
            const masteryResults = dynamicPracticeItems.map((item) => ({
              contentType: item.contentType,
              contentId: item.contentId,
              contentCefr: item.contentCefr,
              contentCategory: item.contentCategory,
              wasCorrect: !wrongAnswerSet.has(item.contentId.toLowerCase()),
              isHighFrequency: item.isHighFrequency,
            }));

            await batchUpdateMastery(user.id, masteryResults);
          }
        } catch (e) {
          console.error("[LESSON] Mastery tracking failed:", e);
        }
      }

      const freshMap = await getLessonProgressMap().catch(() => ({}));
      const a1Count = Object.entries(freshMap).filter(([lid, p]) => lid.startsWith("a1-") && p.completed).length;
      const a2Count = Object.entries(freshMap).filter(([lid, p]) => lid.startsWith("a2-") && p.completed).length;
      const b1Count = Object.entries(freshMap).filter(([lid, p]) => lid.startsWith("b1-") && p.completed).length;
      setLevelCounts({ a1: a1Count, a2: a2Count, b1: b1Count, total: a1Count + a2Count + b1Count });

      if (passed) {
        if (lesson.cefr === "A1") updateGoalProgress("lessons_a1", a1Count).catch(() => {});
        if (lesson.cefr === "A2") updateGoalProgress("lessons_a2", a2Count).catch(() => {});
        if (lesson.cefr === "B1") updateGoalProgress("lessons_b1", b1Count).catch(() => {});
      }
    } catch (e) {
      console.error("[LESSON] Save exception:", e);
      setSaveError(true);
    } finally {
    }
  }, [lesson, generatedLesson, sectionResults, accuracy, passed, id, isDynamic, dynamicPracticeItems]);

  useEffect(() => {
    if (lessonState !== "results" || hasSaved.current) return;
    hasSaved.current = true;
    doSave();
  }, [lessonState, doSave]);

  const msg = (text: string) => (
    <div className="mx-auto max-w-[620px] py-16 text-center text-[13px] text-aula-text-3">{text}</div>
  );

  if (isDynamic && dynamicLoading) return msg("A preparar a tua lição…");

  if (!lesson) {
    return (
      <div className="mx-auto max-w-[620px] py-16 text-center">
        <p className="text-[13px] text-aula-text-2">Lição não encontrada.</p>
        <Link href="/lessons" className="mt-2 inline-block text-[13px] font-medium text-aula-accent">
          Voltar às lições
        </Link>
      </div>
    );
  }

  if (showRestorePrompt) {
    return (
      <div className="mx-auto max-w-[620px] pt-10">
        <div className="rounded-xl border border-aula-border bg-white p-6">
          <p className="text-[15px] font-semibold text-aula-text">Tens esta lição a meio</p>
          <p className="mt-1 text-[12.5px] text-aula-text-2">Podes continuar onde ficaste ou começar de novo.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleRestore} className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
              Continuar onde parei
            </button>
            <button type="button" onClick={handleStartFresh} className="inline-flex h-9 items-center rounded-lg border border-aula-border bg-white px-4 text-[13px] font-medium text-aula-text transition-colors hover:border-aula-text-4">
              Começar de novo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!generatedLesson) return msg("A preparar a lição…");

  const unlockedExamId = levelCounts != null ? (EXAM_LESSON_THRESHOLDS[levelCounts.total] ?? null) : null;

  return (
    <>
      {lessonState === "results" && (saveError || unlockedExamId) && (
        <div className="mx-auto mb-[-8px] max-w-[620px] pt-6">
          {saveError ? (
            <div className="flex items-center gap-3 rounded-[10px] border border-[#B94A32] bg-[#FBE9E4] px-4 py-2.5 text-[12.5px] text-aula-text">
              <span className="flex-1">Não foi possível guardar o resultado.</span>
              <button type="button" onClick={() => { hasSaved.current = false; doSave(); }} className="font-medium text-aula-overdue">
                Tentar outra vez
              </button>
            </div>
          ) : (
            <Link href={`/exams/${unlockedExamId}`} className="flex items-center gap-3 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-4 py-2.5 text-[12.5px] text-aula-text">
              <span className="flex-1">Desbloqueaste um novo exame simulado.</span>
              <span className="font-medium text-aula-accent">Ver exame →</span>
            </Link>
          )}
        </div>
      )}
      <LearnPlayer
        key={resume ? "resumed" : "fresh"}
        lesson={lesson}
        generated={generatedLesson}
        isReview={id === "review"}
        initial={resume}
        onProgress={persist}
        onComplete={(results) => {
          setSectionResults(results);
          hasSaved.current = false;
          setSaveError(false);
          setLessonState("results");
        }}
      />
    </>
  );
}

/* ─── Page wrapper ─── */

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <PageShell>
        <LessonContent id={id} />
      </PageShell>
    </ProtectedRoute>
  );
}
