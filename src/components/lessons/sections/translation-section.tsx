"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface TransSentence {
  id: string;
  sourceText: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
}

interface TranslationSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  sentences: TransSentence[];
  onComplete: (result: SectionResult) => void;
}

export function TranslationSection({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: TranslationSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const allAnswered = sentences.every((s) => (answers[s.id] ?? "").trim() !== "");

  const handleVerify = () => {
    const r: Record<string, { correct: boolean; accentHint?: string }> = {};
    for (const s of sentences) {
      const check = checkAnswer((answers[s.id] ?? "").trim(), s.correctAnswer, s.acceptedAnswers);
      r[s.id] = { correct: check.correct, accentHint: check.accentHint };
    }
    setResults(r);
    setState("reviewed");
  };

  const handleNext = () => {
    const ans = sentences.map((s) => ({
      questionId: s.id,
      correct: results[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(),
      correctAnswer: s.correctAnswer,
      accentHint: results[s.id]?.accentHint,
    }));
    onComplete({
      sectionKey: "translation",
      sectionName: "Tradução",
      answers: ans,
      totalCorrect: ans.filter((a) => a.correct).length,
      totalQuestions: ans.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: Object.values(results).filter((r) => r.correct).length, total: sentences.length }
    : undefined;

  return (
    <SectionShell
      sectionIndex={sectionIndex} totalSections={totalSections}
      sectionNamePt="Tradução" sectionNameEn="Translation"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allAnswered} score={score}
    >
      <p className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.08em] mb-1">
        Traduz para português:
      </p>
      {showEnglish && <p className="text-[12px] text-[var(--text-muted)] mb-4">Translate to Portuguese:</p>}

      {sentences.map((s, i) => {
        const r = results[s.id];
        return (
          <div key={s.id} className="border border-[var(--border-primary)] rounded-[12px] p-5 bg-[var(--bg-card)]">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[13px] font-semibold text-[var(--text-muted)]">{i + 1}.</span>
              <p className="text-[15px] font-medium text-[var(--text-primary)]">&ldquo;{s.sourceText}&rdquo;</p>
            </div>
            {state === "answering" ? (
              <textarea
                ref={i === 0 ? firstRef : undefined}
                value={answers[s.id] ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                rows={2}
                className="w-full text-[15px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] focus:border-[#003399] rounded-lg px-4 py-2.5 outline-none transition-colors resize-none placeholder:text-[var(--text-muted)]"
                placeholder="Escreve a tradução em português..."
                autoComplete="off" spellCheck={false}
              />
            ) : (
              <div className={`px-4 py-2.5 rounded-lg border ${r?.correct ? "border-[#059669] bg-[#F0FDF4]" : "border-[#DC2626] bg-[#FEF2F2]"}`}>
                <p className={`text-[15px] font-medium ${r?.correct ? "text-[#059669]" : "text-[#DC2626]"}`}>
                  {answers[s.id]}
                </p>
                {!r?.correct && <p className="text-[13px] text-[#059669] mt-1">{s.correctAnswer}</p>}
                {r?.accentHint && <p className="text-[11px] text-[var(--text-muted)] mt-1">Acento: {r.accentHint}</p>}
              </div>
            )}
          </div>
        );
      })}
    </SectionShell>
  );
}
