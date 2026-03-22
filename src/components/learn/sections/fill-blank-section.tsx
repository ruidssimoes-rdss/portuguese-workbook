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

  const correctCount = Object.values(results).filter((r) => r.correct).length;

  return (
    <div>
      {sentences.map((s, i) => {
        const blankMatch = s.sentencePt.match(/_+/);
        const blankIdx = blankMatch ? s.sentencePt.indexOf(blankMatch[0]) : -1;
        const before = blankIdx >= 0 ? s.sentencePt.substring(0, blankIdx) : s.sentencePt;
        const after = blankIdx >= 0 ? s.sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";
        const r = results[s.id];

        return (
          <div key={s.id} className={`border-[0.5px] rounded-lg p-[12px_14px] mb-1.5 ${
            phase === "reviewed" ? (r?.correct ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#FCEBEB]") : "border-[rgba(0,0,0,0.06)]"
          }`}>
            <div className="text-[11px] text-[#9B9DA3]">{i + 1}</div>
            <div className="text-[14px] text-[#111111] leading-[2] mt-0.5">
              {before}
              {phase === "answering" ? (
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="text" value={answers[s.id] ?? ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                  className="inline-block w-20 mx-0.5 px-1 py-px text-[13px] font-medium text-center border-b-[1.5px] border-[rgba(0,0,0,0.15)] outline-none focus:border-[#185FA5] bg-transparent"
                  placeholder={s.hint ?? "..."} autoComplete="off" spellCheck={false}
                />
              ) : (
                <span className={`inline-block mx-0.5 px-1 py-px rounded font-medium ${
                  r?.correct ? "text-[#0F6E56] border-b-[1.5px] border-[#0F6E56]" : "text-[#dc2626] border-b-[1.5px] border-[#dc2626]"
                }`}>
                  {r?.correct ? s.correctAnswer : answers[s.id]}
                </span>
              )}
              {after}
            </div>
            {showEnglish && s.sentenceEn && <div className="text-[12px] text-[#6C6B71] italic mt-0.5">{s.sentenceEn}</div>}
            {phase === "reviewed" && r?.correct && <div className="text-[12px] font-medium text-[#0F6E56] mt-1">Correct!</div>}
            {phase === "reviewed" && !r?.correct && <div className="text-[12px] font-medium text-[#dc2626] mt-1">Not quite <span className="font-normal">→ {s.correctAnswer}</span></div>}
            {phase === "reviewed" && r?.accentHint && <span className="inline-block mt-1 px-[10px] py-1 text-[11px] text-[#854F0B] bg-[#FAEEDA] rounded-[5px]">Atenção ao acento: {r.accentHint}</span>}
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
