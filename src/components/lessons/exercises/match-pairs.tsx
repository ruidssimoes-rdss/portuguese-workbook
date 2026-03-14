"use client";

import { useState, useMemo } from "react";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface MatchPairsProps {
  instruction: string;
  pairs: Array<{ left: string; right: string }>;
  onComplete: (results: ExerciseResult[]) => void;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function MatchPairs({ instruction, pairs, onComplete }: MatchPairsProps) {
  const shuffledLeft = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs]);
  const shuffledRight = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  const pairMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of pairs) {
      map.set(p.left, p.right);
    }
    return map;
  }, [pairs]);

  const tryMatch = (left: string, right: string) => {
    const isCorrect = pairMap.get(left) === right;

    const result: ExerciseResult = {
      correct: isCorrect,
      userAnswer: `${left} → ${right}`,
      correctAnswer: `${left} → ${pairMap.get(left)}`,
    };

    if (isCorrect) {
      const newMatched = new Set(matched);
      newMatched.add(left);
      setMatched(newMatched);
      const newResults = [...results, result];
      setResults(newResults);

      if (newMatched.size === pairs.length) {
        setTimeout(() => onComplete(newResults), 800);
      }
    } else {
      setWrongFlash({ left, right });
      setResults((prev) => [...prev, result]);
      setTimeout(() => setWrongFlash(null), 600);
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleLeftClick = (item: string) => {
    if (matched.has(item)) return;
    setSelectedLeft(item);
    if (selectedRight) {
      tryMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item: string) => {
    // Find if this right item is already matched
    const isMatched = [...matched].some((left) => pairMap.get(left) === item);
    if (isMatched) return;
    setSelectedRight(item);
    if (selectedLeft) {
      tryMatch(selectedLeft, item);
    }
  };

  const matchedCount = matched.size;

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-4">
        {instruction}
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column (PT) */}
        <div className="space-y-2">
          {shuffledLeft.map((item) => {
            const isMatched = matched.has(item);
            const isSelected = selectedLeft === item;
            const isWrong = wrongFlash?.left === item;

            let btnClass = "border-[var(--border-primary)] hover:border-[#003399] cursor-pointer";
            if (isMatched) {
              btnClass = "border-[#059669] bg-[#F0FDF4] opacity-70";
            } else if (isWrong) {
              btnClass = "border-[#DC2626] bg-[#FEF2F2]";
            } else if (isSelected) {
              btnClass = "border-[#003399] bg-[rgba(0,51,153,0.05)] ring-2 ring-[#003399]/20";
            }

            return (
              <button
                key={item}
                type="button"
                disabled={isMatched}
                onClick={() => handleLeftClick(item)}
                className={`w-full text-left px-4 py-3 rounded-[12px] border text-[14px] font-medium text-[var(--text-primary)] transition-all duration-200 ${btnClass}`}
              >
                {item}
                {isMatched && (
                  <svg className="inline w-4 h-4 text-[#059669] ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column (EN) */}
        <div className="space-y-2">
          {shuffledRight.map((item) => {
            const isMatched = [...matched].some((left) => pairMap.get(left) === item);
            const isSelected = selectedRight === item;
            const isWrong = wrongFlash?.right === item;

            let btnClass = "border-[var(--border-primary)] hover:border-[#003399] cursor-pointer";
            if (isMatched) {
              btnClass = "border-[#059669] bg-[#F0FDF4] opacity-70";
            } else if (isWrong) {
              btnClass = "border-[#DC2626] bg-[#FEF2F2]";
            } else if (isSelected) {
              btnClass = "border-[#003399] bg-[rgba(0,51,153,0.05)] ring-2 ring-[#003399]/20";
            }

            return (
              <button
                key={item}
                type="button"
                disabled={isMatched}
                onClick={() => handleRightClick(item)}
                className={`w-full text-left px-4 py-3 rounded-[12px] border text-[14px] font-medium text-[var(--text-secondary)] transition-all duration-200 ${btnClass}`}
              >
                {item}
                {isMatched && (
                  <svg className="inline w-4 h-4 text-[#059669] ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[13px] text-[var(--text-muted)] text-center mt-4">
        {matchedCount} / {pairs.length} pares
      </p>
    </div>
  );
}
