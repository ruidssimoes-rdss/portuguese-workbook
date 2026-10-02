"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { Item, Prompt, AnswerInput, AccentNote, SectionFooter, type Mark } from "../kit";

interface TransSentence { id: string; sourceText: string; correctAnswer: string; acceptedAnswers?: string[]; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  sentences: TransSentence[]; onComplete: (result: SectionResult) => void;
}

export function TranslationSectionNew({ sectionIndex, totalSections, sentences, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }> | null>(null);
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);

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
      questionId: s.id, correct: results?.[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(), correctAnswer: s.correctAnswer,
      accentHint: results?.[s.id]?.accentHint,
    }));
    onComplete({ sectionKey: "translation", sectionName: "Tradução", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {sentences.map((s, i) => {
          const r = results?.[s.id];
          const mark: Mark = !r ? "idle" : r.correct ? "correct" : "wrong";
          return (
            <Item key={s.id} n={i + 1} mark={mark}>
              <Prompt>«{s.sourceText}»</Prompt>
              <AnswerInput
                ref={(el) => { refs.current[i] = el; }}
                multiline
                value={answers[s.id] ?? ""}
                onChange={(v) => setAnswers((p) => ({ ...p, [s.id]: v }))}
                mark={mark}
                correct={s.correctAnswer}
                placeholder="Escreve a tradução…"
                onEnter={() => (i < sentences.length - 1 ? refs.current[i + 1]?.focus() : verify())}
              />
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
