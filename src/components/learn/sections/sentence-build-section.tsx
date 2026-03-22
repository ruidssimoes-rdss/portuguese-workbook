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
    setAvailable((p) => {
      const arr = [...(p[sid] ?? [])];
      arr.splice(idx, 1);
      return { ...p, [sid]: arr };
    });
  }

  function removeWord(sid: string, idx: number) {
    if (phase !== "answering") return;
    const word = placed[sid]?.[idx];
    if (!word) return;
    setPlaced((p) => {
      const arr = [...(p[sid] ?? [])];
      arr.splice(idx, 1);
      return { ...p, [sid]: arr };
    });
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
    setResults(r);
    setPhase("reviewed");
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id,
      correct: results[s.id] ?? false,
      userAnswer: (placed[s.id] ?? []).join(" "),
      correctAnswer: s.correctSentence,
    }));
    onComplete({ sectionKey: "sentence-build", sectionName: "Constrói a frase", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-1">Secção {sectionIndex + 1} de {totalSections}</p>
        <h2 className="text-[18px] font-medium text-[#111111]">Constrói a frase</h2>
        {showEnglish && <p className="text-[13px] text-[#9B9DA3]">Build the sentence</p>}
      </div>

      <div className="space-y-4">
        {sentences.map((s, i) => (
          <div key={s.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
            <span className="text-[12px] text-[#9B9DA3]">{i + 1}.</span>
            {showEnglish && s.sentenceEnglish && <p className="text-[13px] text-[#9B9DA3] italic mt-1 mb-3">{s.sentenceEnglish}</p>}

            {/* Answer area */}
            <div className={`min-h-[48px] border-[0.5px] rounded-lg p-3 mb-3 flex flex-wrap gap-1.5 ${
              phase === "reviewed"
                ? results[s.id] ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"
                : "border-dashed border-[rgba(0,0,0,0.12)]"
            }`}>
              {(placed[s.id] ?? []).map((w, wi) => (
                <button key={wi} type="button" onClick={() => removeWord(s.id, wi)} disabled={phase === "reviewed"}
                  className="px-2.5 py-1 bg-[#111111] text-white text-[13px] rounded-md cursor-pointer"
                >{w}</button>
              ))}
              {(placed[s.id] ?? []).length === 0 && phase === "answering" && (
                <span className="text-[13px] text-[#9B9DA3]">Tap words below to build the sentence</span>
              )}
            </div>

            {/* Word bank */}
            {phase === "answering" && (
              <div className="flex flex-wrap gap-1.5">
                {(available[s.id] ?? []).map((w, wi) => (
                  <button key={wi} type="button" onClick={() => addWord(s.id, w, wi)}
                    className="px-2.5 py-1 bg-[#F7F7F5] text-[#111111] text-[13px] rounded-md hover:bg-[rgba(0,0,0,0.08)] transition-colors cursor-pointer"
                  >{w}</button>
                ))}
              </div>
            )}

            {phase === "reviewed" && !results[s.id] && (
              <p className="text-[13px] text-[#0F6E56] mt-2">Resposta: {s.correctSentence}</p>
            )}
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
            <p className="text-[14px] font-medium text-[#111111]">{Object.values(results).filter(Boolean).length} de {sentences.length} corretas</p>
            <button type="button" onClick={finish} className="px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer">
              {sectionIndex < totalSections - 1 ? "Próxima secção →" : "Ver resultados →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
