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

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">
          Secção {sectionIndex + 1} de {totalSections}
        </p>
        <h2 className="text-[18px] font-medium text-[#111111]">Gramática</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Grammar</p>}
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
            <span className="text-[12px] text-[#9B9DA3]">{i + 1}.</span>

            {q.type === "true-false" && (
              <div className="mt-2">
                <div className="bg-[#F7F7F5] rounded-lg px-4 py-3 mb-3">
                  <p className="text-[14px] text-[#111111]">{q.statement}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([true, false] as const).map((val) => {
                    const label = val ? "Verdadeiro" : "Falso";
                    const sel = tfPicks[q.id] === val;
                    const isCorr = val === q.isTrue;
                    let cls = "px-4 py-3 text-[13px] text-center rounded-lg border-[0.5px] transition-colors ";
                    if (phase === "reviewed") {
                      if (isCorr) cls += "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]";
                      else if (sel && !results[q.id]) cls += "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]";
                      else cls += "border-[rgba(0,0,0,0.06)] text-[#9B9DA3]";
                    } else if (sel) {
                      cls += "border-[#185FA5] bg-[#E6F1FB] text-[#111111]";
                    } else {
                      cls += "border-[rgba(0,0,0,0.06)] text-[#111111] hover:border-[rgba(0,0,0,0.12)] hover:bg-[#F7F7F5] cursor-pointer";
                    }
                    return (
                      <button key={label} type="button" disabled={phase === "reviewed"}
                        onClick={() => setTfPicks((p) => ({ ...p, [q.id]: val }))}
                        className={cls}
                      >{label}</button>
                    );
                  })}
                </div>
                {phase === "reviewed" && explanations[q.id] && (
                  <p className="text-[12px] text-[#854F0B] mt-3 bg-[#FAEEDA] px-4 py-2.5 rounded-lg">{explanations[q.id]}</p>
                )}
              </div>
            )}

            {q.type === "mc" && (
              <div className="mt-2">
                <p className="text-[14px] font-medium text-[#111111] mb-1">{q.question}</p>
                {showEnglish && q.questionEnglish && (
                  <p className="text-[13px] text-[#9B9DA3] italic mb-3">{q.questionEnglish}</p>
                )}
                <div className="space-y-2">
                  {(q.options || []).map((opt, oi) => {
                    const sel = mcPicks[q.id] === oi;
                    const isCorr = oi === q.correctIndex;
                    let cls = "w-full text-left px-4 py-3 text-[13px] rounded-lg border-[0.5px] transition-colors ";
                    if (phase === "reviewed") {
                      if (isCorr) cls += "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]";
                      else if (sel && !results[q.id]) cls += "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]";
                      else cls += "border-[rgba(0,0,0,0.06)] text-[#9B9DA3]";
                    } else if (sel) {
                      cls += "border-[#185FA5] bg-[#E6F1FB] text-[#111111]";
                    } else {
                      cls += "border-[rgba(0,0,0,0.06)] text-[#111111] hover:border-[rgba(0,0,0,0.12)] hover:bg-[#F7F7F5] cursor-pointer";
                    }
                    return (
                      <button key={oi} type="button" disabled={phase === "reviewed"}
                        onClick={() => setMcPicks((p) => ({ ...p, [q.id]: oi }))}
                        className={cls}
                      >{opt}</button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-3 text-[14px] font-medium rounded-lg transition-colors ${allFilled ? "bg-[#111111] text-white hover:bg-[#333] cursor-pointer" : "bg-[#F7F7F5] text-[#9B9DA3] cursor-not-allowed"}`}
          >Verificar secção</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-[#111111]">
              {Object.values(results).filter(Boolean).length} de {questions.length} corretas
            </p>
            <button type="button" onClick={finish}
              className="px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
            >{sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
