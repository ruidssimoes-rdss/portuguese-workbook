"use client";

import { useState, useEffect, useRef } from "react";
import type { ExerciseProps, SpotErrorExerciseData, AnswerResult } from "@/types/blocks";
import { checkAnswer } from "./shared/answer-validator";

export function SpotErrorExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<SpotErrorExerciseData>) {
  const [step, setStep] = useState<"tap" | "type">("tap");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [shakeWord, setShakeWord] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const words = data.sentence.split(/\s+/);

  useEffect(() => {
    if (step === "type") inputRef.current?.focus();
  }, [step]);

  function handleWordTap(word: string) {
    if (disabled || step !== "tap") return;
    const wordClean = word.replace(/[.,!?;:]+$/, "");
    const errorClean = data.errorWord.replace(/[.,!?;:]+$/, "");

    if (wordClean.toLowerCase() === errorClean.toLowerCase()) {
      setSelectedWord(word);
      setStep("type");
    } else {
      setShakeWord(word);
      setTimeout(() => setShakeWord(null), 500);
    }
  }

  function handleSubmit() {
    if (!input.trim() || disabled) return;
    const result = checkAnswer(input, data.correctWord);
    const answer: AnswerResult = {
      correct: result.correct,
      userAnswer: input.trim(),
      expectedAnswer: data.correctWord,
      points: result.correct ? 1 : 0,
      maxPoints: 1,
    };
    onAnswer(answer);
  }

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <p className="text-[13px] text-[#6B7280] mb-4">
        {step === "tap" ? "Find the error" : "Type the correction"}
      </p>

      <div className="flex flex-wrap gap-1 justify-center mb-4">
        {words.map((word, i) => {
          const isSelected = selectedWord === word;
          const isShaking = shakeWord === word;
          const isFoundError = step === "type" && !isSelected;

          return (
            <button
              key={i}
              onClick={() => handleWordTap(word)}
              disabled={disabled || step === "type"}
              className={`inline-block py-1 px-2 rounded text-[16px] text-[#111827] transition-all duration-150 ${
                isSelected ? "bg-red-50 border border-red-300" :
                isShaking ? "error-shake bg-red-50" :
                isFoundError ? "opacity-50" :
                step === "tap" ? "hover:bg-[#F3F4F6] cursor-pointer" : ""
              }`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {step === "type" && (
        <div className="flex flex-col items-center fade-in">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            disabled={disabled}
            placeholder="Type the correct word..."
            className="w-full max-w-[300px] px-4 py-3 text-[16px] text-center border border-[#E5E7EB] rounded-full bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#003399] transition-all duration-150 input-focus-glow"
          />
        </div>
      )}
    </div>
  );
}
