"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface WordBankProps {
  instruction: string;
  englishInstruction?: string;
  textWithBlanks: string;
  blanks: Array<{ correctAnswer: string; acceptedAnswers?: string[] }>;
  wordBank: string[];
  onComplete: (results: ExerciseResult[]) => void;
}

export function WordBank({
  instruction,
  englishInstruction,
  textWithBlanks,
  blanks,
  wordBank,
  onComplete,
}: WordBankProps) {
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(
    new Array(blanks.length).fill(null)
  );
  const [activeBlankIndex, setActiveBlankIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);

  // Track which word bank items are used
  const usedWords = new Set(filledBlanks.filter(Boolean) as string[]);

  const handleWordTap = (word: string) => {
    if (submitted) return;
    if (usedWords.has(word)) return;

    // Fill the active blank
    const nextBlanks = [...filledBlanks];
    nextBlanks[activeBlankIndex] = word;
    setFilledBlanks(nextBlanks);

    // Advance to next empty blank
    const nextEmpty = nextBlanks.findIndex((b, i) => b === null && i > activeBlankIndex);
    if (nextEmpty !== -1) {
      setActiveBlankIndex(nextEmpty);
    } else {
      const firstEmpty = nextBlanks.findIndex((b) => b === null);
      if (firstEmpty !== -1) setActiveBlankIndex(firstEmpty);
    }
  };

  const handleBlankTap = (index: number) => {
    if (submitted) return;
    if (filledBlanks[index] !== null) {
      // Remove word from blank
      const nextBlanks = [...filledBlanks];
      nextBlanks[index] = null;
      setFilledBlanks(nextBlanks);
      setActiveBlankIndex(index);
    } else {
      setActiveBlankIndex(index);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);

    const exerciseResults: ExerciseResult[] = blanks.map((blank, i) => {
      const userAnswer = filledBlanks[i] ?? "";
      const check = checkAnswer(userAnswer, blank.correctAnswer, blank.acceptedAnswers);
      return {
        correct: check.correct,
        exactMatch: check.exactMatch,
        accentHint: check.accentHint,
        userAnswer,
        correctAnswer: blank.correctAnswer,
      };
    });

    setResults(exerciseResults);
    setTimeout(() => onComplete(exerciseResults), 2500);
  };

  const allFilled = filledBlanks.every((b) => b !== null);
  const correctCount = results.filter((r) => r.correct).length;

  // Split text into segments around blanks
  const segments = textWithBlanks.split(/___/);

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
        {instruction}
      </p>
      {englishInstruction && (
        <p className="text-[12px] text-[var(--text-muted)] mb-4">{englishInstruction}</p>
      )}
      {!englishInstruction && <div className="mb-3" />}

      {/* Text with blanks */}
      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)] mb-4">
        <p className="text-[16px] text-[var(--text-primary)] leading-relaxed">
          {segments.map((seg, i) => (
            <span key={i}>
              {seg}
              {i < blanks.length && (
                <button
                  type="button"
                  onClick={() => handleBlankTap(i)}
                  className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 border-dashed text-center text-[15px] font-semibold transition-all ${
                    submitted
                      ? results[i]?.correct
                        ? "border-[#059669] bg-[#F0FDF4] text-[#059669]"
                        : "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
                      : i === activeBlankIndex
                        ? "border-[#003399] bg-[rgba(0,51,153,0.05)] text-[var(--text-primary)]"
                        : filledBlanks[i]
                          ? "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer"
                          : "border-[var(--text-muted)] text-[var(--text-muted)] cursor-pointer"
                  }`}
                >
                  {submitted && !results[i]?.correct
                    ? blanks[i].correctAnswer
                    : filledBlanks[i] ?? `${i + 1}`}
                </button>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Word bank */}
      {!submitted && (
        <div className="flex flex-wrap gap-2 mb-4">
          {wordBank.map((word, i) => {
            const isUsed = usedWords.has(word);
            return (
              <button
                key={`${word}-${i}`}
                type="button"
                disabled={isUsed}
                onClick={() => handleWordTap(word)}
                className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-all ${
                  isUsed
                    ? "border-[var(--border-light)] text-[var(--text-muted)] opacity-40"
                    : "border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      )}

      {!submitted && allFilled && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2.5 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Verificar
        </button>
      )}

      {submitted && (
        <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-[12px] border border-[var(--border-light)] text-center">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            {correctCount} / {blanks.length} corretas
          </p>
        </div>
      )}
    </div>
  );
}
