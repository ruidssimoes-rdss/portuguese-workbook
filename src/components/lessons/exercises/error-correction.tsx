"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface ErrorCorrectionProps {
  instruction: string;
  englishInstruction?: string;
  incorrectSentence: string;
  correctSentence: string;
  acceptedAnswers?: string[];
  onComplete: (result: ExerciseResult) => void;
}

export function ErrorCorrection({
  instruction,
  englishInstruction,
  incorrectSentence,
  correctSentence,
  acceptedAnswers,
  onComplete,
}: ErrorCorrectionProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    setSubmitted(true);

    const check = checkAnswer(value.trim(), correctSentence, acceptedAnswers);
    const exerciseResult: ExerciseResult = {
      correct: check.correct,
      exactMatch: check.exactMatch,
      accentHint: check.accentHint,
      userAnswer: value.trim(),
      correctAnswer: correctSentence,
    };
    setResult(exerciseResult);

    const delay = check.correct ? (check.accentHint ? 2000 : 1500) : 2500;
    setTimeout(() => onComplete(exerciseResult), delay);
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
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg px-4 py-3 mb-5">
          <p className="text-[16px] font-semibold text-[#DC2626] text-center">
            {incorrectSentence}
          </p>
        </div>

        {!submitted ? (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) handleSubmit();
              }}
              placeholder="Escreve a frase corrigida..."
              className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-4 py-3 outline-none focus:border-[var(--text-primary)] transition-colors placeholder:text-[var(--text-muted)]"
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
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">{correctSentence}</p>
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
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">{correctSentence}</p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
