"use client";

import { useState, useEffect, useRef } from "react";
import type { ExerciseProps, ConjugateExerciseData, AnswerResult } from "@/types/blocks";
import { checkAnswer } from "./shared/answer-validator";

export function ConjugateExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<ConjugateExerciseData>) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit() {
    if (!input.trim() || disabled || submitted) return;
    const result = checkAnswer(input, data.correctForm, data.acceptedForms);
    setSubmitted(true);
    setWasCorrect(result.correct);
    const answer: AnswerResult = {
      correct: result.correct,
      userAnswer: input.trim(),
      expectedAnswer: data.correctForm,
      acceptedAnswers: data.acceptedForms,
      points: result.correct ? 1 : 0,
      maxPoints: 1,
    };
    setTimeout(() => onAnswer(answer), 200);
  }

  return (
    <div className={`flex flex-col items-center py-6 fade-in ${className ?? ""}`}>
      <span className="text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F7F7F5] text-[#6C6B71] mb-3 fade-in">
        {data.tenseLabel || data.tense}
      </span>
      <p className="text-[20px] font-medium text-[#111111] fade-in">{data.verb}</p>
      <p className="text-[13px] text-[#9B9DA3] mt-0.5 fade-in" style={{ animationDelay: "50ms" }}>{data.verbTranslation}</p>
      <p className="text-[16px] font-medium text-[#185FA5] mt-5 fade-in" style={{ animationDelay: "100ms" }}>{data.pronoun}</p>

      <div className={`mt-4 w-full max-w-[400px] rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] p-4 ${submitted ? (wasCorrect ? "exercise-correct" : "exercise-incorrect error-shake") : ""}`}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          disabled={disabled || submitted}
          readOnly={submitted}
          placeholder="Type the conjugated form..."
          className="w-full text-[16px] text-center text-[#111111] bg-transparent placeholder:text-[#9B9DA3] focus:outline-none"
        />
      </div>
      {submitted && wasCorrect && (
        <p className="text-[14px] font-medium text-[#185FA5] mt-3 success-pulse">{data.correctForm}</p>
      )}
      {submitted && !wasCorrect && (
        <p className="text-[14px] text-[#6C6B71] mt-3 fade-in">{data.correctForm}</p>
      )}
    </div>
  );
}
