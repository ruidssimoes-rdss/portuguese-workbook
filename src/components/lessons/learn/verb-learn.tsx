"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AudioButton } from "@/components/primitives";
import { TENSE_PT } from "@/components/aula";
import type { VerbLearnData } from "@/lib/exercise-generator";

/** Learn phase · verb in one tense (matches the Conjugações verb page). */
export function VerbLearn({ data }: { data: VerbLearnData }) {
  return (
    <div className="rounded-xl border border-aula-border bg-white p-6">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Verbo</p>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-aula-text">{data.verb.toLowerCase()}</h2>
        <AudioButton text={data.verb.toLowerCase()} />
        <span className="rounded-md bg-aula-accent-faint px-1.5 py-[1px] text-[11px] font-medium text-aula-accent">{TENSE_PT[data.tenseLabel] ?? data.tenseLabel}</span>
      </div>
      <p className="mt-1 text-[14px] text-aula-text-2">{data.verbTranslation}</p>

      <div className="mt-5 divide-y divide-aula-line rounded-[10px] border border-aula-border">
        {(data.conjugations ?? []).map((c) => (
          <div key={c.pronoun} className="grid h-11 grid-cols-[110px_1fr] items-center px-4">
            <span className="text-[12.5px] text-aula-text-3">{c.pronoun}</span>
            <span className="flex items-center gap-1 text-[14px] font-medium text-aula-text">
              {c.form}
              <AudioButton text={c.form} />
            </span>
          </div>
        ))}
      </div>

      <Link href={`/conjugations/${data.verbSlug}`} target="_blank" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-aula-accent">
        Ver todos os tempos <ArrowRight size={12} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
