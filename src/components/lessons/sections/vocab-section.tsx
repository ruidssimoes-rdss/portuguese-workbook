"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface VocabQuestion {
  id: string;
  type: "type-answer" | "mc";
  portugueseWord: string;
  englishWord: string;
  pronunciation?: string;
  options?: string[];
  correctIndex?: number;
}

interface VocabSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: VocabQuestion[];
  onComplete: (result: SectionResult) => void;
}

export function VocabSection({ sectionIndex, totalSections, showEnglish, questions, onComplete }: VocabSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mcSelections, setMcSelections] = useState<Record<string, number>>({});
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const allAnswered = questions.every((q) =>
    q.type === "mc" ? mcSelections[q.id] !== undefined : (answers[q.id] ?? "").trim() !== ""
  );

  const handleVerify = () => {
    const newResults: Record<string, { correct: boolean; accentHint?: string }> = {};
    for (const q of questions) {
      if (q.type === "mc") {
        newResults[q.id] = { correct: mcSelections[q.id] === q.correctIndex };
      } else {
        const check = checkAnswer((answers[q.id] ?? "").trim(), q.englishWord);
        newResults[q.id] = { correct: check.correct, accentHint: check.accentHint };
      }
    }
    setResults(newResults);
    setState("reviewed");
  };

  const handleNext = () => {
    const sectionAnswers = questions.map((q) => ({
      questionId: q.id,
      correct: results[q.id]?.correct ?? false,
      userAnswer: q.type === "mc" ? (q.options?.[mcSelections[q.id] ?? 0] ?? "") : (answers[q.id] ?? "").trim(),
      correctAnswer: q.type === "mc" ? (q.options?.[q.correctIndex ?? 0] ?? "") : q.englishWord,
      accentHint: results[q.id]?.accentHint,
    }));
    onComplete({
      sectionKey: "vocab",
      sectionName: "Vocabulário",
      answers: sectionAnswers,
      totalCorrect: sectionAnswers.filter((a) => a.correct).length,
      totalQuestions: sectionAnswers.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: Object.values(results).filter((r) => r.correct).length, total: questions.length }
    : undefined;

  return (
    <SectionShell
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      sectionNamePt="Vocabulário"
      sectionNameEn="Vocabulary"
      showEnglish={showEnglish}
      state={state}
      onVerify={handleVerify}
      onNext={handleNext}
      canVerify={allAnswered}
      score={score}
    >
      {questions.map((q, i) => (
        <div key={q.id} className="border border-[var(--border-primary)] rounded-[12px] p-5 bg-[var(--bg-card)]">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-[13px] font-semibold text-[var(--text-muted)]">{i + 1}.</span>
            <div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">&ldquo;{q.portugueseWord}&rdquo;</p>
              {q.pronunciation && <p className="text-[12px] text-[var(--text-muted)] font-mono">{q.pronunciation}</p>}
            </div>
          </div>

          {q.type === "type-answer" ? (
            <div>
              {state === "answering" ? (
                <input
                  ref={i === 0 ? firstInputRef : undefined}
                  type="text"
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder={showEnglish ? "Type the English translation..." : "Escreve a tradução..."}
                  className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[#003399] rounded-lg px-4 py-2.5 outline-none transition-colors placeholder:text-[var(--text-muted)]"
                  autoComplete="off"
                  spellCheck={false}
                />
              ) : (
                <div className={`px-4 py-2.5 rounded-lg border ${results[q.id]?.correct ? "border-[#059669] bg-[#F0FDF4]" : "border-[#DC2626] bg-[#FEF2F2]"}`}>
                  <p className={`text-[15px] font-medium ${results[q.id]?.correct ? "text-[#059669]" : "text-[#DC2626]"}`}>
                    {answers[q.id]}
                  </p>
                  {!results[q.id]?.correct && (
                    <p className="text-[13px] text-[#059669] mt-1">{q.englishWord}</p>
                  )}
                  {results[q.id]?.accentHint && (
                    <p className="text-[12px] text-[var(--text-muted)] mt-1">Atenção ao acento: {results[q.id].accentHint}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {q.options?.map((opt, oi) => {
                const isSelected = mcSelections[q.id] === oi;
                const isCorrect = oi === q.correctIndex;
                let cls = "border-[var(--border-primary)] hover:border-[#003399] cursor-pointer";
                if (state === "reviewed") {
                  if (isCorrect) cls = "border-[#059669] bg-[#F0FDF4]";
                  else if (isSelected && !isCorrect) cls = "border-[#DC2626] bg-[#FEF2F2]";
                  else cls = "border-[var(--border-primary)] opacity-50";
                } else if (isSelected) {
                  cls = "border-[#003399] bg-[rgba(0,51,153,0.05)]";
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={state === "reviewed"}
                    onClick={() => setMcSelections((prev) => ({ ...prev, [q.id]: oi }))}
                    className={`px-3 py-2.5 rounded-[10px] border text-[14px] text-left transition-all ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </SectionShell>
  );
}
