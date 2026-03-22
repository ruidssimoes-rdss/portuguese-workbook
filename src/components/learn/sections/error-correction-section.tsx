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

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">Secção {sectionIndex + 1} de {totalSections}</p>
        <h2 className="text-[18px] font-medium text-[#111111]">Corrige os erros</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Correct the errors</p>}
      </div>

      <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-4">Cada frase tem um erro. Escreve a versão correta.</p>

      <div className="space-y-3">
        {sentences.map((s, i) => {
          const r = results[s.id];
          return (
            <div key={s.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
              <span className="text-[12px] text-[#9B9DA3]">{i + 1}.</span>
              <div className="bg-[#fef2f2] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-4 py-2.5 mt-2 mb-3">
                <p className="text-[14px] font-medium text-[#dc2626]">{s.incorrectSentence}</p>
              </div>
              {showEnglish && s.hintEnglish && <p className="text-[12px] text-[#9B9DA3] mb-2">{s.hintEnglish}</p>}

              {phase === "answering" ? (
                <input ref={i === 0 ? firstRef : undefined} type="text" value={answers[s.id] ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-[14px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                  placeholder="Escreve a frase corrigida..." autoComplete="off" spellCheck={false}
                />
              ) : (
                <div className={`px-4 py-2.5 rounded-lg border-[0.5px] ${r?.correct ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"}`}>
                  <p className={`text-[14px] font-medium ${r?.correct ? "text-[#0F6E56]" : "text-[#dc2626]"}`}>{answers[s.id]}</p>
                  {!r?.correct && <p className="text-[13px] text-[#0F6E56] mt-1">{s.correctSentence}</p>}
                  {r?.accentHint && <p className="text-[12px] text-[#854F0B] mt-2 bg-[#FAEEDA] px-3 py-1.5 rounded-lg inline-block">Atenção ao acento: {r.accentHint}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-3 text-[14px] font-medium rounded-lg transition-colors ${allFilled ? "bg-[#111111] text-white hover:bg-[#333] cursor-pointer" : "bg-[#F7F7F5] text-[#9B9DA3] cursor-not-allowed"}`}
          >Verificar secção</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-[#111111]">{Object.values(results).filter((r) => r.correct).length} de {sentences.length} corretas</p>
            <button type="button" onClick={finish} className="px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
