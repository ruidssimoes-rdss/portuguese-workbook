"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import {
  generateConjugationQuestions,
  generateVocabularyQuestions,
  generateGrammarQuestions,
  DEFAULT_QUESTIONS,
} from "@/lib/test-generator";
import { PronunciationButton } from "@/components/pronunciation-button";
import { getProgress as getLocalProgress } from "@/lib/progress";
import { getProgress, saveLevelResult } from "@/lib/progress-service";
import { useAuth } from "@/components/auth-provider";
import { getNextLevel, getLevelIndex, type TestQuestion, type UserProgress } from "@/types/levels";
import type { LevelsData, ConjugationSubLevel, VocabSubLevel, GrammarSubLevel } from "@/types/levels";
import levelsDataRaw from "@/data/levels.json";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import type { VerbDataSet } from "@/types";
import type { VocabData } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";

const levelsData = levelsDataRaw as unknown as LevelsData;
const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;
const grammar = grammarData as unknown as GrammarData;

const TEST_SECTION_COLORS = {
  conjugations: {
    primary: "#111827",
    tagBg: "#F3F4F6",
    tagBorder: "#E5E7EB",
    tagText: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
  vocabulary: {
    primary: "#111827",
    tagBg: "#F3F4F6",
    tagBorder: "#E5E7EB",
    tagText: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
  grammar: {
    primary: "#111827",
    tagBg: "#F3F4F6",
    tagBorder: "#E5E7EB",
    tagText: "#6B7280",
    barTrack: "#F3F4F6",
    barFill: "#111827",
  },
} as const;

function getConjugationTags(levelData: ConjugationSubLevel): string[] {
  const req = levelData.requiredVerbs;
  if (typeof req === "string") {
    const labels: Record<string, string> = {
      all: "All verbs",
      all_A1: "All A1 verbs",
      all_A2: "All A2 verbs",
      all_A1_A2: "All A1 & A2 verbs",
      all_B1: "All B1 verbs",
      essential_A1: "Essential A1",
      essential_A1_A2: "Essential A1 & A2",
    };
    const tags = [labels[req] || req];
    for (const t of levelData.requiredTenses) {
      tags.push(t);
    }
    return tags;
  }
  const verbTags = req.length <= 6 ? req.map((v) => v.toLowerCase()) : [`${req.length} verbs`];
  const tenseTags = levelData.requiredTenses.map((t) => t);
  return [...verbTags, ...tenseTags];
}

function getVocabularyTags(levelData: VocabSubLevel): string[] {
  const req = levelData.requiredCategories;
  if (req === "all") {
    const cefrLabel = levelData.cefrFilter
      ? typeof levelData.cefrFilter === "string"
        ? levelData.cefrFilter.replace("_", " & ")
        : levelData.cefrFilter.join(" & ")
      : "all levels";
    return ["All categories", cefrLabel];
  }
  const shortLabels: Record<string, string> = {
    "greetings-expressions": "greetings",
    "numbers-time": "numbers",
    "colours-weather": "colours",
    "food-drink": "food & drink",
    "travel-directions": "travel",
    "home-rooms": "home",
    "family-daily-routine": "family",
    "work-education": "work",
    "health-body": "health",
    "shopping-money": "shopping",
    "nature-animals": "nature",
    "emotions-personality": "emotions",
    "colloquial-slang": "slang",
    "technology-internet": "technology",
    "clothing-appearance": "clothing",
  };
  return req.map((id) => shortLabels[id] || id);
}

function getGrammarTags(levelData: GrammarSubLevel): string[] {
  const topics = levelData.topics;
  if (typeof topics === "string") {
    const labels: Record<string, string> = {
      all: "All topics",
      all_A1: "All A1 topics",
      all_A1_A2: "All A1 & A2 topics",
      all_B1: "All B1 topics",
    };
    return [labels[topics] || topics];
  }
  return topics.map((slug) => {
    const topic = grammar.topics[slug];
    return topic ? topic.title : slug;
  });
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

function getQuestionCount(section: string, level: string): number {
  if (section === "conjugations" && level === "A1.1") return 10;
  return DEFAULT_QUESTIONS;
}

function parseQuestionText(text: string, sectionColor: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: sectionColor }}>{p}</strong> : p
  );
}

