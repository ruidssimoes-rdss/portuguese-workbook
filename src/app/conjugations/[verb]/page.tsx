"use client";

/**
 * Conjugações / verbo (Figma: Conjugações — fazer).
 * Tense tabs over a person / form / example table; participle and notes;
 * panel with your mastery of the verb and verbs in the same group.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { AudioButton } from "@/components/primitives";
import { Pips, LevelTag, Label, PanelCard, KV, TENSE_PT } from "@/components/aula";
import { useMastery, stateOf, dueLabel, STATE_LABEL } from "@/lib/use-mastery";
import verbData from "@/data/verbs.json";

interface Row {
  Person: string;
  Tense: string;
  Conjugation: string;
  "Example Sentence": string;
  "English Translation": string;
  Notes?: string;
}
interface Verb {
  meta: { english: string; group: string; cefr: string; pronunciation?: string; participle?: string; participleNote?: string };
  conjugations: Row[];
}

const VERBS = (verbData as unknown as { verbs: Record<string, Verb>; order: string[] }).verbs;
const ORDER = (verbData as unknown as { order: string[] }).order;


export default function VerbPage() {
  const params = useParams();
  const key = (params.verb as string).toUpperCase();
  const verb = VERBS[key];
  const { map, signedIn } = useMastery("verb");

  const tenses = useMemo(() => (verb ? [...new Set(verb.conjugations.map((c) => c.Tense))] : []), [verb]);
  const [tense, setTense] = useState<string>("Present");
  const rows = verb ? verb.conjugations.filter((c) => c.Tense === tense) : [];

  const sameGroup = useMemo(
    () => (verb ? ORDER.filter((k) => k !== key && VERBS[k]?.meta.group === verb.meta.group).slice(0, 6) : []),
    [verb, key],
  );

  const name = key.toLowerCase();
  const crumbs = <Crumbs items={[{ label: "Conjugações", href: "/conjugations" }, ...(verb ? [{ label: verb.meta.group }] : []), { label: name }]} />;

  if (!verb) {
    return (
      <PageShell header={crumbs}>
        <div className="mx-auto max-w-[620px]">
          <h1 className="text-[22px] font-semibold text-aula-text">Verbo não encontrado</h1>
          <Link href="/conjugations" className="mt-2 inline-block text-[13px] text-aula-accent">
            Voltar às conjugações
          </Link>
        </div>
      </PageShell>
    );
  }

  const rec = map.get(key);
  const state = stateOf(rec);
  const note = rows.find((r) => r.Notes)?.Notes;

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn && (
        <PanelCard title="O teu domínio" aside={<span className={`text-[11px] ${state === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{STATE_LABEL[state].toLowerCase()}</span>}>
          <div className="mb-3">
            <Pips level={rec?.mastery_level ?? 0} state={state} />
          </div>
          <KV k="Próxima revisão" v={dueLabel(rec)} tone={state === "overdue" ? "overdue" : undefined} />
          <KV k="Tentativas" v={rec?.times_seen ?? 0} />
          <Link href="/learn" className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
            Praticar
          </Link>
        </PanelCard>
      )}
      {sameGroup.length > 0 && (
        <div>
          <Label className="mb-2">Mesmo padrão</Label>
          {sameGroup.map((k) => (
            <Link key={k} href={`/conjugations/${k.toLowerCase()}`} className="flex h-7 items-center rounded-md px-2 text-[12.5px] text-aula-accent hover:bg-aula-sunken">
              {k.toLowerCase()}
              <span className="flex-1" />
              <span className="truncate pl-2 text-[11px] text-aula-text-3">{VERBS[k].meta.english}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell header={crumbs} panel={panel}>
      <article className="mx-auto max-w-[680px]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-aula-text-3">
          {verb.meta.pronunciation && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-aula-border px-2 text-aula-accent">
              <AudioButton text={name} />/{verb.meta.pronunciation}/
            </span>
          )}
          <span>{verb.meta.english}</span>
          <span className="text-aula-text-4">·</span>
          <span className="text-aula-accent">{verb.meta.group}</span>
          <LevelTag level={verb.meta.cefr} />
        </div>

        <div className="mt-6 inline-flex max-w-full flex-wrap gap-0.5 rounded-lg bg-aula-sunken p-[3px]">
          {tenses.map((t) => (
            <button
              key={t}
              onClick={() => setTense(t)}
              className={`h-[26px] rounded-md border px-2.5 text-[12px] transition-colors ${
                tense === t ? "border-aula-line bg-white font-medium text-aula-text shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : "border-transparent text-aula-text-2 hover:text-aula-text"
              }`}
            >
              {TENSE_PT[t] ?? t}
            </button>
          ))}
        </div>

        <div className="mt-2">
          {rows.map((r, i) => (
            <div key={i} className="grid min-h-[40px] grid-cols-[110px_1fr] items-center gap-3 border-b border-aula-line py-1.5 last:border-0 md:grid-cols-[140px_140px_1fr]">
              <span className="text-[12px] text-aula-text-3">{r.Person.split(" (")[0]}</span>
              <span className="flex items-center gap-1 text-[13px] font-medium text-aula-text">
                {r.Conjugation}
                <AudioButton text={r.Conjugation} />
              </span>
              <span className="hidden text-[12px] md:block">
                <span className="text-aula-text-2">{r["Example Sentence"]}</span>
                <span className="block text-[11px] text-aula-text-3">{r["English Translation"]}</span>
              </span>
            </div>
          ))}
        </div>
        {note && <p className="mt-3 text-[12px] leading-relaxed text-aula-text-3">{note}</p>}

        {verb.meta.participle && (
          <div className="mt-8 rounded-[10px] border border-aula-border px-4 py-3">
            <div className="flex items-baseline gap-3">
              <Label>Particípio</Label>
              <span className="text-[13px] font-medium text-aula-text">{verb.meta.participle}</span>
            </div>
            {verb.meta.participleNote && <p className="mt-1 text-[12px] leading-relaxed text-aula-text-2">{verb.meta.participleNote}</p>}
          </div>
        )}
      </article>
    </PageShell>
  );
}
