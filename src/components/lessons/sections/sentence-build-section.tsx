"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { SectionShell } from "./section-shell";

interface BuildSentence {
  id: string;
  scrambledWords: string[];
  correctSentence: string;
  acceptedAnswers?: string[];
  sentenceEnglish?: string;
}

interface SentenceBuildSectionProps {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  sentences: BuildSentence[];
  onComplete: (result: SectionResult) => void;
}

export function SentenceBuildSection({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: SentenceBuildSectionProps) {
  const [placed, setPlaced] = useState<Record<string, string[]>>(
    Object.fromEntries(sentences.map((s) => [s.id, []]))
  );
  const [available, setAvailable] = useState<Record<string, string[]>>(
    Object.fromEntries(sentences.map((s) => [s.id, [...s.scrambledWords]]))
  );
  const [state, setState] = useState<"answering" | "reviewed">("answering");
  const [results, setResults] = useState<Record<string, boolean>>({});

  const allAnswered = sentences.every((s) => (placed[s.id]?.length ?? 0) > 0 && (available[s.id]?.length ?? 0) === 0);

  const addWord = (sentenceId: string, word: string, index: number) => {
    if (state === "reviewed") return;
    setAvailable((p) => {
      const arr = [...(p[sentenceId] ?? [])];
      arr.splice(index, 1);
      return { ...p, [sentenceId]: arr };
    });
    setPlaced((p) => ({ ...p, [sentenceId]: [...(p[sentenceId] ?? []), word] }));
  };

  const removeWord = (sentenceId: string, word: string, index: number) => {
    if (state === "reviewed") return;
    setPlaced((p) => {
      const arr = [...(p[sentenceId] ?? [])];
      arr.splice(index, 1);
      return { ...p, [sentenceId]: arr };
    });
    setAvailable((p) => ({ ...p, [sentenceId]: [...(p[sentenceId] ?? []), word] }));
  };

  const handleVerify = () => {
    const r: Record<string, boolean> = {};
    for (const s of sentences) {
      const built = (placed[s.id] ?? []).join(" ");
      r[s.id] = checkAnswer(built, s.correctSentence, s.acceptedAnswers).correct;
    }
    setResults(r);
    setState("reviewed");
  };

  const handleNext = () => {
    const ans = sentences.map((s) => ({
      questionId: s.id,
      correct: results[s.id] ?? false,
      userAnswer: (placed[s.id] ?? []).join(" "),
      correctAnswer: s.correctSentence,
    }));
    onComplete({
      sectionKey: "sentence-build",
      sectionName: "Constrói a frase",
      answers: ans,
      totalCorrect: ans.filter((a) => a.correct).length,
      totalQuestions: ans.length,
    });
  };

  const score = state === "reviewed"
    ? { correct: Object.values(results).filter(Boolean).length, total: sentences.length }
    : undefined;

  return (
    <SectionShell
      sectionIndex={sectionIndex} totalSections={totalSections}
      sectionNamePt="Constrói a frase" sectionNameEn="Build the sentence"
      showEnglish={showEnglish} state={state}
      onVerify={handleVerify} onNext={handleNext}
      canVerify={allAnswered} score={score}
    >
      {sentences.map((s, i) => (
        <div key={s.id} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5 bg-white">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-[13px] font-medium text-[#9B9DA3]">{i + 1}.</span>
            {showEnglish && s.sentenceEnglish && (
              <p className="text-[14px] text-[#6C6B71]">&ldquo;{s.sentenceEnglish}&rdquo;</p>
            )}
          </div>

          {/* Staging area */}
          <div className={`border-[0.5px] border-dashed rounded-lg p-3 min-h-[48px] mb-3 flex flex-wrap gap-1.5 ${
            state === "reviewed"
              ? results[s.id] ? "border-[#0F6E56] bg-[#E1F5EE]" : "border-[#dc2626] bg-[#fef2f2]"
              : "border-[rgba(0,0,0,0.12)]"
          }`}>
            {(placed[s.id] ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(placed[s.id] ?? []).map((w, wi) => (
                  <button key={`${w}-${wi}`} type="button" disabled={state === "reviewed"}
                    onClick={() => removeWord(s.id, w, wi)}
                    className="px-2.5 py-1 rounded-md text-[13px] bg-[#111111] text-white cursor-pointer transition-all active:scale-95"
                  >{w}</button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#9B9DA3] text-center">
                {showEnglish ? "Tap words below" : "Toca nas palavras abaixo"}
              </p>
            )}
          </div>

          {/* Available words */}
          {state === "answering" && (
            <div className="flex flex-wrap gap-2">
              {(available[s.id] ?? []).map((w, wi) => (
                <button key={`${w}-${wi}`} type="button"
                  onClick={() => addWord(s.id, w, wi)}
                  className="px-2.5 py-1 rounded-md bg-[#F7F7F5] text-[13px] text-[#111111] hover:bg-[rgba(0,0,0,0.08)] cursor-pointer transition-colors active:scale-95"
                >{w}</button>
              ))}
            </div>
          )}

          {state === "reviewed" && !results[s.id] && (
            <p className="text-[13px] text-[#0F6E56] mt-2">{s.correctSentence}</p>
          )}
        </div>
      ))}
    </SectionShell>
  );
}
