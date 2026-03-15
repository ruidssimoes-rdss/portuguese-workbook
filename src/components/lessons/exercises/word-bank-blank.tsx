"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-types";

interface WordBankBlankProps {
  instruction: string;
  englishInstruction?: string;
  sentenceWithBlank: string;
  sentenceEnglish?: string;
  wordOptions: string[];
  correctWord: string;
  onComplete: (result: ExerciseResult) => void;
  id: string;
}

export function WordBankBlank({
  instruction,
  englishInstruction,
  sentenceWithBlank,
  sentenceEnglish,
  wordOptions,
  correctWord,
  onComplete,
  id,
}: WordBankBlankProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleWordTap = (word: string) => {
    if (submitted) return;
    setSelected(selected === word ? null : word);
  };

  const handleSubmit = () => {
    if (!selected || submitted || completedRef.current) return;
    setSubmitted(true);
    completedRef.current = true;

    const check = checkAnswer(selected, correctWord);
    setCorrect(check.correct);

    const delay = check.correct ? 1500 : 2500;
    timerRef.current = setTimeout(() => {
      onComplete({
        exerciseId: id,
        correct: check.correct,
        userAnswer: selected,
        correctAnswer: correctWord,
        accentHint: check.accentHint,
        exerciseType: "word-bank-blank",
      });
    }, delay);
  };

  // Split sentence around blank
  const blankMatch = sentenceWithBlank.match(/_+/);
  const blankIdx = blankMatch ? sentenceWithBlank.indexOf(blankMatch[0]) : -1;
  const before = blankIdx >= 0 ? sentenceWithBlank.substring(0, blankIdx) : sentenceWithBlank;
  const after = blankIdx >= 0 ? sentenceWithBlank.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
        {instruction}
      </p>
      {englishInstruction && (
        <p className="text-[12px] text-[var(--text-muted)] mb-4">{englishInstruction}</p>
      )}
      {!englishInstruction && <div className="mb-3" />}

      {/* Sentence with blank */}
      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)] mb-4">
        <p className="text-[18px] font-semibold text-[var(--text-primary)] leading-relaxed text-center">
          {before}
          <span className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-2 border-dashed text-center transition-all ${
            submitted
              ? correct
                ? "border-[#059669] bg-[#F0FDF4] text-[#059669]"
                : "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
              : selected
                ? "border-[#003399] bg-[rgba(0,51,153,0.05)] text-[var(--text-primary)]"
                : "border-[var(--text-muted)] text-[var(--text-muted)]"
          }`}>
            {submitted && !correct ? correctWord : selected ?? "___"}
          </span>
          {after}
        </p>
        {sentenceEnglish && (
          <p className="text-[13px] text-[var(--text-muted)] mt-2 text-center">{sentenceEnglish}</p>
        )}
      </div>

      {/* Word options */}
      {!submitted && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {wordOptions.map((word, i) => (
            <button
              key={`${word}-${i}`}
              type="button"
              onClick={() => handleWordTap(word)}
              className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-all cursor-pointer ${
                selected === word
                  ? "border-[#003399] bg-[rgba(0,51,153,0.05)] text-[var(--text-primary)] ring-2 ring-[#003399]/20"
                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)]"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {!submitted && selected && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2.5 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Verificar
        </button>
      )}

      {submitted && (
        <div className="mt-4 text-center">
          {correct ? (
            <p className="text-[15px] font-semibold text-[#059669]">Correto!</p>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-[#DC2626]">Não é bem</p>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                A resposta correta é: <span className="font-semibold text-[var(--text-primary)]">{correctWord}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
