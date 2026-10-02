"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { Item, AccentNote, SectionFooter, type Mark } from "../kit";

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
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }> | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { const t = setTimeout(() => refs.current[0]?.focus(), 100); return () => clearTimeout(t); }, []);

  const remaining = sentences.filter((s) => !(answers[s.id] ?? "").trim()).length;

  function verify() {
    if (remaining > 0) return;
    const r: NonNullable<typeof results> = {};
    for (const s of sentences) {
      const chk = checkAnswer((answers[s.id] ?? "").trim(), s.correctAnswer, s.acceptedAnswers);
      r[s.id] = { correct: chk.correct, accentHint: chk.accentHint };
    }
    setResults(r);
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id,
      correct: results?.[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(),
      correctAnswer: s.correctAnswer,
      accentHint: results?.[s.id]?.accentHint,
    }));
    onComplete({ sectionKey: "fill-blank", sectionName: "Completa as frases", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {sentences.map((s, i) => {
          const blankMatch = s.sentencePt.match(/_+/);
          const blankIdx = blankMatch ? s.sentencePt.indexOf(blankMatch[0]) : -1;
          const before = blankIdx >= 0 ? s.sentencePt.substring(0, blankIdx) : s.sentencePt;
          const after = blankIdx >= 0 ? s.sentencePt.substring(blankIdx + (blankMatch?.[0].length ?? 0)) : "";
          const r = results?.[s.id];
          const mark: Mark = !r ? "idle" : r.correct ? "correct" : "wrong";
          const val = answers[s.id] ?? "";

          return (
            <Item key={s.id} n={i + 1} mark={mark}>
              <div className="text-[15px] leading-[2.1] text-[#1F1F1F]">
                {before}
                {mark === "idle" ? (
                  <input
                    ref={(el) => { refs.current[i] = el; }}
                    type="text"
                    value={val}
                    onChange={(e) => setAnswers((p) => ({ ...p, [s.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (i < sentences.length - 1) refs.current[i + 1]?.focus();
                        else verify();
                      }
                    }}
                    style={{ width: `${Math.max(6, (val || s.hint || "").length + 2)}ch` }}
                    className="mx-1 inline-block h-8 rounded-lg border border-[#E6E6E4] bg-white px-2 text-center text-[14px] font-medium text-[#1F1F1F] outline-none transition-colors placeholder:font-normal placeholder:text-[#B5B5AE] focus:border-[#1B2B61]"
                    placeholder={s.hint ?? "…"}
                    autoComplete="off"
                    spellCheck={false}
                  />
                ) : mark === "correct" ? (
                  <span className="mx-1 inline-flex h-8 items-center rounded-lg border border-[#1F7A68] bg-[#E1F2ED] px-2.5 text-[14px] font-medium text-[#1F7A68]">{s.correctAnswer}</span>
                ) : (
                  <span className="mx-1 inline-flex h-8 items-center gap-2 rounded-lg border border-[#B94A32] bg-[#FBE9E4] px-2.5 text-[14px] font-medium">
                    {val && <span className="text-[#B94A32] line-through decoration-[#B94A32]/60">{val}</span>}
                    <span className="text-[#1F1F1F]">{s.correctAnswer}</span>
                  </span>
                )}
                {after}
              </div>
              {showEnglish && s.sentenceEn && <p className="mt-0.5 text-[12px] text-[#98988F]">{s.sentenceEn}</p>}
              {r?.correct && <AccentNote hint={r.accentHint} />}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter((r) => r.correct).length} total={sentences.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
