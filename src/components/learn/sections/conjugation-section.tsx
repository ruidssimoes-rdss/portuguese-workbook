"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { TENSE_PT } from "@/components/aula";
import { Item, ConjRow, SectionFooter, type Mark } from "../kit";

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

const keyOf = (v: VerbData, p: { pronoun: string }) => `${v.verb}-${v.tense}-${p.pronoun}`;

export function ConjugationSectionNew({ sectionIndex, totalSections, showEnglish, verbs, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }> | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { const t = setTimeout(() => refs.current[0]?.focus(), 100); return () => clearTimeout(t); }, []);

  const allKeys = verbs.flatMap((v) => v.persons.map((p) => keyOf(v, p)));
  const remaining = allKeys.filter((k) => !(answers[k] ?? "").trim()).length;

  function verify() {
    if (remaining > 0) return;
    const r: NonNullable<typeof results> = {};
    for (const v of verbs) {
      for (const p of v.persons) {
        const chk = checkAnswer((answers[keyOf(v, p)] ?? "").trim(), p.correctForm);
        r[keyOf(v, p)] = { correct: chk.correct, accentHint: chk.accentHint };
      }
    }
    setResults(r);
  }

  function finish() {
    const ans = verbs.flatMap((v) =>
      v.persons.map((p) => {
        const key = keyOf(v, p);
        return {
          questionId: key,
          correct: results?.[key]?.correct ?? false,
          userAnswer: (answers[key] ?? "").trim(),
          correctAnswer: p.correctForm,
          accentHint: results?.[key]?.accentHint,
        };
      }),
    );
    onComplete({ sectionKey: "conjugation", sectionName: "Conjugação", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  let idx = 0;
  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {verbs.map((v, vi) => {
          const keys = v.persons.map((p) => keyOf(v, p));
          const mark: Mark = !results ? "idle" : keys.every((k) => results[k]?.correct) ? "correct" : "wrong";
          return (
            <Item key={`${v.verb}-${v.tense}`} n={vi + 1} mark={mark}>
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[15px] font-semibold text-[#1F1F1F]">{v.verb.toLowerCase()}</span>
                {showEnglish && v.verbMeaning && <span className="text-[12px] text-[#98988F]">{v.verbMeaning}</span>}
                <span className="rounded-md bg-[#F3F5FA] px-1.5 py-[1px] text-[11px] font-medium text-[#1B2B61]">{TENSE_PT[v.tense] ?? v.tense}</span>
              </div>
              {v.persons.map((p) => {
                const key = keyOf(v, p);
                const r = results?.[key];
                const i = idx++;
                return (
                  <ConjRow
                    key={key}
                    ref={(el) => { refs.current[i] = el; }}
                    person={p.pronoun}
                    value={answers[key] ?? ""}
                    onChange={(val) => setAnswers((prev) => ({ ...prev, [key]: val }))}
                    mark={!r ? "idle" : r.correct ? "correct" : "wrong"}
                    correct={p.correctForm}
                    onEnter={() => (i < allKeys.length - 1 ? refs.current[i + 1]?.focus() : verify())}
                  />
                );
              })}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter((r) => r.correct).length} total={allKeys.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
