"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface SentenceBuildProps {
  instruction: string;
  words: string[];
  correctSentence: string;
  acceptedAnswers?: string[];
  onComplete: (result: ExerciseResult) => void;
}

export function SentenceBuild({
  instruction,
  words,
  correctSentence,
  acceptedAnswers,
  onComplete,
}: SentenceBuildProps) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([...words]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const handleWordTap = (word: string, index: number) => {
    if (submitted) return;
    const nextAvailable = [...available];
    nextAvailable.splice(index, 1);
    setAvailable(nextAvailable);
    setPlaced([...placed, word]);
  };

  const handlePlacedTap = (word: string, index: number) => {
    if (submitted) return;
    const nextPlaced = [...placed];
    nextPlaced.splice(index, 1);
    setPlaced(nextPlaced);
    setAvailable([...available, word]);
  };

  const handleSubmit = () => {
    if (submitted || placed.length === 0) return;
    setSubmitted(true);

    const builtSentence = placed.join(" ");
    const check = checkAnswer(builtSentence, correctSentence, acceptedAnswers);
    const exerciseResult: ExerciseResult = {
      correct: check.correct,
      exactMatch: check.exactMatch,
      accentHint: check.accentHint,
      userAnswer: builtSentence,
      correctAnswer: correctSentence,
    };
    setResult(exerciseResult);

    const delay = check.correct ? 1500 : 2500;
    setTimeout(() => onComplete(exerciseResult), delay);
  };

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-4">
        {instruction}
      </p>

      {/* Staging area */}
      <div className="border-2 border-dashed border-[var(--border-primary)] rounded-[12px] p-4 min-h-[60px] mb-4 bg-[var(--bg-card)]">
        {placed.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {placed.map((word, i) => (
              <button
                key={`${word}-${i}`}
                type="button"
                onClick={() => handlePlacedTap(word, i)}
                disabled={submitted}
                className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-all ${
                  submitted
                    ? result?.correct
                      ? "border-[#059669] bg-[#F0FDF4] text-[#059669]"
                      : "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
                    : "border-[#003399] bg-[rgba(0,51,153,0.05)] text-[var(--text-primary)] hover:bg-[rgba(0,51,153,0.1)] cursor-pointer"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--text-muted)] text-center">
            Toca nas palavras abaixo para construir a frase
          </p>
        )}
      </div>

      {/* Word pool */}
      {!submitted && (
        <div className="flex flex-wrap gap-2 mb-4">
          {available.map((word, i) => (
            <button
              key={`${word}-${i}`}
              type="button"
              onClick={() => handleWordTap(word, i)}
              className="px-4 py-2 rounded-full border border-[var(--border-primary)] text-[14px] font-medium text-[var(--text-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer transition-all"
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {!submitted && placed.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2.5 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Verificar
        </button>
      )}

      {submitted && result && (
        <div className="mt-4 text-center">
          {result.correct ? (
            <p className="text-[15px] font-semibold text-[#059669]">Correto!</p>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-[#DC2626]">Não é bem</p>
              <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">
                {correctSentence}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
