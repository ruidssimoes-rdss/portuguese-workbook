"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PracticeProgressBar } from "@/components/practice/practice-progress-bar";
import { PracticeQuestionCard } from "@/components/practice/practice-question-card";
import { PracticeResults } from "@/components/practice/practice-results";
import { useSpeakPortuguese } from "@/lib/speak-pt";
import { compareAnswer } from "@/lib/practice-utils";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import type { VerbDataSet } from "@/types";
import type { VocabData, VocabCategory } from "@/types/vocab";
import { shuffle } from "@/lib/practice-utils";

const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;

type WordWithCategory = { word: string; english: string; categoryId: string; categoryTitle: string; example?: string; exampleTranslation?: string; cefr?: string };
type ConjItem = { verb: string; tense: string; person: string; conjugation: string; example: string; translation: string };

const TENSES = ["All Tenses", "Present", "Preterite", "Imperfect", "Future", "Conditional", "Present Subjunctive"];
const LEVELS = ["All", "A1", "A2", "B1"] as const;
const COUNTS = [10, 20, 30] as const;

function flattenVocab(): WordWithCategory[] {
  const out: WordWithCategory[] = [];
  for (const cat of vocab.categories) {
    for (const w of cat.words ?? []) {
      out.push({
        word: w.portuguese,
        english: w.english,
        categoryId: cat.id,
        categoryTitle: cat.title,
        example: w.example,
        exampleTranslation: w.exampleTranslation,
        cefr: w.cefr,
      });
    }
  }
  return out;
}

function flattenConjugations(): ConjItem[] {
  const out: ConjItem[] = [];
  for (const key of verbs.order) {
    const v = verbs.verbs[key];
    if (!v?.conjugations) continue;
    for (const c of v.conjugations) {
      out.push({
        verb: key,
        tense: c.Tense,
        person: c.Person.split(" (")[0].trim(),
        conjugation: c.Conjugation,
        example: c["Example Sentence"],
        translation: c["English Translation"],
      });
    }
  }
  return out;
}

const allVocabWords = flattenVocab();
const allConjugations = flattenConjugations();

