"use client";

import { useState } from "react";
import type { SectionResult } from "@/lib/exercise-types";

interface BuildSentence { id: string; scrambledWords: string[]; correctSentence: string; acceptedAnswers?: string[]; sentenceEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  sentences: BuildSentence[]; onComplete: (result: SectionResult) => void;
}

export function SentenceBuildSectionNew({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: Props) {
  const [placed, setPlaced] = useState<Record<string, string[]>>(Object.fromEntries(sentences.map((s) => [s.id, []])));
  const [available, setAvailable] = useState<Record<string, string[]>>(Object.fromEntries(sentences.map((s) => [s.id, [...s.scrambledWords]])));
  const [phase, setPhase] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, boolean>>({});

  const allFilled = sentences.every((s) => (available[s.id] ?? []).length === 0);

  function addWord(sid: string, word: string, idx: number) {
    if (phase !== "answering") return;
    setPlaced((p) => ({ ...p, [sid]: [...(p[sid] ?? []), word] }));
    setAvailable((p) => { const arr = [...(p[sid] ?? [])]; arr.splice(idx, 1); return { ...p, [sid]: arr }; });
  }

  function removeWord(sid: string, idx: number) {
    if (phase !== "answering") return;
    const word = placed[sid]?.[idx]; if (!word) return;
    setPlaced((p) => { const arr = [...(p[sid] ?? [])]; arr.splice(idx, 1); return { ...p, [sid]: arr }; });
    setAvailable((p) => ({ ...p, [sid]: [...(p[sid] ?? []), word] }));
  }

  function verify() {
    const r: Record<string, boolean> = {};
    for (const s of sentences) {
      const userSentence = (placed[s.id] ?? []).join(" ");
      const normalize = (str: string) => str.trim().toLowerCase().replace(/[.!?¿¡,;:]+/g, "").replace(/\s+/g, " ");
      const accepted = [s.correctSentence, ...(s.acceptedAnswers ?? [])];
      r[s.id] = accepted.some((a) => normalize(userSentence) === normalize(a));
    }
    setResults(r); setPhase("reviewed");
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id, correct: results[s.id] ?? false,
      userAnswer: (placed[s.id] ?? []).join(" "), correctAnswer: s.correctSentence,
    }));
    onComplete({ sectionKey: "sentence-build", sectionName: "Constrói a frase", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  const correctCount = Object.values(results).filter(Boolean).length;

  return (
    <div>
      {sentences.map((s, i) => (
        <div key={s.id} className={`border-[0.5px] rounded-lg p-[12px_14px] mb-1.5 ${
          phase === "reviewed" ? (results[s.id] ? "border-[#1F7A68]" : "border-[#dc2626]") : "border-[#E6E6E4]"
        }`}>
          <div className="text-[11px] text-[#98988F]">{i + 1}</div>
          {showEnglish && s.sentenceEnglish && <div className="text-[12px] text-[#6B6B69] italic mt-0.5">{s.sentenceEnglish}</div>}

          {/* Drop zone */}
          <div className={`min-h-[36px] rounded-[6px] p-1.5 flex flex-wrap gap-1 mt-2 ${
            phase === "reviewed"
              ? results[s.id] ? "border-[0.5px] border-[#1F7A68]" : "border-[0.5px] border-[#dc2626]"
              : "border border-dashed border-[rgba(0,0,0,0.1)]"
          }`}>
            {(placed[s.id] ?? []).map((w, wi) => (
              <button key={wi} type="button" onClick={() => removeWord(s.id, wi)} disabled={phase === "reviewed"}
                className="px-[10px] py-1 text-[12px] text-white bg-[#1B2B61] rounded-[5px] cursor-pointer"
              >{w}</button>
            ))}
          </div>

          {/* Word bank */}
          {phase === "answering" && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(available[s.id] ?? []).map((w, wi) => (
                <button key={wi} type="button" onClick={() => addWord(s.id, w, wi)}
                  className="px-[10px] py-1 text-[12px] text-[#1F1F1F] bg-[#F7F7F6] rounded-[5px] cursor-pointer hover:bg-[rgba(0,0,0,0.08)]"
                >{w}</button>
              ))}
            </div>
          )}

          {phase === "reviewed" && !results[s.id] && (
            <div className="text-[12px] font-medium text-[#dc2626] mt-1.5">Not quite <span className="font-normal">→ {s.correctSentence}</span></div>
          )}
          {phase === "reviewed" && results[s.id] && (
            <div className="text-[12px] font-medium text-[#1F7A68] mt-1.5">Correct!</div>
          )}
        </div>
      ))}

      <div className="mt-[10px]">
        {phase === "answering" && (
          <button type="button" onClick={verify} disabled={!allFilled}
            className={`w-full py-[10px] text-[13px] font-medium rounded-[6px] ${allFilled ? "bg-[#1B2B61] text-white cursor-pointer" : "bg-[#1B2B61] text-white opacity-40 cursor-not-allowed"}`}
          >{allFilled ? "Continue →" : "Answer all questions to continue"}</button>
        )}
        {phase === "reviewed" && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#1F1F1F]">{correctCount}/{sentences.length}</span>
            <button type="button" onClick={finish} className="px-[14px] py-[7px] text-[12px] font-medium text-white bg-[#1B2B61] rounded-[6px] cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Next section →" : "See results →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
