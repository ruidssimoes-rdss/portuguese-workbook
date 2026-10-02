"use client";

import { useState } from "react";
import type { SectionResult } from "@/lib/exercise-types";

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

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: GrammarQuestion[];
  onComplete: (result: SectionResult) => void;
}

export function GrammarSectionNew({
  sectionIndex,
  totalSections,
  showEnglish,
  questions,
  onComplete,
}: Props) {
  const [tfPicks, setTfPicks] = useState<Record<string, boolean>>({});
  const [mcPicks, setMcPicks] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const allFilled = questions.every((q) =>
    q.type === "true-false" ? tfPicks[q.id] !== undefined : mcPicks[q.id] !== undefined
  );

  function verify() {
    const r: Record<string, boolean> = {};
    const ex: Record<string, string> = {};
    for (const q of questions) {
      if (q.type === "true-false") {
        r[q.id] = tfPicks[q.id] === q.isTrue;
        if (q.explanation) ex[q.id] = q.explanation;
      } else {
        r[q.id] = mcPicks[q.id] === q.correctIndex;
      }
    }
    setResults(r);
    setExplanations(ex);
    setPhase("reviewed");
  }

  function finish() {
    const ans = questions.map((q) => ({
      questionId: q.id,
      correct: results[q.id] ?? false,
      userAnswer: q.type === "true-false"
        ? (tfPicks[q.id] ? "Verdadeiro" : "Falso")
        : (q.options?.[mcPicks[q.id] ?? 0] ?? ""),
      correctAnswer: q.type === "true-false"
        ? (q.isTrue ? "Verdadeiro" : "Falso")
        : (q.options?.[q.correctIndex ?? 0] ?? ""),
    }));
    onComplete({
      sectionKey: "grammar",
      sectionName: "Gramática",
      answers: ans,
      totalCorrect: ans.filter((a) => a.correct).length,
      totalQuestions: ans.length,
    });
  }

  const correctCount = Object.values(results).filter(Boolean).length;

  return (
    <div>
      {questions.map((q, i) => {
        const isCorr = results[q.id];
        const reviewed = phase === "reviewed";

        return (
          <div key={q.id} className={`border-[0.5px] rounded-lg p-[12px_14px] mb-1.5 ${
            reviewed ? (isCorr ? "border-[#1F7A68]" : "border-[#B94A32]") : "border-[#E6E6E4]"
          }`}>
            <div className={`text-[11px] ${reviewed ? (isCorr ? "text-[#1F7A68]" : "text-[#B94A32]") : "text-[#98988F]"}`}>{i + 1}</div>

            {q.type === "true-false" && (
              <>
                <div className="bg-[#F7F7F6] rounded-[6px] px-3 py-2 mt-1.5">
                  <p className="text-[13px] text-[#1F1F1F] leading-relaxed">{q.statement}</p>
                </div>
                <div className="grid grid-cols-2 gap-[5px] mt-2">
                  {([true, false] as const).map((val) => {
                    const label = val ? "Verdadeiro" : "Falso";
                    const sel = tfPicks[q.id] === val;
                    const isRight = val === q.isTrue;
                    let cls = "py-[9px] text-[13px] font-medium text-center rounded-[6px] border-[0.5px] transition-colors ";
                    if (reviewed) {
                      if (isRight) cls += "border-[#1F7A68] text-[#1F7A68]";
                      else if (sel && !isCorr) cls += "border-[#B94A32] text-[#B94A32]";
                      else cls += "border-[#E6E6E4] text-[#98988F]";
                    } else if (sel) {
                      cls += "border-[#1B2B61] bg-[#E8ECF6] text-[#1F1F1F]";
                    } else {
                      cls += "border-[#E6E6E4] text-[#1F1F1F] hover:border-[#CFCFCB] hover:bg-[#F7F7F6] cursor-pointer";
                    }
                    return (
                      <button key={label} type="button" disabled={reviewed}
                        onClick={() => setTfPicks((p) => ({ ...p, [q.id]: val }))}
                        className={cls}
                      >{label}</button>
                    );
                  })}
                </div>
                {reviewed && (
                  <div className="text-[12px] font-medium mt-1.5">
                    <span className={isCorr ? "text-[#1F7A68]" : "text-[#B94A32]"}>{isCorr ? "Correct!" : "Not quite"}</span>
                  </div>
                )}
                {reviewed && explanations[q.id] && (
                  <div className="mt-1.5 px-[10px] py-1.5 bg-[#ECE8F8] rounded-[6px] text-[11px] text-[#5B45B8]">{explanations[q.id]}</div>
                )}
              </>
            )}

            {q.type === "mc" && (
              <>
                <p className="text-[13px] font-medium text-[#1F1F1F] mt-0.5">{q.question}</p>
                {showEnglish && q.questionEnglish && (
                  <p className="text-[12px] text-[#6B6B69] italic mt-px">{q.questionEnglish}</p>
                )}
                <div className="grid grid-cols-2 gap-[5px] mt-2">
                  {(q.options || []).map((opt, oi) => {
                    const sel = mcPicks[q.id] === oi;
                    const isRight = oi === q.correctIndex;
                    let cls = "px-3 py-[9px] text-[12px] text-left rounded-[6px] border-[0.5px] transition-colors ";
                    if (reviewed) {
                      if (isRight) cls += "border-[#1F7A68] text-[#1F7A68]";
                      else if (sel && !isCorr) cls += "border-[#B94A32] text-[#B94A32]";
                      else cls += "border-[#E6E6E4] text-[#98988F]";
                    } else if (sel) {
                      cls += "border-[#1B2B61] bg-[#E8ECF6] text-[#1F1F1F]";
                    } else {
                      cls += "border-[#E6E6E4] text-[#1F1F1F] hover:border-[#CFCFCB] hover:bg-[#F7F7F6] cursor-pointer";
                    }
                    return (
                      <button key={oi} type="button" disabled={reviewed}
                        onClick={() => setMcPicks((p) => ({ ...p, [q.id]: oi }))}
                        className={cls}
                      >{opt}</button>
                    );
                  })}
                </div>
                {reviewed && (
                  <div className="text-[12px] font-medium mt-1.5">
                    <span className={isCorr ? "text-[#1F7A68]" : "text-[#B94A32]"}>
                      {isCorr ? "Correct!" : <>Not quite <span className="font-normal">→ {q.options?.[q.correctIndex ?? 0]}</span></>}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] ${allFilled ? "bg-[#1B2B61] text-white cursor-pointer" : "bg-[#1B2B61] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continuar →" : "Responde a todas para continuar"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#1F1F1F]">{correctCount}/{questions.length}</span>
            <button type="button" onClick={finish}
              className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#1B2B61] rounded-[6px] cursor-pointer"
            >{sectionIndex < totalSections - 1 ? "Secção seguinte →" : "Ver resultados →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
