"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";

interface FillInBlankProps {
  instruction: string;
  englishInstruction?: string;
  sentencePt: string;
  sentenceEn: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  onComplete: (result: { correct: boolean; userAnswer: string; correctAnswer: string; accentHint?: string }) => void;
}

export function FillInBlank({
  instruction,
  englishInstruction,
  sentencePt,
  sentenceEn,
  correctAnswer,
  acceptedAnswers,
  onComplete,
}: FillInBlankProps) {
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

  const blankMatch = sentencePt.match(/_+/);
  const blankIdx = blankMatch ? sentencePt.indexOf(blankMatch[0]) : -1;
  const before = blankIdx >= 0 ? sentencePt.substring(0, blankIdx) : sentencePt;
  const after = blankIdx >= 0 ? sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";

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
        <div className="text-center mb-4">
          <p className="text-[18px] font-semibold text-[var(--text-primary)] leading-relaxed">
            {blankIdx >= 0 ? (
              <>
                <span>{before}</span>
                {!submitted ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && value.trim()) handleSubmit();
                    }}
                    className="inline-block w-28 border-b-2 border-[var(--border-primary)] focus:border-[#003399] text-center text-[18px] font-semibold text-[var(--text-primary)] bg-transparent outline-none mx-1 transition-colors"
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
            className={`w-full py-2.5 text-[14px] font-medium rounded-[12px] transition-all ${
              value.trim()
                ? "bg-[#003399] text-white hover:opacity-90 cursor-pointer"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
            }`}
          >
            Verificar
          </button>
        )}

        {submitted && result && (
          <div className="mt-4 text-center">
            {result.correct ? (
              <>
                <p className="text-[15px] font-semibold text-[#059669]">Correto!</p>
                {result.accentHint && (
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">
                    Atenção ao acento: <span className="font-semibold text-[var(--text-primary)]">{result.accentHint}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold text-[#DC2626]">Não é bem</p>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                  A resposta correta é: <span className="font-semibold text-[var(--text-primary)]">{correctAnswer}</span>
                </p>
              </>
            )}
          </div>
        )}
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
