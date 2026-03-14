/*
 * LESSON v2 — Learn → Practice → Apply
 * ──────────────────────────────────────
 * Round 1 (Learn): Vocabulary cards, grammar rules, verb tables, culture items — no scoring.
 * Round 2 (Practice): Mixed exercises generated from lesson content (~15-18 exercises).
 * Round 3 (Apply): Harder combination exercises (~6-7 exercises).
 * Results: Score from Round 2 + 3 combined. Pass threshold: 80%.
 *
 * Save flow:
 * 1. Results screen mounts → doSave() → saveLessonAttempt()
 * 2. Success → clearLessonSession(), logCalendar, updateStreak, updateGoals
 * 3. Failure → error banner with retry
 */
"use client";

import { useState, use, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getResolvedLesson,
  getCurriculumLesson,
  getResolvedLessons,
} from "@/data/resolve-lessons";
import { MOCK_EXAM_UNLOCKS } from "@/data/curriculum";
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
  type ExerciseResult,
  type Exercise,
  type LearnItem,
  type GrammarLearnData,
  type VerbLearnData,
  type CultureLearnData,
} from "@/lib/exercise-generator";
import type { VocabItem } from "@/data/lessons";

// Shell & navigation
import { LessonShell } from "@/components/lessons/lesson-shell";
import { RoundTransition } from "@/components/lessons/round-transition";
import { ResultsScreen } from "@/components/lessons/results-screen";

// Learn components
import { VocabLearnCard } from "@/components/lessons/learn/vocab-learn-card";
import { GrammarLearn } from "@/components/lessons/learn/grammar-learn";
import { VerbLearn } from "@/components/lessons/learn/verb-learn";
import { CultureLearn } from "@/components/lessons/learn/culture-learn";

// Exercise components
import { MultipleChoice } from "@/components/lessons/exercises/multiple-choice";
import { FillInBlank } from "@/components/lessons/exercises/fill-in-blank";
import { ConjugationDrill } from "@/components/lessons/exercises/conjugation-drill";
import { TrueFalse } from "@/components/lessons/exercises/true-false";
import { TranslationInput } from "@/components/lessons/exercises/translation-input";
import { MatchPairs } from "@/components/lessons/exercises/match-pairs";
import { WordBank } from "@/components/lessons/exercises/word-bank";
import { SentenceBuild } from "@/components/lessons/exercises/sentence-build";
import { ErrorCorrection } from "@/components/lessons/exercises/error-correction";

import Link from "next/link";

/* ─── Session persistence ─── */

const SESSION_KEY_PREFIX = "aula-pt-lesson-v2-";

type Round = "intro" | "learn" | "practice" | "apply" | "results";

interface LessonSessionState {
  round: Round;
  learnIndex: number;
  practiceIndex: number;
  applyIndex: number;
  practiceResults: (ExerciseResult | ExerciseResult[])[];
  applyResults: (ExerciseResult | ExerciseResult[])[];
  generatedLesson: GeneratedLesson;
  showTransition: boolean;
  skippedLearn: boolean;
}

function getSessionKey(lessonId: string): string {
  return `${SESSION_KEY_PREFIX}${lessonId}`;
}

function saveSession(lessonId: string, state: LessonSessionState): void {
  try {
    sessionStorage.setItem(getSessionKey(lessonId), JSON.stringify(state));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function restoreSession(lessonId: string): LessonSessionState | null {
  try {
    const raw = sessionStorage.getItem(getSessionKey(lessonId));
    if (raw) return JSON.parse(raw) as LessonSessionState;
  } catch {
    // ignore
  }
  return null;
}

function clearSession(lessonId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(lessonId));
    // Also clear old v1 session
    sessionStorage.removeItem(`aula-pt-lesson-${lessonId}`);
  } catch {
    // ignore
  }
}

/* ─── Exercise renderer ─── */

