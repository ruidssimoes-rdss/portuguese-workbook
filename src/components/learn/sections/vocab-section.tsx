"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";

interface VocabQuestion {
  id: string;
  type: "type-answer" | "mc";
  portugueseWord: string;
  englishWord: string;
  pronunciation?: string;
  acceptedAnswers?: string[];
  options?: string[];
  correctIndex?: number;
}

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: VocabQuestion[];
  onComplete: (result: SectionResult) => void;
}

export function VocabSectionNew({
  sectionIndex,
  totalSections,
  showEnglish,
  questions,
  onComplete,
}: Props) {
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [mcPicks, setMcPicks] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const allFilled = questions.every((q) =>
    q.type === "mc" ? mcPicks[q.id] !== undefined : (typed[q.id] ?? "").trim() !== ""
  );

  function verify() {
    const r: typeof results = {};
    for (const q of questions) {
      if (q.type === "mc") {
        r[q.id] = { correct: mcPicks[q.id] === q.correctIndex };
      } else {
        const chk = checkAnswer((typed[q.id] ?? "").trim(), q.englishWord, q.acceptedAnswers);
        r[q.id] = { correct: chk.correct, accentHint: chk.accentHint };
      }
    }
    setResults(r);
    setPhase("reviewed");
  }

  function finish() {
    const answers = questions.map((q) => ({
      questionId: q.id,
      correct: results[q.id]?.correct ?? false,
      userAnswer: q.type === "mc" ? (q.options?.[mcPicks[q.id] ?? 0] ?? "") : (typed[q.id] ?? "").trim(),
      correctAnswer: q.type === "mc" ? (q.options?.[q.correctIndex ?? 0] ?? "") : q.englishWord,
      accentHint: results[q.id]?.accentHint,
    }));
    onComplete({
      sectionKey: "vocab",
      sectionName: "Vocabulário",
      answers,
      totalCorrect: answers.filter((a) => a.correct).length,
      totalQuestions: answers.length,
    });
  }

  const correctCount = Object.values(results).filter((r) => r.correct).length;

  return (
    <div>
      {questions.map((q, i) => {
        const r = results[q.id];
        const cardCls = phase === "reviewed"
          ? r?.correct
            ? "border-[#0F6E56]"
            : "border-[#dc2626]"
          : "border-[rgba(0,0,0,0.06)]";

        return (
          <div key={q.id} className={`border-[0.5px] rounded-lg p-[12px_14px] mb-1.5 ${cardCls}`}>
            <div className={`text-[11px] ${phase === "reviewed" ? (r?.correct ? "text-[#0F6E56]" : "text-[#dc2626]") : "text-[#9B9DA3]"}`}>{i + 1}</div>
            <div className={`text-[15px] font-medium mt-0.5 ${phase === "reviewed" ? (r?.correct ? "text-[#0F6E56]" : "text-[#dc2626]") : "text-[#111111]"}`}>
              &ldquo;{q.portugueseWord}&rdquo;
            </div>
            {q.pronunciation && <div className="text-[11px] text-[#9B9DA3] font-mono mt-px">{q.pronunciation}</div>}

            {/* MC */}
            {q.type === "mc" && q.options && (
              <div className="grid grid-cols-2 gap-[5px] mt-2">
                {q.options.map((opt, oi) => {
                  const sel = mcPicks[q.id] === oi;
                  const isCorr = oi === q.correctIndex;
                  let cls = "px-3 py-[9px] text-[12px] text-left rounded-[6px] border-[0.5px] transition-colors ";
                  if (phase === "reviewed") {
                    if (isCorr) cls += "border-[#0F6E56] text-[#0F6E56]";
                    else if (sel && !r?.correct) cls += "border-[#dc2626] text-[#dc2626]";
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
            )}

            {/* Type answer */}
            {q.type === "type-answer" && phase === "answering" && (
              <div className="flex gap-1.5 mt-2">
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="text"
                  value={typed[q.id] ?? ""}
                  onChange={(e) => setTyped((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder={showEnglish ? "English translation..." : "Tradução..."}
                  className="flex-1 px-[10px] py-[7px] text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-[6px] outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                  autoComplete="off" spellCheck={false}
                />
                <button type="button"
                  onClick={() => {
                    if ((typed[q.id] ?? "").trim()) {
                      const chk = checkAnswer((typed[q.id] ?? "").trim(), q.englishWord, q.acceptedAnswers);
                      setResults((prev) => ({ ...prev, [q.id]: { correct: chk.correct, accentHint: chk.accentHint } }));
                    }
                  }}
                  className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#111111] rounded-[6px] shrink-0 cursor-pointer"
                >Check</button>
              </div>
            )}

            {/* Reviewed type-answer result */}
            {q.type === "type-answer" && phase === "reviewed" && !results[q.id] && (
              <div className="text-[12px] font-medium text-[#dc2626] mt-1.5">
                Not answered <span className="font-normal">→ {q.englishWord}</span>
              </div>
            )}

            {/* Inline feedback */}
            {r && (
              <div className="mt-1.5">
                {r.correct ? (
                  <div className="text-[12px] font-medium text-[#0F6E56]">
                    {q.type === "type-answer" ? typed[q.id] : null}
                  </div>
                ) : (
                  <div className="text-[12px] font-medium text-[#dc2626]">
                    Not quite <span className="font-normal">→ {q.englishWord}</span>
                  </div>
                )}
                {r.accentHint && (
                  <span className="inline-block mt-1 px-[10px] py-1 text-[11px] text-[#854F0B] bg-[#FAEEDA] rounded-[5px]">
                    Atenção ao acento: {r.accentHint}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit */}
      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] transition-colors ${allFilled ? "bg-[#111111] text-white cursor-pointer" : "bg-[#111111] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continue →" : "Answer all questions to continue"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111111]">{correctCount}/{questions.length}</span>
            <button type="button" onClick={finish}
              className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#111111] rounded-[6px] cursor-pointer"
            >{sectionIndex < totalSections - 1 ? "Next section →" : "See results →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