export default function ListeningPage() {
  const [phase, setPhase] = useState<"setup" | "active" | "results">("setup");
  const [content, setContent] = useState<"Vocabulary" | "Verb conjugations">("Vocabulary");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [selectedTenses, setSelectedTenses] = useState<string[]>(["All Tenses"]);
  const [level, setLevel] = useState<string>("All");
  const [count, setCount] = useState<number>(20);
  const [questions, setQuestions] = useState<(WordWithCategory | ConjItem)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ correct: boolean; userAnswer: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoPlayDone = useRef(false);

  const currentQ = questions[currentIndex];
  const textToSpeak =
    content === "Vocabulary" && currentQ && "word" in currentQ
      ? currentQ.word
      : content === "Verb conjugations" && currentQ && "conjugation" in currentQ
        ? currentQ.conjugation
        : "";
  const { speak, isPlaying } = useSpeakPortuguese(textToSpeak);

  const total = questions.length;
  const current = currentIndex + 1;
  const answered = userAnswers.length;
  const score = userAnswers.filter((a) => a.correct).length;

  const correctAnswer =
    content === "Vocabulary" && currentQ && "word" in currentQ
      ? currentQ.word
      : content === "Verb conjugations" && currentQ && "conjugation" in currentQ
        ? currentQ.conjugation
        : "";

  const startSession = useCallback(() => {
    if (content === "Vocabulary") {
      let pool = categoryId === "all" ? allVocabWords : allVocabWords.filter((w) => w.categoryId === categoryId);
      if (level !== "All") pool = pool.filter((w) => w.cefr === level);
      setQuestions(shuffle(pool).slice(0, Math.min(count, pool.length)));
    } else {
      const useAllTenses = selectedTenses.length === 0 || selectedTenses.includes("All Tenses");
      let pool = allConjugations;
      if (!useAllTenses) pool = pool.filter((c) => selectedTenses.includes(c.tense));
      if (level !== "All") {
        pool = pool.filter((c) => {
          const v = verbs.verbs[c.verb];
          return v?.meta?.cefr === level;
        });
      }
      setQuestions(shuffle(pool).slice(0, Math.min(count, pool.length)));
    }
    setCurrentIndex(0);
    setUserAnswers([]);
    setInputValue("");
    setFeedback(null);
    setHasPlayed(false);
    setStartTime(Date.now());
    setEndTime(0);
    setPhase("active");
    autoPlayDone.current = false;
  }, [content, categoryId, selectedTenses, level, count]);

  useEffect(() => {
    if (phase !== "active" || !currentQ) return;
    setHasPlayed(false);
    setFeedback(null);
    setInputValue("");
    autoPlayDone.current = false;
    const t = setTimeout(() => {
      if (!autoPlayDone.current) {
        speak();
        autoPlayDone.current = true;
        setHasPlayed(true);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [phase, currentIndex, currentQ, speak]);

  useEffect(() => {
    if (phase === "active" && feedback === null) inputRef.current?.focus();
  }, [phase, currentIndex, feedback]);

  const checkAnswer = useCallback(() => {
    if (!currentQ) return;
    const result = compareAnswer(inputValue, correctAnswer);
    const correct = result !== "wrong";
    setUserAnswers((prev) => [...prev, { correct, userAnswer: inputValue }]);
    setFeedback(correct ? "correct" : "wrong");
    if (!correct && typeof window !== "undefined" && window.speechSynthesis) {
      setTimeout(() => speak(), 400);
    }
    if (correct) {
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
  }, [currentQ, inputValue, correctAnswer, currentIndex, total, speak]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirm("End session?")) {
          setEndTime(Date.now());
          setPhase("results");
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (feedback === null) checkAnswer();
        else if (feedback === "correct" && currentIndex < total - 1) setCurrentIndex((i) => i + 1);
      }
    },
    [feedback, checkAnswer, currentIndex, total]
  );

  const mistakes = useMemo(() => {
    return userAnswers
      .map((a, i) => ({ ...a, index: i }))
      .filter((a) => !a.correct)
      .map((a) => {
        const q = questions[a.index];
        const prompt =
          content === "Vocabulary" && q && "word" in q
            ? `${q.word} (${q.english})`
            : content === "Verb conjugations" && q && "conjugation" in q
              ? `${q.verb} · ${q.tense} · ${q.person}`
              : "";
        const correct =
          content === "Vocabulary" && q && "word" in q
            ? q.word
            : content === "Verb conjugations" && q && "conjugation" in q
              ? q.conjugation
              : "";
        return {
          id: `${a.index}`,
          prompt,
          userAnswer: a.userAnswer,
          correctAnswer: correct,
          wasCorrect: false,
        };
      });
  }, [userAnswers, questions, content]);

  if (phase === "results") {
    return (
      <>
        <Topbar />
        <main className="min-h-screen bg-[#fafafa]">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5">
            <PracticeResults
              title="Session Complete"
              subtitle="Sessão Completa"
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
              newLabel="New session"
              backHref="/practice"
              backLabel="Back to Practice"
            />
          </div>
        </main>
      </>
    );
  }

  if (phase === "active" && currentQ) {
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
                onClick={() => confirm("End session?") && (setEndTime(Date.now()), setPhase("results"))}
                className="text-sm text-[#9CA3AF] hover:text-[#6B7280]"
              >
                End
              </button>
            </div>
            <PracticeProgressBar current={answered} total={total} className="mb-8" />

            <PracticeQuestionCard>
              <button
                type="button"
                onClick={() => { speak(); setHasPlayed(true); }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-colors duration-200 ${
                  isPlaying ? "bg-[#111827]/20" : "bg-[#EBF2FA] hover:bg-[#dce8f5]"
                }`}
                aria-label="Play"
              >
                <svg
                  className={`w-8 h-8 text-[#111827] ${isPlaying ? "animate-pulse" : ""}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
              <p className="text-sm text-[#9CA3AF] mt-2">{hasPlayed ? "Tap to replay" : "Tap to listen"}</p>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), feedback === null ? checkAnswer() : (feedback === "correct" && currentIndex < total - 1) && setCurrentIndex((i) => i + 1))}
                placeholder="Type what you hear..."
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
                <p className="text-emerald-600 font-medium text-sm mt-2">Correct!</p>
              )}
              {feedback === "wrong" && (
                <>
                  <p className="text-red-500 font-medium text-sm mt-2">Not quite</p>
                  <p className="text-lg font-bold text-[#111827] mt-2">The answer is: {correctAnswer}</p>
                </>
              )}
              {(feedback === "correct" || feedback === "wrong") && content === "Vocabulary" && "exampleTranslation" in currentQ && currentQ.example && (
                <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                  <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                  {"exampleTranslation" in currentQ && currentQ.exampleTranslation && (
                    <p className="text-xs text-[#6B7280] mt-1">{currentQ.exampleTranslation}</p>
                  )}
                </div>
              )}
              {(feedback === "correct" || feedback === "wrong") && content === "Verb conjugations" && "translation" in currentQ && currentQ.example && (
                <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                  <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{currentQ.translation}</p>
                </div>
              )}
              {feedback === null && (
                <button
                  type="button"
                  onClick={checkAnswer}
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
            <h1 className="text-2xl font-bold tracking-tight">
              Listening Practice
            </h1>
            <p className="text-[13px] text-[#6B7280] font-medium mt-1">Prática de Audição</p>
            <p className="text-sm text-[#6B7280] mt-2">
              Listen and identify words and phrases. Train your ear for European Portuguese.
            </p>
          </header>

          <div className="max-w-lg mx-auto space-y-8">
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Content</p>
              <div className="flex flex-wrap gap-2">
                {(["Vocabulary", "Verb conjugations"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContent(c)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      content === c
                        ? "bg-[#111827] text-white border border-[#111827]"
                        : "border border-[#E9E9E9] text-[#6B7280] bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {content === "Vocabulary" && (
              <div>
                <p className="text-sm font-medium text-[#374151] mb-2">Category</p>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E9E9E9] rounded-xl bg-white text-[#111827]"
                >
                  <option value="all">All categories</option>
                  {vocab.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}
            {content === "Verb conjugations" && (
              <div>
                <p className="text-sm font-medium text-[#374151] mb-2">Tense</p>
                <div className="flex flex-wrap gap-2">
                  {TENSES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setSelectedTenses((prev) =>
                          t === "All Tenses"
                            ? prev.includes(t) ? prev : ["All Tenses"]
                            : prev.includes(t)
                              ? prev.filter((x) => x !== t)
                              : [...prev.filter((x) => x !== "All Tenses"), t]
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        selectedTenses.includes(t)
                          ? "bg-[#111827] text-white border border-[#111827]"
                          : "border border-[#E9E9E9] text-[#6B7280] bg-white hover:bg-[#F9FAFB]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              onClick={startSession}
              className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl px-6 py-3 text-base font-medium transition-colors duration-200 w-full"
            >
              Start Listening
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