function ExerciseRenderer({
  exercise,
  onComplete,
}: {
  exercise: Exercise;
  onComplete: (result: ExerciseResult | ExerciseResult[]) => void;
}) {
  // Key forces re-mount when exercise changes
  const key = JSON.stringify(exercise).slice(0, 100);

  switch (exercise.type) {
    case "multiple-choice":
      return (
        <MultipleChoice
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          options={exercise.options}
          correctIndex={exercise.correctIndex}
          onComplete={onComplete}
        />
      );
    case "fill-in-blank":
      return (
        <FillInBlank
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          sentencePt={exercise.sentencePt}
          sentenceEn={exercise.sentenceEn}
          correctAnswer={exercise.correctAnswer}
          acceptedAnswers={exercise.acceptedAnswers}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "conjugation-drill":
      return (
        <ConjugationDrill
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          verb={exercise.verb}
          verbMeaning={exercise.verbMeaning}
          tense={exercise.tense}
          persons={exercise.persons}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "true-false":
      return (
        <TrueFalse
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          statement={exercise.statement}
          isTrue={exercise.isTrue}
          explanation={exercise.explanation}
          onComplete={onComplete}
        />
      );
    case "translation-input":
      return (
        <TranslationInput
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          sourceText={exercise.sourceText}
          correctAnswer={exercise.correctAnswer}
          acceptedAnswers={exercise.acceptedAnswers}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "match-pairs":
      return (
        <MatchPairs
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          pairs={exercise.pairs}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "word-bank":
      return (
        <WordBank
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          textWithBlanks={exercise.textWithBlanks}
          blanks={exercise.blanks}
          wordBank={exercise.wordBank}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "sentence-build":
      return (
        <SentenceBuild
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          words={exercise.words}
          correctSentence={exercise.correctSentence}
          acceptedAnswers={exercise.acceptedAnswers}
          onComplete={(r) => onComplete(r)}
        />
      );
    case "error-correction":
      return (
        <ErrorCorrection
          key={key}
          instruction={exercise.instruction}
          englishInstruction={exercise.englishInstruction}
          incorrectSentence={exercise.incorrectSentence}
          correctSentence={exercise.correctSentence}
          acceptedAnswers={exercise.acceptedAnswers}
          onComplete={(r) => onComplete(r)}
        />
      );
  }
}

/* ─── Learn item renderer ─── */

function LearnItemRenderer({ item }: { item: LearnItem }) {
  switch (item.type) {
    case "vocab": {
      const v = item.data as VocabItem;
      return (
        <VocabLearnCard
          word={v.word}
          translation={v.translation}
          pronunciation={v.pronunciation}
          example={v.example}
        />
      );
    }
    case "grammar":
      return <GrammarLearn data={item.data as GrammarLearnData} />;
    case "verb":
      return <VerbLearn data={item.data as VerbLearnData} />;
    case "culture":
      return <CultureLearn data={item.data as CultureLearnData} />;
  }
}

/* ─── Intro screen ─── */

function LessonIntro({
  lesson,
  generatedLesson,
  showEnglish,
  onStartExercises,
  onReviewFirst,
}: {
  lesson: Lesson;
  generatedLesson: GeneratedLesson | null;
  showEnglish: boolean;
  onStartExercises: () => void;
  onReviewFirst: () => void;
}) {
  const learnItems = generatedLesson?.learnItems ?? [];
  const vocabCount = learnItems.filter((i) => i.type === "vocab").length;
  const verbCount = learnItems.filter((i) => i.type === "verb").length;
  const grammarCount = learnItems.filter((i) => i.type === "grammar").length;
  const cultureCount = learnItems.filter((i) => i.type === "culture").length;

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-1">
        {lesson.ptTitle}
      </h2>
      <p className="text-[15px] text-[var(--text-secondary)] mb-8">
        {lesson.title}
      </p>

      <div className="text-left bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-5 mb-8">
        <p className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1">
          Esta lição cobre:
        </p>
        {showEnglish && (
          <p className="text-[12px] text-[var(--text-muted)] mb-3">This lesson covers:</p>
        )}
        {!showEnglish && <div className="mb-2" />}
        <div className="space-y-2 text-[14px] text-[var(--text-primary)]">
          {vocabCount > 0 && (
            <p>
              {vocabCount} palavras novas
              {showEnglish && <span className="text-[var(--text-muted)]"> ({vocabCount} new words)</span>}
            </p>
          )}
          {verbCount > 0 && (
            <p>
              {verbCount} {verbCount === 1 ? "verbo" : "verbos"}
              {showEnglish && <span className="text-[var(--text-muted)]"> ({verbCount} {verbCount === 1 ? "verb" : "verbs"})</span>}
            </p>
          )}
          {grammarCount > 0 && (
            <p>
              {grammarCount} {grammarCount === 1 ? "tópico de gramática" : "tópicos de gramática"}
              {showEnglish && <span className="text-[var(--text-muted)]"> ({grammarCount} grammar {grammarCount === 1 ? "topic" : "topics"})</span>}
            </p>
          )}
          {cultureCount > 0 && (
            <p>
              {cultureCount} {cultureCount === 1 ? "expressão cultural" : "expressões culturais"}
              {showEnglish && <span className="text-[var(--text-muted)]"> ({cultureCount} cultural {cultureCount === 1 ? "expression" : "expressions"})</span>}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onStartExercises}
          className="w-full px-6 py-3.5 bg-[#003399] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity cursor-pointer"
        >
          Começar os exercícios →
          {showEnglish && <span className="block text-[12px] font-normal opacity-75 mt-0.5">Start the exercises</span>}
        </button>
        <button
          type="button"
          onClick={onReviewFirst}
          className="w-full px-6 py-3.5 border border-[var(--border-primary)] text-[var(--text-secondary)] text-[15px] font-medium rounded-[12px] hover:border-[#003399] hover:text-[#003399] transition-colors cursor-pointer"
        >
          Rever o material primeiro
          {showEnglish && <span className="block text-[12px] font-normal opacity-75 mt-0.5">Review the material first</span>}
        </button>
      </div>
    </div>
  );
}

/* ─── Scoring helpers ─── */

function calculateScore(results: (ExerciseResult | ExerciseResult[])[]): {
  correct: number;
  total: number;
} {
  let correct = 0;
  let total = 0;

  for (const r of results) {
    if (Array.isArray(r)) {
      total += r.length;
      correct += r.filter((x) => x.correct).length;
    } else {
      total += 1;
      if (r.correct) correct += 1;
    }
  }

  return { correct, total };
}

function collectWrongAnswers(
  results: (ExerciseResult | ExerciseResult[])[],
  exercises: Exercise[],
): { question: string; userAnswer: string; correctAnswer: string }[] {
  const wrong: { question: string; userAnswer: string; correctAnswer: string }[] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const ex = exercises[i];
    if (!ex) continue;

    if (Array.isArray(r)) {
      for (const sub of r) {
        if (!sub.correct) {
          wrong.push({
            question: ex.type === "conjugation-drill"
              ? `${(ex as { verb: string }).verb}: ${sub.correctAnswer}`
              : (ex as { instruction: string }).instruction,
            userAnswer: sub.userAnswer,
            correctAnswer: sub.correctAnswer,
          });
        }
      }
    } else if (!r.correct) {
      wrong.push({
        question: (ex as { instruction: string }).instruction,
        userAnswer: r.userAnswer,
        correctAnswer: r.correctAnswer,
      });
    }
  }

  return wrong;
}

/* ─── Main lesson content ─── */

function LessonContent({ id }: { id: string }) {
  const router = useRouter();
  const lesson = getResolvedLesson(id);
  const curriculumLesson = getCurriculumLesson(id);

  // Determine CEFR level and whether to show English
  const showEnglish = lesson?.cefr === "A1" || lesson?.cefr === "A2";

  // State
  const [round, setRound] = useState<Round>("intro");
  const [skippedLearn, setSkippedLearn] = useState(false);
  const [learnIndex, setLearnIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [applyIndex, setApplyIndex] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [practiceResults, setPracticeResults] = useState<(ExerciseResult | ExerciseResult[])[]>([]);
  const [applyResults, setApplyResults] = useState<(ExerciseResult | ExerciseResult[])[]>([]);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);

  // Progress & session
  const [progressMap, setProgressMap] = useState<Record<string, { completed?: boolean }> | null>(null);
  const [savedSessionState, setSavedSessionState] = useState<LessonSessionState | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasSaved = useRef(false);
  const [levelCounts, setLevelCounts] = useState<{ a1: number; a2: number; b1: number; total: number } | null>(null);

  // Next lesson
  const sortedLessons = getResolvedLessons().sort((a, b) => a.order - b.order);
  const nextLesson = lesson ? sortedLessons.find((l) => l.order === lesson.order + 1) : null;
  const nextLessonId = nextLesson?.id ?? null;

  // Initialize
  useEffect(() => {
    getLessonProgressMap().then((map) => {
      setProgressMap(map);
      const session = restoreSession(id);
      setSavedSessionState(session);
      if (session && !map[id]?.completed) {
        setShowRestorePrompt(true);
      } else if (session && map[id]?.completed) {
        clearSession(id);
      }
    });
  }, [id]);

  // Generate exercises on first render (if no restore)
  useEffect(() => {
    if (!lesson || showRestorePrompt || generatedLesson) return;
    setGeneratedLesson(generateLessonExercises(lesson, showEnglish));
  }, [lesson, showRestorePrompt, generatedLesson]);

  // Persist session
  useEffect(() => {
    if (!generatedLesson || showRestorePrompt || round === "results" || round === "intro") return;
    saveSession(id, {
      round,
      learnIndex,
      practiceIndex,
      applyIndex,
      practiceResults,
      applyResults,
      generatedLesson,
      showTransition,
      skippedLearn,
    });
  }, [id, round, learnIndex, practiceIndex, applyIndex, practiceResults, applyResults, generatedLesson, showTransition, showRestorePrompt, skippedLearn]);

  // Restore session
  const handleRestore = () => {
    if (savedSessionState) {
      setRound(savedSessionState.round);
      setLearnIndex(savedSessionState.learnIndex);
      setPracticeIndex(savedSessionState.practiceIndex);
      setApplyIndex(savedSessionState.applyIndex);
      setPracticeResults(savedSessionState.practiceResults);
      setApplyResults(savedSessionState.applyResults);
      setGeneratedLesson(savedSessionState.generatedLesson);
      setShowTransition(savedSessionState.showTransition);
      setSkippedLearn(savedSessionState.skippedLearn ?? false);
    }
    setShowRestorePrompt(false);
  };

  const handleStartFresh = () => {
    clearSession(id);
    setSavedSessionState(null);
    setShowRestorePrompt(false);
  };

  // Save
  const doSave = useCallback(async () => {
    if (!lesson || !generatedLesson) return;
    setIsSaving(true);
    setSaveError(false);

    const practiceScore = calculateScore(practiceResults);
    const applyScore = calculateScore(applyResults);
    const totalPoints = practiceScore.total + applyScore.total;
    const totalCorrect = practiceScore.correct + applyScore.correct;
    const accuracy = totalPoints > 0 ? Math.round((totalCorrect / totalPoints) * 100) : 0;
    const passed = accuracy >= 80;

    // Build wrong items for storage
    const wrongItems: WrongItem[] = [];
    const allResults = [...practiceResults, ...applyResults];
    const allExercises = [...generatedLesson.practiceExercises, ...generatedLesson.applyExercises];
    for (let i = 0; i < allResults.length; i++) {
      const r = allResults[i];
      const ex = allExercises[i];
      if (!ex) continue;

      if (Array.isArray(r)) {
        for (const sub of r) {
          if (!sub.correct) {
            wrongItems.push({
              type: ex.type === "conjugation-drill" ? "verb" : "practice",
              userAnswer: sub.userAnswer,
              correctAnswer: sub.correctAnswer,
            });
          }
        }
      } else if (!r.correct) {
        wrongItems.push({
          type: "practice",
          userAnswer: r.userAnswer,
          correctAnswer: r.correctAnswer,
        });
      }
    }

    const title = lesson.ptTitle ? `${lesson.title} (${lesson.ptTitle})` : lesson.title;

    try {
      const ok = await saveLessonAttempt(lesson.id, accuracy, passed, wrongItems);
      if (!ok) {
        setSaveError(true);
        setIsSaving(false);
        return;
      }

      clearSession(id);
      logLessonCompletion(lesson.id, title, accuracy, passed).catch(() => {});
      updateStreak().catch(() => {});

      // Fetch fresh progress
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
  }, [lesson, generatedLesson, practiceResults, applyResults, id]);

  // Auto-save on results
  useEffect(() => {
    if (round !== "results" || hasSaved.current) return;
    hasSaved.current = true;
    doSave();
  }, [round, doSave]);

  // Not found
  if (!lesson) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[var(--text-muted)]">Lição não encontrada.</p>
          <Link
            href="/lessons"
            className="text-[13px] font-medium text-[#003399] hover:underline mt-2 inline-block"
          >
            Voltar às lições
          </Link>
        </main>
      </>
    );
  }

  if (!generatedLesson && !showRestorePrompt) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[var(--text-secondary)]">A preparar a lição...</p>
        </main>
      </>
    );
  }

  // Compute progress
  const learnTotal = generatedLesson?.learnItems.length ?? 0;
  const practiceTotal = generatedLesson?.practiceExercises.length ?? 0;
  const applyTotal = generatedLesson?.applyExercises.length ?? 0;

  let roundProgress = 0;
  let progressLabel = "";
  if (round === "learn") {
    roundProgress = learnTotal > 0 ? (learnIndex / learnTotal) * 100 : 0;
    const itemType = generatedLesson?.learnItems[learnIndex]?.type;
    const typeLabels: Record<string, string> = {
      vocab: "Vocabulário",
      grammar: "Gramática",
      verb: "Verbo",
      culture: "Cultura",
    };
    progressLabel = `${typeLabels[itemType ?? "vocab"] ?? ""} ${learnIndex + 1} de ${learnTotal}`;
  } else if (round === "practice") {
    roundProgress = practiceTotal > 0 ? (practiceIndex / practiceTotal) * 100 : 0;
    progressLabel = `Exercício ${practiceIndex + 1} de ${practiceTotal}`;
  } else if (round === "apply") {
    roundProgress = applyTotal > 0 ? (applyIndex / applyTotal) * 100 : 0;
    progressLabel = `Exercício ${applyIndex + 1} de ${applyTotal}`;
  }

  // Scoring for results
  const practiceScore = calculateScore(practiceResults);
  const applyScore = calculateScore(applyResults);
  const totalPoints = practiceScore.total + applyScore.total;
  const totalCorrect = practiceScore.correct + applyScore.correct;
  const accuracy = totalPoints > 0 ? Math.round((totalCorrect / totalPoints) * 100) : 0;
  const passed = accuracy >= 80;

  // Exam unlock
  const unlockedExamId =
    levelCounts != null
      ? Object.entries(MOCK_EXAM_UNLOCKS).find(
          ([, config]) => config.lessonsRequired === levelCounts.total
        )?.[0] ?? null
      : null;

  // Level progress for results
  const cefrTotals: Record<string, number> = { A1: 18, A2: 16, B1: 10 };
  const cefrCompleted = levelCounts
    ? lesson.cefr === "A1" ? levelCounts.a1
      : lesson.cefr === "A2" ? levelCounts.a2
      : levelCounts.b1
    : 0;

  // Handlers
  const handleStartExercises = () => {
    // Skip learn, go directly to practice transition
    setSkippedLearn(true);
    setShowTransition(true);
    setRound("learn"); // Use "learn" round with transition showing to get to practice
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReviewFirst = () => {
    setSkippedLearn(false);
    setRound("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLearnNext = () => {
    if (learnIndex < learnTotal - 1) {
      setLearnIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowTransition(true);
    }
  };

  const handleLearnPrev = () => {
    if (learnIndex > 0) {
      setLearnIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStartPractice = () => {
    setShowTransition(false);
    setRound("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePracticeComplete = (result: ExerciseResult | ExerciseResult[]) => {
    setPracticeResults((prev) => [...prev, result]);
    if (practiceIndex < practiceTotal - 1) {
      setPracticeIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Transition to apply
      setShowTransition(true);
    }
  };

  const handleStartApply = () => {
    setShowTransition(false);
    setRound("apply");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyComplete = (result: ExerciseResult | ExerciseResult[]) => {
    setApplyResults((prev) => [...prev, result]);
    if (applyIndex < applyTotal - 1) {
      setApplyIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Go to results
      setRound("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRetryPractice = () => {
    // Skip Round 1, regenerate exercises
    if (lesson) {
      const newGen = generateLessonExercises(lesson, showEnglish);
      setGeneratedLesson(newGen);
    }
    setSkippedLearn(true);
    setPracticeIndex(0);
    setApplyIndex(0);
    setPracticeResults([]);
    setApplyResults([]);
    hasSaved.current = false;
    setSaveError(false);
    setRound("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryFull = () => {
    // Full restart including Round 1 (not intro — they've already chosen)
    if (lesson) {
      const newGen = generateLessonExercises(lesson, showEnglish);
      setGeneratedLesson(newGen);
    }
    setSkippedLearn(false);
    setLearnIndex(0);
    setPracticeIndex(0);
    setApplyIndex(0);
    setPracticeResults([]);
    setApplyResults([]);
    hasSaved.current = false;
    setSaveError(false);
    setShowTransition(false);
    setRound("learn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetrySave = () => {
    hasSaved.current = false;
    doSave();
  };

  // Restore prompt
  if (showRestorePrompt) {
    return (
      <>
        <Topbar />
        <LessonShell
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          lessonTitlePt={lesson.ptTitle}
          cefr={lesson.cefr}
          currentRound="learn"
          roundProgress={0}
          progressLabel=""
        >
          <div className="p-6 rounded-[12px] border border-[var(--border-primary)] bg-[var(--bg-card)] text-center">
            <p className="text-[15px] font-medium text-[var(--text-primary)] mb-4">
              Tens progresso guardado nesta lição.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRestore}
                className="px-5 py-2.5 bg-[#003399] text-white text-[14px] font-medium rounded-[12px] hover:opacity-90 transition-opacity"
              >
                Continuar de onde parei
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-5 py-2.5 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Começar de novo
              </button>
            </div>
          </div>
        </LessonShell>
      </>
    );
  }

  if (!generatedLesson) return null;

  // Render
  return (
    <>
      <Topbar />
      <LessonShell
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        lessonTitlePt={lesson.ptTitle}
        cefr={lesson.cefr}
        currentRound={round}
        skippedLearn={skippedLearn}
        roundProgress={roundProgress}
        progressLabel={progressLabel}
      >
        {/* ── INTRO: Choose path ── */}
        {round === "intro" && (
          <LessonIntro
            lesson={lesson}
            generatedLesson={generatedLesson}
            showEnglish={showEnglish}
            onStartExercises={handleStartExercises}
            onReviewFirst={handleReviewFirst}
          />
        )}

        {/* ── ROUND 1: Learn ── */}
        {round === "learn" && !showTransition && (
          <>
            <LearnItemRenderer item={generatedLesson.learnItems[learnIndex]} />

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-light)]">
              <button
                type="button"
                onClick={handleLearnPrev}
                disabled={learnIndex === 0}
                className={`text-[13px] font-medium transition-colors ${
                  learnIndex === 0
                    ? "text-[var(--text-muted)] cursor-not-allowed"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                }`}
              >
                &larr; Anterior
              </button>
              <button
                type="button"
                onClick={handleLearnNext}
                className="px-5 py-2 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                {learnIndex < learnTotal - 1 ? "Próximo →" : "Continuar →"}
              </button>
            </div>
          </>
        )}

        {/* ── Transition: Learn → Practice ── */}
        {round === "learn" && showTransition && (
          <RoundTransition
            title="Vamos praticar!"
            englishTitle={showEnglish ? "Let's practice!" : undefined}
            subtitle="Agora vais ser testado no que acabaste de aprender. Exercícios variados sobre vocabulário, verbos, gramática e cultura."
            englishSubtitle={showEnglish ? "Now you'll be tested on what you just learned. Mixed exercises on vocabulary, verbs, grammar and culture." : undefined}
            buttonText="Começar →"
            onContinue={handleStartPractice}
          />
        )}

        {/* ── ROUND 2: Practice ── */}
        {round === "practice" && !showTransition && generatedLesson.practiceExercises[practiceIndex] && (
          <ExerciseRenderer
            exercise={generatedLesson.practiceExercises[practiceIndex]}
            onComplete={handlePracticeComplete}
          />
        )}

        {/* ── Transition: Practice → Apply ── */}
        {round === "practice" && showTransition && (
          <RoundTransition
            title="Bom trabalho!"
            englishTitle={showEnglish ? "Good work!" : undefined}
            subtitle="Agora vamos aplicar tudo junto com exercícios mais desafiantes."
            englishSubtitle={showEnglish ? "Now let's put it all together with more challenging exercises." : undefined}
            buttonText="Continuar →"
            onContinue={handleStartApply}
          />
        )}

        {/* ── ROUND 3: Apply ── */}
        {round === "apply" && generatedLesson.applyExercises[applyIndex] && (
          <ExerciseRenderer
            exercise={generatedLesson.applyExercises[applyIndex]}
            onComplete={handleApplyComplete}
          />
        )}

        {/* ── Results ── */}
        {round === "results" && (
          <ResultsScreen
            passed={passed}
            accuracy={accuracy}
            practiceScore={practiceScore}
            applyScore={applyScore}
            wrongAnswers={collectWrongAnswers(
              [...practiceResults, ...applyResults],
              [...generatedLesson.practiceExercises, ...generatedLesson.applyExercises],
            )}
            levelProgress={{
              completed: cefrCompleted,
              total: cefrTotals[lesson.cefr] ?? 18,
              level: lesson.cefr,
            }}
            onNextLesson={
              nextLessonId
                ? () => router.push(`/lessons/${nextLessonId}`)
                : null
            }
            onRetryPractice={handleRetryPractice}
            onRetryFull={handleRetryFull}
            onBackToLessons={() => router.push("/lessons")}
            isSaving={isSaving}
            saveError={saveError}
            onRetrySave={handleRetrySave}
            examUnlocked={unlockedExamId}
            showEnglish={showEnglish}
          />
        )}
      </LessonShell>
    </>
  );
}

/* ─── Page wrapper ─── */

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <LessonContent id={id} />
    </ProtectedRoute>
  );
}
