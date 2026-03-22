/*
 * LESSON v4 — Section-based sheets
 * ─────────────────────────────────
 * Intro → [Optional Learn] → Section 1-8 → Results
 *
 * Each section is a full scrollable page of related questions.
 * User fills in everything, taps "Verificar secção", sees results,
 * then advances. Like a real test.
 */
"use client";

import { useState, use, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/protected-route";
import {
  getResolvedLesson,
  getCurriculumLesson,
  getResolvedLessons,
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
  resetLessonProgress,
  type WrongItem,
} from "@/lib/lesson-progress";
import { logLessonCompletion } from "@/lib/calendar-service";
import { updateStreak } from "@/lib/streak-service";
import { updateGoalProgress } from "@/lib/goals-service";
import {
  generateLessonExercises,
  type GeneratedLesson,
  type GeneratedSection,
  type LearnItem,
  type GrammarLearnData,
  type VerbLearnData,
  type CultureLearnData,
} from "@/lib/exercise-generator";
import {
  generateLesson as generateDynamicLesson,
  generateReviewSession,
  adaptGeneratedLesson,
  adaptReviewSession,
  getCurrentStudyLevel,
  batchUpdateMastery,
  type PracticeItem as LearningPracticeItem,
  type ContentType,
  type CEFRLevel as LearningCEFRLevel,
} from "@/lib/learning-engine";
import { createClient } from "@/lib/supabase/client";
import type { SectionResult } from "@/lib/exercise-types";
import type { VocabItem } from "@/data/lessons";

import { LessonShell } from "@/components/lessons/lesson-shell";
import { ResultsScreen } from "@/components/lessons/results-screen";

// Learn components
import { VocabLearnCard } from "@/components/lessons/learn/vocab-learn-card";
import { GrammarLearn } from "@/components/lessons/learn/grammar-learn";
import { VerbLearn } from "@/components/lessons/learn/verb-learn";
import { CultureLearn } from "@/components/lessons/learn/culture-learn";

// Section components
import { VocabSection } from "@/components/lessons/sections/vocab-section";
import { ConjugationSection } from "@/components/lessons/sections/conjugation-section";
import { GrammarSection } from "@/components/lessons/sections/grammar-section";
import { FillBlankSection } from "@/components/lessons/sections/fill-blank-section";
import { TranslationSection } from "@/components/lessons/sections/translation-section";
import { SentenceBuildSection } from "@/components/lessons/sections/sentence-build-section";
import { WordBankSection } from "@/components/lessons/sections/word-bank-section";
import { ErrorCorrectionSection } from "@/components/lessons/sections/error-correction-section";

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

/* ─── Learn item renderer ─── */

function LearnItemRenderer({ item }: { item: LearnItem }) {
  switch (item.type) {
    case "vocab": {
      const v = item.data as VocabItem;
      return <VocabLearnCard word={v.word} translation={v.translation} pronunciation={v.pronunciation} example={v.example} />;
    }
    case "grammar": return <GrammarLearn data={item.data as GrammarLearnData} />;
    case "verb": return <VerbLearn data={item.data as VerbLearnData} />;
    case "culture": return <CultureLearn data={item.data as CultureLearnData} />;
  }
}

/* ─── Section renderer ─── */

const SECTION_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  vocab: VocabSection as unknown as React.ComponentType<Record<string, unknown>>,
  conjugation: ConjugationSection as unknown as React.ComponentType<Record<string, unknown>>,
  grammar: GrammarSection as unknown as React.ComponentType<Record<string, unknown>>,
  "fill-blank": FillBlankSection as unknown as React.ComponentType<Record<string, unknown>>,
  translation: TranslationSection as unknown as React.ComponentType<Record<string, unknown>>,
  "sentence-build": SentenceBuildSection as unknown as React.ComponentType<Record<string, unknown>>,
  "word-bank": WordBankSection as unknown as React.ComponentType<Record<string, unknown>>,
  "error-correction": ErrorCorrectionSection as unknown as React.ComponentType<Record<string, unknown>>,
};

function SectionRenderer({
  section,
  sectionIndex,
  totalSections,
  showEnglish,
  onComplete,
}: {
  section: GeneratedSection;
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  onComplete: (result: SectionResult) => void;
}) {
  const Component = SECTION_MAP[section.key];
  if (!Component) return null;

  return (
    <Component
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      showEnglish={showEnglish}
      onComplete={onComplete}
      {...(section.data as Record<string, unknown>)}
    />
  );
}

/* ─── Intro screen ─── */

