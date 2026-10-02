"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AudioButton } from "@/components/primitives";
import type { GrammarLearnData } from "@/lib/exercise-generator";

/** Learn phase · grammar rule (matches the Gramática topic page). */
export function GrammarLearn({ data }: { data: GrammarLearnData }) {
  return (
    <div className="rounded-xl border border-aula-border bg-white p-6">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Regra</p>
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{data.topicTitlePt || data.topicTitle}</h2>
      {data.topicTitlePt && <p className="mt-0.5 text-[12.5px] text-aula-text-3">{data.topicTitle}</p>}

      {data.rules.map((rule, i) => (
        <section key={i} className="mt-6">
          <h3 className="text-[14px] font-semibold text-aula-text">
            {i + 1} · {rule.rulePt || rule.rule}
          </h3>
          {rule.rulePt && <p className="mt-1 text-[13px] leading-relaxed text-aula-text-2">{rule.rule}</p>}
          {rule.examples.length > 0 && (
            <div className="mt-3 flex flex-col gap-2.5">
              {rule.examples.map((ex, j) => (
                <div key={j} className="flex gap-2.5">
                  <AudioButton text={ex.pt} />
                  <div>
                    <p className="text-[13.5px] font-medium text-aula-text">{ex.pt}</p>
                    <p className="text-[11.5px] text-aula-text-3">{ex.en}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {data.tipsPt.length > 0 && (
        <div className="mt-6 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-4 py-3">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span>
            <span className="text-[12px] font-medium text-aula-accent">Dica</span>
          </div>
          {data.tipsPt.map((tip, i) => (
            <p key={i} className="text-[12.5px] leading-relaxed text-aula-text">
              {tip}
            </p>
          ))}
        </div>
      )}

      <Link href={`/grammar/${data.topicSlug}`} target="_blank" className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-aula-accent">
        Ler a regra completa <ArrowRight size={12} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
