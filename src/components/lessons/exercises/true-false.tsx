"use client";

import { useState, useRef, useEffect } from "react";
interface TrueFalseProps {
  instruction: string;
  englishInstruction?: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
  onComplete: (result: { correct: boolean; userAnswer: string; correctAnswer: string }) => void;
}

export function TrueFalse({
  instruction,
  englishInstruction,
  statement,
  isTrue,
  explanation,
  onComplete,
}: TrueFalseProps) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const completedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSelect = (answer: boolean) => {
    if (selected !== null || completedRef.current) return;
    setSelected(answer);
    completedRef.current = true;

    const isCorrect = answer === isTrue;
    const delay = isCorrect ? 1500 : 2500;

    timerRef.current = setTimeout(() => {
      onComplete({
        correct: isCorrect,
        userAnswer: answer ? "Verdadeiro" : "Falso",
        correctAnswer: isTrue ? "Verdadeiro" : "Falso",
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

      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)] mb-4">
        <p className="text-[16px] font-semibold text-[var(--text-primary)] text-center">
          {statement}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((value) => {
          const label = value ? "Verdadeiro" : "Falso";
          const isSelected = selected === value;
          const isCorrectOption = value === isTrue;
          const showResult = selected !== null;

          let btnClass =
            "border-[var(--border-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer";
          if (showResult && isCorrectOption) {
            btnClass = "border-[#059669] bg-[#F0FDF4]";
          } else if (showResult && isSelected && !isCorrectOption) {
            btnClass = "border-[#DC2626] bg-[#FEF2F2]";
          } else if (showResult) {
            btnClass = "border-[var(--border-primary)] opacity-50";
          }

          return (
            <button
              key={label}
              type="button"
              disabled={selected !== null}
              onClick={() => handleSelect(value)}
              className={`px-5 py-4 rounded-[12px] border text-[15px] font-semibold text-center transition-all duration-200 ${btnClass}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-[12px] border border-[var(--border-light)]">
          <p className="text-[13px] text-[var(--text-secondary)]">{explanation}</p>
        </div>
      )}
    </div>
  );
}
