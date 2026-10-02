"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { Chip, SectionFooter } from "../kit";

interface WordBankBlank { id: string; correctAnswer: string; acceptedAnswers?: string[]; }
interface WordBankParagraph { textWithBlanks: string; blanks: WordBankBlank[]; wordBank: string[]; paragraphEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  paragraph: WordBankParagraph; onComplete: (result: SectionResult) => void;
}

export function WordBankSectionNew({ sectionIndex, totalSections, showEnglish, paragraph, onComplete }: Props) {
  // filled[blank] = index into wordBank, or null.
  const [filled, setFilled] = useState<(number | null)[]>(() => paragraph.blanks.map(() => null));
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<boolean[] | null>(null);

  const remaining = filled.filter((f) => f === null).length;
  const word = (b: number) => (filled[b] === null ? "" : paragraph.wordBank[filled[b]!]);

  function pick(wi: number) {
    if (results || filled.includes(wi)) return;
    const target = filled[active] === null ? active : filled.findIndex((f) => f === null);
    if (target === -1) return;
    const next = filled.map((f, i) => (i === target ? wi : f));
    setFilled(next);
    const after = next.findIndex((f, i) => i > target && f === null);
    setActive(after !== -1 ? after : next.findIndex((f) => f === null));
  }

  function clearBlank(b: number) {
    if (results) return;
    setFilled((p) => p.map((f, i) => (i === b ? null : f)));
    setActive(b);
  }

  function verify() {
    if (remaining > 0) return;
    setResults(paragraph.blanks.map((b, i) => checkAnswer(word(i), b.correctAnswer, b.acceptedAnswers).correct));
  }

  function finish() {
    const ans = paragraph.blanks.map((b, i) => ({ questionId: b.id, correct: results?.[i] ?? false, userAnswer: word(i), correctAnswer: b.correctAnswer }));
    onComplete({ sectionKey: "word-bank", sectionName: "Texto com lacunas", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  const parts = paragraph.textWithBlanks.split(/_+/);

  return (
    <div>
      <div className="pt-1">
        <p className="mb-3 text-[11px] text-[#98988F]">Toca numa palavra para preencher o espaço marcado. Toca num espaço para o limpar.</p>
        <div className="text-[15px] leading-[2.3] text-[#1F1F1F]">
          {parts.map((part, pi) => (
            <span key={pi}>
              {part}
              {pi < paragraph.blanks.length &&
                (results ? (
                  results[pi] ? (
                    <span className="mx-1 inline-flex h-8 items-center rounded-lg border border-[#1F7A68] bg-[#E1F2ED] px-2.5 text-[14px] font-medium text-[#1F7A68]">{word(pi)}</span>
                  ) : (
                    <span className="mx-1 inline-flex h-8 items-center gap-2 rounded-lg border border-[#B94A32] bg-[#FBE9E4] px-2.5 text-[14px] font-medium">
                      <span className="text-[#B94A32] line-through decoration-[#B94A32]/60">{word(pi)}</span>
                      <span className="text-[#1F1F1F]">{paragraph.blanks[pi].correctAnswer}</span>
                    </span>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => (filled[pi] !== null ? clearBlank(pi) : setActive(pi))}
                    className={`mx-1 inline-flex h-8 min-w-[64px] items-center justify-center rounded-lg border px-2.5 text-[14px] font-medium transition-colors ${
                      filled[pi] !== null
                        ? "border-[#D3DAEB] bg-[#F3F5FA] text-[#1B2B61]"
                        : active === pi
                          ? "border-[#1B2B61] bg-white"
                          : "border-[#E6E6E4] bg-[#F7F7F6]"
                    }`}
                  >
                    {word(pi) || <span className="text-[11px] font-normal text-[#B5B5AE]">{pi + 1}</span>}
                  </button>
                ))}
            </span>
          ))}
        </div>
        {showEnglish && paragraph.paragraphEnglish && <p className="mt-2 text-[12px] leading-relaxed text-[#98988F]">{paragraph.paragraphEnglish}</p>}

        {!results && (
          <div className="mt-5 flex flex-wrap gap-1.5 rounded-[10px] bg-[#F7F7F6] p-2.5">
            {paragraph.wordBank.map((w, wi) => (
              <Chip key={wi} state={filled.includes(wi) ? "used" : "available"} onClick={() => pick(wi)}>
                {w}
              </Chip>
            ))}
          </div>
        )}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={(results ?? []).filter(Boolean).length} total={paragraph.blanks.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
