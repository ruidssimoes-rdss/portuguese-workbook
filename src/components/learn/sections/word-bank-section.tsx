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
    const word = filled[blankIdx]; if (!word) return;
    const bankIdx = paragraph.wordBank.findIndex((w, i) => w === word && bankUsed[i]);
    setFilled((p) => { const n = [...p]; n[blankIdx] = null; return n; });
    if (bankIdx !== -1) setBankUsed((p) => { const n = [...p]; n[bankIdx] = false; return n; });
    setActiveBlank(blankIdx);
  }

  function verify() {
    const r = paragraph.blanks.map((b, i) => {
      const chk = checkAnswer(filled[i] ?? "", b.correctAnswer, b.acceptedAnswers);
      return chk.correct;
    });
    setResults(r); setPhase("reviewed");
  }

  function finish() {
    const ans = paragraph.blanks.map((b, i) => ({
      questionId: b.id, correct: results[i] ?? false,
      userAnswer: filled[i] ?? "", correctAnswer: b.correctAnswer,
    }));
    onComplete({ sectionKey: "word-bank", sectionName: "Texto com lacunas", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  const parts = paragraph.textWithBlanks.split(/_+/);
  const correctCount = results.filter(Boolean).length;

  return (
    <div>
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-[12px_14px]">
        <div className="text-[14px] text-[#111111] leading-[2]">
          {parts.map((part, pi) => (
            <span key={pi}>
              {part}
              {pi < paragraph.blanks.length && (
                phase === "answering" ? (
                  <button type="button" onClick={() => { if (filled[pi]) removeFromBlank(pi); else setActiveBlank(pi); }}
                    className={`inline-block min-w-[50px] mx-0.5 px-1.5 py-px text-[13px] text-center rounded-[4px] border-[0.5px] ${
                      filled[pi] ? "bg-[#111111] text-white border-[#111111] cursor-pointer"
                        : activeBlank === pi ? "border-[#185FA5] bg-[#E6F1FB] border-dashed" : "border-dashed border-[rgba(0,0,0,0.15)]"
                    }`}
                  >{filled[pi] || "\u00A0"}</button>
                ) : (
                  <span className={`inline-block mx-0.5 px-1.5 py-px rounded-[4px] text-[13px] font-medium ${
                    results[pi] ? "text-[#0F6E56] bg-[#E1F5EE]" : "text-[#dc2626] bg-[#FCEBEB]"
                  }`}>{results[pi] ? paragraph.blanks[pi].correctAnswer : (filled[pi] ?? "—")}</span>
                )
              )}
            </span>
          ))}
        </div>

        {showEnglish && paragraph.paragraphEnglish && (
          <div className="text-[12px] text-[#6C6B71] italic mt-1">{paragraph.paragraphEnglish}</div>
        )}

        {/* Word bank */}
        {phase === "answering" && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t-[0.5px] border-[rgba(0,0,0,0.06)]">
            {paragraph.wordBank.map((w, wi) => (
              <button key={wi} type="button" onClick={() => pickWord(wi)} disabled={bankUsed[wi]}
                className={`px-[10px] py-1 text-[12px] rounded-[5px] ${
                  bankUsed[wi] ? "bg-[rgba(0,0,0,0.04)] text-[#9B9DA3] cursor-not-allowed" : "bg-[#F7F7F5] text-[#111111] cursor-pointer hover:bg-[rgba(0,0,0,0.08)]"
                }`}
              >{w}</button>
            ))}
          </div>
        )}

        {phase === "reviewed" && results.some((r) => !r) && (
          <div className="mt-1.5">
            {paragraph.blanks.map((b, i) => !results[i] && (
              <div key={i} className="text-[11px] text-[#0F6E56]">Lacuna {i + 1}: {b.correctAnswer}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] ${allFilled ? "bg-[#111111] text-white cursor-pointer" : "bg-[#111111] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continue →" : "Answer all questions to continue"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111111]">{correctCount}/{paragraph.blanks.length}</span>
            <button type="button" onClick={finish} className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#111111] rounded-[6px] cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Next section →" : "See results →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
