"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";

interface WordBankBlank { id: string; correctAnswer: string; acceptedAnswers?: string[]; }
interface WordBankParagraph { textWithBlanks: string; blanks: WordBankBlank[]; wordBank: string[]; paragraphEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  paragraph: WordBankParagraph; onComplete: (result: SectionResult) => void;
}

export function WordBankSectionNew({ sectionIndex, totalSections, showEnglish, paragraph, onComplete }: Props) {
  const [filled, setFilled] = useState<(string | null)[]>(new Array(paragraph.blanks.length).fill(null));
  const [activeBlank, setActiveBlank] = useState(0);
  const [bankUsed, setBankUsed] = useState<boolean[]>(new Array(paragraph.wordBank.length).fill(false));
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<boolean[]>([]);

  const allFilled = filled.every((f) => f !== null);

  function pickWord(wordIdx: number) {
    if (phase !== "answering" || bankUsed[wordIdx]) return;
    const word = paragraph.wordBank[wordIdx];
    const nextBlank = filled.findIndex((f) => f === null);
    if (nextBlank === -1) return;

    setFilled((p) => { const n = [...p]; n[nextBlank] = word; return n; });
    setBankUsed((p) => { const n = [...p]; n[wordIdx] = true; return n; });
    setActiveBlank(filled.findIndex((f, i) => i > nextBlank && f === null) ?? -1);
  }

  function removeFromBlank(blankIdx: number) {
    if (phase !== "answering") return;
    const word = filled[blankIdx];
    if (!word) return;
    const bankIdx = paragraph.wordBank.findIndex((w, i) => w === word && bankUsed[i]);
    setFilled((p) => { const n = [...p]; n[blankIdx] = null; return n; });
    if (bankIdx !== -1) setBankUsed((p) => { const n = [...p]; n[bankIdx] = false; return n; });
    setActiveBlank(blankIdx);
  }

  function verify() {
    const r = paragraph.blanks.map((b, i) => {
      const userAns = filled[i] ?? "";
      const chk = checkAnswer(userAns, b.correctAnswer, b.acceptedAnswers);
      return chk.correct;
    });
    setResults(r);
    setPhase("reviewed");
  }

  function finish() {
    const ans = paragraph.blanks.map((b, i) => ({
      questionId: b.id,
      correct: results[i] ?? false,
      userAnswer: filled[i] ?? "",
      correctAnswer: b.correctAnswer,
    }));
    onComplete({ sectionKey: "word-bank", sectionName: "Texto com lacunas", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  // Split paragraph text at blanks
  const parts = paragraph.textWithBlanks.split(/_+/);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">Secção {sectionIndex + 1} de {totalSections}</p>
        <h2 className="text-[18px] font-medium text-[#111111]">Texto com lacunas</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Text with gaps</p>}
      </div>

      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
        {/* Paragraph with inline blanks */}
        <div className="text-[14px] text-[#111111] leading-relaxed mb-4">
          {parts.map((part, pi) => (
            <span key={pi}>
              {part}
              {pi < paragraph.blanks.length && (
                phase === "answering" ? (
                  <button type="button" onClick={() => { if (filled[pi]) removeFromBlank(pi); else setActiveBlank(pi); }}
                    className={`inline-block min-w-[60px] mx-1 px-2 py-0.5 text-center rounded border-[0.5px] transition-colors ${
                      filled[pi]
                        ? "bg-[#111111] text-white border-[#111111] cursor-pointer"
                        : activeBlank === pi
                          ? "border-[#185FA5] bg-[#E6F1FB] border-dashed"
                          : "border-dashed border-[rgba(0,0,0,0.15)]"
                    }`}
                  >
                    {filled[pi] || "\u00A0"}
                  </button>
                ) : (
                  <span className={`inline-block mx-1 px-2 py-0.5 rounded font-medium ${
                    results[pi] ? "text-[#0F6E56] bg-[#E1F5EE]" : "text-[#dc2626] bg-[#fef2f2]"
                  }`}>
                    {results[pi] ? paragraph.blanks[pi].correctAnswer : (filled[pi] ?? "—")}
                  </span>
                )
              )}
            </span>
          ))}
        </div>

        {showEnglish && paragraph.paragraphEnglish && (
          <p className="text-[13px] text-[#9B9DA3] italic mb-4">{paragraph.paragraphEnglish}</p>
        )}

        {/* Word bank */}
        {phase === "answering" && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t-[0.5px] border-[rgba(0,0,0,0.06)]">
            {paragraph.wordBank.map((w, wi) => (
              <button key={wi} type="button" onClick={() => pickWord(wi)} disabled={bankUsed[wi]}
                className={`px-2.5 py-1 text-[13px] rounded-md transition-colors ${
                  bankUsed[wi]
                    ? "bg-[rgba(0,0,0,0.04)] text-[#9B9DA3] cursor-not-allowed"
                    : "bg-[#F7F7F5] text-[#111111] hover:bg-[rgba(0,0,0,0.08)] cursor-pointer"
                }`}
              >{w}</button>
            ))}
          </div>
        )}

        {phase === "reviewed" && results.some((r) => !r) && (
          <div className="mt-3">
            {paragraph.blanks.map((b, i) => !results[i] && (
              <p key={i} className="text-[12px] text-[#0F6E56]">Lacuna {i + 1}: {b.correctAnswer}</p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-3 text-[14px] font-medium rounded-lg transition-colors ${allFilled ? "bg-[#111111] text-white hover:bg-[#333] cursor-pointer" : "bg-[#F7F7F5] text-[#9B9DA3] cursor-not-allowed"}`}
          >Verificar secção</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-[#111111]">{results.filter(Boolean).length} de {paragraph.blanks.length} corretas</p>
            <button type="button" onClick={finish} className="px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
