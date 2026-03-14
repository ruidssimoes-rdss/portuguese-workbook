"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface FillInBlankProps {
  instruction: string;
  sentencePt: string;
  sentenceEn: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  onComplete: (result: ExerciseResult) => void;
}

export function FillInBlank({
  instruction,
  sentencePt,
  sentenceEn,
  correctAnswer,
  acceptedAnswers,
  onComplete,
}: FillInBlankProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const handleSubmit = () => {
    if (!value.trim() || submitted) return;
    setSubmitted(true);

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
    setTimeout(() => onComplete(exerciseResult), delay);
  };

  // Split sentence around the blank
  const blankMatch = sentencePt.match(/_+/);
  const blankIdx = blankMatch ? sentencePt.indexOf(blankMatch[0]) : -1;
  const before = blankIdx >= 0 ? sentencePt.substring(0, blankIdx) : sentencePt;
  const after = blankIdx >= 0 ? sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-4">
        {instruction}
      </p>

      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)]">
        <div className="text-center mb-4">
          <p className="text-[18px] font-semibold text-[var(--text-primary)] leading-relaxed">
            {blankIdx >= 0 ? (
              <>
                <span>{before}</span>
                {!submitted ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && value.trim()) handleSubmit();
                    }}
                    className="inline-block w-28 border-b-2 border-[var(--text-primary)] text-center text-[18px] font-semibold text-[var(--text-primary)] bg-transparent outline-none mx-1"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                ) : (
                  <span
                    className={`inline-block mx-1 px-2 py-0.5 rounded font-semibold ${
                      result?.correct ? "text-[#059669] bg-[#F0FDF4]" : "text-[#DC2626] bg-[#FEF2F2]"
                    }`}
                  >
                    {result?.correct ? correctAnswer : value}
                  </span>
                )}
                <span>{after}</span>
              </>
            ) : (
              sentencePt
            )}
          </p>
          <p className="text-[13px] text-[var(--text-muted)] mt-2">{sentenceEn}</p>
        </div>

        {!submitted && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`w-full py-2.5 text-[13px] font-semibold rounded-lg transition-colors ${
              value.trim()
                ? "bg-[var(--text-primary)] text-white hover:opacity-90 cursor-pointer"
                : "bg-[var(--border-light)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            Verificar
          </button>
        )}

        {submitted && result && (
          <div className="mt-4">
            {result.correct ? (
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[#059669]">Correto!</p>
                {result.accentHint && (
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                    Atenção ao acento: <span className="font-semibold text-[var(--text-primary)]">{result.accentHint}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[15px] font-semibold text-[#DC2626]">Não é bem</p>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                  A resposta correta é: <span className="font-semibold text-[var(--text-primary)]">{correctAnswer}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
