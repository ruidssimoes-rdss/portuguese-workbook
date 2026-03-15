"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";

interface TranslationInputProps {
  instruction: string;
  englishInstruction?: string;
  sourceText: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  onComplete: (result: { correct: boolean; userAnswer: string; correctAnswer: string; accentHint?: string }) => void;
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
  const [result, setResult] = useState<{ correct: boolean; accentHint?: string } | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const completedRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || submitted || completedRef.current) return;
    setSubmitted(true);
    completedRef.current = true;

    const check = checkAnswer(value.trim(), correctAnswer, acceptedAnswers);
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
      correctAnswer,
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
        <p className="text-[18px] font-semibold text-[var(--text-primary)] text-center mb-6">
          &ldquo;{sourceText}&rdquo;
        </p>

        {!submitted ? (
          <>
            <textarea
              ref={inputRef}
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
              className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[#003399] rounded-lg px-4 py-3 outline-none transition-colors resize-none placeholder:text-[var(--text-muted)]"
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
                <p className="text-[13px] text-[var(--text-muted)] mt-1 line-through">{value}</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)] mt-2">{correctAnswer}</p>
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
