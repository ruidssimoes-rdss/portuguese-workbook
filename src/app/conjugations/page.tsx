"use client";

/**
 * Conjugações — índice (Figma: Ecrãs / Conjugações — índice).
 * Verbs grouped by conjugation pattern with mastery and next review;
 * panel with your verb stats and the four families.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SegmentedFilter } from "@/components/primitives";
import { Pips, LevelTag, Label, ScreenTitle, PanelCard, KV } from "@/components/aula";
import { useMastery, stateOf, dueLabel, type WordState } from "@/lib/use-mastery";
import verbData from "@/data/verbs.json";
import { getGroupedVerbs } from "@/data/verb-groups";

interface Conj {
  Conjugation: string;
  Person: string;
  Tense: string;
}
interface Verb {
  meta: { english: string; group: string; cefr: string };
  conjugations: Conj[];
}
const VERBS = (verbData as unknown as { verbs: Record<string, Verb> }).verbs;
const ORDER = (verbData as unknown as { order: string[] }).order;

const LEVELS = ["Todos", "A1", "A2", "B1"];
const STATE_FILTERS = ["Todos", "Em atraso", "A aprender", "Por ver"];
const FILTER_STATE: Record<string, WordState | null> = { Todos: null, "Em atraso": "overdue", "A aprender": "learning", "Por ver": "unseen" };

const FAMILIES: { key: string; label: string; note: string; test: (g: string) => boolean }[] = [
  { key: "ar", label: "Regulares em -ar", note: "falar → falo, falas, fala, falamos, falam", test: (g) => g.includes("-ar") && !g.startsWith("irregular") },
  { key: "er", label: "Regulares em -er", note: "comer → como, comes, come, comemos, comem", test: (g) => g.includes("-er") && !g.startsWith("irregular") },
  { key: "ir", label: "Regulares em -ir", note: "partir → parto, partes, parte, partimos, partem", test: (g) => g.includes("-ir") && !g.startsWith("irregular") },
  { key: "irr", label: "Irregulares", note: "ser, estar, ter, ir, fazer… cada um tem as suas formas", test: (g) => g.startsWith("irregular") || g.includes("impersonal") },
];


export default function ConjugationsPage() {
  const { map, signedIn } = useMastery("verb");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [filter, setFilter] = useState("Todos");
  const [family, setFamily] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const want = FILTER_STATE[filter];
    const fam = FAMILIES.find((f) => f.key === family);
    return ORDER.filter((k) => {
      const m = VERBS[k]?.meta;
      if (!m) return false;
      if (level !== "Todos" && m.cefr !== level) return false;
      if (fam && !fam.test(m.group.toLowerCase())) return false;
      if (want && stateOf(map.get(k)) !== want) return false;
      if (!q) return true;
      return k.toLowerCase().includes(q) || m.english.toLowerCase().includes(q) || VERBS[k].conjugations.some((c) => c.Conjugation?.toLowerCase().includes(q));
    });
  }, [query, level, filter, family, map]);

  const groups = useMemo(() => getGroupedVerbs(visible), [visible]);
  const searching = query.trim().length > 0;

  const mastered = ORDER.filter((k) => stateOf(map.get(k)) === "mastered").length;
  const overdue = ORDER.filter((k) => stateOf(map.get(k)) === "overdue").length;
  const learning = ORDER.filter((k) => stateOf(map.get(k)) === "learning").length;

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn && (
        <PanelCard title="Os teus verbos">
          <KV k="Dominados" v={`${mastered} de ${ORDER.length}`} />
          <KV k="A aprender" v={learning} />
          <KV k="Em atraso" v={overdue} tone={overdue > 0 ? "overdue" : undefined} />
          {overdue > 0 && (
            <Link href="/learn?mode=review" className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
              Rever {overdue}
            </Link>
          )}
        </PanelCard>
      )}
      <div>
        <Label className="mb-2">Famílias</Label>
        <button
          onClick={() => setFamily(null)}
          className={`flex h-7 w-full items-center rounded-md px-2 text-[12.5px] ${!family ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
        >
          Todas <span className="flex-1" />
          <span className="text-[11px] text-aula-text-3">{ORDER.length}</span>
        </button>
        {FAMILIES.map((f) => (
          <button
            key={f.key}
            onClick={() => setFamily(family === f.key ? null : f.key)}
            className={`flex h-7 w-full items-center rounded-md px-2 text-left text-[12.5px] ${family === f.key ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
          >
            {f.label}
            <span className="flex-1" />
            <span className="text-[11px] text-aula-text-3">{ORDER.filter((k) => f.test(VERBS[k].meta.group.toLowerCase())).length}</span>
          </button>
        ))}
        {family && <p className="mt-2 px-2 text-[11.5px] leading-relaxed text-aula-text-3">{FAMILIES.find((f) => f.key === family)!.note}</p>}
      </div>
    </div>
  );

  const Row = ({ k }: { k: string }) => {
    const m = VERBS[k].meta;
    const r = map.get(k);
    const s = stateOf(r);
    const q = query.trim().toLowerCase();
    const formHit =
      q && !k.toLowerCase().includes(q) && !m.english.toLowerCase().includes(q)
        ? VERBS[k].conjugations.find((c) => c.Conjugation?.toLowerCase().includes(q))
        : undefined;
    return (
      <Link href={`/conjugations/${k.toLowerCase()}`} className="flex min-h-[44px] items-center gap-4 rounded-[10px] px-3 py-1.5 transition-colors hover:bg-aula-sunken">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[12.5px] font-medium text-aula-text">{k.toLowerCase()}</span>
            <span className="truncate text-[11.5px] text-aula-text-3">{m.english}</span>
          </div>
          {formHit && (
            <div className="text-[11px] text-aula-text-3">
              «{formHit.Conjugation}» · {formHit.Person.split(" (")[0]}
            </div>
          )}
        </div>
        <LevelTag level={m.cefr} />
        {signedIn && (
          <>
            <Pips level={r?.mastery_level ?? 0} state={s} />
            <span className={`w-[64px] text-right text-[11px] ${s === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{dueLabel(r)}</span>
          </>
        )}
      </Link>
    );
  };

  return (
    <PageShell header={<Crumbs items={[{ label: "Conjugações" }]} />} panel={panel}>
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle
          title="Conjugações"
          subtitle={signedIn ? `${ORDER.length} verbos · ${mastered} dominados · ${overdue} em atraso` : `${ORDER.length} verbos em 9 tempos, do A1 ao B1`}
        />
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-aula-line bg-aula-sunken px-2.5 focus-within:border-aula-border focus-within:bg-white">
            <Search size={14} strokeWidth={1.5} className="text-aula-text-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar um verbo ou uma forma (ex.: fiz)…"
              className="w-full bg-transparent text-[12px] text-aula-text outline-none placeholder:text-aula-text-3"
            />
          </label>
          <SegmentedFilter options={LEVELS} value={level} onChange={setLevel} />
        </div>
        {signedIn && (
          <div className="mb-7">
            <SegmentedFilter options={STATE_FILTERS} value={filter} onChange={setFilter} />
          </div>
        )}
        {!signedIn && <div className="mb-7" />}

        {searching || groups.length === 0 ? (
          <div>
            {visible.map((k) => (
              <Row key={k} k={k} />
            ))}
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.label} className="mb-7">
              <div className="mb-1 flex items-center gap-2 px-3">
                <Label>{(g.labelPt ?? g.label).replace(/^Regular (-[A-Z]{2}): /, "$1 · ").replace(/^Irregular (-[A-Z]{2}: )?/, "Irregulares · ")}</Label>
                <span className="text-[11px] text-aula-text-4">{g.verbs.length}</span>
              </div>
              {g.verbs.map((k: string) => (
                <Row key={k} k={k} />
              ))}
            </section>
          ))
        )}
        {visible.length === 0 && <p className="py-12 text-center text-[13px] text-aula-text-2">Nenhum verbo com estes filtros.</p>}
      </div>
    </PageShell>
  );
}
