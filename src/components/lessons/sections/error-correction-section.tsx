"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface ErrorSentence {
  id: string;
  incorrectSentence: string;
  correctSentence: string;
  acceptedAnswers?: string[];
  hintEnglish?: string;
}

interface ErrorCorrectionSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  sentences: ErrorSentence[];
  onComplete: (result: SectionResult) => void;
}

export function ErrorCorrectionSection({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: ErrorCorrectionSectionProps) {
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
      const check = checkAnswer((answers[s.id] ?? "").trim(), s.correctSentence, s.acceptedAnswers);
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
      correctAnswer: s.correctSentence,
      accentHint: results[s.id]?.accentHint,
    }));
    onComplete({
      sectionKey: "error-correction",
      sectionName: "Corrige os erros",
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
      sectionNamePt="Corrige os erros" sectionNameEn="Correct the errors"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allAnswered} score={score}
    >
      <p className="text-[13px] font-medium text-[#9B9DA3] uppercase tracking-[0.08em] mb-1">
        Cada frase tem um erro. Escreve a versão correta:
      </p>
      {showEnglish && (
        <p className="text-[12px] text-[#9B9DA3] mb-4">Each sentence has one error. Write the correct version:</p>
      )}

      {sentences.map((s, i) => {
        const r = results[s.id];
        return (
          <div key={s.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5 bg-white">
            <span className="text-[13px] font-medium text-[#9B9DA3]">{i + 1}.</span>
            <div className="bg-[#fef2f2] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-4 py-2.5 mt-2 mb-3">
              <p className="text-[14px] font-medium text-[#dc2626]">{s.incorrectSentence}</p>
            </div>
            {showEnglish && s.hintEnglish && (
              <p className="text-[12px] text-[#9B9DA3] mb-2">{s.hintEnglish}</p>
            )}
            {state === "answering" ? (
              <input
                ref={i === 0 ? firstRef : undefined}
                type="text"
                value={answers[s.id] ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                className="w-full text-[14px] text-[#111111] bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] focus:border-[#185FA5] rounded-lg px-4 py-2.5 outline-none transition-colors placeholder:text-[#9B9DA3]"
                placeholder="Escreve a frase corrigida..."
                autoComplete="off" spellCheck={false}
              />
            ) : (
              <div className={`px-4 py-2.5 rounded-lg border-[0.5px] ${r?.correct ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"}`}>
                <p className={`text-[14px] font-medium ${r?.correct ? "text-[#0F6E56]" : "text-[#dc2626]"}`}>
                  {answers[s.id]}
                </p>
                {!r?.correct && <p className="text-[13px] text-[#0F6E56] mt-1">{s.correctSentence}</p>}
                {r?.accentHint && <p className="text-[11px] text-[#9B9DA3] mt-1">Acento: {r.accentHint}</p>}
              </div>
            )}
          </div>
        );
      })}
    </SectionShell>
  );
}
