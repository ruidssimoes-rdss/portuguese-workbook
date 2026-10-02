"use client";

/**
 * Vocabulário — índice (Figma: Ecrãs / Vocabulário — índice).
 * Search + state filter, words grouped by category with level, mastery and
 * next review; right panel with the collection breakdown and categories.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SegmentedFilter } from "@/components/primitives";
import { Pips, LevelTag, PanelCard, Label, ScreenTitle, CATEGORY_PT, wordHref } from "@/components/aula";
import { useMastery, stateOf, dueLabel, STATE_LABEL, type WordState } from "@/lib/use-mastery";
import vocabData from "@/data/vocab.json";

const PER_GROUP = 6;
const STATE_FILTERS = ["Todas", "Em atraso", "A aprender", "Dominadas", "Por ver"] as const;
const FILTER_TO_STATE: Record<string, WordState | null> = {
  Todas: null,
  "Em atraso": "overdue",
  "A aprender": "learning",
  Dominadas: "mastered",
  "Por ver": "unseen",
};
const LEVEL_FILTERS = ["Todos", "A1", "A2", "B1"];

type Word = (typeof vocabData.categories)[number]["words"][number];

export default function VocabularyPage() {
  const { map, signedIn } = useMastery("vocab");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("Todas");
  const [level, setLevel] = useState("Todos");
  const [category, setCategory] = useState<string | null>(null);

  const total = useMemo(() => vocabData.categories.reduce((n, c) => n + c.words.length, 0), []);

  const counts = useMemo(() => {
    const c: Record<WordState, number> = { unseen: 0, learning: 0, overdue: 0, mastered: 0 };
    for (const cat of vocabData.categories) for (const w of cat.words) c[stateOf(map.get(w.portuguese))]++;
    return c;
  }, [map]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const wantState = FILTER_TO_STATE[stateFilter];
    return vocabData.categories
      .filter((cat) => !category || cat.id === category)
      .map((cat) => {
        const words = cat.words.filter((w: Word) => {
          if (level !== "Todos" && w.cefr !== level) return false;
          if (wantState && stateOf(map.get(w.portuguese)) !== wantState) return false;
          if (q && !w.portuguese.toLowerCase().includes(q) && !w.english.toLowerCase().includes(q)) return false;
          return true;
        });
        return { cat, words };
      })
      .filter((g) => g.words.length > 0);
  }, [query, stateFilter, level, category, map]);

  const shown = groups.reduce((n, g) => n + g.words.length, 0);
  const filtering = !!query || stateFilter !== "Todas" || level !== "Todos" || !!category;

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn && (
        <PanelCard title="A tua coleção">
          <div className="mb-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            {(["mastered", "learning", "overdue", "unseen"] as WordState[]).map((s) => (
              <div
                key={s}
                className={s === "mastered" ? "bg-aula-accent" : s === "learning" ? "bg-[#5B45B8]" : s === "overdue" ? "bg-aula-overdue" : "bg-[#E6E6E4]"}
                style={{ flexGrow: Math.max(counts[s], total * 0.004) }}
              />
            ))}
          </div>
          {(["mastered", "learning", "overdue", "unseen"] as WordState[]).map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(STATE_FILTERS.find((f) => FILTER_TO_STATE[f] === s) ?? "Todas")}
              className="flex w-full items-center gap-2 py-[3px] text-[12px]"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s === "mastered" ? "bg-aula-accent" : s === "learning" ? "bg-[#5B45B8]" : s === "overdue" ? "bg-aula-overdue" : "bg-aula-text-4"}`} />
              <span className="text-aula-text-2">{STATE_LABEL[s]}</span>
              <span className="flex-1" />
              <span className={`font-medium ${s === "overdue" && counts.overdue > 0 ? "text-aula-overdue" : "text-aula-text"}`}>
                {counts[s].toLocaleString("pt-PT")}
              </span>
            </button>
          ))}
          {counts.overdue > 0 && (
            <Link
              href="/learn?mode=review"
              className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
            >
              Rever as {counts.overdue} em atraso
            </Link>
          )}
        </PanelCard>
      )}
      <div>
        <Label className="mb-2">Categorias</Label>
        <CategoryRow label="Todas" count={total} active={!category} onClick={() => setCategory(null)} />
        {vocabData.categories.map((c) => (
          <CategoryRow
            key={c.id}
            label={CATEGORY_PT[c.id] ?? c.title}
            count={c.words.length}
            active={category === c.id}
            onClick={() => setCategory(category === c.id ? null : c.id)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Vocabulário" }]} />} panel={panel}>
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle
          title="Vocabulário"
          subtitle={
            signedIn
              ? `${total.toLocaleString("pt-PT")} palavras · ${counts.mastered} dominadas · ${counts.overdue} em atraso`
              : `${total.toLocaleString("pt-PT")} palavras em ${vocabData.categories.length} categorias`
          }
        />

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-aula-line bg-aula-sunken px-2.5 focus-within:border-aula-border focus-within:bg-white">
            <Search size={14} strokeWidth={1.5} className="text-aula-text-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Procurar ${total.toLocaleString("pt-PT")} palavras…`}
              className="w-full bg-transparent text-[12px] text-aula-text outline-none placeholder:text-aula-text-3"
            />
          </label>
          <SegmentedFilter options={LEVEL_FILTERS} value={level} onChange={setLevel} />
        </div>
        {signedIn && (
          <div className="mb-7">
            <SegmentedFilter options={[...STATE_FILTERS]} value={stateFilter} onChange={setStateFilter} />
          </div>
        )}
        {!signedIn && <div className="mb-4" />}

        {/* Groups */}
        {groups.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[15px] font-semibold text-aula-text">
              {query ? `Nenhuma palavra para «${query}»` : "Nada aqui"}
            </div>
            <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] text-aula-text-2">
              {query ? "Não está no teu vocabulário. Experimenta outra forma da palavra, ou procura em inglês." : "Experimenta outro filtro."}
            </p>
          </div>
        ) : (
          groups.map(({ cat, words }) => {
            const limit = filtering ? 40 : PER_GROUP;
            return (
              <section key={cat.id} className="mb-7">
                <div className="mb-1.5 flex items-center justify-between">
                  <Label>
                    {CATEGORY_PT[cat.id] ?? cat.title} · {words.length}
                  </Label>
                  <Link href={`/vocabulary/${cat.id}`} className="flex items-center gap-0.5 text-[11px] text-aula-text-3 hover:text-aula-accent">
                    Ver categoria <ChevronRight size={12} strokeWidth={1.5} />
                  </Link>
                </div>
                <div>
                  {words.slice(0, limit).map((w) => (
                    <WordRow key={w.portuguese} word={w} rec={map.get(w.portuguese)} signedIn={signedIn} href={wordHref(cat.id, w.portuguese)} />
                  ))}
                </div>
                {words.length > limit && (
                  <Link href={`/vocabulary/${cat.id}`} className="mt-1 block px-2 text-[11.5px] text-aula-text-3 hover:text-aula-accent">
                    + {words.length - limit} palavras
                  </Link>
                )}
              </section>
            );
          })
        )}
        {filtering && groups.length > 0 && <p className="text-[11.5px] text-aula-text-3">{shown} palavras</p>}
      </div>
    </PageShell>
  );
}

