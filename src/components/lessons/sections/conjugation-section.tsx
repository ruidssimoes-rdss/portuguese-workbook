"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface VerbData {
  verb: string;
  verbMeaning?: string;
  tense: string;
  tenseEnglish?: string;
  persons: Array<{ pronoun: string; correctForm: string }>;
}

interface ConjugationSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  verbs: VerbData[];
  onComplete: (result: SectionResult) => void;
}

export function ConjugationSection({ sectionIndex, totalSections, showEnglish, verbs, onComplete }: ConjugationSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const allKeys: string[] = [];
  verbs.forEach((v) => v.persons.forEach((p) => allKeys.push(`${v.verb}-${v.tense}-${p.pronoun}`)));

  const allAnswered = allKeys.every((k) => (answers[k] ?? "").trim() !== "");

  const handleVerify = () => {
    const newResults: Record<string, { correct: boolean; accentHint?: string }> = {};
    for (const v of verbs) {
      for (const p of v.persons) {
        const key = `${v.verb}-${v.tense}-${p.pronoun}`;
        const check = checkAnswer((answers[key] ?? "").trim(), p.correctForm);
        newResults[key] = { correct: check.correct, accentHint: check.accentHint };
      }
    }
    setResults(newResults);
    setState("reviewed");
  };

  const handleNext = () => {
    const sectionAnswers = verbs.flatMap((v) =>
      v.persons.map((p) => {
        const key = `${v.verb}-${v.tense}-${p.pronoun}`;
        return {
          questionId: key,
          correct: results[key]?.correct ?? false,
          userAnswer: (answers[key] ?? "").trim(),
          correctAnswer: p.correctForm,
          accentHint: results[key]?.accentHint,
        };
      })
    );
    onComplete({
      sectionKey: "conjugation",
      sectionName: "Conjugação",
      answers: sectionAnswers,
      totalCorrect: sectionAnswers.filter((a) => a.correct).length,
      totalQuestions: sectionAnswers.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: Object.values(results).filter((r) => r.correct).length, total: allKeys.length }
    : undefined;

  let inputIdx = 0;

  return (
    <SectionShell
      sectionIndex={sectionIndex}
      totalSections={totalSections}
      sectionNamePt="Conjugação"
      sectionNameEn="Conjugation"
      showEnglish={showEnglish}
      state={state}
      onVerify={handleVerify}
      onNext={handleNext}
      canVerify={allAnswered}
      score={score}
    >
      {verbs.map((v) => (
        <div key={`${v.verb}-${v.tense}`} className="border border-[var(--border-primary)] rounded-[12px] overflow-hidden bg-[var(--bg-card)]">
          <div className="px-5 py-4 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
              {v.verb.toUpperCase()}
              {v.verbMeaning && <span className="text-[13px] font-normal text-[var(--text-muted)] ml-2">({v.verbMeaning})</span>}
            </h3>
            <p className="text-[13px] text-[var(--text-muted)]">
              {v.tense}
              {v.tenseEnglish && <span className="ml-1">/ {v.tenseEnglish}</span>}
            </p>
          </div>
          {v.persons.map((p) => {
            const key = `${v.verb}-${v.tense}-${p.pronoun}`;
            const r = results[key];
            const currentIdx = inputIdx++;
            return (
              <div key={key} className={`flex items-center gap-4 px-5 py-3 border-b border-[var(--border-light)] last:border-b-0 ${
                state === "reviewed" ? (r?.correct ? "bg-[#F0FDF4]" : "bg-[#FEF2F2]") : ""
              }`}>
                <span className="text-[14px] font-medium text-[var(--text-muted)] w-20 shrink-0">{p.pronoun}</span>
                {state === "answering" ? (
                  <input
                    ref={currentIdx === 0 ? firstInputRef : undefined}
                    type="text"
                    value={answers[key] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 text-[15px] font-medium text-[var(--text-primary)] bg-transparent border-b-2 border-[var(--border-primary)] focus:border-[#003399] outline-none py-1 transition-colors placeholder:text-[var(--text-muted)]"
                    placeholder="..."
                    autoComplete="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      {r?.correct ? (
                        <span className="text-[15px] font-semibold text-[#059669]">{p.correctForm}</span>
                      ) : (
                        <>
                          <span className="text-[15px] font-medium text-[#DC2626] line-through mr-2">{answers[key] || "(vazio)"}</span>
                          <span className="text-[15px] font-semibold text-[#059669]">{p.correctForm}</span>
                        </>
                      )}
                      {r?.accentHint && <p className="text-[11px] text-[var(--text-muted)]">Acento: {r.accentHint}</p>}
                    </div>
                    {r?.correct ? (
                      <svg className="w-4 h-4 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </SectionShell>
  );
}
