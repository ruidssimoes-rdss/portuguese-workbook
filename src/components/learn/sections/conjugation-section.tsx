"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";

interface VerbData {
  verb: string;
  verbMeaning?: string;
  tense: string;
  tenseEnglish?: string;
  persons: Array<{ pronoun: string; correctForm: string }>;
}

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  verbs: VerbData[];
  onComplete: (result: SectionResult) => void;
}

export function ConjugationSectionNew({
  sectionIndex,
  totalSections,
  showEnglish,
  verbs,
  onComplete,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }>>({});
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const allKeys: string[] = [];
  verbs.forEach((v) => v.persons.forEach((p) => allKeys.push(`${v.verb}-${v.tense}-${p.pronoun}`)));
  const allFilled = allKeys.every((k) => (answers[k] ?? "").trim() !== "");

  function verify() {
    const r: typeof results = {};
    for (const v of verbs) {
      for (const p of v.persons) {
        const key = `${v.verb}-${v.tense}-${p.pronoun}`;
        const chk = checkAnswer((answers[key] ?? "").trim(), p.correctForm);
        r[key] = { correct: chk.correct, accentHint: chk.accentHint };
      }
    }
    setResults(r);
    setPhase("reviewed");
  }

  function finish() {
    const ans = verbs.flatMap((v) =>
      v.persons.map((p) => {
        const key = `${v.verb}-${v.tense}-${p.pronoun}`;
        return {
          questionId: key,
          correct: results[key]?.correct ?? false,
          userAnswer: (answers[key] ?? "").trim(),
          correctAnswer: p.correctForm,
          accentHint: results[key]?.accentHint,
        };
      })
    );
    onComplete({
      sectionKey: "conjugation",
      sectionName: "Conjugação",
      answers: ans,
      totalCorrect: ans.filter((a) => a.correct).length,
      totalQuestions: ans.length,
    });
  }

  const correctCount = Object.values(results).filter((r) => r.correct).length;
  let inputIdx = 0;

  return (
    <div>
      {verbs.map((v, vi) => (
        <div key={`${v.verb}-${v.tense}`} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-[12px_14px] mb-1.5">
          {/* Verb header */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-[11px] text-[#9B9DA3]">{vi + 1}</span>
            <span className="text-[15px] font-medium text-[#111111]">{v.verb.toUpperCase()}</span>
            {v.verbMeaning && <span className="text-[12px] text-[#6C6B71]">{v.verbMeaning}</span>}
            <span className="text-[11px] text-[#9B9DA3]">{v.tense}</span>
          </div>

          {/* Person rows */}
          {v.persons.map((p) => {
            const key = `${v.verb}-${v.tense}-${p.pronoun}`;
            const r = results[key];
            const curIdx = inputIdx++;
            return (
              <div key={key} className="flex items-center gap-2 mb-[5px]">
                <span className="text-[12px] text-[#6C6B71] w-[60px] shrink-0">{p.pronoun}</span>
                {phase === "answering" ? (
                  <input
                    ref={curIdx === 0 ? firstRef : undefined}
                    type="text"
                    value={answers[key] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 px-[10px] py-[5px] text-[13px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-[6px] outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                    placeholder="..." autoComplete="off" spellCheck={false}
                  />
                ) : (
                  <>
                    <span className={`flex-1 px-[10px] py-[5px] text-[13px] rounded-[6px] border-[0.5px] ${
                      r?.correct
                        ? "border-[#0F6E56] bg-[#E1F5EE] text-[#0F6E56]"
                        : "border-[#dc2626] bg-[#FCEBEB] text-[#dc2626]"
                    }`}>
                      {r?.correct ? p.correctForm : (answers[key] || "—")}
                    </span>
                    {!r?.correct && <span className="text-[11px] text-[#0F6E56] shrink-0">→ {p.correctForm}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] ${allFilled ? "bg-[#111111] text-white cursor-pointer" : "bg-[#111111] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continue →" : "Answer all questions to continue"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111111]">{correctCount}/{allKeys.length}</span>
            <button type="button" onClick={finish}
              className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#111111] rounded-[6px] cursor-pointer"
            >{sectionIndex < totalSections - 1 ? "Next section →" : "See results →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
