"use client";

import { useRef, useCallback, useState } from "react";
import type {
  ReviewStackProps,
  AnswerResult,
  SessionResults,
  ExerciseBlockType,
  ExerciseData,
  ExerciseDifficulty,
} from "@/types/blocks";
import { useExerciseFlow } from "../exercises/shared/exercise-state";
import { useExplanation } from "../exercises/shared/use-explanation";
import { getAdaptation, adjustDifficulty } from "../exercises/shared/adaptive-engine";
import { ExerciseChrome } from "../exercises/shared/exercise-chrome";
import { ExerciseFeedback } from "../exercises/shared/exercise-feedback";
import {
  TranslateExercise,
  ConjugateExercise,
  FillGapExercise,
  BuildSentenceExercise,
  ChooseCorrectExercise,
  SpotErrorExercise,
  ListenWriteExercise,
  MatchPairsExercise,
  SpeakExercise,
} from "../exercises";

function renderExercise(
  type: ExerciseBlockType,
  data: ExerciseData,
  difficulty: ExerciseDifficulty,
  showEnglish: boolean,
  onAnswer: (result: AnswerResult) => void,
  disabled: boolean,
) {
  const props = { data: data as never, difficulty, showEnglish, onAnswer, disabled };

  switch (type) {
    case "exercise-translate": return <TranslateExercise {...props} />;
    case "exercise-conjugate": return <ConjugateExercise {...props} />;
    case "exercise-fill-gap": return <FillGapExercise {...props} />;
    case "exercise-build-sentence": return <BuildSentenceExercise {...props} />;
    case "exercise-choose-correct": return <ChooseCorrectExercise {...props} />;
    case "exercise-spot-error": return <SpotErrorExercise {...props} />;
    case "exercise-listen-write": return <ListenWriteExercise {...props} />;
    case "exercise-match-pairs": return <MatchPairsExercise {...props} />;
    case "exercise-speak": return <SpeakExercise {...props} />;
    default: return <p className="text-[13px] text-[#9B9DA3]">Unknown exercise type</p>;
  }
}

function getExerciseContext(exercise: { type: ExerciseBlockType; data: ExerciseData }): string {
  const d = exercise.data;
  if ("word" in d) return (d as { word: string }).word;
  if ("sentence" in d) return (d as { sentence: string }).sentence;
  if ("question" in d) return (d as { question: string }).question;
  if ("verb" in d) return `${(d as { verb: string }).verb} (${(d as { pronoun?: string }).pronoun ?? ""})`;
  return exercise.type;
}

export function ReviewStack({
  exercises,
  difficulty: initialDifficulty,
  showEnglish,
  passThreshold = 0.6,
  onComplete,
  className,
}: ReviewStackProps) {
  const startTime = useRef(Date.now());
  const explanation = useExplanation();
  const [currentDifficulty, setCurrentDifficulty] = useState<ExerciseDifficulty>(initialDifficulty);
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);

  const handleFlowComplete = useCallback((allResults: AnswerResult[]) => {
    const totalPoints = allResults.reduce((s, a) => s + a.points, 0);
    const maxPoints = allResults.reduce((s, a) => s + a.maxPoints, 0);
    const accuracy = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    const results: SessionResults = {
      totalPoints,
      maxPoints,
      accuracy,
      passed: accuracy >= passThreshold * 100,
      answers: allResults,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
    };
    onComplete(results);
  }, [passThreshold, onComplete]);

  const {
    state,
    handleAnswer: rawHandleAnswer,
    advanceToNext: rawAdvance,
    skipExercise,
    isShowingFeedback,
  } = useExerciseFlow({
    totalExercises: exercises.length,
    onComplete: handleFlowComplete,
    transitionDuration: 200,
  });

  const current = exercises[state.currentIndex];

  const handleAnswer = useCallback((result: AnswerResult) => {
    explanation.reset();
    setMilestoneMsg(null);

    // Fetch explanation for wrong answers
    if (!result.correct && current) {
      explanation.fetchExplanation({
        wrongAnswer: result.userAnswer,
        correctAnswer: result.expectedAnswer,
        exerciseType: current.type,
        context: getExerciseContext(current),
        studentLevel: currentDifficulty === "foundation" ? "A1" : currentDifficulty === "developing" ? "A2" : "B1",
      });
    }

    rawHandleAnswer(result);

    // Adaptive engine — check after updating state
    const newCorrectStreak = result.correct ? state.streak.correct + 1 : 0;
    const newIncorrectStreak = result.correct ? 0 : state.streak.incorrect + 1;

    const adaptation = getAdaptation(
      newCorrectStreak,
      newIncorrectStreak,
      currentDifficulty,
      state.allResults.length + 1,
      [...state.allResults, result].slice(-10),
    );

    switch (adaptation.type) {
      case "increase-difficulty":
        setCurrentDifficulty(adjustDifficulty(currentDifficulty, "increase"));
        break;
      case "decrease-difficulty":
        setCurrentDifficulty(adjustDifficulty(currentDifficulty, "decrease"));
        break;
      case "milestone":
        setMilestoneMsg(adaptation.message);
        break;
    }
  }, [rawHandleAnswer, explanation, current, currentDifficulty, state]);

  const advanceToNext = useCallback(() => {
    explanation.reset();
    setMilestoneMsg(null);
    rawAdvance();
  }, [rawAdvance, explanation]);

  if (!current) return null;

  return (
    <div className={`relative ${className ?? ""}`}>
      <ExerciseChrome
        currentIndex={state.currentIndex}
        totalCount={state.totalCount}
        phase={state.phase}
        onSkip={skipExercise}
      >
        {renderExercise(
          current.type,
          current.data,
          currentDifficulty,
          showEnglish,
          handleAnswer,
          isShowingFeedback,
        )}
      </ExerciseChrome>

      {isShowingFeedback && state.lastResult && (
        <ExerciseFeedback
          result={state.lastResult}
          onContinue={advanceToNext}
          explanation={explanation.explanation}
          tip={explanation.tip}
          explanationLoading={explanation.loading}
          milestone={milestoneMsg}
        />
      )}
    </div>
  );
}
