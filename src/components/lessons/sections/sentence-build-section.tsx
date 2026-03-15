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
        <div key={s.id} className="border border-[var(--border-primary)] rounded-[12px] p-5 bg-[var(--bg-card)]">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-[13px] font-semibold text-[var(--text-muted)]">{i + 1}.</span>
            {showEnglish && s.sentenceEnglish && (
              <p className="text-[14px] text-[var(--text-secondary)]">&ldquo;{s.sentenceEnglish}&rdquo;</p>
            )}
          </div>

          {/* Staging area */}
          <div className={`border-2 border-dashed rounded-[10px] p-3 min-h-[48px] mb-3 ${
            state === "reviewed"
              ? results[s.id] ? "border-[#059669] bg-[#F0FDF4]" : "border-[#DC2626] bg-[#FEF2F2]"
              : "border-[var(--border-primary)]"
          }`}>
            {(placed[s.id] ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(placed[s.id] ?? []).map((w, wi) => (
                  <button key={`${w}-${wi}`} type="button" disabled={state === "reviewed"}
                    onClick={() => removeWord(s.id, w, wi)}
                    className="px-3 py-1.5 rounded-[8px] text-[14px] font-medium bg-[rgba(0,51,153,0.05)] border border-[#003399] text-[#003399] cursor-pointer hover:bg-[#003399] hover:text-white transition-all active:scale-95"
                  >{w}</button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] text-center">
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
                  className="px-3 py-1.5 rounded-[8px] border border-[var(--border-primary)] text-[14px] font-medium text-[var(--text-primary)] hover:border-[#003399] hover:bg-[rgba(0,51,153,0.05)] cursor-pointer transition-all active:scale-95"
                >{w}</button>
              ))}
            </div>
          )}

          {state === "reviewed" && !results[s.id] && (
            <p className="text-[13px] text-[#059669] mt-2">{s.correctSentence}</p>
          )}
        </div>
      ))}
    </SectionShell>
  );
}
