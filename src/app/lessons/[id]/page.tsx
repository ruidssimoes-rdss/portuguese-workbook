"use client";

/**
 * Lesson Player — block-system implementation.
 * Handles both curriculum lessons (resolved from data files)
 * and AI tutor sessions (loaded from sessionStorage).
 */

import { useState, useCallback, use, useMemo } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { getResolvedLesson } from "@/data/resolve-lessons";
import { adaptLessonToBlocks, getDifficultyFromLesson } from "@/components/blocks/lesson-adapter";
import { SessionShell } from "@/components/blocks/layout/session-shell";
import { LearnCarousel } from "@/components/blocks/layout/learn-carousel";
import { ReviewStack } from "@/components/blocks/layout/review-stack";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { saveLessonAttempt, type WrongItem } from "@/lib/lesson-progress";
import type { SessionResults, LessonBlockPlan, ExerciseDifficulty } from "@/types/blocks";

/** Load AI session plan from sessionStorage */
function loadAISessionPlan(id: string): LessonBlockPlan | null {
  try {
    const raw = sessionStorage.getItem(`ai-session-${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as LessonBlockPlan;
  } catch {
    return null;
  }
}

function LessonContent({ id }: { id: string }) {
  const isAISession = id.startsWith("ai-");

  const { plan, difficulty, showEnglish } = useMemo(() => {
    if (isAISession) {
      const aiPlan = loadAISessionPlan(id);
      if (aiPlan) {
        const diff: ExerciseDifficulty =
          aiPlan.meta.cefr === "A1" ? "foundation" :
          aiPlan.meta.cefr === "A2" ? "developing" : "confident";
        return {
          plan: aiPlan,
          difficulty: diff,
          showEnglish: aiPlan.meta.cefr === "A1" || aiPlan.meta.cefr === "A2",
        };
      }
    }

    const lesson = getResolvedLesson(id);
    if (lesson) {
      return {
        plan: adaptLessonToBlocks(lesson),
        difficulty: getDifficultyFromLesson(lesson),
        showEnglish: lesson.cefr === "A1" || lesson.cefr === "A2",
      };
    }

    return { plan: null, difficulty: "foundation" as ExerciseDifficulty, showEnglish: true };
  }, [id, isAISession]);

  const [currentStage, setCurrentStage] = useState(0);

  const handleComplete = useCallback(async (results: SessionResults) => {
    if (isAISession) {
      console.log("[AI Session] Complete:", results.accuracy, "% accuracy");
      return;
    }

    try {
      const wrongItems: WrongItem[] = results.answers
        .filter((a) => !a.correct)
        .map((a) => ({
          type: "practice" as const,
          userAnswer: a.userAnswer,
          correctAnswer: a.expectedAnswer,
        }));

      await saveLessonAttempt(
        id,
        results.accuracy / 100,
        results.passed,
        wrongItems,
      );
    } catch (err) {
      console.error("[Lesson] Save failed:", err);
    }
  }, [id, isAISession]);

  if (!plan) {
    return (
      <div className="max-w-[896px] mx-auto px-4 py-12 text-center">
        <p className="text-[16px] font-semibold text-[#111827]">
          {isAISession ? "Session expired" : "Lesson not found"}
        </p>
        <p className="text-[13px] text-[#6B7280] mt-1">
          {isAISession
            ? "This AI session has expired. Generate a new one from the Tutor tab."
            : `Could not find lesson with ID: ${id}`}
        </p>
      </div>
    );
  }

  const currentPhase = plan.stages[currentStage];

  return (
    <SessionShell
      lessonTitle={plan.meta.title}
      lessonTitlePt={plan.meta.ptTitle}
      cefr={plan.meta.cefr}
      stages={plan.stages}
      currentStageIndex={currentStage}
      onStageChange={setCurrentStage}
      onComplete={handleComplete}
    >
      {currentPhase?.type === "learn" && (
        <LearnCarousel
          items={plan.learnBlocks}
          onComplete={() => {
            setCurrentStage(1);
          }}
        >
          {(index) => (
            <BlockRenderer descriptor={plan.learnBlocks[index]} />
          )}
        </LearnCarousel>
      )}

      {currentPhase?.type === "exercise" && (
        <ReviewStack
          exercises={plan.exerciseBlocks}
          difficulty={difficulty}
          showEnglish={showEnglish}
          passThreshold={0.6}
          onComplete={handleComplete}
        />
      )}
    </SessionShell>
  );
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <LessonContent id={id} />
    </ProtectedRoute>
  );
}