function WordRow({
  word,
  rec,
  signedIn,
  href,
}: {
  word: Word;
  rec: ReturnType<ReturnType<typeof useMastery>["map"]["get"]>;
  signedIn: boolean;
  href: string;
}) {
  const state = stateOf(rec);
  const due = dueLabel(rec);
  return (
    <Link href={href} className="grid h-[33px] grid-cols-[1fr_1fr_auto] items-center gap-3 rounded-lg px-2 transition-colors hover:bg-aula-sunken md:grid-cols-[200px_1fr_36px_70px_76px]">
      <span className="truncate text-[12.5px] font-medium text-aula-accent">{word.portuguese}</span>
      <span className="truncate text-[12px] text-aula-text-2">{word.english}</span>
      <span className="hidden md:block">
        <LevelTag level={word.cefr} />
      </span>
      {signedIn ? (
        <>
          <span className="hidden md:block">
            <Pips level={rec?.mastery_level ?? 0} state={state} />
          </span>
          <span className={`hidden text-right text-[11px] md:block ${state === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{due}</span>
        </>
      ) : (
        <span className="md:hidden">
          <LevelTag level={word.cefr} />
        </span>
      )}
    </Link>
  );
}

function CategoryRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 w-full items-center rounded-md px-2 text-[12.5px] transition-colors ${
        active ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="flex-1" />
      <span className="text-[11px] text-aula-text-3">{count.toLocaleString("pt-PT")}</span>
    </button>
  );
}
