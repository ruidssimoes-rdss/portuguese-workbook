"use client";

import { useState } from "react";
import type { ExerciseProps, ChooseCorrectExerciseData, AnswerResult } from "@/types/blocks";

export function ChooseCorrectExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<ChooseCorrectExerciseData>) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(index: number) {
    if (disabled || selected !== null) return;
    setSelected(index);
    const correct = index === data.correctIndex;
    const answer: AnswerResult = {
      correct,
      userAnswer: data.options[index],
      expectedAnswer: data.options[data.correctIndex],
      explanation: data.explanation,
      points: correct ? 1 : 0,
      maxPoints: 1,
    };
    // Brief pause to show visual states before feedback
    setTimeout(() => onAnswer(answer), 400);
  }

  function optionClass(index: number): string {
    const base = "w-full text-left text-[15px] py-3 px-4 rounded-xl border cursor-pointer transition-all duration-200";
    if (selected === null) {
      return `${base} border-[#E5E7EB] bg-white text-[#111827] hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:scale-[1.01]`;
    }
    if (index === data.correctIndex) return `${base} option-correct`;
    if (index === selected) return `${base} option-incorrect`;
    return `${base} option-disabled border-[#E5E7EB] bg-white`;
  }

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <p className="text-[16px] font-medium text-[#111827] mb-4">{data.question}</p>
      <div className="space-y-3">
        {data.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={disabled || selected !== null}
            className={optionClass(i)}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <span className="fade-in" style={{ animationDelay: `${i * 75}ms` }}>{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
