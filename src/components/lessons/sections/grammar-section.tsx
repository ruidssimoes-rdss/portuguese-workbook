"use client";

import { useState } from "react";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface GrammarQuestion {
  id: string;
  type: "true-false" | "mc";
  statement?: string;
  statementPt?: string;
  isTrue?: boolean;
  explanation?: string;
  question?: string;
  questionEnglish?: string;
  options?: string[];
  correctIndex?: number;
}

interface GrammarSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: GrammarQuestion[];
  onComplete: (result: SectionResult) => void;
}

export function GrammarSection({ sectionIndex, totalSections, showEnglish, questions, onComplete }: GrammarSectionProps) {
  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean>>({});
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const allAnswered = questions.every((q) =>
    q.type === "true-false" ? tfAnswers[q.id] !== undefined : mcAnswers[q.id] !== undefined
  );

  const handleVerify = () => {
    const newResults: Record<string, boolean> = {};
    const newExplanations: Record<string, string> = {};
    for (const q of questions) {
      if (q.type === "true-false") {
        newResults[q.id] = tfAnswers[q.id] === q.isTrue;
        if (q.explanation) newExplanations[q.id] = q.explanation;
      } else {
        newResults[q.id] = mcAnswers[q.id] === q.correctIndex;
      }
    }
    setResults(newResults);
    setExplanations(newExplanations);
    setState("reviewed");
  };

  const handleNext = () => {
    const answers = questions.map((q) => ({
      questionId: q.id,
      correct: results[q.id] ?? false,
      userAnswer: q.type === "true-false"
        ? (tfAnswers[q.id] ? "Verdadeiro" : "Falso")
        : (q.options?.[mcAnswers[q.id] ?? 0] ?? ""),
      correctAnswer: q.type === "true-false"
        ? (q.isTrue ? "Verdadeiro" : "Falso")
        : (q.options?.[q.correctIndex ?? 0] ?? ""),
    }));
    onComplete({
      sectionKey: "grammar",
      sectionName: "Gramática",
      answers,
      totalCorrect: answers.filter((a) => a.correct).length,
      totalQuestions: answers.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: Object.values(results).filter(Boolean).length, total: questions.length }
    : undefined;

  return (
    <SectionShell
      sectionIndex={sectionIndex} totalSections={totalSections}
      sectionNamePt="Gramática" sectionNameEn="Grammar"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allAnswered} score={score}
    >
      {questions.map((q, i) => (
        <div key={q.id} className="border border-[var(--border-primary)] rounded-[12px] p-5 bg-[var(--bg-card)]">
          <span className="text-[13px] font-semibold text-[var(--text-muted)]">{i + 1}.</span>

          {q.type === "true-false" ? (
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
                Verdadeiro ou falso?{showEnglish && " / True or false?"}
              </p>
              <p className="text-[15px] font-medium text-[var(--text-primary)] mb-3">{q.statement}</p>
              <div className="flex gap-3">
                {([true, false] as const).map((val) => {
                  const label = val ? "Verdadeiro" : "Falso";
                  const isSelected = tfAnswers[q.id] === val;
                  const isCorrectOpt = val === q.isTrue;
                  let cls = "border-[var(--border-primary)] hover:border-[#003399] cursor-pointer";
                  if (state === "reviewed") {
                    if (isCorrectOpt) cls = "border-[#059669] bg-[#F0FDF4]";
                    else if (isSelected && !isCorrectOpt) cls = "border-[#DC2626] bg-[#FEF2F2]";
                    else cls = "border-[var(--border-primary)] opacity-50";
                  } else if (isSelected) {
                    cls = "border-[#003399] bg-[rgba(0,51,153,0.05)]";
                  }
                  return (
                    <button key={label} type="button" disabled={state === "reviewed"}
                      onClick={() => setTfAnswers((p) => ({ ...p, [q.id]: val }))}
                      className={`flex-1 py-2.5 rounded-[10px] border text-[14px] font-medium text-center transition-all ${cls}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {state === "reviewed" && explanations[q.id] && (
                <p className="text-[12px] text-[var(--text-secondary)] mt-2">{explanations[q.id]}</p>
              )}
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-[15px] font-medium text-[var(--text-primary)] mb-1">{q.question}</p>
              {showEnglish && q.questionEnglish && (
                <p className="text-[12px] text-[var(--text-muted)] mb-3">{q.questionEnglish}</p>
              )}
              <div className="space-y-2">
                {q.options?.map((opt, oi) => {
                  const isSelected = mcAnswers[q.id] === oi;
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
                    <button key={oi} type="button" disabled={state === "reviewed"}
                      onClick={() => setMcAnswers((p) => ({ ...p, [q.id]: oi }))}
                      className={`w-full text-left px-4 py-2.5 rounded-[10px] border text-[14px] transition-all ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </SectionShell>
  );
}
