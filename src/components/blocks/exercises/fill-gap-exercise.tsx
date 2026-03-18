"use client";

import { useState, useEffect, useRef } from "react";
import type { ExerciseProps, FillGapExerciseData, AnswerResult } from "@/types/blocks";
import { checkAnswer } from "./shared/answer-validator";

export function FillGapExercise({
  data,
  onAnswer,
  showEnglish,
  disabled,
  className,
}: ExerciseProps<FillGapExerciseData>) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit() {
    if (!input.trim() || disabled || submitted) return;
    const result = checkAnswer(input, data.correctAnswer, data.acceptedAnswers);
    setSubmitted(true);
    setWasCorrect(result.correct);
    const answer: AnswerResult = {
      correct: result.correct,
      userAnswer: input.trim(),
      expectedAnswer: data.correctAnswer,
      acceptedAnswers: data.acceptedAnswers,
      points: result.correct ? 1 : 0,
      maxPoints: 1,
    };
    setTimeout(() => onAnswer(answer), 200);
  }

  const parts = data.sentence.split("_____");
  const inputWidth = Math.max(80, data.correctAnswer.length * 12);

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <p className="text-[16px] text-[#111827] leading-relaxed text-center">
        {parts[0]}
        {submitted ? (
          <span className={`inline-block px-2 py-0.5 rounded font-medium mx-1 ${wasCorrect ? "text-emerald-600 success-pulse" : "text-red-600"}`}>
            {wasCorrect ? data.correctAnswer : data.correctAnswer}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Tab") e.preventDefault();
            }}
            disabled={disabled}
            className="inline-block text-[16px] text-center text-[#111827] border-b-2 border-[#9CA3AF] focus:border-[#003399] bg-transparent outline-none mx-1 transition-colors duration-150"
            style={{ width: `${inputWidth}px` }}
          />
        )}
        {parts[1]}
      </p>
      {showEnglish && data.translation && (
        <p className="text-[13px] text-[#6B7280] italic text-center mt-3 fade-in" style={{ animationDelay: "100ms" }}>
          {data.translation}
        </p>
      )}
    </div>
  );
}
