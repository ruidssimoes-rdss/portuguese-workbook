"use client";

import { useState, useEffect, useRef } from "react";
import type { ExerciseProps, TranslateExerciseData, AnswerResult } from "@/types/blocks";
import { checkAnswer } from "./shared/answer-validator";

export function TranslateExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<TranslateExerciseData>) {
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
    // Brief delay to show visual state before feedback
    setTimeout(() => onAnswer(answer), 200);
  }

  const dirLabel = data.direction === "pt-to-en" ? "Translate to English" : "Translate to Portuguese";

  const inputStateClass = submitted
    ? wasCorrect ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"
    : "";

  const containerShake = submitted && !wasCorrect ? "error-shake" : "";

  return (
    <div className={`flex flex-col items-center py-6 fade-in ${containerShake} ${className ?? ""}`}>
      <p className="text-[13px] text-[#6C6B71] mb-4">{dirLabel}</p>
      <p className="text-[24px] font-medium text-[#111111]">{data.word}</p>
      {data.pronunciation && data.direction === "pt-to-en" && (
        <p className="text-[13px] text-[#9B9DA3] italic mt-1">{data.pronunciation}</p>
      )}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        disabled={disabled || submitted}
        readOnly={submitted}
        placeholder="Type your answer..."
        className={`mt-6 w-full max-w-[400px] text-[14px] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2 outline-none focus:border-[rgba(0,0,0,0.12)] text-center text-[#111111] placeholder:text-[#9B9DA3] transition-all duration-150 ${inputStateClass}`}
      />
      {input.trim() && !submitted && !disabled && (
        <button
          onClick={handleSubmit}
          className="mt-3 text-[13px] font-medium text-[#185FA5] hover:text-[#185FA5]/80 transition-colors fade-in cursor-pointer"
        >
          Submit
        </button>
      )}
      {submitted && wasCorrect && data.pronunciation && (
        <p className="text-[13px] text-[#9B9DA3] italic mt-2 fade-in">{data.pronunciation}</p>
      )}
    </div>
  );
}