function LessonIntro({
  lesson,
  generatedLesson,
  showEnglish,
  isCompleted,
  onStartExercises,
  onReviewFirst,
  onReset,
}: {
  lesson: Lesson;
  generatedLesson: GeneratedLesson | null;
  showEnglish: boolean;
  isCompleted: boolean;
  onStartExercises: () => void;
  onReviewFirst: () => void;
  onReset: () => void;
}) {
  const learnItems = generatedLesson?.learnItems ?? [];
  const vocabCount = learnItems.filter((i) => i.type === "vocab").length;
  const verbCount = learnItems.filter((i) => i.type === "verb").length;
  const grammarCount = learnItems.filter((i) => i.type === "grammar").length;
  const cultureCount = learnItems.filter((i) => i.type === "culture").length;
  const sectionCount = generatedLesson?.sections.length ?? 0;
  const totalPoints = generatedLesson?.totalPoints ?? 0;

  const stats = [
    { value: vocabCount, labelPt: "Palavras", labelEn: "Words" },
    { value: verbCount, labelPt: "Verbos", labelEn: "Verbs" },
    { value: grammarCount, labelPt: "Gramática", labelEn: "Grammar" },
    { value: cultureCount, labelPt: "Cultura", labelEn: "Culture" },
  ].filter((s) => s.value > 0);

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      {/* Title */}
      <h1 className="text-[22px] font-medium text-[#111111] tracking-tight">
        {lesson.ptTitle}
      </h1>
      <p className="text-[13px] text-[#6C6B71] mt-1">
        {lesson.title}
      </p>

      {/* CEFR badge */}
      <div className="flex items-center justify-center mt-5">
        <span className="px-3 py-1 text-[10px] font-medium text-[#185FA5] bg-[rgba(24,95,165,0.05)] rounded-full">
          {lesson.cefr}
        </span>
      </div>

      {/* Stat cards */}
      <div className="flex items-center justify-center gap-3 mt-8">
        {stats.map((stat) => (
          <div
            key={stat.labelPt}
            className="flex flex-col items-center justify-center w-20 h-20 bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg"
          >
            <span className="text-[22px] font-medium text-[#111111]">{stat.value}</span>
            <span className="text-[10px] font-medium text-[#9B9DA3] mt-0.5">{stat.labelPt}</span>
            {showEnglish && (
              <span className="text-[9px] text-[#9B9DA3]">{stat.labelEn}</span>
            )}
          </div>
        ))}
      </div>

      {/* Meta line */}
      <p className="text-[11px] text-[#9B9DA3] mt-5">
        {sectionCount} secções · {totalPoints} perguntas · 80% para passar
      </p>
      {showEnglish && (
        <p className="text-[11px] text-[#9B9DA3]">
          {sectionCount} sections · {totalPoints} questions · 80% to pass
        </p>
      )}

      {/* CTAs */}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onStartExercises}
          className="w-full px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
        >
          Começar os exercícios →
          {showEnglish && (
            <span className="block text-[12px] font-normal opacity-75 mt-0.5">Start the exercises</span>
          )}
        </button>
        <button
          type="button"
          onClick={onReviewFirst}
          className="w-full px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer"
        >
          Rever o material primeiro
          {showEnglish && (
            <span className="block text-[12px] font-normal text-[#9B9DA3] mt-0.5">Review the material first</span>
          )}
        </button>
      </div>

      {/* Reset */}
      {isCompleted && (
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] text-[#9B9DA3] hover:text-[#dc2626] transition-colors mt-6 cursor-pointer"
        >
          Recomeçar lição
          {showEnglish && <span className="block text-[11px]">Reset lesson</span>}
        </button>
      )}
    </div>
  );
}

/* ─── Main lesson content ─── */

