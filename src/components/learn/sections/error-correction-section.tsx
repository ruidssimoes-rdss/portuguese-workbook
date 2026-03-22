"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";

interface ErrorSentence { id: string; incorrectSentence: string; correctSentence: string; acceptedAnswers?: string[]; hintEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  sentences: ErrorSentence[]; onComplete: (result: SectionResult) => void;
}

export function ErrorCorrectionSectionNew({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => firstRef.current?.focus(), 100); return () => clearTimeout(t); }, []);

  const allFilled = sentences.every((s) => (answers[s.id] ?? "").trim() !== "");

  function verify() {
    const r: typeof results = {};
    for (const s of sentences) {
      const chk = checkAnswer((answers[s.id] ?? "").trim(), s.correctSentence, s.acceptedAnswers);
      r[s.id] = { correct: chk.correct, accentHint: chk.accentHint };
    }
    setResults(r); setPhase("reviewed");
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id, correct: results[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(), correctAnswer: s.correctSentence,
      accentHint: results[s.id]?.accentHint,
    }));
    onComplete({ sectionKey: "error-correction", sectionName: "Corrige os erros", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  const correctCount = Object.values(results).filter((r) => r.correct).length;

  return (
    <div>
      {sentences.map((s, i) => {
        const r = results[s.id];
        return (
          <div key={s.id} className={`border-[0.5px] rounded-lg p-[12px_14px] mb-1.5 ${
            phase === "reviewed" ? (r?.correct ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#FCEBEB]") : "border-[rgba(0,0,0,0.06)]"
          }`}>
            <div className="text-[11px] text-[#9B9DA3]">{i + 1}</div>

            {/* Error sentence */}
            <div className="bg-[#FCEBEB] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-[6px] px-3 py-2 mt-1">
              <p className="text-[13px] font-medium text-[#dc2626]">{s.incorrectSentence}</p>
            </div>
            {showEnglish && s.hintEnglish && <div className="text-[11px] text-[#9B9DA3] mt-1">{s.hintEnglish}</div>}

            {phase === "answering" ? (
              <input ref={i === 0 ? firstRef : undefined} type="text" value={answers[s.id] ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                className="w-full mt-2 px-[10px] py-[7px] text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-[6px] outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                placeholder="Escreve a frase corrigida..." autoComplete="off" spellCheck={false}
              />
            ) : (
              <>
                {r?.correct ? (
                  <div className="text-[12px] font-medium text-[#0F6E56] mt-1.5">{answers[s.id]}</div>
                ) : (
                  <div className="text-[12px] font-medium text-[#dc2626] mt-1.5">
                    Not quite <span className="font-normal">→ {s.correctSentence}</span>
                  </div>
                )}
                {r?.accentHint && <span className="inline-block mt-1 px-[10px] py-1 text-[11px] text-[#854F0B] bg-[#FAEEDA] rounded-[5px]">Atenção ao acento: {r.accentHint}</span>}
              </>
            )}
          </div>
        );
      })}

      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] ${allFilled ? "bg-[#111111] text-white cursor-pointer" : "bg-[#111111] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continue →" : "Answer all questions to continue"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111111]">{correctCount}/{sentences.length}</span>
            <button type="button" onClick={finish} className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#111111] rounded-[6px] cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Next section →" : "See results →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
