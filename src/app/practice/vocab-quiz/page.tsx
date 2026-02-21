"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PracticeProgressBar } from "@/components/practice/practice-progress-bar";
import { PracticeQuestionCard } from "@/components/practice/practice-question-card";
import { PracticeResults } from "@/components/practice/practice-results";
import {
  compareVocabAnswerPtToEn,
  compareVocabAnswerEnToPt,
  shuffle,
} from "@/lib/practice-utils";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord, VocabCategory } from "@/types/vocab";

const vocab = vocabData as unknown as VocabData;

type WordWithCategory = VocabWord & { categoryId: string; categoryTitle: string };

function flattenVocab(categories: VocabCategory[]): WordWithCategory[] {
  const out: WordWithCategory[] = [];
  for (const cat of categories) {
    for (const w of cat.words ?? []) {
      out.push({
        ...w,
        categoryId: cat.id,
        categoryTitle: cat.title,
      });
    }
  }
  return out;
}

const allWords = flattenVocab(vocab.categories);
const categories = vocab.categories;

const MODES = ["Portuguese → English", "English → Portuguese"] as const;
const FORMATS = ["Multiple choice", "Type it"] as const;
const LEVELS = ["All", "A1", "A2", "B1"] as const;
const COUNTS = [10, 20, 30, 50] as const;

const CORRECT_PHRASES = ["Correct!", "Boa!", "Very good!", "Excelente!", "Well done!", "Perfect!"];

export interface VocabQuizQuestion extends WordWithCategory {}

