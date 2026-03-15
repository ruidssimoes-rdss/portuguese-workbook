"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface FillSentence {
  id: string;
  sentencePt: string;
  sentenceEn?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
}

interface FillBlankSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  sentences: FillSentence[];
  onComplete: (result: SectionResult) => void;
}

export function FillBlankSection({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: FillBlankSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLInputElement>(null);

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
      sectionKey: "fill-blank",
      sectionName: "Completa as frases",
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
      sectionNamePt="Completa as frases" sectionNameEn="Complete the sentences"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allAnswered} score={score}
    >
      {sentences.map((s, i) => {
        const blankMatch = s.sentencePt.match(/_+/);
        const blankIdx = blankMatch ? s.sentencePt.indexOf(blankMatch[0]) : -1;
        const before = blankIdx >= 0 ? s.sentencePt.substring(0, blankIdx) : s.sentencePt;
        const after = blankIdx >= 0 ? s.sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";
        const r = results[s.id];

        return (
          <div key={s.id} className="border border-[var(--border-primary)] rounded-[12px] p-5 bg-[var(--bg-card)]">
            <span className="text-[13px] font-semibold text-[var(--text-muted)]">{i + 1}.</span>
            <p className="text-[16px] font-semibold text-[var(--text-primary)] mt-1 leading-relaxed">
              {before}
              {state === "answering" ? (
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="text"
                  value={answers[s.id] ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="inline-block w-28 border-b-2 border-[var(--border-primary)] focus:border-[#003399] text-center text-[16px] font-semibold text-[var(--text-primary)] bg-transparent outline-none mx-1 transition-colors"
                  autoComplete="off" spellCheck={false}
                  placeholder={s.hint ?? "___"}
                />
              ) : (
                <span className={`inline-block mx-1 px-2 py-0.5 rounded font-semibold ${r?.correct ? "text-[#059669] bg-[#F0FDF4]" : "text-[#DC2626] bg-[#FEF2F2]"}`}>
                  {r?.correct ? s.correctAnswer : answers[s.id]}
                </span>
              )}
              {after}
            </p>
            {showEnglish && s.sentenceEn && <p className="text-[13px] text-[var(--text-muted)] mt-1">{s.sentenceEn}</p>}
            {state === "reviewed" && !r?.correct && (
              <p className="text-[13px] text-[#059669] mt-1">Resposta: {s.correctAnswer}</p>
            )}
            {state === "reviewed" && r?.accentHint && (
              <p className="text-[11px] text-[var(--text-muted)] mt-1">Acento: {r.accentHint}</p>
            )}
          </div>
        );
      })}
    </SectionShell>
  );
}
