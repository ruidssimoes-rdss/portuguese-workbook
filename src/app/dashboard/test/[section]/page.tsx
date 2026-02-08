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

const SECTION_COLORS = {
  conjugations: "#3B82F6",
  vocabulary: "#22C55E",
  grammar: "#F59E0B",
} as const;

function parseQuestionText(
  text: string,
  sectionColor: string
): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ color: sectionColor }}>{p}</strong>
    ) : (
      p
    )
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
  const [resultAnswers, setResultAnswers] = useState<{ correct: boolean; levelKey: string }[]>([]);
  const [previousLevel, setPreviousLevel] = useState<string | null>(null);
  const [questionTransition, setQuestionTransition] = useState(false);

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
    if (answers.length >= TOTAL_QUESTIONS) return;
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
    const allAnswers = answers.length < TOTAL_QUESTIONS ? [...answers, lastAnswer] : answers;

    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      const cappedAnswers = allAnswers.slice(0, TOTAL_QUESTIONS);
      const finalLevel = computePlacementLevel(
        cappedAnswers,
        sectionLevels as Record<string, { targetAccuracy: number }>,
        10
      );
      const score = getOverallScore(cappedAnswers);
      const progress = getProgress();
      const prevSection = progress[section as "conjugations" | "vocabulary" | "grammar"];
      setPreviousLevel(prevSection?.level ?? null);
      setResultLevel(finalLevel);
      setResultScore(score);
      setResultAnswers(cappedAnswers);
      setPhase("results");
      if (section === "conjugations" || section === "vocabulary") {
        updateSectionProgress(
          section as "conjugations" | "vocabulary",
          finalLevel,
          score
        );
      }
    } else {
      setQuestionTransition(true);
      setTimeout(() => {
        setQuestionIndex((i) => i + 1);
        setSelectedIndex(null);
        setRevealed(false);
        setQuestionTransition(false);
      }, 150);
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
  const sectionColor = isConjugations
    ? SECTION_COLORS.conjugations
    : SECTION_COLORS.vocabulary;
  const startSummary =
    isConjugations
      ? "You'll be tested on verb conjugations across tenses and persons."
      : "You'll be tested on Portuguese words and their English meanings.";
  const currentProgress = typeof window !== "undefined" ? getProgress()[section as "conjugations" | "vocabulary"] : null;
  const hasTakenBefore = currentProgress?.completedAt && currentProgress?.testScore != null;

  return (
    <>
      <Topbar />
      <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
        {phase === "start" && (
          <div className="max-w-[500px] mx-auto">
            <div
              className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-150"
              style={{ borderTopWidth: 4, borderTopColor: sectionColor }}
            >
              <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-text">
                  {sectionLabel} placement test
                </h1>
                <p className="text-[15px] text-text-2 mt-3">
                  {startSummary}
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-[13px] text-text-3">
                  <span>15 questions</span>
                  <span>Adaptive difficulty</span>
                  <span>~3–5 minutes</span>
                </div>
                {hasTakenBefore && (
                  <p className="mt-4 text-[13px] text-text-3">
                    Your current level: {currentProgress!.level} ({Math.round(currentProgress!.testScore!)}%)
                  </p>
                )}
                <div className="border-t border-border-l mt-5 pt-5">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="w-full py-3 px-4 rounded-xl font-medium text-white hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ backgroundColor: sectionColor }}
                  >
                    Start Test
                  </button>
                  <Link
                    href="/dashboard"
                    className="block text-center text-[14px] text-text-2 hover:text-text underline mt-4"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "question" && (
          <div
            className={questionTransition ? "opacity-0 transition-opacity duration-150" : "opacity-100 transition-opacity duration-150"}
          >
            <div className="flex justify-between text-[13px] text-text-2 mb-4">
              <span>Question {questionIndex + 1} of {TOTAL_QUESTIONS}</span>
              <span className="text-text-3">Testing: {levelKey}</span>
            </div>
            <div className="flex gap-0.5 mb-8">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 min-w-0 rounded-sm transition-all duration-150"
                  style={{
                    backgroundColor: i < questionIndex + 1 ? sectionColor : "#E5E7EB",
                  }}
                />
              ))}
            </div>

            {currentQuestion && (
              <>
                <p className="text-[20px] text-text font-medium mb-8 leading-snug">
                  {parseQuestionText(currentQuestion.questionText, sectionColor)}
                </p>
                <div className="space-y-3">
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
                        className={`group w-full text-left py-4 px-5 rounded-xl border text-[15px] transition-all duration-150 relative pl-10 ${
                          showCorrect
                            ? "border-[#22C55E] bg-[#22C55E]/10"
                            : showWrong
                              ? "border-[#EF4444] bg-[#EF4444]/10"
                              : "border-border bg-white text-text hover:border-[#ccc]"
                        } ${!revealed ? "hover:bg-opacity-5" : ""} ${revealed ? "cursor-default" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        style={
                          !revealed
                            ? { ["--tw-ring-color" as string]: sectionColor, backgroundColor: revealed ? undefined : "transparent" }
                            : undefined
                        }
                      >
                        {showCorrect && (
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
                            aria-hidden
                          >
                            <span
                              className="block w-2.5 h-1.5 border-l-2 border-b-2 border-[#22C55E] -rotate-45 origin-center"
                              style={{ marginLeft: "1px", marginBottom: "2px" }}
                            />
                          </span>
                        )}
                        {showWrong && (
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#EF4444] rounded-full flex items-center justify-center text-[#EF4444] text-base leading-none font-bold"
                            aria-hidden
                          >
                            ×
                          </span>
                        )}
                        {!revealed && (
                          <span
                            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                            style={{ backgroundColor: sectionColor }}
                          />
                        )}
                        {!revealed && (
                          <span
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150"
                            style={{ backgroundColor: `${sectionColor}0D` }}
                          />
                        )}
                        <span className={`relative ${showCorrect ? "text-[#15803D]" : showWrong ? "text-[#DC2626]" : ""}`}>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {revealed && currentQuestion.explanation && (
                  <div
                    className="mt-6 p-4 rounded-xl bg-[#F9FAFB] border-l-4 italic text-[14px] text-text-2"
                    style={{ borderLeftColor: sectionColor }}
                  >
                    {currentQuestion.explanation}
                  </div>
                )}
                {revealed && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full py-3 px-4 rounded-xl font-medium border border-border text-text hover:bg-bg-s transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ ["--tw-ring-color" as string]: sectionColor }}
                  >
                    {questionIndex + 1 >= TOTAL_QUESTIONS ? "See results" : "Next"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {phase === "results" && resultLevel && (
          <div className="max-w-[500px] mx-auto">
            <div className="border border-border rounded-xl bg-white overflow-hidden transition-all duration-150">
              <div className="p-8">
                <h1 className="text-2xl font-bold tracking-tight text-text">
                  Test Complete
                </h1>
                <p className="text-[15px] text-text-3 mt-1 capitalize">
                  {sectionLabel}
                </p>

                <div className="flex flex-col items-center mt-8">
                  <div className="relative w-[120px] h-[120px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={sectionColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(resultScore / 100) * 339.3} 339.3`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-text" style={{ color: sectionColor }}>
                        {resultScore}%
                      </span>
                      <span className="text-[12px] text-text-3 mt-0.5">
                        {Math.min(resultAnswers.filter((a) => a.correct).length, TOTAL_QUESTIONS)}/{Math.min(resultAnswers.length, TOTAL_QUESTIONS)}
                      </span>
                    </div>
                  </div>
                  <span
                    className="mt-6 text-lg font-bold px-5 py-2 rounded-full text-white"
                    style={{ backgroundColor: sectionColor }}
                  >
                    {resultLevel}
                  </span>
                </div>

                {(() => {
                  const sectionData = levelsData[section as "conjugations" | "vocabulary" | "grammar"];
                  const levelInfo = sectionData && typeof sectionData === "object" && resultLevel in sectionData
                    ? (sectionData as Record<string, { label: string; description: string }>)[resultLevel]
                    : null;
                  return levelInfo ? (
                    <div className="mt-6 text-center">
                      <p className="text-[15px] font-medium text-text">
                        {levelInfo.label}
                      </p>
                      <p className="mt-1 text-[14px] text-text-2">
                        {levelInfo.description}
                      </p>
                    </div>
                  ) : null;
                })()}

                <div className="mt-6 text-center">
                  {previousLevel && SUB_LEVEL_ORDER.indexOf(resultLevel as (typeof SUB_LEVEL_ORDER)[number]) > SUB_LEVEL_ORDER.indexOf(previousLevel as (typeof SUB_LEVEL_ORDER)[number]) && (
                    <p className="text-[14px] text-[#22C55E] font-medium inline-flex items-center gap-1">
                      <span className="inline-block w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#22C55E]" style={{ marginBottom: "2px" }} />
                      Up from {previousLevel}!
                    </p>
                  )}
                  {previousLevel && SUB_LEVEL_ORDER.indexOf(resultLevel as (typeof SUB_LEVEL_ORDER)[number]) === SUB_LEVEL_ORDER.indexOf(previousLevel as (typeof SUB_LEVEL_ORDER)[number]) && (
                    <p className="text-[14px] text-text-3">Level maintained</p>
                  )}
                  {previousLevel && SUB_LEVEL_ORDER.indexOf(resultLevel as (typeof SUB_LEVEL_ORDER)[number]) < SUB_LEVEL_ORDER.indexOf(previousLevel as (typeof SUB_LEVEL_ORDER)[number]) && (
                    <p className="text-[14px] text-[#F59E0B] font-medium">Down from {previousLevel}</p>
                  )}
                  {!previousLevel && <p className="text-[14px] text-text-3">First test</p>}
                </div>

                <div className="border-t border-border-l mt-8 pt-6 flex flex-col gap-3">
                  <Link
                    href="/dashboard"
                    className="w-full text-center py-3 px-4 rounded-xl font-medium text-white hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ backgroundColor: sectionColor }}
                  >
                    Back to Dashboard
                  </Link>
                  <Link
                    href={`/dashboard/test/${section}`}
                    className="w-full text-center py-3 px-4 rounded-xl font-medium border-2 bg-transparent hover:bg-opacity-5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: sectionColor, color: sectionColor }}
                  >
                    Retake Test
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
