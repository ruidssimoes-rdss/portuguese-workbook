"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";

interface FillSentence {
  id: string;
  sentencePt: string;
  sentenceEn?: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
}

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  sentences: FillSentence[];
  onComplete: (result: SectionResult) => void;
}

export function FillBlankSectionNew({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => firstRef.current?.focus(), 100); return () => clearTimeout(t); }, []);

  const allFilled = sentences.every((s) => (answers[s.id] ?? "").trim() !== "");

  function verify() {
    const r: typeof results = {};
    for (const s of sentences) {
      const chk = checkAnswer((answers[s.id] ?? "").trim(), s.correctAnswer, s.acceptedAnswers);
      r[s.id] = { correct: chk.correct, accentHint: chk.accentHint };
    }
    setResults(r);
    setPhase("reviewed");
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id,
      correct: results[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(),
      correctAnswer: s.correctAnswer,
      accentHint: results[s.id]?.accentHint,
    }));
    onComplete({ sectionKey: "fill-blank", sectionName: "Completa as frases", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">Secção {sectionIndex + 1} de {totalSections}</p>
        <h2 className="text-[18px] font-medium text-[#111111]">Completa as frases</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Complete the sentences</p>}
      </div>

      <div className="space-y-3">
        {sentences.map((s, i) => {
          const blankMatch = s.sentencePt.match(/_+/);
          const blankIdx = blankMatch ? s.sentencePt.indexOf(blankMatch[0]) : -1;
          const before = blankIdx >= 0 ? s.sentencePt.substring(0, blankIdx) : s.sentencePt;
          const after = blankIdx >= 0 ? s.sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";
          const r = results[s.id];

          return (
            <div key={s.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
              <span className="text-[12px] text-[#9B9DA3]">{i + 1}.</span>
              <p className="text-[16px] font-medium text-[#111111] mt-1 leading-relaxed">
                {before}
                {phase === "answering" ? (
                  <input
                    ref={i === 0 ? firstRef : undefined}
                    type="text" value={answers[s.id] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                    className="inline-block w-28 mx-1 px-2 py-1 text-[14px] font-medium text-center border-b-[1.5px] border-[rgba(0,0,0,0.15)] outline-none focus:border-[#185FA5] bg-transparent"
                    placeholder={s.hint ?? "___"} autoComplete="off" spellCheck={false}
                  />
                ) : (
                  <span className={`inline-block mx-1 px-2 py-0.5 rounded font-medium ${r?.correct ? "text-[#0F6E56] bg-[#E1F5EE]" : "text-[#dc2626] bg-[#fef2f2]"}`}>
                    {r?.correct ? s.correctAnswer : answers[s.id]}
                  </span>
                )}
                {after}
              </p>
              {showEnglish && s.sentenceEn && <p className="text-[13px] text-[#9B9DA3] italic mt-1">{s.sentenceEn}</p>}
              {phase === "reviewed" && !r?.correct && <p className="text-[13px] text-[#0F6E56] mt-1">Resposta: {s.correctAnswer}</p>}
              {phase === "reviewed" && r?.accentHint && <p className="text-[12px] text-[#854F0B] mt-2 bg-[#FAEEDA] px-3 py-1.5 rounded-lg inline-block">Atenção ao acento: {r.accentHint}</p>}
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