/** Load AI session lesson + exercises from sessionStorage */
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
  const router = useRouter();
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
  const curriculumLesson = (isAISession || isDynamic) ? undefined : getCurriculumLesson(id);
  const showEnglish = lesson?.cefr === "A1" || lesson?.cefr === "A2";

  // State
  const [lessonState, setLessonState] = useState<LessonState>("intro");
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [skippedLearn, setSkippedLearn] = useState(false);
  const [learnIndex, setLearnIndex] = useState(0);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(
    isAISession && aiData?.exercises ? aiData.exercises : null,
  );

  // Progress & session
  const [progressMap, setProgressMap] = useState<Record<string, { completed?: boolean }> | null>(null);
  const [savedSession, setSavedSession] = useState<LessonSessionData | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasSaved = useRef(false);
  const [levelCounts, setLevelCounts] = useState<{ a1: number; a2: number; b1: number; total: number } | null>(null);

  // Next lesson
  const sortedLessons = getResolvedLessons().sort((a, b) => a.order - b.order);
  const nextLesson = lesson ? sortedLessons.find((l) => l.order === lesson.order + 1) : null;
  const nextLessonId = isDynamic ? "next" : (nextLesson?.id ?? null);

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
      setProgressMap(map);
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

  // Persist session
  useEffect(() => {
    if (!generatedLesson || showRestorePrompt || lessonState === "results" || lessonState === "intro") return;
    saveSession(id, { lessonState, currentSection, sectionResults, generatedLesson, skippedLearn, learnIndex });
  }, [id, lessonState, currentSection, sectionResults, generatedLesson, showRestorePrompt, skippedLearn, learnIndex]);

  // Restore
  const handleRestore = () => {
    if (savedSession) {
      setLessonState(savedSession.lessonState);
      setCurrentSection(savedSession.currentSection);
      setSectionResults(savedSession.sectionResults);
      setGeneratedLesson(savedSession.generatedLesson);
      setSkippedLearn(savedSession.skippedLearn);
      setLearnIndex(savedSession.learnIndex);
    }
    setShowRestorePrompt(false);
  };
  const handleStartFresh = () => { clearSession(id); setSavedSession(null); setShowRestorePrompt(false); };

  // Save
  const totalSections = generatedLesson?.sections.length ?? 0;
  const totalPoints = generatedLesson?.totalPoints ?? 0;
  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const passed = accuracy >= 80;

  const doSave = useCallback(async () => {
    if (!lesson || !generatedLesson) return;
    setIsSaving(true);
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
      if (!ok) { setSaveError(true); setIsSaving(false); return; }

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
      setIsSaving(false);
    }
  }, [lesson, generatedLesson, sectionResults, accuracy, passed, id, isDynamic, dynamicPracticeItems]);

  useEffect(() => {
    if (lessonState !== "results" || hasSaved.current) return;
    hasSaved.current = true;
    doSave();
  }, [lessonState, doSave]);

  // Loading dynamic lesson
  if (isDynamic && dynamicLoading) {
    return (
      <>
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[#6C6B71]">A preparar a tua lição...</p>
        </main>
      </>
    );
  }

  // Not found
  if (!lesson) {
    return (
      <>

        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[#9B9DA3]">Lição não encontrada.</p>
          <Link href="/lessons" className="text-[13px] font-medium text-[#185FA5] hover:underline mt-2 inline-block">Voltar às lições</Link>
        </main>
      </>
    );
  }

  if (!generatedLesson && !showRestorePrompt) {
    return (
      <>

        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[#6C6B71]">A preparar a lição...</p>
        </main>
      </>
    );
  }

  // Progress
  const learnTotal = generatedLesson?.learnItems.length ?? 0;
  const sectionProgress = lessonState === "sections"
    ? ((currentSection + 1) / totalSections) * 100
    : lessonState === "learn"
      ? (learnIndex / learnTotal) * 100
      : 0;
  const progressLabel = lessonState === "sections"
    ? `Secção ${currentSection + 1} de ${totalSections}`
    : lessonState === "learn"
      ? `${learnIndex + 1} de ${learnTotal}`
      : "";

  // Exam unlock
  const cefrTotals: Record<string, number> = { A1: 18, A2: 16, B1: 10 };
  const cefrCompleted = levelCounts
    ? lesson.cefr === "A1" ? levelCounts.a1 : lesson.cefr === "A2" ? levelCounts.a2 : levelCounts.b1
    : 0;
  const unlockedExamId = levelCounts != null
    ? EXAM_LESSON_THRESHOLDS[levelCounts.total] ?? null
    : null;

  // Wrong answers for results
  const wrongAnswers = sectionResults.flatMap((sr) =>
    sr.answers.filter((a) => !a.correct).map((a) => ({
      question: `${sr.sectionName}: ${a.correctAnswer}`,
      userAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
    }))
  );

  // Handlers
  const handleStartExercises = () => { setSkippedLearn(true); setLessonState("sections"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleReviewFirst = () => { setSkippedLearn(false); setLessonState("learn"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleLearnNext = () => {
    if (learnIndex < learnTotal - 1) { setLearnIndex((i) => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else { setLessonState("sections"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handleLearnPrev = () => {
    if (learnIndex > 0) { setLearnIndex((i) => i - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleSectionComplete = (result: SectionResult) => {
    setSectionResults((prev) => [...prev, result]);
    const next = currentSection + 1;
    if (next >= totalSections) { setLessonState("results"); }
    else { setCurrentSection(next); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryExercises = () => {
    if (lesson) setGeneratedLesson(generateLessonExercises(lesson, showEnglish));
    setCurrentSection(0);
    setSectionResults([]);
    hasSaved.current = false;
    setSaveError(false);
    setSkippedLearn(true);
    setLessonState("sections");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryFull = () => {
    if (lesson) setGeneratedLesson(generateLessonExercises(lesson, showEnglish));
    setLearnIndex(0);
    setCurrentSection(0);
    setSectionResults([]);
    hasSaved.current = false;
    setSaveError(false);
    setSkippedLearn(false);
    setLessonState("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Restore prompt
  if (showRestorePrompt) {
    return (
      <>

        <LessonShell lessonId={lesson.id} lessonTitle={lesson.title} lessonTitlePt={lesson.ptTitle} cefr={lesson.cefr} currentState="intro">
          <div className="p-6 rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-[#F7F7F5] text-center">
            <p className="text-[14px] font-medium text-[#111111] mb-4">Tens progresso guardado nesta lição.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button type="button" onClick={handleRestore} className="px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors">Continuar de onde parei</button>
              <button type="button" onClick={handleStartFresh} className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors">Começar de novo</button>
            </div>
          </div>
        </LessonShell>
      </>
    );
  }

  if (!generatedLesson) return null;

  const isFullScreen = lessonState === "learn" || lessonState === "sections";

  return (
    <div className={isFullScreen ? "fixed inset-0 z-50 bg-white overflow-auto" : undefined}>
      <LessonShell
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        lessonTitlePt={lesson.ptTitle}
        cefr={lesson.cefr}
        currentState={lessonState}
        sectionProgress={sectionProgress}
        progressLabel={progressLabel}
      >
        {/* Intro */}
        {lessonState === "intro" && (
          <LessonIntro
            lesson={lesson}
            generatedLesson={generatedLesson}
            showEnglish={showEnglish}
            isCompleted={!!progressMap?.[id]?.completed}
            onStartExercises={handleStartExercises}
            onReviewFirst={handleReviewFirst}
            onReset={async () => {
              if (!confirm("Tens a certeza? O teu progresso nesta lição será apagado.")) return;
              const ok = await resetLessonProgress(id);
              if (ok) {
                clearSession(id);
                window.location.reload();
              }
            }}
          />
        )}

        {/* Learn */}
        {lessonState === "learn" && generatedLesson.learnItems[learnIndex] && (
          <>
            <LearnItemRenderer item={generatedLesson.learnItems[learnIndex]} />
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(0,0,0,0.06)]">
              <button type="button" onClick={handleLearnPrev} disabled={learnIndex === 0}
                className={`text-[13px] font-medium transition-colors ${learnIndex === 0 ? "text-[#9B9DA3] cursor-not-allowed" : "text-[#6C6B71] hover:text-[#111111] cursor-pointer"}`}
              >&larr; Anterior</button>
              <button type="button" onClick={handleLearnNext}
                className="px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
              >{learnIndex < learnTotal - 1 ? "Próximo →" : "Começar exercícios →"}</button>
            </div>
          </>
        )}

        {/* Sections */}
        {lessonState === "sections" && generatedLesson.sections[currentSection] && (
          <SectionRenderer
            key={`section-${currentSection}`}
            section={generatedLesson.sections[currentSection]}
            sectionIndex={currentSection}
            totalSections={totalSections}
            showEnglish={showEnglish}
            onComplete={handleSectionComplete}
          />
        )}

        {/* Results */}
        {lessonState === "results" && (
          <ResultsScreen
            passed={passed}
            accuracy={accuracy}
            sectionResults={sectionResults}
            wrongAnswers={wrongAnswers}
            levelProgress={{ completed: cefrCompleted, total: cefrTotals[lesson.cefr] ?? 18, level: lesson.cefr }}
            onNextLesson={nextLessonId ? () => router.push(`/lessons/${nextLessonId}`) : null}
            onRetryExercises={handleRetryExercises}
            onRetryFull={handleRetryFull}
            onBackToLessons={() => router.push("/lessons")}
            isSaving={isSaving}
            saveError={saveError}
            onRetrySave={() => { hasSaved.current = false; doSave(); }}
            examUnlocked={unlockedExamId}
            showEnglish={showEnglish}
          />
        )}
      </LessonShell>
    </div>
  );
}

/* ─── Page wrapper ─── */

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <LessonContent id={id} />
    </ProtectedRoute>
  );
}
