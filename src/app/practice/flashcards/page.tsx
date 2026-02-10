"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord, VocabCategory } from "@/types/vocab";

const vocab = vocabData as unknown as VocabData;

type VocabWordWithCategory = VocabWord & {
  categoryId: string;
  categoryTitle: string;
};

function flattenVocab(categories: VocabCategory[]): VocabWordWithCategory[] {
  const out: VocabWordWithCategory[] = [];
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

function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let i = a.length;
  const rng = seed !== undefined ? seeded(seed) : Math.random;
  while (i > 1) {
    const j = Math.floor(rng() * i);
    i--;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function seeded(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const CARD_OPTIONS = [10, 20, 30, 50] as const;
const ORDER_OPTIONS = [
  { value: "random", label: "Random" },
  { value: "pt", label: "Alphabetical (PT)" },
  { value: "en", label: "Alphabetical (EN)" },
] as const;
const DIRECTION_OPTIONS = [
  { value: "pt-en", label: "Portuguese → English" },
  { value: "en-pt", label: "English → Portuguese" },
  { value: "mixed", label: "Mixed" },
] as const;
const CEFR_OPTIONS = ["All", "A1", "A2", "B1"] as const;

const allWords = flattenVocab(vocab.categories);
const categories = vocab.categories;
const totalWords = allWords.length;

function wordKey(w: VocabWordWithCategory): string {
  return `${w.categoryId}:${w.portuguese}`;
}

export default function FlashcardsPage() {
  const [phase, setPhase] = useState<"setup" | "session" | "results">("setup");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [level, setLevel] = useState<string>("All");
  const [cardCount, setCardCount] = useState<number>(20);
  const [order, setOrder] = useState<"random" | "pt" | "en">("random");
  const [direction, setDirection] = useState<"pt-en" | "en-pt" | "mixed">("pt-en");
  const [sessionWords, setSessionWords] = useState<VocabWordWithCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Map<number, "known" | "learning">>(new Map());
  const [frontSide, setFrontSide] = useState<("pt" | "en")[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const filteredWords = useMemo(() => {
    let list = categoryId === "all"
      ? allWords
      : allWords.filter((w) => w.categoryId === categoryId);
    if (level !== "All") {
      list = list.filter((w) => w.cefr === level);
    }
    return list;
  }, [categoryId, level]);

  const startSession = useCallback(
    (wordsToUse?: VocabWordWithCategory[]) => {
      const pool = wordsToUse ?? filteredWords;
      if (pool.length === 0) return;
      let list = [...pool];
      if (order === "random") list = shuffle(list, Date.now() % 10000);
      else if (order === "pt") list.sort((a, b) => a.portuguese.localeCompare(b.portuguese));
      else list.sort((a, b) => a.english.localeCompare(b.english));
      const limit = cardCount === 0 ? list.length : Math.min(cardCount, list.length);
      list = list.slice(0, limit);
      const sides: ("pt" | "en")[] = list.map(() =>
        direction === "mixed" ? (Math.random() < 0.5 ? "pt" : "en") : direction === "pt-en" ? "pt" : "en"
      );
      setFrontSide(sides);
      setSessionWords(list);
      setCurrentIndex(0);
      setIsFlipped(false);
      setResults(new Map());
      setPhase("session");
    },
    [filteredWords, order, cardCount, direction]
  );

  const currentWord = sessionWords[currentIndex];
  const showPortugueseOnFront = currentWord
    ? frontSide[currentIndex] === "pt"
    : true;

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const recordAndNext = useCallback(
    (status: "known" | "learning") => {
      setResults((prev) => {
        const m = new Map(prev);
        m.set(currentIndex, status);
        return m;
      });
      if (currentIndex >= sessionWords.length - 1) {
        setPhase("results");
      } else {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      }
    },
    [currentIndex, sessionWords.length]
  );

  useEffect(() => {
    if (phase !== "session") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
          setIsFlipped(false);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < sessionWords.length - 1) {
          setCurrentIndex((i) => i + 1);
          setIsFlipped(false);
        }
      } else if (e.key === "1" && isFlipped) {
        recordAndNext("known");
      } else if (e.key === "2" && isFlipped) {
        recordAndNext("learning");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, currentIndex, sessionWords.length, isFlipped, handleFlip, recordAndNext]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) < 50) return;
      if (diff > 0 && currentIndex < sessionWords.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setIsFlipped(false);
      }
    },
    [currentIndex, sessionWords.length]
  );

  const knownCount = useMemo(
    () => Array.from(results.values()).filter((v) => v === "known").length,
    [results]
  );
  const learningCount = useMemo(
    () => Array.from(results.values()).filter((v) => v === "learning").length,
    [results]
  );
  const learningWords = useMemo(
    () =>
      sessionWords.filter((_, i) => results.get(i) === "learning"),
    [sessionWords, results]
  );

  const practiceAgain = useCallback(() => {
    if (learningWords.length === 0) return;
    startSession(learningWords);
  }, [learningWords, startSession]);

  if (phase === "setup") {
    const maxAvailable = filteredWords.length;
    return (
      <>
        <Topbar />
        <main className="min-h-screen bg-[#fafafa]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Flashcards
              </h1>
              <p className="text-lg text-[#5B4FA0]/70 font-medium mt-1">
                Cartões de Memória
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Choose what to practice:
              </p>
            </header>
            <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-[#5B4FA0] focus:ring-1 focus:ring-[#5B4FA0]/20 min-h-[44px] w-48 md:w-56"
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-700">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-[#5B4FA0] focus:ring-1 focus:ring-[#5B4FA0]/20 min-h-[44px] w-48 md:w-56"
                >
                  {CEFR_OPTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-700">Cards</label>
                <select
                  value={cardCount === 0 ? "all" : cardCount}
                  onChange={(e) =>
                    setCardCount(e.target.value === "all" ? 0 : Number(e.target.value))
                  }
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-[#5B4FA0] focus:ring-1 focus:ring-[#5B4FA0]/20 min-h-[44px] w-48 md:w-56"
                >
                  {CARD_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                  <option value="all">All</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-700">Order</label>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as "random" | "pt" | "en")}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-[#5B4FA0] focus:ring-1 focus:ring-[#5B4FA0]/20 min-h-[44px] w-48 md:w-56"
                >
                  {ORDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <label className="text-sm font-medium text-gray-700">Direction</label>
                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as "pt-en" | "en-pt" | "mixed")
                  }
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-[#5B4FA0] focus:ring-1 focus:ring-[#5B4FA0]/20 min-h-[44px] w-48 md:w-56"
                >
                  {DIRECTION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => startSession()}
                disabled={maxAvailable === 0}
                className="bg-[#5B4FA0] text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-[#4A3F8F] transition-colors mt-6 w-full min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start session →
              </button>
              {maxAvailable === 0 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  No words match the selected filters.
                </p>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (phase === "results") {
    const total = sessionWords.length;
    const knewPct = total > 0 ? Math.round((knownCount / total) * 100) : 0;
    const learningPct = total > 0 ? Math.round((learningCount / total) * 100) : 0;
    return (
      <>
        <Topbar />
        <main className="min-h-screen bg-[#fafafa]">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900">Session Complete!</h1>
              <p className="text-lg text-[#5B4FA0]/70 font-medium mt-1">Sessão Concluída!</p>
              <div className="mt-8 py-6 border-y border-gray-200 space-y-3">
                <p className="text-emerald-600 font-semibold">
                  Knew: {knownCount} / {total} ({knewPct}%)
                </p>
                <p className="text-amber-600 font-semibold">
                  Learning: {learningCount} / {total} ({learningPct}%)
                </p>
              </div>
              {learningWords.length > 0 && (
                <div className="mt-8 text-left">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">
                    Words to review:
                  </h2>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {learningWords.map((w) => (
                      <li key={wordKey(w)}>
                        <span className="font-medium text-gray-800">{w.portuguese}</span>
                        <span className="text-gray-400"> — {w.english}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                {learningWords.length > 0 && (
                  <button
                    type="button"
                    onClick={practiceAgain}
                    className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-100 transition-colors min-h-[44px]"
                  >
                    Practice these again →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPhase("setup")}
                  className="bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  New session
                </button>
                <Link
                  href="/practice"
                  className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px] inline-flex items-center justify-center"
                >
                  Back to Practice
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Session phase
  const progressPct = sessionWords.length > 0 ? ((currentIndex + 1) / sessionWords.length) * 100 : 0;
  return (
    <>
      <Topbar />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-6">
          <p className="text-sm text-gray-400 text-center mb-4">
            {currentIndex + 1} / {sessionWords.length}
          </p>
          <div className="h-1 bg-gray-100 rounded-full max-w-sm mx-auto mb-8">
            <div
              className="h-full bg-[#5B4FA0] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div
            className="max-w-sm mx-auto flashcard-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleFlip}
              onKeyDown={(e) => e.key === "Enter" && handleFlip()}
              className="w-full aspect-[3/4] bg-white border border-gray-200 rounded-xl shadow-lg cursor-pointer select-none overflow-hidden"
              aria-label="Flip card"
            >
              <div className={`flashcard-inner w-full h-full ${isFlipped ? "flipped" : ""}`}>
                <div className="flashcard-front flex flex-col items-center justify-center p-6">
                  {showPortugueseOnFront ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className="text-3xl font-bold text-gray-900 text-center">
                          {currentWord.portuguese}
                        </span>
                        {currentWord.gender && (
                          <span className="text-lg text-gray-400">({currentWord.gender}.)</span>
                        )}
                      </div>
                      <div className="mt-4">
                        <PronunciationButton
                          text={currentWord.portuguese}
                          size="sm"
                          className="shrink-0"
                        />
                      </div>
                      <p className="text-xs text-gray-300 mt-6">Tap to flip</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900 text-center">
                        {currentWord.english}
                      </span>
                      <p className="text-xs text-gray-300 mt-6">Tap to flip</p>
                    </>
                  )}
                </div>
                <div className="flashcard-back flex flex-col items-center justify-center p-6 overflow-y-auto">
                  <span className="text-3xl font-bold text-[#5B4FA0] text-center">
                    {showPortugueseOnFront ? currentWord.english : currentWord.portuguese}
                  </span>
                  <span className="text-lg text-gray-500 mt-2 text-center">
                    {showPortugueseOnFront ? currentWord.portuguese : currentWord.english}
                  </span>
                  {currentWord.pronunciation && (
                    <span className="text-sm font-mono text-gray-400 mt-1 text-center">
                      {currentWord.pronunciation}
                    </span>
                  )}
                  <div className="mt-2">
                    <PronunciationButton
                      text={currentWord.portuguese}
                      size="sm"
                      className="shrink-0"
                    />
                  </div>
                  {currentWord.example && (
                    <p className="text-sm text-gray-500 italic mt-4 text-center">
                      {currentWord.example}
                    </p>
                  )}
                  {currentWord.exampleTranslation && (
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      {currentWord.exampleTranslation}
                    </p>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 mt-4">
                    {currentWord.categoryTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-sm mx-auto mt-6 gap-4">
            <button
              type="button"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex((i) => i - 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIndex === 0}
              className="bg-gray-100 rounded-full p-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]"
              aria-label="Previous card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentIndex < sessionWords.length - 1) {
                  setCurrentIndex((i) => i + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIndex === sessionWords.length - 1}
              className="bg-gray-100 rounded-full p-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px]"
              aria-label="Next card"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {isFlipped && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => recordAndNext("known")}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-100 transition-colors min-h-[44px]"
              >
                I knew it
              </button>
              <button
                type="button"
                onClick={() => recordAndNext("learning")}
                className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-amber-100 transition-colors min-h-[44px]"
              >
                Still learning
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
