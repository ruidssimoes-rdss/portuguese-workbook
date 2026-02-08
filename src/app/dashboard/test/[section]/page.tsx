"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import {
  generateConjugationQuestion,
  generateVocabularyQuestion,
  computePlacementLevel,
  getOverallScore,
} from "@/lib/placement-test";
import { getProgress, updateSectionProgress } from "@/lib/progress";
import {
  SUB_LEVEL_ORDER,
  type TestQuestion,
  type LevelsData,
  type ConjugationSubLevel,
  type VocabSubLevel,
} from "@/types/levels";
import levelsDataRaw from "@/data/levels.json";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import type { VerbDataSet } from "@/types";
import type { VocabData } from "@/types/vocab";

const levelsData = levelsDataRaw as unknown as LevelsData;
const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;

const TOTAL_QUESTIONS = 15;
const START_LEVEL = "A1.3";
const CORRECT_STREAK_TO_JUMP = 3;
const INCORRECT_STREAK_TO_DROP = 2;

function parseQuestionText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i}>{p}</strong> : p
  );
}

export default function PlacementTestPage() {
  const params = useParams();
  const section = params.section as string;
  const isConjugations = section === "conjugations";
  const isVocabulary = section === "vocabulary";
  const isGrammar = section === "grammar";

  const [phase, setPhase] = useState<"start" | "question" | "results">("start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [adaptiveLevelIndex, setAdaptiveLevelIndex] = useState(
    SUB_LEVEL_ORDER.indexOf(START_LEVEL as (typeof SUB_LEVEL_ORDER)[number])
  );
  const [correctStreak, setCorrectStreak] = useState(0);
  const [incorrectStreak, setIncorrectStreak] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; levelKey: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [resultLevel, setResultLevel] = useState<string | null>(null);
  const [resultScore, setResultScore] = useState<number>(0);
  const [previousLevel, setPreviousLevel] = useState<string | null>(null);

  const levelKey = SUB_LEVEL_ORDER[Math.max(0, Math.min(adaptiveLevelIndex, 14))];
  const sectionLevels = useMemo(() => {
    const data = levelsData[section as keyof typeof levelsData];
    if (typeof data !== "object" || !data) return {};
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [
        k,
        { targetAccuracy: (v as { targetAccuracy: number }).targetAccuracy },
      ])
    );
  }, [section]);

  const generateQuestion = useCallback(() => {
    if (isConjugations) {
      const levelInfo = levelsData.conjugations[levelKey] as ConjugationSubLevel | undefined;
      if (!levelInfo) return null;
      return generateConjugationQuestion(
        levelKey,
        levelInfo,
        verbs,
        questionIndex
      );
    }
    if (isVocabulary) {
      const levelInfo = levelsData.vocabulary[levelKey] as VocabSubLevel | undefined;
      if (!levelInfo) return null;
      return generateVocabularyQuestion(
        levelKey,
        levelInfo,
        vocab,
        questionIndex
      );
    }
    return null;
  }, [isConjugations, isVocabulary, levelKey, questionIndex]);

  useEffect(() => {
    if (phase === "question" && (isConjugations || isVocabulary)) {
      const q = generateQuestion();
      setCurrentQuestion(q);
      setSelectedIndex(null);
      setRevealed(false);
    }
  }, [phase, questionIndex, adaptiveLevelIndex, isConjugations, isVocabulary, generateQuestion]);

  const handleStart = () => setPhase("question");

  const handleAnswer = (index: number) => {
    if (revealed || !currentQuestion) return;
    setSelectedIndex(index);
    setRevealed(true);
    const correct = index === currentQuestion.correctIndex;
    const newAnswers = [
      ...answers,
      { correct, levelKey: currentQuestion.levelKey },
    ];
    setAnswers(newAnswers);

    if (correct) {
      setCorrectStreak((s) => s + 1);
      setIncorrectStreak(0);
      if (correctStreak + 1 >= CORRECT_STREAK_TO_JUMP) {
        setAdaptiveLevelIndex((i) => Math.min(14, i + 1));
        setCorrectStreak(0);
      }
    } else {
      setIncorrectStreak((s) => s + 1);
      setCorrectStreak(0);
      if (incorrectStreak + 1 >= INCORRECT_STREAK_TO_DROP) {
        setAdaptiveLevelIndex((i) => Math.max(0, i - 1));
        setIncorrectStreak(0);
      }
    }
  };

  const handleNext = () => {
    const lastAnswer = {
      correct: selectedIndex === currentQuestion!.correctIndex,
      levelKey: currentQuestion!.levelKey,
    };
    const allAnswers = [...answers, lastAnswer];

    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      const finalLevel = computePlacementLevel(
        allAnswers,
        sectionLevels as Record<string, { targetAccuracy: number }>,
        10
      );
      const progress = getProgress();
      const prevSection = progress[section as "conjugations" | "vocabulary" | "grammar"];
      setPreviousLevel(prevSection?.level ?? null);
      setResultLevel(finalLevel);
      setResultScore(getOverallScore(allAnswers));
      setPhase("results");
      if (section === "conjugations" || section === "vocabulary") {
        updateSectionProgress(
          section as "conjugations" | "vocabulary",
          finalLevel,
          getOverallScore(allAnswers)
        );
      }
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
      setRevealed(false);
    }
  };

  if (isGrammar || (!isConjugations && !isVocabulary)) {
    return (
      <>
        <Topbar />
        <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
          <p className="text-text-2">Grammar placement test is not available yet.</p>
          <Link href="/dashboard" className="text-[14px] text-text-2 hover:text-text underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </main>
      </>
    );
  }

  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <>
      <Topbar />
      <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
        {phase === "start" && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              {sectionLabel} placement test
            </h1>
            <p className="text-text-2 mt-2 text-[15px]">
              This test has 15 questions and adapts to your level. It takes about 3–5 minutes.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-3 px-4 rounded-lg font-medium text-white bg-text hover:opacity-90 transition-opacity"
              >
                Start Test
              </button>
              <Link
                href="/dashboard"
                className="text-center text-[14px] text-text-2 hover:text-text underline"
              >
                Back to Dashboard
              </Link>
            </div>
          </>
        )}

        {phase === "question" && (
          <>
            <div className="flex justify-between text-[13px] text-text-2 mb-6">
              <span>Question {questionIndex + 1} of {TOTAL_QUESTIONS}</span>
              <span className="text-text-3">Testing: {levelKey}</span>
            </div>
            <div className="h-1.5 bg-bg-s rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-text rounded-full transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>

            {currentQuestion && (
              <>
                <p className="text-[17px] text-text font-medium mb-6">
                  {parseQuestionText(currentQuestion.questionText)}
                </p>
                <div className="space-y-2">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = selectedIndex === i;
                    const isCorrect = i === currentQuestion.correctIndex;
                    const showCorrect = revealed && isCorrect;
                    const showWrong = revealed && isSelected && !isCorrect;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAnswer(i)}
                        disabled={revealed}
                        className={`w-full text-left py-3 px-4 rounded-xl border text-[15px] transition-colors ${
                          showCorrect
                            ? "border-[#22C55E] bg-[#F0FDF4] text-[#15803D]"
                            : showWrong
                              ? "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
                              : "border-border bg-white text-text hover:border-[#ccc]"
                        } ${revealed ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {revealed && currentQuestion.explanation && (
                  <p className="mt-4 text-[13px] text-text-2 italic border-l-2 border-border pl-4">
                    {currentQuestion.explanation}
                  </p>
                )}
                {revealed && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full py-3 px-4 rounded-lg font-medium border border-border text-text hover:bg-bg-s transition-colors"
                  >
                    {questionIndex + 1 >= TOTAL_QUESTIONS ? "See results" : "Next"}
                  </button>
                )}
              </>
            )}
          </>
        )}

        {phase === "results" && resultLevel && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Results
            </h1>
            <p className="text-[15px] text-text-2 mt-2">
              {answers.filter((a) => a.correct).length} / {TOTAL_QUESTIONS} correct ({resultScore}%)
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[13px] text-text-3">Your level:</span>
              <span className="text-xl font-bold px-3 py-1 rounded-full bg-bg-h text-text">
                {resultLevel}
              </span>
            </div>
            {previousLevel && SUB_LEVEL_ORDER.indexOf(resultLevel as (typeof SUB_LEVEL_ORDER)[number]) > SUB_LEVEL_ORDER.indexOf(previousLevel as (typeof SUB_LEVEL_ORDER)[number]) && (
              <p className="mt-2 text-[14px] text-[#15803D] font-medium">
                Up from {previousLevel}!
              </p>
            )}
            {(() => {
              const sectionData = levelsData[section as "conjugations" | "vocabulary" | "grammar"];
              const levelInfo = sectionData && typeof sectionData === "object" && resultLevel in sectionData
                ? (sectionData as Record<string, { label: string; description: string }>)[resultLevel]
                : null;
              return levelInfo ? (
                <>
                  <p className="mt-3 text-[15px] font-medium text-text">
                    {levelInfo.label}
                  </p>
                  <p className="mt-1 text-[14px] text-text-2">
                    {levelInfo.description}
                  </p>
                </>
              ) : null;
            })()}
            <Link
              href="/dashboard"
              className="mt-8 inline-block w-full text-center py-3 px-4 rounded-lg font-medium border border-border text-text hover:bg-bg-s transition-colors"
            >
              Back to Dashboard
            </Link>
          </>
        )}
      </main>
    </>
  );
}
