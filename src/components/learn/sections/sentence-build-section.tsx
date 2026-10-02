"use client";

import { useState } from "react";
import type { SectionResult } from "@/lib/exercise-types";
import { Item, Prompt, Chip, SectionFooter, type Mark } from "../kit";

interface BuildSentence { id: string; scrambledWords: string[]; correctSentence: string; acceptedAnswers?: string[]; sentenceEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  sentences: BuildSentence[]; onComplete: (result: SectionResult) => void;
}

const normalize = (str: string) => str.trim().toLowerCase().replace(/[.!?¿¡,;:]+/g, "").replace(/\s+/g, " ");

export function SentenceBuildSectionNew({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: Props) {
  // Placed = indexes into scrambledWords, in the order the learner tapped them.
  const [placed, setPlaced] = useState<Record<string, number[]>>({});
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const sentenceOf = (s: BuildSentence) => (placed[s.id] ?? []).map((i) => s.scrambledWords[i]).join(" ");
  const remaining = sentences.filter((s) => (placed[s.id] ?? []).length < s.scrambledWords.length).length;

  function toggle(s: BuildSentence, wi: number) {
    if (results) return;
    setPlaced((p) => {
      const cur = p[s.id] ?? [];
      return { ...p, [s.id]: cur.includes(wi) ? cur.filter((x) => x !== wi) : [...cur, wi] };
    });
  }

  function verify() {
    if (remaining > 0) return;
    setResults(
      Object.fromEntries(
        sentences.map((s) => [s.id, [s.correctSentence, ...(s.acceptedAnswers ?? [])].some((a) => normalize(sentenceOf(s)) === normalize(a))]),
      ),
    );
  }

  function finish() {
    const ans = sentences.map((s) => ({ questionId: s.id, correct: results?.[s.id] ?? false, userAnswer: sentenceOf(s), correctAnswer: s.correctSentence }));
    onComplete({ sectionKey: "sentence-build", sectionName: "Constrói a frase", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {sentences.map((s, i) => {
          const ok = results?.[s.id];
          const mark: Mark = results ? (ok ? "correct" : "wrong") : "idle";
          const order = placed[s.id] ?? [];
          return (
            <Item key={s.id} n={i + 1} mark={mark}>
              <Prompt>{showEnglish && s.sentenceEnglish ? s.sentenceEnglish : "Põe as palavras por ordem"}</Prompt>

              <div
                className={`flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-[10px] border px-2 py-1.5 ${
                  mark === "correct" ? "border-[#1F7A68] bg-[#E1F2ED]" : mark === "wrong" ? "border-[#B94A32] bg-[#FBE9E4]" : "border-[#E6E6E4] bg-[#F7F7F6]"
                }`}
              >
                {order.length === 0 && <span className="px-1.5 text-[12.5px] text-[#B5B5AE]">Toca nas palavras abaixo…</span>}
                {order.map((wi) =>
                  results ? (
                    <span key={wi} className={`px-1 text-[14px] ${ok ? "text-[#1F7A68]" : "text-[#B94A32] line-through decoration-[#B94A32]/60"}`}>
                      {s.scrambledWords[wi]}
                    </span>
                  ) : (
                    <Chip key={wi} state="placed" onClick={() => toggle(s, wi)}>
                      {s.scrambledWords[wi]}
                    </Chip>
                  ),
                )}
              </div>

              {!results ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.scrambledWords.map((w, wi) => (
                    <Chip key={wi} state={order.includes(wi) ? "used" : "available"} onClick={() => toggle(s, wi)}>
                      {w}
                    </Chip>
                  ))}
                </div>
              ) : (
                !ok && (
                  <p className="mt-2 flex items-baseline gap-2.5 px-1">
                    <span className="text-[11px] text-[#98988F]">Resposta</span>
                    <span className="text-[14px] text-[#1F1F1F]">{s.correctSentence}</span>
                  </p>
                )
              )}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter(Boolean).length} total={sentences.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
