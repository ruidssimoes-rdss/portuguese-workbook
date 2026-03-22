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

  let inputIdx = 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">
          Secção {sectionIndex + 1} de {totalSections}
        </p>
        <h2 className="text-[18px] font-medium text-[#111111]">Conjugação</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Conjugation</p>}
      </div>

      <div className="space-y-4">
        {verbs.map((v) => (
          <div key={`${v.verb}-${v.tense}`} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden">
            {/* Verb header */}
            <div className="px-5 py-4 bg-[#F7F7F5] border-b-[0.5px] border-[rgba(0,0,0,0.06)]">
              <h3 className="text-[16px] font-medium text-[#111111]">
                {v.verb.toUpperCase()}
                {v.verbMeaning && <span className="text-[13px] font-normal text-[#9B9DA3] ml-2">({v.verbMeaning})</span>}
              </h3>
              <p className="text-[13px] text-[#9B9DA3]">
                {v.tense}{v.tenseEnglish && <span className="ml-1">/ {v.tenseEnglish}</span>}
              </p>
            </div>

            {/* Person rows */}
            {v.persons.map((p) => {
              const key = `${v.verb}-${v.tense}-${p.pronoun}`;
              const r = results[key];
              const curIdx = inputIdx++;
              return (
                <div key={key} className="flex items-center gap-3 px-5 py-3 border-b-[0.5px] border-[rgba(0,0,0,0.06)] last:border-b-0">
                  <span className="text-[13px] text-[#9B9DA3] w-24 shrink-0">{p.pronoun}</span>
                  {phase === "answering" ? (
                    <input
                      ref={curIdx === 0 ? firstRef : undefined}
                      type="text"
                      value={answers[key] ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-3 py-2 text-[14px] bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg outline-none focus:border-[rgba(0,0,0,0.12)] placeholder:text-[#9B9DA3]"
                      placeholder="..."
                      autoComplete="off" spellCheck={false}
                    />
                  ) : (
                    <div className="flex-1 flex items-center gap-2">
                      <span className={`px-3 py-2 rounded-lg text-[14px] font-medium ${
                        r?.correct ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#fef2f2] text-[#dc2626]"
                      }`}>
                        {r?.correct ? p.correctForm : (answers[key] || "—")}
                      </span>
                      {!r?.correct && (
                        <span className="text-[12px] text-[#0F6E56] shrink-0">→ {p.correctForm}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
              {Object.values(results).filter((r) => r.correct).length} de {allKeys.length} corretas
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
