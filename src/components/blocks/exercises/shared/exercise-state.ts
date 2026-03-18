"use client";

import { useState, useCallback, useRef } from "react";
import type { AnswerResult } from "@/types/blocks";

export type ExercisePhase =
  | "active"
  | "submitted"
  | "showing-feedback"
  | "transitioning"
  | "complete";

export interface ExerciseState {
  phase: ExercisePhase;
  currentIndex: number;
  totalCount: number;
  lastResult: AnswerResult | null;
  streak: { correct: number; incorrect: number };
  allResults: AnswerResult[];
}

interface UseExerciseFlowOptions {
  totalExercises: number;
  onComplete: (results: AnswerResult[]) => void;
  feedbackDuration?: number;
  transitionDuration?: number;
}

export function useExerciseFlow(options: UseExerciseFlowOptions) {
  const {
    totalExercises,
    onComplete,
    feedbackDuration,
    transitionDuration = 200,
  } = options;

  const [state, setState] = useState<ExerciseState>({
    phase: "active",
    currentIndex: 0,
    totalCount: totalExercises,
    lastResult: null,
    streak: { correct: 0, incorrect: 0 },
    allResults: [],
  });

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleAnswer = useCallback((result: AnswerResult) => {
    setState((prev) => {
      const newResults = [...prev.allResults, result];
      const newStreak = result.correct
        ? { correct: prev.streak.correct + 1, incorrect: 0 }
        : { correct: 0, incorrect: prev.streak.incorrect + 1 };

      return {
        ...prev,
        phase: "showing-feedback" as ExercisePhase,
        lastResult: result,
        streak: newStreak,
        allResults: newResults,
      };
    });

    if (feedbackDuration) {
      transitionTimer.current = setTimeout(() => {
        advanceToNext();
      }, feedbackDuration);
    }
  }, [feedbackDuration]);

  const advanceToNext = useCallback(() => {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }

    setState((prev) => {
      if (prev.currentIndex >= prev.totalCount - 1) {
        // Fire onComplete async to avoid state update during render
        setTimeout(() => onCompleteRef.current(prev.allResults), 0);
        return { ...prev, phase: "complete" as ExercisePhase };
      }
      return { ...prev, phase: "transitioning" as ExercisePhase };
    });

    setTimeout(() => {
      setState((prev) => {
        if (prev.phase === "complete") return prev;
        return {
          ...prev,
          phase: "active" as ExercisePhase,
          currentIndex: prev.currentIndex + 1,
          lastResult: null,
        };
      });
    }, transitionDuration);
  }, [transitionDuration]);

  const skipExercise = useCallback(() => {
    const skipResult: AnswerResult = {
      correct: false,
      userAnswer: "(skipped)",
      expectedAnswer: "",
      points: 0,
      maxPoints: 1,
    };
    handleAnswer(skipResult);
  }, [handleAnswer]);

  return {
    state,
    handleAnswer,
    advanceToNext,
    skipExercise,
    isActive: state.phase === "active",
    isShowingFeedback: state.phase === "showing-feedback",
    isTransitioning: state.phase === "transitioning",
    isComplete: state.phase === "complete",
    progress: (state.currentIndex + 1) / state.totalCount,
  };
}
