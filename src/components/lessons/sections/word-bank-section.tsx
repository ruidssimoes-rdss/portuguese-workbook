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
      <div className="border border-[var(--border-primary)] rounded-[12px] p-6 bg-[var(--bg-card)]">
        <p className="text-[16px] text-[var(--text-primary)] leading-relaxed">
          {segments.map((seg, i) => (
            <span key={i}>
              {seg}
              {i < paragraph.blanks.length && (
                <button
                  type="button"
                  onClick={() => handleBlankTap(i)}
                  disabled={state === "reviewed"}
                  className={`inline-block min-w-[70px] mx-1 px-2 py-0.5 rounded-lg border-2 border-dashed text-center text-[15px] font-semibold transition-all ${
                    state === "reviewed"
                      ? results[i]?.correct
                        ? "border-[#059669] bg-[#F0FDF4] text-[#059669]"
                        : "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
                      : i === activeBlank
                        ? "border-[#003399] bg-[rgba(0,51,153,0.05)] text-[var(--text-primary)]"
                        : filledBlanks[i]
                          ? "border-[var(--border-primary)] text-[var(--text-primary)] cursor-pointer"
                          : "border-[var(--text-muted)] text-[var(--text-muted)] cursor-pointer"
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
          <p className="text-[13px] text-[var(--text-muted)] mt-3 italic">{paragraph.paragraphEnglish}</p>
        )}
      </div>

      {/* Word bank */}
      {state === "answering" && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
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
                  className={`px-4 py-2 rounded-full border text-[14px] font-medium transition-all ${
                    isUsed
                      ? "border-[var(--border-light)] text-[var(--text-muted)] opacity-40"
                      : "border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer active:scale-95"
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