export default function LevelTestPage() {
  const params = useParams();
  const section = params.section as string;
  const isConjugations = section === "conjugations";
  const isVocabulary = section === "vocabulary";
  const isGrammar = section === "grammar";

  const [phase, setPhase] = useState<"start" | "question" | "results">("start");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [resultAnswers, setResultAnswers] = useState<{ correct: boolean }[]>([]);
  const [testedLevel, setTestedLevel] = useState<string | null>(null);
  const [questionTransition, setQuestionTransition] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [saveFallbackMessage, setSaveFallbackMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = user?.id ? await getProgress(user.id) : (typeof window !== "undefined" ? getLocalProgress() : null);
      if (!cancelled && p) setProgress(p);
    })();
    return () => { cancelled = true; };
  }, [user?.id, section]);

  const sectionProgress = progress?.[section as keyof typeof progress];
  const currentLevel = sectionProgress?.currentLevel ?? "A1.1";
  const levelInfo = useMemo(() => {
    const data = levelsData[section as keyof LevelsData];
    if (typeof data !== "object" || !data || !(currentLevel in data)) return null;
    return (data as Record<string, { label: string; description: string; targetAccuracy?: number }>)[currentLevel];
  }, [section, currentLevel]);
  const targetAccuracy = levelInfo?.targetAccuracy ?? 70;
  const levelForUnlock = phase === "results" && testedLevel ? testedLevel : currentLevel;
  const nextLevel = getNextLevel(levelForUnlock);
  const nextLevelInfo = useMemo(() => {
    if (!nextLevel) return null;
    const data = levelsData[section as keyof LevelsData];
    if (typeof data !== "object" || !data || !(nextLevel in data)) return null;
    return (data as Record<string, { label: string }>)[nextLevel];
  }, [section, nextLevel]);
  const resultsLevelInfo = useMemo(() => {
    const level = testedLevel ?? currentLevel;
    const data = levelsData[section as keyof LevelsData];
    if (typeof data !== "object" || !data || !(level in data)) return null;
    return (data as Record<string, { label: string }>)[level];
  }, [section, testedLevel, currentLevel]);

  const sectionColor =
    TEST_SECTION_COLORS[section as keyof typeof TEST_SECTION_COLORS]?.primary ??
    TEST_SECTION_COLORS.conjugations.primary;
  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);

  const handleStart = () => {
    const count = getQuestionCount(section, currentLevel);

    if (isConjugations && levelInfo) {
      const levelData = levelsData.conjugations[currentLevel] as ConjugationSubLevel | undefined;
      if (levelData) {
        const qs = generateConjugationQuestions(currentLevel, levelData, verbs, count);
        setQuestions(qs.slice(0, count));
      } else {
        setQuestions([]);
      }
    } else if (isVocabulary && levelInfo) {
      const levelData = levelsData.vocabulary[currentLevel] as VocabSubLevel | undefined;
      if (levelData) {
        const qs = generateVocabularyQuestions(currentLevel, levelData, vocab, count);
        setQuestions(qs.slice(0, count));
      } else {
        setQuestions([]);
      }
    } else if (isGrammar && levelInfo) {
      const levelData = levelsData.grammar[currentLevel] as GrammarSubLevel | undefined;
      if (levelData) {
        const qs = generateGrammarQuestions(currentLevel, levelData, grammar, count);
        setQuestions(qs.slice(0, count));
      } else {
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
    setQuestionIndex(0);
    setSelectedIndex(null);
    setRevealed(false);
    setAnswers([]);
    setResultAnswers([]);
    setTestedLevel(null);
    setPhase("question");
  };

  const currentQuestion = questions[questionIndex] ?? null;

  const handleAnswer = (index: number) => {
    if (revealed || !currentQuestion) return;
    setSelectedIndex(index);
    setRevealed(true);
    const correct = index === currentQuestion.correctIndex;
    setAnswers((a) => [...a, { correct }]);
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    const isLast = questionIndex >= questions.length - 1;
    if (isLast) {
      const allAnswers =
        answers.length < questions.length
          ? [...answers, { correct: selectedIndex === currentQuestion.correctIndex }]
          : answers;
      setResultAnswers(allAnswers);
      setTestedLevel(currentLevel);
      const correctCount = allAnswers.filter((a) => a.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= targetAccuracy;
      const result = await saveLevelResult(
        section as "conjugations" | "vocabulary" | "grammar",
        currentLevel,
        passed,
        score,
        user?.id
      );
      if (result.fallbackToLocal) setSaveFallbackMessage(true);
      if (user?.id) {
        const next = await getProgress(user.id);
        if (next) setProgress(next);
      } else {
        setProgress(typeof window !== "undefined" ? getLocalProgress() : null);
      }
      setPhase("results");
      return;
    }
    setQuestionTransition(true);
    setTimeout(() => {
      setQuestionIndex((i) => i + 1);
      setSelectedIndex(null);
      setRevealed(false);
      setQuestionTransition(false);
    }, 150);
  };

  const resultScore =
    phase === "results" && resultAnswers.length > 0
      ? Math.round((resultAnswers.filter((a) => a.correct).length / resultAnswers.length) * 100)
      : 0;
  const resultCorrect =
    phase === "results" ? resultAnswers.filter((a) => a.correct).length : 0;
  const passed = resultScore >= targetAccuracy;

  if (!isConjugations && !isVocabulary && !isGrammar) {
    return (
      <>
        <Topbar />
        <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
          <p className="text-text-2">Section not found.</p>
          <Link href="/lessons" className="text-[13px] text-text-2 hover:text-text underline mt-4 inline-block">
            Back to Revision
          </Link>
        </main>
      </>
    );
  }

  if (!levelInfo) {
    return (
      <>
        <Topbar />
        <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
          <p className="text-text-2">Level not found.</p>
          <Link href="/lessons" className="text-[13px] text-text-2 hover:text-text underline mt-4 inline-block">
            Back to Revision
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="max-w-[640px] mx-auto px-6 md:px-10 py-12">
        {phase === "start" &&
          (() => {
            const colors =
              TEST_SECTION_COLORS[section as keyof typeof TEST_SECTION_COLORS] ??
              TEST_SECTION_COLORS.conjugations;
            const passedCount = sectionProgress?.highestPassed
              ? getLevelIndex(sectionProgress.highestPassed) + 1
              : 0;
            const progressPct = Math.max(4, (passedCount / 15) * 100);

            let tags: string[] = [];
            if (isConjugations) {
              const ld = levelsData.conjugations[currentLevel] as ConjugationSubLevel | undefined;
              if (ld) tags = getConjugationTags(ld);
            } else if (isVocabulary) {
              const ld = levelsData.vocabulary[currentLevel] as VocabSubLevel | undefined;
              if (ld) tags = getVocabularyTags(ld);
            } else if (isGrammar) {
              const ld = levelsData.grammar[currentLevel] as GrammarSubLevel | undefined;
              if (ld) tags = getGrammarTags(ld);
            }

            return (
              <div className="max-w-[672px] mx-auto">
                <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-5">
                  {/* Row 1: Title + Score pill */}
                  <div className="flex items-start justify-between gap-5">
                    <h1 className="text-[18px] font-normal text-[#111827] leading-[42px]">
                      Level {currentLevel} – {levelInfo?.label}
                    </h1>
                    <div className="flex items-center h-[35px] px-2.5 bg-white border-[0.5px] border-[#6B7280] rounded-[12px] shrink-0">
                      <span className="text-[13px] font-light text-[#6B7280] whitespace-nowrap">
                        Score {targetAccuracy}% or higher to advance
                        {nextLevel ? ` to ${nextLevel}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Content tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center justify-center px-3 py-0.5 rounded-[12px] text-[12px]"
                          style={{
                            backgroundColor: colors.tagBg,
                            border: `0.8px solid ${colors.tagBorder}`,
                            color: colors.tagText,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row 3: Progress bar + count */}
                  <div className="flex flex-col gap-1">
                    <div
                      className="h-[6px] rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.barTrack }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: colors.barFill,
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-normal text-[#9FA5AD]">
                      {passedCount} / 15
                    </span>
                  </div>

                  {/* Row 4: CTA + Back */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleStart}
                      className="inline-flex items-center justify-center h-[36px] px-5 bg-[#111827] border border-[#111827] rounded-[12px] text-[13px] font-medium text-white hover:bg-[#1F2937] transition-colors duration-200"
                    >
                      Start Level {currentLevel} Test
                    </button>
                    <Link
                      href="/lessons"
                      className="inline-flex items-center justify-center h-[36px] px-2.5 bg-[#F4F4F4] border border-[#A2A6AE] rounded-[12px] text-[13px] font-medium text-[#A2A6AE] hover:bg-[#EBEBEB] transition-colors duration-200"
                    >
                      Back
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

        {phase === "question" && (
          <div
            className={
              questionTransition
                ? "opacity-0 transition-opacity duration-150"
                : "opacity-100 transition-opacity duration-150"
            }
          >
            <div className="flex justify-between text-[13px] text-text-2 mb-4">
              <span>
                Question {questionIndex + 1} of {questions.length}
              </span>
              <span className="text-text-3">Level {currentLevel}</span>
            </div>
                <div className="flex gap-0.5 mb-8">
              {Array.from({ length: questions.length }, (_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 min-w-0 rounded-sm transition-all duration-200"
                  style={{
                    backgroundColor: i < questionIndex + 1 ? "#111827" : "#E5E7EB",
                  }}
                />
              ))}
            </div>

            {currentQuestion && (
              <>
                <div className="mb-8">
                  <p className="text-[18px] text-text font-medium leading-snug">
                    {parseQuestionText(currentQuestion.questionText, sectionColor)}
                  </p>
                  {currentQuestion.questionTextPt && (
                    <div className="mt-2 flex items-center gap-2">
                      <PronunciationButton
                        text={stripMarkdown(currentQuestion.questionTextPt)}
                        size="sm"
                        variant="muted"
                      />
                      <p className="text-[15px] text-text-2 italic">
                        {parseQuestionText(currentQuestion.questionTextPt, sectionColor)}
                      </p>
                    </div>
                  )}
                </div>
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
                        className={`group w-full text-left py-4 px-5 rounded-lg border text-[15px] transition-colors duration-200 relative pl-10 min-h-[44px] flex items-center ${
                          showCorrect
                            ? "border-green-500 bg-green-50"
                            : showWrong
                              ? "border-red-500 bg-red-50"
                              : "border-[#E5E7EB] bg-white text-text hover:border-[#111827]"
                        } ${revealed ? "cursor-default" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827]`}
                        style={
                          !revealed ? { ["--tw-ring-color" as string]: "#111827" } : undefined
                        }
                      >
                        {showCorrect && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center" aria-hidden>
                            <span
                              className="block w-2.5 h-1.5 border-l-2 border-b-2 border-green-600 -rotate-45"
                              style={{ marginLeft: "1px", marginBottom: "2px" }}
                            />
                          </span>
                        )}
                        {showWrong && (
                          <span
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 text-base leading-none font-bold"
                            aria-hidden
                          >
                            ×
                          </span>
                        )}
                        {!revealed && (
                          <span
                            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-[#111827]"
                          />
                        )}
                        {!revealed && (
                          <span
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 bg-[#111827]/5"
                          />
                        )}
                        <span
                          className={
                            showCorrect ? "text-green-800" : showWrong ? "text-red-700" : ""
                          }
                        >
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {revealed && (currentQuestion.explanation || currentQuestion.exampleSentence) && (
                  <div
                    className="mt-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[13px] text-text-2"
                  >
                    {currentQuestion.explanation && (
                      <p className="italic">{currentQuestion.explanation}</p>
                    )}
                    {currentQuestion.exampleSentence && (
                      <p className="mt-2">
                        <span className="font-semibold not-italic">Exemplo:</span>{" "}
                        <span className="italic">{currentQuestion.exampleSentence}</span>
                        {currentQuestion.exampleTranslation && (
                          <>
                            <br />
                            <span className="text-text-3">({currentQuestion.exampleTranslation})</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}
                {revealed && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="mt-6 w-full py-3 px-4 rounded-xl font-medium border border-[#E5E7EB] text-text hover:bg-[#FAFAFA] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ ["--tw-ring-color" as string]: "#111827" }}
                  >
                    {questionIndex >= questions.length - 1 ? "See Results" : "Next"}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {phase === "results" && (
          <div className="max-w-[500px] mx-auto">
            {saveFallbackMessage && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-[13px]">
                Progresso guardado localmente. Será sincronizado quando a ligação for restabelecida.
              </div>
            )}
            <div
              className="border border-[#E5E7EB] rounded-[14px] bg-white overflow-hidden transition-all duration-200"
            >
              <div className="p-8">
                <h1 className="text-[18px] font-semibold tracking-tight text-text">
                  Level {testedLevel ?? currentLevel} — {resultsLevelInfo?.label ?? levelInfo?.label ?? ""}
                </h1>
                <div className="flex flex-col items-center mt-8">
                  <div className="relative w-[120px] h-[120px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#111827"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(resultScore / 100) * 339.3} 339.3`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#111827]">
                        {resultScore}%
                      </span>
                      <span className="text-[12px] text-text-3 mt-0.5">
                        {resultCorrect}/{resultAnswers.length}
                      </span>
                    </div>
                  </div>
                  {passed ? (
                    <>
                      <p className="mt-6 text-[18px] font-semibold text-green-600">PASSED</p>
                      {nextLevel && nextLevelInfo && (
                        <p className="mt-2 text-[15px] text-text-2 text-center">
                          You&apos;ve unlocked {nextLevel}! — {nextLevelInfo.label}
                        </p>
                      )}
                      <div className="mt-6 flex flex-col gap-3 w-full">
                        <Link
                          href="/lessons#level-tests"
                          className="w-full text-center py-3 px-4 rounded-xl font-medium text-white bg-[#111827] hover:bg-[#1F2937] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827]"
                        >
                          {nextLevel ? `Continue to ${nextLevel}` : "Back to Revision"}
                        </Link>
                        <Link
                          href="/lessons#level-tests"
                          className="w-full text-center py-3 px-4 rounded-xl font-medium border-2 border-[#E5E7EB] text-[#6B7280] bg-transparent hover:bg-[#FAFAFA] transition-colors duration-150"
                        >
                          Back to Revision
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-6 text-[18px] font-semibold text-amber-600">NOT YET</p>
                      <p className="mt-2 text-[15px] text-text-2 text-center">
                        You needed {targetAccuracy}%, you scored {resultScore}%.
                      </p>
                      {questions.length > 0 && resultAnswers.some((a, i) => !a.correct) && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-left">
                          <p className="text-[13px] font-medium text-amber-800 mb-2">Review</p>
                          <ul className="text-[13px] text-amber-900 space-y-1">
                            {resultAnswers.map((a, i) =>
                              !a.correct && questions[i] ? (
                                <li key={i}>
                                  Q{i + 1}: correct answer was {questions[i].correctAnswer}
                                </li>
                              ) : null
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="mt-6 flex flex-col gap-3 w-full">
                        <button
                          type="button"
                          onClick={handleStart}
                          className="w-full py-3 px-4 rounded-xl font-medium text-white bg-[#111827] hover:bg-[#1F2937] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827]"
                        >
                          Try Again
                        </button>
                        <Link
                          href="/lessons#level-tests"
                          className="w-full text-center py-3 px-4 rounded-xl font-medium border-2 border-[#E5E7EB] text-[#6B7280] bg-transparent hover:bg-[#FAFAFA] transition-colors duration-150"
                        >
                          Back to Revision
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
