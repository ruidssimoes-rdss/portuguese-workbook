"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-types";

interface ConjugationProps {
  instruction: string;
  englishInstruction?: string;
  verb: string;
  verbMeaning?: string;
  tense: string;
  pronoun: string;
  correctForm: string;
  onComplete: (result: ExerciseResult) => void;
  id: string;
}

export function Conjugation({
  instruction,
  englishInstruction,
  verb,
  verbMeaning,
  tense,
  pronoun,
  correctForm,
  onComplete,
  id,
}: ConjugationProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [accentHint, setAccentHint] = useState<string | undefined>();
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || submitted || completedRef.current) return;
    setSubmitted(true);
    completedRef.current = true;

    const check = checkAnswer(value.trim(), correctForm);
    setCorrect(check.correct);
    setAccentHint(check.accentHint);

    const delay = check.correct ? (check.accentHint ? 2000 : 1500) : 2500;
    timerRef.current = setTimeout(() => {
      onComplete({
        exerciseId: id,
        correct: check.correct,
        userAnswer: value.trim(),
        correctAnswer: correctForm,
        accentHint: check.accentHint,
        exerciseType: "conjugation",
      });
    }, delay);
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
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{verb}</h3>
        <span className="text-[13px] text-[var(--text-muted)]">{tense}</span>
        {verbMeaning && <span className="text-[13px] text-[var(--text-muted)]">({verbMeaning})</span>}
      </div>

      <div className="border border-[var(--border-primary)] rounded-[12px] overflow-hidden bg-[var(--bg-card)]">
        <div className={`flex items-center gap-4 px-5 py-4 ${submitted ? (correct ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]") : ""}`}>
          <span className="text-[15px] font-medium text-[var(--text-muted)] w-20 shrink-0">
            {pronoun}
          </span>
          {!submitted ? (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Conjugação..."
              className="flex-1 text-[15px] font-semibold text-[var(--text-primary)] bg-transparent border-b border-[var(--border-primary)] focus:border-[var(--text-primary)] outline-none py-1 placeholder:text-[var(--text-muted)] placeholder:font-normal transition-colors"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div>
                {correct ? (
                  <div>
                    <span className="text-[15px] font-semibold text-[#059669]">{correctForm}</span>
                    {accentHint && (
                      <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                        Atenção ao acento: <span className="font-semibold text-[var(--text-primary)]">{accentHint}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-[15px] font-semibold text-[#DC2626] line-through mr-2">{value || "(vazio)"}</span>
                    <span className="text-[15px] font-semibold text-[#059669]">{correctForm}</span>
                  </div>
                )}
              </div>
              {correct ? (
                <svg className="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
          )}
        </div>
      </div>

      {!submitted && value.trim() && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 w-full py-2.5 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Verificar
        </button>
      )}
    </div>
  );
}
