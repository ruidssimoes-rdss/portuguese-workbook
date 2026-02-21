"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PracticeProgressBar } from "@/components/practice/practice-progress-bar";
import { PracticeQuestionCard } from "@/components/practice/practice-question-card";
import { PracticeResults } from "@/components/practice/practice-results";
import { compareAnswer } from "@/lib/practice-utils";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";

const verbs = verbData as unknown as VerbDataSet;

const TENSES = [
  "All Tenses",
  "Present",
  "Preterite",
  "Imperfect",
  "Future",
  "Conditional",
  "Present Subjunctive",
] as const;

const TENSE_LABELS: Record<string, string> = {
  Present: "Present tense",
  Preterite: "Preterite",
  Imperfect: "Imperfect",
  Future: "Future",
  Conditional: "Conditional",
  "Present Subjunctive": "Present Subjunctive",
};

const GROUPS = ["All Groups", "Regular -AR", "Regular -ER", "Regular -IR", "Irregular"] as const;
const LEVELS = ["All", "A1", "A2", "B1"] as const;
const MODES = ["Type it", "Multiple choice"] as const;
const COUNTS = [10, 20, 30, 50] as const;

const CORRECT_PHRASES = ["Correct!", "Boa!", "Very good!", "Excelente!", "Well done!", "Perfect!"];

function normalizePerson(p: string): string {
  const raw = p.split(" (")[0].trim();
  if (/^ele\/ela(\/você)?$/i.test(raw)) return "ele/ela";
  if (/^eles\/elas(\/vocês)?$/i.test(raw)) return "eles/elas";
  return raw;
}

export interface VerbDrillQuestion {
  verb: string;
  verbEnglish: string;
  tense: string;
  person: string;
  correctAnswer: string;
  example: string;
  translation: string;
}

function buildQuestions(
  selectedTenses: string[],
  selectedGroups: string[],
  level: string,
  count: number
): VerbDrillQuestion[] {
  const useAllTenses = selectedTenses.length === 0 || selectedTenses.includes("All Tenses");
  const useAllGroups = selectedGroups.length === 0 || selectedGroups.includes("All Groups");
  const tenseSet = useAllTenses ? null : new Set(selectedTenses);
  const groupSet = useAllGroups ? null : new Set(selectedGroups);

  const pool: VerbDrillQuestion[] = [];
  for (const key of verbs.order) {
    const v = verbs.verbs[key];
    if (!v?.conjugations) continue;
    if (level !== "All" && v.meta.cefr !== level) continue;
    if (groupSet && !groupSet.has(v.meta.group)) continue;
    for (const c of v.conjugations) {
      if (tenseSet && !tenseSet.has(c.Tense)) continue;
      pool.push({
        verb: key,
        verbEnglish: v.meta.english,
        tense: c.Tense,
        person: normalizePerson(c.Person),
        correctAnswer: c.Conjugation,
        example: c["Example Sentence"],
        translation: c["English Translation"],
      });
    }
  }

  const seen = new Set<string>();
  const varied: VerbDrillQuestion[] = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const q of shuffled) {
    const id = `${q.verb}|${q.tense}|${q.person}`;
    if (seen.has(id)) continue;
    seen.add(id);
    varied.push(q);
    if (varied.length >= count) break;
  }
  return varied.slice(0, count);
}

function getDistractors(
  correct: string,
  sameVerbConjugations: string[],
  allConjugations: string[]
): string[] {
  const wrong = sameVerbConjugations.filter((c) => c !== correct);
  const out = wrong.slice(0, 3);
  if (out.length < 3) {
    for (const c of allConjugations) {
      if (out.length >= 3) break;
      if (c !== correct && !out.includes(c)) out.push(c);
    }
  }
  return out.slice(0, 3);
}

