"use client";

/**
 * Vocabulário / categoria — word list for one category, grouped where the
 * category has groups. Each word opens its note (/vocabulary/[category]/[word]).
 */

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SegmentedFilter } from "@/components/primitives";
import { Pips, LevelTag, Label, ScreenTitle, PanelCard, CATEGORY_PT, wordHref } from "@/components/aula";
import { useMastery, stateOf, dueLabel, STATE_LABEL, type WordState } from "@/lib/use-mastery";
import vocabData from "@/data/vocab.json";
import { getWordGroups } from "@/data/vocab-groups";

type Word = (typeof vocabData.categories)[number]["words"][number];

function CategoryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.category as string;
  const category = vocabData.categories.find((c) => c.id === slug);
  const { map, signedIn } = useMastery("vocab");
  const [level, setLevel] = useState(searchParams.get("level") || "Todos");
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const words = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    return category.words.filter(
      (w) =>
        (level === "Todos" || w.cefr === level) &&
        (!q || w.portuguese.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)),
    );
  }, [category, level, query]);

  const groups = useMemo(() => (query ? null : getWordGroups(slug, words)), [slug, words, query]);

  const counts = useMemo(() => {
    const c: Record<WordState, number> = { unseen: 0, learning: 0, overdue: 0, mastered: 0 };
    for (const w of category?.words ?? []) c[stateOf(map.get(w.portuguese))]++;
    return c;
  }, [category, map]);

  if (!category) {
    return (
      <PageShell header={<Crumbs items={[{ label: "Vocabulário", href: "/vocabulary" }]} />}>
        <ScreenTitle title="Categoria não encontrada" subtitle="Esta categoria de vocabulário não existe." />
      </PageShell>
    );
  }

  const title = CATEGORY_PT[category.id] ?? category.title;
  const levels = ["A1", "A2", "B1"].map((l) => [l, category.words.filter((w) => w.cefr === l).length] as const);

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn && (
        <PanelCard title="Nesta categoria">
          {(["mastered", "learning", "overdue", "unseen"] as WordState[]).map((s) => (
            <div key={s} className="flex items-center justify-between py-[3px] text-[12px]">
              <span className="text-aula-text-2">{STATE_LABEL[s]}</span>
              <span className={`font-medium ${s === "overdue" && counts.overdue > 0 ? "text-aula-overdue" : "text-aula-text"}`}>{counts[s]}</span>
            </div>
          ))}
        </PanelCard>
      )}
      <div>
        <Label className="mb-2">Por nível</Label>
        {levels.map(([l, n]) => (
          <div key={l} className="flex items-center justify-between py-1 text-[12px]">
            <LevelTag level={l} />
            <span className="text-aula-text-2">{n} palavras</span>
          </div>
        ))}
      </div>
      {groups && groups.length > 1 && (
        <div>
          <Label className="mb-2">Secções</Label>
          {groups.map((g, i) => (
            <button
              key={i}
              onClick={() => document.getElementById(`group-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex h-7 w-full items-center rounded-md px-2 text-left text-[12.5px] text-aula-text-2 hover:bg-aula-sunken"
            >
              <span className="truncate">{g.labelPt || g.label}</span>
              <span className="flex-1" />
              <span className="text-[11px] text-aula-text-3">{g.words.length}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderRows = (list: Word[]) =>
    list.map((w) => {
      const rec = map.get(w.portuguese);
      const st = stateOf(rec);
      return (
        <Link
          key={w.portuguese}
          href={wordHref(category.id, w.portuguese)}
          className="grid h-[33px] grid-cols-[1fr_1fr_auto] items-center gap-3 rounded-lg px-2 transition-colors hover:bg-aula-sunken md:grid-cols-[200px_1fr_36px_70px_76px]"
        >
          <span className="truncate text-[12.5px] font-medium text-aula-accent">{w.portuguese}</span>
          <span className="truncate text-[12px] text-aula-text-2">{w.english}</span>
          <LevelTag level={w.cefr} />
          {signedIn && (
            <>
              <span className="hidden md:block">
                <Pips level={rec?.mastery_level ?? 0} state={st} />
              </span>
              <span className={`hidden text-right text-[11px] md:block ${st === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>
                {dueLabel(rec)}
              </span>
            </>
          )}
        </Link>
      );
    });

  return (
    <PageShell
      header={<Crumbs items={[{ label: "Vocabulário", href: "/vocabulary" }, { label: title }]} />}
      panel={panel}
    >
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle title={title} subtitle={`${category.words.length} palavras · ${category.description}`} />
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <label className="flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-aula-line bg-aula-sunken px-2.5 focus-within:border-aula-border focus-within:bg-white">
            <Search size={14} strokeWidth={1.5} className="text-aula-text-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar nesta categoria…"
              className="w-full bg-transparent text-[12px] text-aula-text outline-none placeholder:text-aula-text-3"
            />
          </label>
          <SegmentedFilter options={["Todos", "A1", "A2", "B1"]} value={level} onChange={setLevel} />
        </div>

        {words.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-aula-text-2">Nenhuma palavra com estes filtros.</p>
        ) : groups && groups.length > 1 ? (
          groups.map((g, i) => (
            <section key={i} id={`group-${i}`} className="mb-7 scroll-mt-4">
              <Label className="mb-1.5">
                {g.labelPt || g.label} · {g.words.length}
              </Label>
              {renderRows(g.words as Word[])}
            </section>
          ))
        ) : (
          renderRows(words)
        )}
      </div>
    </PageShell>
  );
}

export default function VocabularyCategoryPage() {
  return (
    <Suspense fallback={<PageShell>{null}</PageShell>}>
      <CategoryContent />
    </Suspense>
  );
}
