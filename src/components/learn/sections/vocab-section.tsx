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

  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">
          Secção {sectionIndex + 1} de {totalSections}
        </p>
        <h2 className="text-[18px] font-medium text-[#111111]">Vocabulário</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Vocabulary</p>}
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const r = results[q.id];
          return (
            <div key={q.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
              <span className="text-[12px] text-[#9B9DA3]">{i + 1}.</span>
              <p className="text-[16px] font-medium text-[#111111] mt-1">&ldquo;{q.portugueseWord}&rdquo;</p>
              {q.pronunciation && <p className="text-[12px] text-[#9B9DA3] font-mono mt-0.5">{q.pronunciation}</p>}

              {/* MC */}
              {q.type === "mc" && q.options && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, oi) => {
                    const sel = mcPicks[q.id] === oi;
                    const isCorr = oi === q.correctIndex;
                    let cls = "px-4 py-3 text-[13px] text-left rounded-lg border-[0.5px] transition-colors ";
                    if (phase === "reviewed") {
                      if (isCorr) cls += "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]";
                      else if (sel && !r?.correct) cls += "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]";
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
                <input
                  ref={i === 0 ? firstRef : undefined}
                  type="text"
                  value={typed[q.id] ?? ""}
                  onChange={(e) => setTyped((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder={showEnglish ? "Type the English translation..." : "Escreve a tradução..."}
                  className="w-full mt-3 px-3 py-2.5 text-[14px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                  autoComplete="off" spellCheck={false}
                />
              )}
              {q.type === "type-answer" && phase === "reviewed" && (
                <div className={`mt-3 px-4 py-2.5 rounded-lg border-[0.5px] ${r?.correct ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"}`}>
                  <p className={`text-[14px] font-medium ${r?.correct ? "text-[#0F6E56]" : "text-[#dc2626]"}`}>{typed[q.id]}</p>
                  {!r?.correct && <p className="text-[13px] text-[#0F6E56] mt-1">{q.englishWord}</p>}
                  {r?.accentHint && <p className="text-[12px] text-[#854F0B] mt-2 bg-[#FAEEDA] px-3 py-1.5 rounded-lg inline-block">Atenção ao acento: {r.accentHint}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-3 text-[14px] font-medium rounded-lg transition-colors ${allFilled ? "bg-[#111111] text-white hover:bg-[#333] cursor-pointer" : "bg-[#F7F7F5] text-[#9B9DA3] cursor-not-allowed"}`}
          >Verificar secção</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-[#111111]">
              {Object.values(results).filter((r) => r.correct).length} de {questions.length} corretas
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
