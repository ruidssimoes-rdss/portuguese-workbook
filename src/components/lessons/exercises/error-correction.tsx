"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";

interface ErrorCorrectionProps {
  instruction: string;
  englishInstruction?: string;
  incorrectSentence: string;
  correctSentence: string;
  acceptedAnswers?: string[];
  onComplete: (result: { correct: boolean; userAnswer: string; correctAnswer: string; accentHint?: string }) => void;
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
  const [result, setResult] = useState<{ correct: boolean; accentHint?: string } | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const completedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || submitted || completedRef.current) return;
    setSubmitted(true);
    completedRef.current = true;

    const check = checkAnswer(value.trim(), correctSentence, acceptedAnswers);
    setResult({ correct: check.correct, accentHint: check.accentHint });

    if (check.correct) {
      setCanAdvance(true);
    } else {
      setTimeout(() => setCanAdvance(true), 500);
    }
  };

  const handleAdvance = () => {
    onComplete({
      correct: result?.correct ?? false,
      accentHint: result?.accentHint,
      userAnswer: value.trim(),
      correctAnswer: correctSentence,
    });
  };

  return (
    <div>
      <p className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
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
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) handleSubmit();
              }}
              placeholder="Escreve a frase corrigida..."
              className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[#003399] rounded-lg px-4 py-3 outline-none transition-colors placeholder:text-[var(--text-muted)]"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={`w-full mt-3 py-2.5 text-[14px] font-medium rounded-[12px] transition-all ${
                value.trim()
                  ? "bg-[#003399] text-white hover:opacity-90 cursor-pointer"
                  : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
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
                <p className="text-[13px] text-[var(--text-muted)] mt-1 line-through">{value}</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">{correctSentence}</p>
              </>
            )}
          </div>
        ) : null}
      </div>

      {canAdvance && (
        <button
          type="button"
          onClick={handleAdvance}
          className="mt-4 w-full py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] text-[14px] font-medium rounded-[12px] hover:bg-[var(--border-light)] transition-colors cursor-pointer"
        >
          Próximo →
        </button>
      )}
    </div>
  );
}
