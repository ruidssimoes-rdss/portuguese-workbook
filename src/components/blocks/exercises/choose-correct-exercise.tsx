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
    const base = "w-full text-left text-[14px] py-3 px-4 rounded-lg cursor-pointer transition-all duration-200";
    if (selected === null) {
      return `${base} border-[0.5px] border-[#E6E6E4] bg-white text-[#1F1F1F] hover:border-[#CFCFCB] hover:bg-[#F7F7F6]`;
    }
    if (index === data.correctIndex) return `${base} border-[1px] border-[#1F7A68] bg-[#E1F2ED]`;
    if (index === selected) return `${base} border-[1px] border-[#B94A32] bg-[#FBE9E4]`;
    return `${base} option-disabled border-[0.5px] border-[#E6E6E4] bg-white`;
  }

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <p className="text-[16px] font-medium text-[#1F1F1F] mb-4">{data.question}</p>
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
