"use client";

import { useState, useRef } from "react";
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
  const [checked, setChecked] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const completedRef = useRef(false);
  const resultRef = useRef<ExerciseResult | null>(null);

  const handleSelect = (index: number) => {
    if (checked || completedRef.current) return;
    setSelectedIndex(index);

    setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setChecked(true);

      const isCorrect = index === correctIndex;
      resultRef.current = {
        exerciseId: id,
        correct: isCorrect,
        userAnswer: options[index],
        correctAnswer,
        exerciseType: "match-word",
      };

      if (isCorrect) {
        setCanAdvance(true);
      } else {
        setTimeout(() => setCanAdvance(true), 500);
      }
    }, 300);
  };

  const handleAdvance = () => {
    if (resultRef.current) onComplete(resultRef.current);
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

      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)] mb-4 text-center">
        <p className="text-[20px] font-bold text-[var(--text-primary)]">{portugueseWord}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === correctIndex;

          let btnClass = "border-[var(--border-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer";
          if (isSelected && !checked) {
            btnClass = "border-[#003399] bg-[rgba(0,51,153,0.05)] scale-[1.01]";
          } else if (checked && isCorrectOption) {
            btnClass = "border-[#059669] bg-[#F0FDF4]";
          } else if (checked && isSelected && !isCorrectOption) {
            btnClass = "border-[#DC2626] bg-[#FEF2F2]";
          } else if (checked) {
            btnClass = "border-[var(--border-primary)] opacity-50";
          }

          return (
            <button
              key={`${option}-${i}`}
              type="button"
              disabled={checked}
              onClick={() => handleSelect(i)}
              className={`px-4 py-3.5 rounded-[12px] border text-[15px] font-medium text-center transition-all duration-200 transform ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {checked && selectedIndex !== correctIndex && (
        <p className="text-[13px] text-[#DC2626] mt-3 text-center">
          A resposta correta é: <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}

      {canAdvance && (
        <button
          type="button"
          onClick={handleAdvance}
          className="mt-4 w-full py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] text-[14px] font-medium rounded-[12px] hover:bg-[var(--border-light)] transition-colors cursor-pointer"
        >
          Próximo →
        </button>
      )}
    </div>
  );
}
