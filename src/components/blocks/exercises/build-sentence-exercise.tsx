"use client";

import { useState } from "react";
import type { ExerciseProps, BuildSentenceExerciseData, AnswerResult } from "@/types/blocks";

export function BuildSentenceExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<BuildSentenceExerciseData>) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>([...data.scrambledWords]);
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  function placeWord(word: string, bankIndex: number) {
    if (disabled || submitted) return;
    setPlaced([...placed, word]);
    setBank(bank.filter((_, i) => i !== bankIndex));
  }

  function removeWord(placedIndex: number) {
    if (disabled || submitted) return;
    const word = placed[placedIndex];
    setPlaced(placed.filter((_, i) => i !== placedIndex));
    setBank([...bank, word]);
  }

  function handleSubmit() {
    if (disabled || submitted) return;
    const userSentence = placed.join(" ");
    const correctSentence = data.correctOrder.join(" ");
    const correct = userSentence.toLowerCase() === correctSentence.toLowerCase();
    setSubmitted(true);
    setWasCorrect(correct);
    const answer: AnswerResult = {
      correct,
      userAnswer: userSentence,
      expectedAnswer: correctSentence,
      points: correct ? 1 : 0,
      maxPoints: 1,
    };
    setTimeout(() => onAnswer(answer), 300);
  }

  const allPlaced = bank.length === 0;

  return (
    <div className={`py-6 fade-in ${className ?? ""}`}>
      <p className="text-[14px] text-[#9B9DA3] mb-4 text-center">
        Arrange: {data.translation}
      </p>

      {/* Answer area */}
      <div className={`min-h-[48px] pb-3 mb-4 flex flex-wrap gap-2 items-center justify-center ${
        placed.length === 0 ? "border-b border-dashed border-[rgba(0,0,0,0.06)]" : "border-b border-[0.5px] border-[rgba(0,0,0,0.06)]"
      } ${submitted ? (wasCorrect ? "success-pulse" : "error-shake") : ""}`}>
        {placed.length === 0 && (
          <span className="text-[13px] text-[#9B9DA3]">Tap words to build the sentence</span>
        )}
        {placed.map((word, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => removeWord(i)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium border border-[#111111] bg-[#111111] text-white cursor-pointer transition-all duration-150 ease-out word-pill-enter ${
              submitted ? (wasCorrect ? "option-correct" : "") : ""
            }`}
            disabled={disabled || submitted}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((word, i) => (
          <button
            key={`bank-${i}-${word}`}
            onClick={() => placeWord(word, i)}
            className="px-4 py-2 rounded-full text-[13px] font-normal border-[0.5px] border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71] transition-all duration-150 ease-out cursor-pointer bg-white"
            disabled={disabled || submitted}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Submit */}
      {allPlaced && !submitted && (
        <div className="flex justify-center mt-4 fade-in">
          <button
            onClick={handleSubmit}
            className="bg-[#111111] text-white text-[14px] font-medium rounded-lg px-5 py-2.5 hover:bg-[#111111]/90 transition-all duration-150 ease-out h-10 px-6"
            disabled={disabled}
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}
