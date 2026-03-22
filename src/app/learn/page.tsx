"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  generateLesson as generateDynamicLesson,
  generateReviewSession,
  adaptGeneratedLesson,
  adaptReviewSession,
  getCurrentStudyLevel,
  batchUpdateMastery,
  type CEFRLevel as LearningCEFRLevel,
} from "@/lib/learning-engine";
import {
  generateLessonExercises,
  type GeneratedLesson,
} from "@/lib/exercise-generator";
import type { Lesson } from "@/data/lessons";
import type { SectionResult } from "@/lib/exercise-types";
import { saveLessonAttempt, type WrongItem } from "@/lib/lesson-progress";
import { logLessonCompletion } from "@/lib/calendar-service";
import { updateStreak } from "@/lib/streak-service";
import { updateGoalProgress } from "@/lib/goals-service";
import { LearnPlayer } from "@/components/learn/learn-player";

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const requestedLevel = searchParams.get("level") as LearningCEFRLevel | null;

  const [userId, setUserId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [generated, setGenerated] = useState<GeneratedLesson | null>(null);
  const [practiceItems, setPracticeItems] = useState<any[]>([]);
  const [isReview, setIsReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        setUserId(user.id);

        let adapted: { lesson: Lesson; practiceItems: any[] };

        if (mode === "review") {
          const review = await generateReviewSession(user.id);
          adapted = adaptReviewSession(review);
          setIsReview(true);
        } else {
          const cefr = requestedLevel || await getCurrentStudyLevel(user.id);
          const dynamicLesson = await generateDynamicLesson(user.id, cefr);
          adapted = adaptGeneratedLesson(dynamicLesson);
        }

        if (cancelled) return;

        // Generate exercises from the adapted lesson
        const exs = generateLessonExercises(adapted.lesson);

        setLesson(adapted.lesson);
        setGenerated(exs);
        setPracticeItems(adapted.practiceItems);
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Learn page init error:", err);
        setError(err.message || "Failed to generate lesson");
        setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [mode, requestedLevel, router]);

  async function handleComplete(sectionResults: SectionResult[]) {
    if (!userId || !lesson) return;

    const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
    const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const passed = accuracy >= 80;

    // Save lesson attempt
    try {
      const wrongItems: WrongItem[] = sectionResults.flatMap((sr) =>
        sr.answers.filter((a) => !a.correct).map((a) => ({
          type: (sr.sectionKey === "conjugation" ? "verb" : "practice") as WrongItem["type"],
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
        }))
      );

      await saveLessonAttempt(lesson.id, accuracy, passed, wrongItems);
    } catch (e) {
      console.error("Failed to save lesson attempt:", e);
    }

    // Save mastery data
    try {
      if (practiceItems.length > 0) {
        // Mark all learn-phase items as seen
        const learnResults = practiceItems.map((item) => ({
          contentType: item.contentType,
          contentId: item.contentId,
          contentCefr: item.contentCefr,
          contentCategory: item.contentCategory,
          wasCorrect: true, // Seen = introduced
          isHighFrequency: item.isHighFrequency ?? false,
        }));
        await batchUpdateMastery(userId, learnResults);
      }
    } catch (e) {
      console.error("Failed to save mastery:", e);
    }

    // Side effects
    try {
      await Promise.allSettled([
        logLessonCompletion(
          lesson.id,
          isReview ? "Review session" : `${lesson.cefr} lesson`,
          accuracy,
          passed
        ),
        updateStreak(),
        updateGoalProgress("lesson", 1),
      ]);
    } catch {
      // Non-critical
    }
  }

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

  if (!lesson || !generated || generated.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-[14px] text-[#6C6B71]">No exercises available at this level yet.</p>
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
      lesson={lesson}
      generated={generated}
      isReview={isReview}
      onComplete={handleComplete}
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
