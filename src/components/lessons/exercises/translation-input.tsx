"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface TranslationInputProps {
  instruction: string;
  englishInstruction?: string;
  sourceText: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  onComplete: (result: ExerciseResult) => void;
}

export function TranslationInput({
  instruction,
  englishInstruction,
  sourceText,
  correctAnswer,
  acceptedAnswers,
  onComplete,
}: TranslationInputProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || submitted || completedRef.current) return;
    setSubmitted(true);
    completedRef.current = true;

    const check = checkAnswer(value.trim(), correctAnswer, acceptedAnswers);
    const exerciseResult: ExerciseResult = {
      correct: check.correct,
      exactMatch: check.exactMatch,
      accentHint: check.accentHint,
      userAnswer: value.trim(),
      correctAnswer,
    };
    setResult(exerciseResult);

    const delay = check.correct ? (check.accentHint ? 2000 : 1500) : 2500;
    timerRef.current = setTimeout(() => onComplete(exerciseResult), delay);
  };

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
        {instruction}
      </p>
      {englishInstruction && (
        <p className="text-[12px] text-[var(--text-muted)] mb-4">{englishInstruction}</p>
      )}
      {!englishInstruction && <div className="mb-3" />}

      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)]">
        <p className="text-[18px] font-semibold text-[var(--text-primary)] text-center mb-6">
          &ldquo;{sourceText}&rdquo;
        </p>

        {!submitted ? (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Escreve a tradução em português..."
              rows={2}
              className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-4 py-3 outline-none focus:border-[var(--text-primary)] transition-colors resize-none placeholder:text-[var(--text-muted)]"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={`w-full mt-3 py-2.5 text-[13px] font-semibold rounded-lg transition-colors ${
                value.trim()
                  ? "bg-[var(--text-primary)] text-white hover:opacity-90 cursor-pointer"
                  : "bg-[var(--border-light)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Verificar
            </button>
          </>
        ) : result ? (
          <div className="text-center">
            {result.correct ? (
              <>
                <p className="text-[15px] font-semibold text-[#059669]">Correto!</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">{correctAnswer}</p>
                {result.accentHint && (
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                    Atenção ao acento: <span className="font-semibold text-[var(--text-primary)]">{result.accentHint}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold text-[#DC2626]">Não é bem</p>
                <p className="text-[13px] text-[var(--text-muted)] mt-1 line-through">{result.userAnswer}</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">
                  {correctAnswer}
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