function buildQuizQuestions(
  categoryId: string,
  level: string,
  count: number
): VocabQuizQuestion[] {
  let pool = categoryId === "all"
    ? allWords
    : allWords.filter((w) => w.categoryId === categoryId);
  if (level !== "All") pool = pool.filter((w) => w.cefr === level);
  const shuffled = shuffle(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getEnglishDistractors(
  correct: string,
  sameCategory: string[],
  allEnglish: string[],
  exclude: Set<string>
): string[] {
  const parts = correct.split(/\s*\/\s*/).map((p) => p.trim().toLowerCase());
  const wrong = sameCategory.filter((e) => !parts.includes(e.trim().toLowerCase()) && !exclude.has(e));
  const out = wrong.slice(0, 3);
  if (out.length < 3) {
    for (const e of allEnglish) {
      if (out.length >= 3) break;
      const low = e.trim().toLowerCase();
      if (!parts.includes(low) && !out.includes(e)) out.push(e);
    }
  }
  return shuffle(out.slice(0, 3));
}

function getPortugueseDistractors(
  correct: string,
  sameCategory: string[],
  allPortuguese: string[],
  exclude: Set<string>
): string[] {
  const wrong = sameCategory.filter((p) => p !== correct && !exclude.has(p));
  const out = wrong.slice(0, 3);
  if (out.length < 3) {
    for (const p of allPortuguese) {
      if (out.length >= 3) break;
      if (p !== correct && !out.includes(p)) out.push(p);
    }
  }
  return shuffle(out.slice(0, 3));
}

export default function VocabQuizPage() {
  const [phase, setPhase] = useState<"setup" | "active" | "results">("setup");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [level, setLevel] = useState<string>("All");
  const [mode, setMode] = useState<typeof MODES[number]>("Portuguese → English");
  const [format, setFormat] = useState<typeof FORMATS[number]>("Multiple choice");
  const [count, setCount] = useState<number>(20);
  const [questions, setQuestions] = useState<VocabQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ correct: boolean; userAnswer: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctPhrase, setCorrectPhrase] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allEnglish = useMemo(() => [...new Set(allWords.map((w) => w.english))], []);
  const allPortuguese = useMemo(() => [...new Set(allWords.map((w) => w.portuguese))], []);

  const total = questions.length;
  const current = currentIndex + 1;
  const currentQ = questions[currentIndex];
  const answered = userAnswers.length;
  const score = userAnswers.filter((a) => a.correct).length;

  const startQuiz = useCallback(() => {
    const q = buildQuizQuestions(categoryId, level, count);
    if (q.length === 0) return;
    setQuestions(q);
    setCurrentIndex(0);
    setUserAnswers([]);
    setInputValue("");
    setFeedback(null);
    setStartTime(Date.now());
    setEndTime(0);
    setPhase("active");
    if (format === "Multiple choice" && q[0]) {
      if (mode === "Portuguese → English") {
        const sameCat = allWords.filter((w) => w.categoryId === q[0].categoryId).map((w) => w.english);
        setOptions(
          shuffle([
            q[0].english,
            ...getEnglishDistractors(q[0].english, sameCat, allEnglish, new Set()),
          ])
        );
      } else {
        const sameCat = allWords.filter((w) => w.categoryId === q[0].categoryId).map((w) => w.portuguese);
        setOptions(
          shuffle([
            q[0].portuguese,
            ...getPortugueseDistractors(q[0].portuguese, sameCat, allPortuguese, new Set()),
          ])
        );
      }
    }
    setSelectedOption(null);
  }, [categoryId, level, count, mode, format]);

  useEffect(() => {
    if (phase !== "active" || !currentQ || format !== "Multiple choice") return;
    if (mode === "Portuguese → English") {
      const sameCat = allWords.filter((w) => w.categoryId === currentQ.categoryId).map((w) => w.english);
      setOptions(
        shuffle([
          currentQ.english,
          ...getEnglishDistractors(currentQ.english, sameCat, allEnglish, new Set()),
        ])
      );
    } else {
      const sameCat = allWords.filter((w) => w.categoryId === currentQ.categoryId).map((w) => w.portuguese);
      setOptions(
        shuffle([
          currentQ.portuguese,
          ...getPortugueseDistractors(currentQ.portuguese, sameCat, allPortuguese, new Set()),
        ])
      );
    }
    setSelectedOption(null);
  }, [phase, currentIndex, currentQ?.categoryId, currentQ?.english, currentQ?.portuguese, mode, format]);

  useEffect(() => {
    if (phase === "active" && format === "Type it") inputRef.current?.focus();
  }, [phase, format, currentIndex]);

  const checkAnswer = useCallback(
    (userAnswer: string) => {
      if (!currentQ) return;
      const correct =
        mode === "Portuguese → English"
          ? compareVocabAnswerPtToEn(userAnswer, currentQ.english)
          : compareVocabAnswerEnToPt(userAnswer, currentQ.portuguese) !== "wrong";
      setUserAnswers((prev) => [...prev, { correct, userAnswer }]);
      setFeedback(correct ? "correct" : "wrong");
      if (correct) {
        setCorrectPhrase(CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)]);
        setTimeout(() => {
          if (currentIndex >= total - 1) {
            setEndTime(Date.now());
            setPhase("results");
          } else {
            setCurrentIndex((i) => i + 1);
            setFeedback(null);
            setInputValue("");
          }
        }, 1500);
      }
    },
    [currentQ, mode, currentIndex, total]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirm("End quiz and see results?")) {
          setEndTime(Date.now());
          setPhase("results");
        }
        return;
      }
      if (format === "Type it" && e.key === "Enter") {
        e.preventDefault();
        if (feedback === null) checkAnswer(inputValue);
        else if (feedback === "correct" && currentIndex < total - 1) setCurrentIndex((i) => i + 1);
      }
    },
    [format, feedback, inputValue, checkAnswer, currentIndex, total]
  );

  const mistakes = useMemo(() => {
    return userAnswers
      .map((a, i) => ({ ...a, index: i }))
      .filter((a) => !a.correct)
      .map((a) => ({
        id: `${a.index}`,
        prompt: questions[a.index]
          ? mode === "Portuguese → English"
            ? questions[a.index].portuguese
            : questions[a.index].english
          : "",
        userAnswer: a.userAnswer,
        correctAnswer:
          questions[a.index]?.portuguese != null && mode === "Portuguese → English"
            ? questions[a.index].english
            : questions[a.index]?.portuguese ?? "",
        wasCorrect: false,
      }));
  }, [userAnswers, questions, mode]);

  if (phase === "results") {
    return (
      <>
        <Topbar />
        <main className="min-h-screen bg-[#fafafa]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5">
            <PracticeResults
              title="Quiz Complete"
              subtitle="Questionário Completo"
              score={score}
              total={total}
              timeMs={endTime - startTime}
              mistakes={mistakes}
              onTryAgain={() => {
                setCurrentIndex(0);
                setUserAnswers([]);
                setFeedback(null);
                setInputValue("");
                setStartTime(Date.now());
                setPhase("active");
              }}
              onNew={() => setPhase("setup")}
              tryAgainLabel="Try again"
              newLabel="New quiz"
              backHref="/practice"
              backLabel="Back to Practice"
            />
          </div>
        </main>
      </>
    );
  }

  if (phase === "active" && currentQ) {
    const prompt = mode === "Portuguese → English" ? currentQ.portuguese : currentQ.english;
    const correctAnswer = mode === "Portuguese → English" ? currentQ.english : currentQ.portuguese;

    return (
      <>
        <Topbar />
        <main className="min-h-screen bg-[#fafafa]" onKeyDown={handleKeyDown}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#9CA3AF]">
                Question {current} of {total}
              </p>
              <button
                type="button"
                onClick={() => confirm("End quiz?") && (setEndTime(Date.now()), setPhase("results"))}
                className="text-sm text-[#9CA3AF] hover:text-[#6B7280]"
              >
                End quiz
              </button>
            </div>
            <PracticeProgressBar current={answered} total={total} className="mb-8" />

            <PracticeQuestionCard>
              <p className="text-2xl md:text-3xl font-bold text-[#111827]">
                {prompt}
              </p>

              {format === "Type it" ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && feedback === null && checkAnswer(inputValue)}
                    placeholder={mode === "Portuguese → English" ? "Type the English translation..." : "Type the Portuguese word..."}
                    className={`w-full max-w-sm mx-auto mt-6 px-4 py-3 border rounded-xl text-center text-lg outline-none transition-all duration-200 ${
                      feedback === "correct"
                        ? "border-emerald-400 bg-emerald-50"
                        : feedback === "wrong"
                          ? "border-red-400 bg-red-50"
                          : "border-[#E9E9E9] focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                    }`}
                    autoFocus
                  />
                  {feedback === "correct" && (
                    <p className="text-emerald-600 font-medium text-sm mt-2">{correctPhrase}</p>
                  )}
                  {feedback === "wrong" && (
                    <>
                      <p className="text-red-500 font-medium text-sm mt-2">Not quite</p>
                      <p className="text-lg font-bold text-[#111827] mt-2">The answer is: {correctAnswer}</p>
                    </>
                  )}
                  {(feedback === "correct" || feedback === "wrong") && currentQ.example && (
                    <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                      <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{currentQ.exampleTranslation}</p>
                    </div>
                  )}
                  {feedback === null && (
                    <button
                      type="button"
                      onClick={() => checkAnswer(inputValue)}
                      className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl px-8 py-3 text-base font-medium mt-4 transition-colors duration-200"
                    >
                      Check
                    </button>
                  )}
                  {(feedback === "correct" || feedback === "wrong") && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex >= total - 1) setPhase("results");
                        else {
                          setCurrentIndex((i) => i + 1);
                          setFeedback(null);
                          setInputValue("");
                        }
                      }}
                      className="text-[#111827] font-medium mt-4"
                    >
                      Next
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mt-6">
                    {options.map((opt) => {
                      const isCorrect = opt === correctAnswer;
                      const chosen = selectedOption === opt;
                      const showCorrect = selectedOption !== null;
                      const style =
                        showCorrect && chosen && isCorrect
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : showCorrect && chosen && !isCorrect
                            ? "border-red-400 bg-red-50 text-red-700"
                            : showCorrect && isCorrect
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                              : "border-[#E9E9E9] hover:bg-[#F9FAFB] hover:border-[#E9E9E9]";
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={selectedOption !== null}
                          onClick={() => {
                            if (selectedOption !== null) return;
                            setSelectedOption(opt);
                            const correct = opt === correctAnswer;
                            setUserAnswers((prev) => [...prev, { correct, userAnswer: opt }]);
                            if (correct) {
                              setTimeout(() => {
                                if (currentIndex >= total - 1) {
                                  setEndTime(Date.now());
                                  setPhase("results");
                                } else setCurrentIndex((i) => i + 1);
                              }, 1500);
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-xl text-left text-base transition-all duration-200 ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selectedOption !== null && currentQ.example && (
                    <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                      <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{currentQ.exampleTranslation}</p>
                    </div>
                  )}
                  {selectedOption !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex >= total - 1) setPhase("results");
                        else setCurrentIndex((i) => i + 1);
                      }}
                      className="text-[#111827] font-medium mt-4"
                    >
                      Next
                    </button>
                  )}
                </>
              )}
            </PracticeQuestionCard>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5">
          <header className="mb-8">
            <h1 className="text-[22px] font-bold tracking-tight">
              Vocabulary Quiz
            </h1>
            <p className="text-lg text-[#6B7280] font-medium mt-1">Questionário de Vocabulário</p>
            <p className="text-sm text-[#6B7280] mt-2">
              Test your vocabulary with multiple choice and typing challenges.
            </p>
          </header>

          <div className="max-w-lg mx-auto space-y-8">
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Category</p>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E9E9E9] rounded-xl bg-white text-[#111827]"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Level</p>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E9E9E9] rounded-xl bg-white text-[#111827]"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Mode</p>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      mode === m
                        ? "bg-[#111827] text-white border border-[#111827]"
                        : "border border-[#E9E9E9] text-[#6B7280] bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Format</p>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      format === f
                        ? "bg-[#111827] text-white border border-[#111827]"
                        : "border border-[#E9E9E9] text-[#6B7280] bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Number of questions</p>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-[#E9E9E9] rounded-xl bg-white text-[#111827]"
              >
                {COUNTS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={startQuiz}
              className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl px-6 py-3 text-base font-medium transition-colors duration-200 w-full"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
