"use client";

import { useState, useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { useShuffledOptions } from "@/lib/shuffle-options";
import { getGrammar, type GrammarEntry } from "@/lib/book/catalog";
import { Callout, Examples, Kicker } from "./ui";
import { LinkedText } from "./linked-text";

interface Question {
  questionText: string;
  questionTextPt?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation?: string;
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mt-9 font-sans text-[13px] font-medium leading-relaxed tracking-[-0.011em] text-aula-text">
      <span className="mr-2 tabular-nums text-[#5A5A57]">{n}</span>
      {children}
    </h2>
  );
}

function isEp(text: string) {
  return /european|europeu|brazil|gerúndio|gerundio|\bEP\b|\bBR\b/i.test(text);
}

export function GrammarChapter({ id }: { id: string }) {
  const topic = getGrammar(id);
  if (!topic) return null;
  const paragraphs = topic.intro.split("\n").map((p) => p.trim()).filter(Boolean);
  const epRules = topic.rules.filter((rule) => isEp(`${rule.rule} ${rule.rulePt ?? ""}`));
  const pullEp = topic.rules.length > 2 && epRules.length > 0 && epRules.length < topic.rules.length;
  const bodyRules = pullEp ? topic.rules.filter((rule) => !epRules.includes(rule)) : topic.rules;
  const tips = topic.tips.filter((tip) => !isEp(tip));
  const epTips = topic.tips.filter((tip) => isEp(tip));

  return (
    <article className="mx-auto max-w-[640px]">
      <Kicker>
        Gramática · {topic.cefr}
        {topic.chapter > 0 ? ` · Capítulo ${topic.chapter}` : ""}
      </Kicker>
      <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{topic.titlePt}</h1>
      {topic.summary && <p className="mt-2 text-[13px] leading-relaxed text-[#5A5A57]">{topic.summary}</p>}

      {paragraphs.length > 0 && (
        <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-aula-text">
          {paragraphs.map((p, i) => (
            <p key={i}>
              <LinkedText text={p} skip={topic.ref} />
            </p>
          ))}
        </div>
      )}

      {bodyRules.map((rule, i) => (
        <section key={i}>
          <SectionTitle n={i + 1}>{rule.rulePt || rule.rule}</SectionTitle>
          {rule.rulePt && (
            <p className="mt-2 text-[13px] leading-relaxed text-aula-text">
              <LinkedText text={rule.rule} skip={topic.ref} />
            </p>
          )}
          <Examples rows={rule.examples.slice(0, 4)} skip={topic.ref} />
          {rule.exceptions?.map((exception, j) => (
            <p key={j} className="mt-2 text-[12.5px] leading-relaxed text-[#5A5A57]">
              Nota: <LinkedText text={exception} skip={topic.ref} />
            </p>
          ))}
        </section>
      ))}

      {(pullEp || epTips.length > 0) && (epRules.length > 0 || epTips.length > 0) && (
        <div className="mt-6">
          <Callout
            label={
              <>
                <span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span>
                Português europeu
              </>
            }
          >
            <div className="flex flex-col gap-2">
              {pullEp &&
                epRules.map((rule, i) => (
                  <p key={`r${i}`}>
                    <LinkedText text={rule.rule} skip={topic.ref} />
                  </p>
                ))}
              {epTips.map((tip, i) => (
                <p key={`t${i}`}>
                  <LinkedText text={tip} skip={topic.ref} />
                </p>
              ))}
              {pullEp &&
                epRules[0]?.examples.slice(0, 2).map((ex, i) => (
                  <p key={`e${i}`} className="font-medium">
                    <LinkedText text={ex.pt} skip={topic.ref} />
                    {ex.en && <span className="ml-1.5 font-normal text-[#5A5A57]">{ex.en}</span>}
                  </p>
                ))}
            </div>
          </Callout>
        </div>
      )}

      {tips.length > 0 && (
        <div className="mt-3">
          <Callout tone="plain" label="Dica">
            <ul className="flex flex-col gap-1.5">
              {tips.map((tip, i) => (
                <li key={i}>
                  <LinkedText text={tip} skip={topic.ref} />
                </li>
              ))}
            </ul>
          </Callout>
        </div>
      )}

      {topic.questions.length > 0 && <QuickCheck questions={topic.questions.slice(0, 3)} />}
    </article>
  );
}

export function grammarListenLines(topic: GrammarEntry): string[] {
  const lines = [topic.titlePt];
  for (const rule of topic.rules) {
    for (const ex of rule.examples.slice(0, 2)) lines.push(ex.pt);
  }
  return lines.filter(Boolean);
}

function QuickCheck({ questions }: { questions: Question[] }) {
  return (
    <section className="mt-10">
      <Kicker>Verifica · {questions.length} perguntas</Kicker>
      <div className="mt-3 flex flex-col gap-3">
        {questions.map((q, i) => (
          <CheckBlock key={i} q={q} n={i + 1} total={questions.length} />
        ))}
      </div>
    </section>
  );
}

function useClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function CheckBlock({ q, n, total }: { q: Question; n: number; total: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  // The shuffle seed lives in sessionStorage, so the server snapshot and the
  // hydration render both show the authored order.
  const client = useClient();
  const shuffled = useShuffledOptions(
    q.options,
    q.correctIndex,
    `grammar-quick-check-${q.questionText.slice(0, 30)}`,
  );
  const options = client ? shuffled.options : q.options;
  const correctIndex = client ? shuffled.correctIndex : q.correctIndex;
  const done = picked !== null;
  const right = picked === correctIndex;
  return (
    <div className="rounded-xl border border-aula-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-[#5A5A57]">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-[0.06em] text-[#1F7A68]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A68]" /> Verifica
        </span>
        <span>
          {n} de {total}
        </span>
      </div>
      <p className="mb-3 text-[13px] font-medium text-aula-text">{q.questionTextPt ?? q.questionText}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const isRight = done && i === correctIndex;
          const isWrong = done && i === picked && !right;
          return (
            <button
              key={o}
              type="button"
              disabled={done}
              onClick={() => setPicked(i)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors ${
                isRight
                  ? "border-[#BFE3D8] bg-[#E1F2ED] text-[#1F7A68]"
                  : isWrong
                    ? "border-[#F0C9BE] bg-[#FBE9E4] text-aula-overdue"
                    : done
                      ? "border-aula-border text-[#5A5A57]"
                      : "border-aula-border text-aula-text hover:border-[#B5B5AE]"
              }`}
            >
              {o}
              {isRight && <Check size={13} strokeWidth={2} />}
            </button>
          );
        })}
      </div>
      {done && q.explanation && <p className="mt-3 text-[12px] leading-relaxed text-[#5A5A57]">{q.explanation}</p>}
    </div>
  );
}
