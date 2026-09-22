"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { batchUpdateMastery } from "@/lib/learning-engine/mastery-tracker";
import { buildMasteryAnswers } from "@/lib/learning-engine/mastery-answers";
import type { SessionPayload, SessionRequest } from "@/lib/learning-engine/session-payload";
import type { SectionResult } from "@/lib/exercise-types";
import { saveLessonAttempt, type WrongItem } from "@/lib/lesson-progress";
import { logLessonCompletion } from "@/lib/calendar-service";
import { updateStreak } from "@/lib/streak-service";
import { incrementGoalProgress } from "@/lib/goals-service";
import { LearnPlayer } from "@/components/learn/learn-player";
import type { SaveStatus } from "@/components/learn/learn-results";

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const requestedLevel = searchParams.get("level");
  const curriculumId = searchParams.get("lesson");
  const { user } = useAuth();

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ state: "idle" });

  // What the last completion produced, and which parts of it are already persisted
  const lastResultsRef = useRef<SectionResult[] | null>(null);
  const persistedRef = useRef({ attempt: false, mastery: false, sideEffects: false });

  useEffect(() => {
    const controller = new AbortController();

    async function init() {
      try {
        const body: SessionRequest = {};
        if (curriculumId) body.lesson = curriculumId;
        else if (mode === "review") body.mode = "review";
        else if (requestedLevel === "A1" || requestedLevel === "A2" || requestedLevel === "B1") body.level = requestedLevel;

        const res = await fetch("/api/learn/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          const detail = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(detail.error ?? `Could not generate a session (${res.status})`);
        }
        const payload = (await res.json()) as SessionPayload;
        if (controller.signal.aborted) return;
        setSession(payload);
        setLoading(false);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error("Learn page init error:", err);
        setError(err instanceof Error ? err.message : "Failed to generate lesson");
        setLoading(false);
      }
    }

    init();
    return () => controller.abort();
  }, [mode, requestedLevel, curriculumId]);

  async function persist(sectionResults: SectionResult[]) {
    if (!session || !user) return;
    const { lesson, generated, practiceItems, isReview } = session;

    setSaveStatus({ state: "saving" });

    const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
    const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const passed = accuracy >= 80;

    const failures: string[] = [];

    // 1. Lesson attempt
    if (!persistedRef.current.attempt) {
      const wrongItems: WrongItem[] = sectionResults.flatMap((sr) =>
        sr.answers.filter((a) => !a.correct).map((a) => ({
          type: (sr.sectionKey === "conjugation" ? "verb" : "practice") as WrongItem["type"],
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
        }))
      );
      const ok = await saveLessonAttempt(lesson.id, accuracy, passed, wrongItems).catch(() => false);
      if (ok) persistedRef.current.attempt = true;
      else failures.push("your lesson result");
    }

    // 2. Mastery — one real answer per item actually asked
    if (!persistedRef.current.mastery) {
      const answers = buildMasteryAnswers(generated, sectionResults, practiceItems, lesson.cefr);
      try {
        await batchUpdateMastery(user.id, answers);
        persistedRef.current.mastery = true;
      } catch (e) {
        console.error("Failed to save mastery:", e);
        failures.push("your progress on individual items");
      }
    }

    // 3. Side effects — once, after the attempt is on record
    if (persistedRef.current.attempt && !persistedRef.current.sideEffects) {
      persistedRef.current.sideEffects = true;
      const tasks: Promise<unknown>[] = [
        logLessonCompletion(
          lesson.id,
          isReview ? "Review session" : `${lesson.cefr} lesson`,
          accuracy,
          passed
        ),
        updateStreak(),
      ];
      if (passed && !isReview) {
        tasks.push(incrementGoalProgress(`lessons_${lesson.cefr.toLowerCase()}`));
      }
      await Promise.allSettled(tasks);
    }

    if (failures.length > 0) {
      setSaveStatus({
        state: "error",
        message: `We couldn't save ${failures.join(" or ")}. Check your connection and retry.`,
      });
    } else {
      setSaveStatus({ state: "saved" });
    }
  }

  function handleComplete(sectionResults: SectionResult[]) {
    // A fresh completion (e.g. after "Try again") starts a new save cycle
    if (lastResultsRef.current !== sectionResults) {
      lastResultsRef.current = sectionResults;
      persistedRef.current = { attempt: false, mastery: false, sideEffects: false };
    }
    void persist(sectionResults);
  }

  function handleRetrySave() {
    if (lastResultsRef.current) void persist(lastResultsRef.current);
  }

  const isReview = session?.isReview ?? mode === "review";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-[#9B9DA3]">
            {isReview ? "Building review session..." : "Generating your lesson..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-[14px] text-[#dc2626]">{error}</p>
        <button
          onClick={() => router.push("/lessons")}
          className="px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
        >
          Back to lessons
        </button>
      </div>
    );
  }

  if (!session || session.generated.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-[14px] text-[#6C6B71]">
          {isReview ? "Nothing is due for review right now." : "No exercises available at this level yet."}
        </p>
        <button
          onClick={() => router.push("/lessons")}
          className="px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
        >
          Back to lessons
        </button>
      </div>
    );
  }

  return (
    <LearnPlayer
      lesson={session.lesson}
      generated={session.generated}
      isReview={session.isReview}
      onComplete={handleComplete}
      saveStatus={saveStatus}
      onRetrySave={handleRetrySave}
    />
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-[13px] text-[#9B9DA3]">Loading...</p>
        </div>
      }
    >
      <LearnPageContent />
    </Suspense>
  );
}
