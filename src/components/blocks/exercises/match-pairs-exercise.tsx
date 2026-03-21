"use client";

import { useState, useMemo } from "react";
import type { ExerciseProps, MatchPairsExerciseData, AnswerResult } from "@/types/blocks";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchPairsExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<MatchPairsExerciseData>) {
  const shuffledRight = useMemo(() => shuffle(data.pairs.map((p) => p.right)), [data.pairs]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [flash, setFlash] = useState<{ type: "correct" | "wrong"; left: number; right: number } | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  function handleLeftSelect(index: number) {
    if (disabled || matched.has(index)) return;
    setSelectedLeft(index);
    if (selectedRight !== null) tryMatch(index, selectedRight);
  }

  function handleRightSelect(rightIdx: number) {
    if (disabled) return;
    const rightVal = shuffledRight[rightIdx];
    if (matched.has(data.pairs.findIndex((p) => p.right === rightVal))) return;
    setSelectedRight(rightIdx);
    if (selectedLeft !== null) tryMatch(selectedLeft, rightIdx);
  }

  function tryMatch(leftIdx: number, rightIdx: number) {
    const pair = data.pairs[leftIdx];
    const rightVal = shuffledRight[rightIdx];
    const isMatch = pair.right === rightVal;

    if (isMatch) {
      const newMatched = new Set(matched);
      newMatched.add(leftIdx);
      setMatched(newMatched);
      setFlash({ type: "correct", left: leftIdx, right: rightIdx });
      setTimeout(() => setFlash(null), 300);

      if (newMatched.size === data.pairs.length) {
        const score = Math.max(0, data.pairs.length - wrongAttempts);
        const answer: AnswerResult = {
          correct: wrongAttempts === 0,
          userAnswer: `${newMatched.size}/${data.pairs.length} matched, ${wrongAttempts} wrong attempts`,
          expectedAnswer: `${data.pairs.length} pairs`,
          points: score,
          maxPoints: data.pairs.length,
        };
        setTimeout(() => onAnswer(answer), 300);
      }
    } else {
      setWrongAttempts(wrongAttempts + 1);
      setFlash({ type: "wrong", left: leftIdx, right: rightIdx });
      setTimeout(() => setFlash(null), 400);
    }

    setSelectedLeft(null);
    setSelectedRight(null);
  }

  function leftClass(index: number): string {
    const base = "w-full text-left py-3 px-4 rounded-lg border text-[14px] transition-all duration-150 cursor-pointer";
    if (matched.has(index)) return `${base} pair-matched`;
    if (flash?.left === index && flash.type === "wrong") return `${base} pair-mismatched`;
    if (selectedLeft === index) return `${base} pair-selected`;
    return `${base} border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white text-[#111111] hover:border-[rgba(0,0,0,0.12)]`;
  }

  function rightClass(index: number): string {
    const base = "w-full text-left py-3 px-4 rounded-lg border text-[14px] transition-all duration-150 cursor-pointer";
    const matchedIdx = data.pairs.findIndex((p) => p.right === shuffledRight[index]);
    if (matched.has(matchedIdx)) return `${base} pair-matched`;
    if (flash?.right === index && flash.type === "wrong") return `${base} pair-mismatched`;
    if (selectedRight === index) return `${base} pair-selected`;
    const highlightTappable = selectedLeft !== null && !matched.has(matchedIdx);
    return `${base} border-[0.5px] border-[rgba(0,0,0,0.06)] bg-white ${highlightTappable ? "text-[#111111] border-[rgba(0,0,0,0.12)]" : "text-[#6C6B71]"} hover:border-[rgba(0,0,0,0.12)]`;
  }

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Left — Portuguese */}
        <div className="space-y-2">
          {data.pairs.map((pair, i) => (
            <button
              key={`left-${i}`}
              onClick={() => handleLeftSelect(i)}
              disabled={disabled || matched.has(i)}
              className={leftClass(i)}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>{pair.left}</span>
            </button>
          ))}
        </div>

        {/* Right — English */}
        <div className="space-y-2">
          {shuffledRight.map((rightVal, i) => {
            const matchedIdx = data.pairs.findIndex((p) => p.right === rightVal);
            return (
              <button
                key={`right-${i}`}
                onClick={() => handleRightSelect(i)}
                disabled={disabled || matched.has(matchedIdx)}
                className={rightClass(i)}
                style={{ animationDelay: `${(i + data.pairs.length) * 50}ms` }}
              >
                <span className="fade-in" style={{ animationDelay: `${(i + data.pairs.length) * 50}ms` }}>{rightVal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Attempts counter */}
      <div className="flex justify-center mt-3">
        {wrongAttempts > 0 && (
          <span className="text-[11px] text-[#9B9DA3]">{wrongAttempts} wrong {wrongAttempts === 1 ? "attempt" : "attempts"}</span>
        )}
        {matched.size === data.pairs.length && wrongAttempts === 0 && (
          <span className="text-[13px] font-medium text-[#0F6E56] fade-in">Perfect matching!</span>
        )}
      </div>
    </div>
  );
}
