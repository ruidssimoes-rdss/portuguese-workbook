"use client";

/**
 * Lesson results: score, per-section breakdown, and what to look at again.
 * Wrong answers stay coral (your answer struck through, the right one beside it).
 */

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { SectionResult } from "@/lib/exercise-types";
import { Track } from "@/components/aula";

interface LearnResultsProps {
  passed: boolean;
  accuracy: number;
  sectionResults: SectionResult[];
  onRetry: () => void;
}

export function LearnResults({ passed, accuracy, sectionResults, onRetry }: LearnResultsProps) {
  const pct = Math.round(accuracy);
  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
  const wrong = sectionResults.flatMap((sr) => sr.answers.filter((a) => !a.correct).map((a) => ({ section: sr.sectionName, ...a })));

  return (
    <div className="mx-auto max-w-[620px] pt-6">
      <div className="mb-4 flex items-center gap-2 text-[12px]">
        <Link href="/lessons" className="text-aula-text-3 transition-colors hover:text-aula-text">
          Lições
        </Link>
        <span className="text-aula-text-4">/</span>
        <span className="text-aula-text-2">Resultado</span>
      </div>

      <div className="rounded-xl border border-aula-border bg-white p-6">
        <div className="flex items-end gap-4">
          <span className={`text-[44px] font-semibold leading-none tracking-[-0.03em] ${passed ? "text-[#1F7A68]" : "text-aula-text"}`}>{pct}%</span>
          <div className="pb-1">
            <p className={`text-[15px] font-semibold ${passed ? "text-[#1F7A68]" : "text-[#5B45B8]"}`}>{passed ? "Lição concluída" : "Ainda não"}</p>
            <p className="text-[12px] text-aula-text-2">
              {totalCorrect} de {totalQuestions} certas{passed ? "" : " · precisas de 80% para passar"}
            </p>
          </div>
        </div>
        <div className="relative mt-5">
          <Track value={accuracy / 100} tone={passed ? "accent" : "learning"} />
          <span className="absolute top-[-3px] h-[10px] w-px bg-aula-text-3" style={{ left: "80%" }} title="80%" />
        </div>

        <div className="mt-6">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Por secção</p>
          {sectionResults.map((sr, i) => {
            const p = sr.totalQuestions ? sr.totalCorrect / sr.totalQuestions : 0;
            return (
              <div key={i} className="flex h-9 items-center gap-4 text-[13px]">
                <span className="flex-1 text-aula-text">{sr.sectionName}</span>
                <div className="w-[120px]">
                  <Track value={p} tone={p >= 0.8 ? "accent" : "learning"} />
                </div>
                <span className={`w-12 text-right text-[12px] font-medium ${p >= 0.8 ? "text-[#1F7A68]" : "text-aula-text-2"}`}>
                  {sr.totalCorrect}/{sr.totalQuestions}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
            Para rever · {wrong.length} {wrong.length === 1 ? "resposta" : "respostas"}
          </p>
          <div className="divide-y divide-aula-line rounded-xl border border-aula-border bg-white">
            {wrong.slice(0, 12).map((w, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aula-overdue" />
                <div className="min-w-0 flex-1 text-[13px]">
                  {w.userAnswer && <span className="mr-2 text-aula-overdue line-through decoration-aula-overdue/60">{w.userAnswer}</span>}
                  <span className="text-aula-text">{w.correctAnswer}</span>
                </div>
                <span className="shrink-0 text-[11px] text-aula-text-3">{w.section}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 px-1 text-[11.5px] text-aula-text-3">Voltam nas próximas revisões, mais cedo do que o resto.</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {passed ? (
          <a
            href="/learn"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
          >
            Próxima lição <ArrowRight size={14} strokeWidth={1.5} />
          </a>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
          >
            <RotateCcw size={14} strokeWidth={1.5} /> Tentar outra vez
          </button>
        )}
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-lg border border-aula-border bg-white px-4 text-[13px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
        >
          Voltar a Hoje
        </Link>
      </div>
    </div>
  );
}
