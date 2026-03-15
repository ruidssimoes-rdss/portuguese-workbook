"use client";

import { useState, useRef, useEffect } from "react";
import type { ExerciseResult } from "@/lib/exercise-types";

interface MatchWordProps {
  instruction: string;
  englishInstruction?: string;
  portugueseWord: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
  onComplete: (result: ExerciseResult) => void;
  id: string;
}

export function MatchWord({
  instruction,
  englishInstruction,
  portugueseWord,
  options,
  correctIndex,
  correctAnswer,
  onComplete,
  id,
}: MatchWordProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleSelect = (index: number) => {
    if (selectedIndex !== null || completedRef.current) return;
    setSelectedIndex(index);
    completedRef.current = true;

    const isCorrect = index === correctIndex;
    const delay = isCorrect ? 1500 : 2500;

    timerRef.current = setTimeout(() => {
      onComplete({
        exerciseId: id,
        correct: isCorrect,
        userAnswer: options[index],
        correctAnswer,
        exerciseType: "match-word",
      });
    }, delay);
  };

  return (
    <div>
      <p className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
        {instruction}
      </p>
      {englishInstruction && (
        <p className="text-[12px] text-[var(--text-muted)] mb-4">{englishInstruction}</p>
      )}
      {!englishInstruction && <div className="mb-3" />}

      {/* Portuguese word prominently displayed */}
      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)] mb-4 text-center">
        <p className="text-[20px] font-bold text-[var(--text-primary)]">{portugueseWord}</p>
      </div>

      {/* 2x2 grid of options */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === correctIndex;
          const showResult = selectedIndex !== null;

          let btnClass = "border-[var(--border-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer";
          if (showResult && isCorrectOption) {
            btnClass = "border-[#059669] bg-[#F0FDF4]";
          } else if (showResult && isSelected && !isCorrectOption) {
            btnClass = "border-[#DC2626] bg-[#FEF2F2]";
          } else if (showResult) {
            btnClass = "border-[var(--border-primary)] opacity-50";
          }

          return (
            <button
              key={`${option}-${i}`}
              type="button"
              disabled={selectedIndex !== null}
              onClick={() => handleSelect(i)}
              className={`px-4 py-3.5 rounded-[12px] border text-[15px] font-medium text-center transition-all duration-200 ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedIndex !== null && selectedIndex !== correctIndex && (
        <p className="text-[13px] text-[#DC2626] mt-3 text-center">
          A resposta correta é: <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}
