"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface WordBankBlank {
  id: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
}

interface WordBankParagraph {
  textWithBlanks: string;
  blanks: WordBankBlank[];
  wordBank: string[];
  paragraphEnglish?: string;
}

interface WordBankSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  paragraph: WordBankParagraph;
  onComplete: (result: SectionResult) => void;
}

export function WordBankSection({ sectionIndex, totalSections, showEnglish, paragraph, onComplete }: WordBankSectionProps) {
  const [filledBlanks, setFilledBlanks] = useState<(string | null)[]>(
    new Array(paragraph.blanks.length).fill(null)
  );
  const [activeBlank, setActiveBlank] = useState(0);
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Array<{ correct: boolean; accentHint?: string }>>([]);

  const usedWords = new Set(filledBlanks.filter(Boolean));
  const allFilled = filledBlanks.every((b) => b !== null);

  const handleWordTap = (word: string) => {
    if (state === "reviewed" || usedWords.has(word)) return;
    const next = [...filledBlanks];
    next[activeBlank] = word;
    setFilledBlanks(next);
    const nextEmpty = next.findIndex((b, i) => b === null && i > activeBlank);
    if (nextEmpty !== -1) setActiveBlank(nextEmpty);
    else {
      const first = next.findIndex((b) => b === null);
      if (first !== -1) setActiveBlank(first);
    }
  };

  const handleBlankTap = (index: number) => {
    if (state === "reviewed") return;
    if (filledBlanks[index] !== null) {
      const next = [...filledBlanks];
      next[index] = null;
      setFilledBlanks(next);
      setActiveBlank(index);
    } else {
      setActiveBlank(index);
    }
  };

  const handleVerify = () => {
    const r = paragraph.blanks.map((blank, i) => {
      const userAnswer = filledBlanks[i] ?? "";
      const check = checkAnswer(userAnswer, blank.correctAnswer, blank.acceptedAnswers);
      return { correct: check.correct, accentHint: check.accentHint };
    });
    setResults(r);
    setState("reviewed");
  };

  const handleNext = () => {
    const ans = paragraph.blanks.map((blank, i) => ({
      questionId: blank.id,
      correct: results[i]?.correct ?? false,
      userAnswer: filledBlanks[i] ?? "",
      correctAnswer: blank.correctAnswer,
      accentHint: results[i]?.accentHint,
    }));
    onComplete({
      sectionKey: "word-bank",
      sectionName: "Texto com lacunas",
      answers: ans,
      totalCorrect: ans.filter((a) => a.correct).length,
      totalQuestions: ans.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: results.filter((r) => r.correct).length, total: paragraph.blanks.length }
    : undefined;

  const segments = paragraph.textWithBlanks.split(/___/);

  return (
    <SectionShell
      sectionIndex={sectionIndex} totalSections={totalSections}
      sectionNamePt="Texto com lacunas" sectionNameEn="Text with gaps"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allFilled} score={score}
    >
      {/* Paragraph with blanks */}
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white">
        <p className="text-[16px] text-[#111111] leading-relaxed">
          {segments.map((seg, i) => (
            <span key={i}>
              {seg}
              {i < paragraph.blanks.length && (
                <button
                  type="button"
                  onClick={() => handleBlankTap(i)}
                  disabled={state === "reviewed"}
                  className={`inline-block min-w-[70px] mx-1 px-2 py-0.5 rounded-lg border-[1.5px] border-dashed text-center text-[14px] font-medium transition-all ${
                    state === "reviewed"
                      ? results[i]?.correct
                        ? "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]"
                        : "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]"
                      : i === activeBlank
                        ? "border-[#185FA5] bg-[rgba(24,95,165,0.05)] text-[#111111]"
                        : filledBlanks[i]
                          ? "border-[rgba(0,0,0,0.06)] text-[#111111] cursor-pointer"
                          : "border-[#9B9DA3] text-[#9B9DA3] cursor-pointer"
                  }`}
                >
                  {state === "reviewed" && !results[i]?.correct
                    ? paragraph.blanks[i].correctAnswer
                    : filledBlanks[i] ?? `${i + 1}`}
                </button>
              )}
            </span>
          ))}
        </p>
        {showEnglish && paragraph.paragraphEnglish && (
          <p className="text-[13px] text-[#9B9DA3] mt-3 italic">{paragraph.paragraphEnglish}</p>
        )}
      </div>

      {/* Word bank */}
      {state === "answering" && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3] mb-2">
            Banco de palavras{showEnglish && " / Word bank"}
          </p>
          <div className="flex flex-wrap gap-2">
            {paragraph.wordBank.map((word, i) => {
              const isUsed = usedWords.has(word);
              return (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  disabled={isUsed}
                  onClick={() => handleWordTap(word)}
                  className={`px-4 py-2 rounded-full border-[0.5px] text-[14px] font-medium transition-all ${
                    isUsed
                      ? "border-[rgba(0,0,0,0.06)] text-[#9B9DA3] opacity-40"
                      : "border-[rgba(0,0,0,0.06)] text-[#111111] hover:border-[#185FA5] hover:bg-[rgba(24,95,165,0.05)] cursor-pointer active:scale-95"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </SectionShell>
  );
}
