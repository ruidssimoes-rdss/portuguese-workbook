"use client";

import { useState, useRef } from "react";

interface MultipleChoiceProps {
  instruction: string;
  englishInstruction?: string;
  options: string[];
  correctIndex: number;
  onComplete: (result: { correct: boolean; userAnswer: string; correctAnswer: string }) => void;
}

export function MultipleChoice({
  instruction,
  englishInstruction,
  options,
  correctIndex,
  onComplete,
}: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  const completedRef = useRef(false);
  const resultRef = useRef<{ correct: boolean; userAnswer: string; correctAnswer: string } | null>(null);

  const seen = new Set<string>();
  const dedupedOptions = options.filter((o) => {
    const lower = o.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  const correctAnswer = options[correctIndex];
  const actualCorrectIndex = dedupedOptions.indexOf(correctAnswer);

  const handleSelect = (index: number) => {
    if (checked || completedRef.current) return;
    setSelectedIndex(index);

    // Auto-check after brief highlight
    setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setChecked(true);

      const isCorrect = index === actualCorrectIndex;
      resultRef.current = {
        correct: isCorrect,
        userAnswer: dedupedOptions[index],
        correctAnswer,
      };

      if (isCorrect) {
        setCanAdvance(true);
      } else {
        setTimeout(() => setCanAdvance(true), 500);
      }
    }, 300);
  };

  const handleAdvance = () => {
    if (resultRef.current) onComplete(resultRef.current);
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
      <div className="space-y-3">
        {dedupedOptions.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === actualCorrectIndex;

          let btnClass =
            "border-[var(--border-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer";
          if (isSelected && !checked) {
            btnClass = "border-[#003399] bg-[rgba(0,51,153,0.05)] scale-[1.01]";
          } else if (checked && isCorrectOption) {
            btnClass = "border-[#059669] bg-[#F0FDF4]";
          } else if (checked && isSelected && !isCorrectOption) {
            btnClass = "border-[#DC2626] bg-[#FEF2F2]";
          } else if (checked) {
            btnClass = "border-[var(--border-primary)] opacity-50";
          }

          return (
            <button
              key={`${option}-${i}`}
              type="button"
              disabled={checked}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-5 py-4 rounded-[12px] border text-[15px] transition-all duration-200 transform ${btnClass}`}
            >
              {option}
              {checked && isCorrectOption && (
                <span className="float-right text-[13px] font-medium text-[#059669]">Correto!</span>
              )}
              {checked && isSelected && !isCorrectOption && (
                <span className="float-right text-[13px] font-medium text-[#DC2626]">Incorreto</span>
              )}
            </button>
          );
        })}
      </div>
      {checked && selectedIndex !== actualCorrectIndex && (
        <p className="text-[13px] text-[#DC2626] mt-3">
          A resposta correta é: <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
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