export default function VerbDrillsPage() {
  const [phase, setPhase] = useState<"setup" | "active" | "results">("setup");
  const [selectedTenses, setSelectedTenses] = useState<string[]>(["All Tenses"]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["All Groups"]);
  const [level, setLevel] = useState<string>("All");
  const [mode, setMode] = useState<"Type it" | "Multiple choice">("Type it");
  const [count, setCount] = useState<number>(20);
  const [questions, setQuestions] = useState<VerbDrillQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ correct: boolean; userAnswer: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "correct_no_accent" | null>(null);
  const [correctPhrase, setCorrectPhrase] = useState("");
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = questions.length;
  const current = currentIndex + 1;
  const currentQ = questions[currentIndex];
  const answered = userAnswers.length;
  const score = userAnswers.filter((a) => a.correct).length;

  const allConjugations = useMemo(() => {
    const set = new Set<string>();
    for (const v of Object.values(verbs.verbs)) {
      for (const c of v?.conjugations ?? []) set.add(c.Conjugation);
    }
    return Array.from(set);
  }, []);

  const startDrill = useCallback(() => {
    const q = buildQuestions(selectedTenses, selectedGroups, level, count);
    if (q.length === 0) return;
    setQuestions(q);
    setCurrentIndex(0);
    setUserAnswers([]);
    setInputValue("");
    setFeedback(null);
    setStartTime(Date.now());
    setEndTime(0);
    setPhase("active");
    if (mode === "Multiple choice") {
      const sameVerbTense = q[0]
        ? verbs.verbs[q[0].verb]?.conjugations
            ?.filter((c) => c.Tense === q[0].tense)
            .map((c) => c.Conjugation) ?? []
        : [];
      const opts = getDistractors(q[0].correctAnswer, sameVerbTense, allConjugations);
      setOptions(shuffleOptions([q[0].correctAnswer, ...opts]));
    }
    setSelectedOption(null);
  }, [selectedTenses, selectedGroups, level, count, mode, allConjugations]);

  function shuffleOptions(arr: string[]): string[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  useEffect(() => {
    if (phase !== "active" || !currentQ) return;
    if (mode === "Multiple choice") {
      const sameVerbTense = verbs.verbs[currentQ.verb]?.conjugations
        ?.filter((c) => c.Tense === currentQ.tense)
        .map((c) => c.Conjugation) ?? [];
      const opts = getDistractors(currentQ.correctAnswer, sameVerbTense, allConjugations);
      setOptions(shuffleOptions([currentQ.correctAnswer, ...opts]));
      setSelectedOption(null);
    } else {
      setInputValue("");
      setFeedback(null);
      inputRef.current?.focus();
    }
  }, [phase, currentIndex, currentQ?.verb, currentQ?.tense, currentQ?.correctAnswer, mode]);

  useEffect(() => {
    if (phase === "active" && mode === "Type it") inputRef.current?.focus();
  }, [phase, mode, currentIndex]);

  const checkAnswer = useCallback(
    (userAnswer: string) => {
      if (!currentQ) return;
      const result = compareAnswer(userAnswer, currentQ.correctAnswer);
      const correct = result !== "wrong";
      setUserAnswers((prev) => [...prev, { correct, userAnswer }]);
      setFeedback(result === "exact" ? "correct" : result === "correct_no_accent" ? "correct_no_accent" : "wrong");
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
    [currentQ, currentIndex, total]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirm("End drill and see results?")) {
          setEndTime(Date.now());
          setPhase("results");
        }
        return;
      }
      if (mode === "Type it" && e.key === "Enter") {
        e.preventDefault();
        if (feedback === null) checkAnswer(inputValue);
        else if (feedback === "correct" || feedback === "correct_no_accent") {
          if (currentIndex >= total - 1) setPhase("results");
          else setCurrentIndex((i) => i + 1);
        }
      }
    },
    [mode, feedback, inputValue, checkAnswer, currentIndex, total]
  );

  const toggleTense = (t: string) => {
    setSelectedTenses((prev) => {
      if (t === "All Tenses") return prev.includes(t) ? prev : ["All Tenses"];
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      return [...prev.filter((x) => x !== "All Tenses"), t];
    });
  };
  const toggleGroup = (g: string) => {
    setSelectedGroups((prev) => {
      if (g === "All Groups") return prev.includes(g) ? prev : ["All Groups"];
      if (prev.includes(g)) return prev.filter((x) => x !== g);
      return [...prev.filter((x) => x !== "All Groups"), g];
    });
  };

  const mistakes = useMemo(() => {
    return userAnswers
      .map((a, i) => ({ ...a, index: i }))
      .filter((a) => !a.correct)
      .map((a) => ({
        id: `${a.index}`,
        prompt: `${questions[a.index]?.verb} · ${questions[a.index]?.tense} · ${questions[a.index]?.person}`,
        userAnswer: a.userAnswer,
        correctAnswer: questions[a.index]?.correctAnswer ?? "",
        wasCorrect: false,
      }));
  }, [userAnswers, questions]);

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
              newLabel="New drill"
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
                onClick={() => confirm("End drill?") && (setEndTime(Date.now()), setPhase("results"))}
                className="text-sm text-[#9CA3AF] hover:text-[#6B7280]"
              >
                End drill
              </button>
            </div>
            <PracticeProgressBar current={answered} total={total} className="mb-8" />

            <PracticeQuestionCard>
              <p className="text-2xl font-semibold text-[#111827] uppercase tracking-wide">{currentQ.verb}</p>
              <p className="text-sm text-[#6B7280] mt-1">{currentQ.verbEnglish}</p>
              <p className="text-sm text-[#111827] font-medium mt-4">{TENSE_LABELS[currentQ.tense] ?? currentQ.tense}</p>
              <p className="text-lg text-[#1F2937] font-medium mt-2">
                {currentQ.person} ___
              </p>

              {mode === "Type it" ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && feedback === null && checkAnswer(inputValue)}
                    placeholder="Type the conjugation..."
                    className={`w-full max-w-sm mx-auto mt-6 px-4 py-3 border rounded-xl text-center text-lg outline-none transition-all duration-200 ${
                      feedback === "correct" || feedback === "correct_no_accent"
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
                  {feedback === "correct_no_accent" && (
                    <p className="text-emerald-600 font-medium text-sm mt-2">
                      Correct! But remember the accent: <strong>{currentQ.correctAnswer}</strong>
                    </p>
                  )}
                  {feedback === "wrong" && (
                    <>
                      <p className="text-red-500 font-medium text-sm mt-2">Not quite</p>
                      <p className="text-lg font-bold text-[#111827] mt-2">The answer is: {currentQ.correctAnswer}</p>
                    </>
                  )}
                  {(feedback === "correct" || feedback === "correct_no_accent" || feedback === "wrong") && (
                    <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                      <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{currentQ.translation}</p>
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
                  {(feedback === "correct" || feedback === "correct_no_accent") && (
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
                  {feedback === "wrong" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex >= total - 1) {
                          setEndTime(Date.now());
                          setPhase("results");
                        } else setCurrentIndex((i) => i + 1);
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
                      const isCorrect = opt === currentQ.correctAnswer;
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
                            const result = compareAnswer(opt, currentQ.correctAnswer);
                            const correct = result !== "wrong";
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
                  {selectedOption !== null && (
                    <div className="bg-[#F9FAFB] rounded-[14px] p-4 mt-4 text-left">
                      <p className="text-sm text-[#1F2937] italic">{currentQ.example}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{currentQ.translation}</p>
                    </div>
                  )}
                  {selectedOption !== null && (selectedOption === currentQ.correctAnswer || compareAnswer(selectedOption, currentQ.correctAnswer) !== "wrong") && (
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
                  {selectedOption !== null && compareAnswer(selectedOption, currentQ.correctAnswer) === "wrong" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex >= total - 1) {
                          setEndTime(Date.now());
                          setPhase("results");
                        } else setCurrentIndex((i) => i + 1);
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
            <h1 className="text-2xl font-bold tracking-tight">
              Verb Drills
            </h1>
            <p className="text-[13px] text-[#6B7280] font-medium mt-1">Exercícios de Verbos</p>
            <p className="text-sm text-[#6B7280] mt-2">
              Practice conjugating verbs across all tenses.
            </p>
          </header>

          <div className="max-w-lg mx-auto space-y-8">
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Tense</p>
              <div className="flex flex-wrap gap-2">
                {TENSES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTense(t)}
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
            <div>
              <p className="text-sm font-medium text-[#374151] mb-2">Verb Group</p>
              <div className="flex flex-wrap gap-2">
                {GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGroup(g)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      selectedGroups.includes(g)
                        ? "bg-[#111827] text-white border border-[#111827]"
                        : "border border-[#E9E9E9] text-[#6B7280] bg-white hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
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
              onClick={startDrill}
              className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl px-6 py-3 text-base font-medium transition-colors duration-200 w-full"
            >
              Start Drill
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
