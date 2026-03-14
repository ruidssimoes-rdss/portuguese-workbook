"use client";

import { useState } from "react";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface MultipleChoiceProps {
  instruction: string;
  options: string[];
  correctIndex: number;
  onComplete: (result: ExerciseResult) => void;
}

export function MultipleChoice({
  instruction,
  options,
  correctIndex,
  onComplete,
}: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Deduplicate options defensively
  const seen = new Set<string>();
  const dedupedOptions = options.filter((o) => {
    const lower = o.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  const correctAnswer = options[correctIndex];
  const actualCorrectIndex = dedupedOptions.indexOf(correctAnswer);

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);

    const isCorrect = index === actualCorrectIndex;
    const delay = isCorrect ? 1500 : 2500;

    setTimeout(() => {
      onComplete({
        correct: isCorrect,
        userAnswer: dedupedOptions[index],
        correctAnswer,
      });
    }, delay);
  };

  return (
    <div>
      <p className="text-[16px] font-semibold text-[var(--text-primary)] mb-6">
        {instruction}
      </p>
      <div className="space-y-3">
        {dedupedOptions.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === actualCorrectIndex;
          const showResult = selectedIndex !== null;

          let btnClass =
            "border-[var(--border-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer";
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
              className={`w-full text-left px-5 py-4 rounded-[12px] border text-[15px] transition-all duration-200 ${btnClass}`}
            >
              {option}
              {showResult && isCorrectOption && (
                <span className="float-right text-[13px] font-medium text-[#059669]">
                  Correto!
                </span>
              )}
              {showResult && isSelected && !isCorrectOption && (
                <span className="float-right text-[13px] font-medium text-[#DC2626]">
                  Incorreto
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selectedIndex !== null && selectedIndex !== actualCorrectIndex && (
        <p className="text-[13px] text-[#DC2626] mt-3">
          A resposta correta é: <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}
