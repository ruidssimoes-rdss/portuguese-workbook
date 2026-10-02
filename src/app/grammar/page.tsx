"use client";

/**
 * Gramática — índice (Figma: Ecrãs / Gramática — índice).
 * Topics grouped by level with mastery and next review; panel with weak spots.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { SegmentedFilter } from "@/components/primitives";
import { Pips, LevelTag, Label, ScreenTitle, PanelCard, Track } from "@/components/aula";
import { useMastery, stateOf, dueLabel, type WordState } from "@/lib/use-mastery";
import grammarData from "@/data/grammar.json";
import { grammarGroups } from "@/data/grammar-groups";

interface Topic {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary: string;
}

const LEVELS = ["A1", "A2", "B1"] as const;
const STATE_FILTERS = ["Todos", "Em atraso", "A aprender", "Por ver"];
const FILTER_STATE: Record<string, WordState | null> = { Todos: null, "Em atraso": "overdue", "A aprender": "learning", "Por ver": "unseen" };

export default function GrammarPage() {
  const { map, signedIn } = useMastery("grammar");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [group, setGroup] = useState<string | null>(null);

  const topics: Topic[] = useMemo(
    () =>
      Object.entries(grammarData.topics).map(([id, t]) => ({
        id,
        title: (t as Topic).title,
        titlePt: (t as Topic).titlePt ?? (t as Topic).title,
        cefr: (t as Topic).cefr,
        summary: (t as Topic).summary ?? "",
      })),
    [],
  );

  const groupTopics = group ? new Set(grammarGroups.find((g) => g.labelPt === group)?.topics ?? []) : null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const want = FILTER_STATE[filter];
    return topics.filter(
      (t) =>
        (!groupTopics || groupTopics.has(t.id)) &&
        (!want || stateOf(map.get(t.id)) === want) &&
        (!q || [t.title, t.titlePt, t.summary].some((s) => s.toLowerCase().includes(q))),
    );
  }, [topics, query, filter, map, groupTopics]);

  const mastered = topics.filter((t) => stateOf(map.get(t.id)) === "mastered").length;
  const overdue = topics.filter((t) => stateOf(map.get(t.id)) === "overdue").length;

  const weak = useMemo(
    () =>
      topics
        .map((t) => ({ t, r: map.get(t.id) }))
        .filter(({ r }) => r && r.times_seen >= 3)
        .map(({ t, r }) => ({ t, wrong: r!.times_incorrect / r!.times_seen }))
        .filter((x) => x.wrong > 0)
        .sort((a, b) => b.wrong - a.wrong)
        .slice(0, 3),
    [topics, map],
  );

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn && (
        <PanelCard title="Onde mais erras">
          {weak.length === 0 ? (
            <p className="text-[12px] leading-relaxed text-aula-text-2">Ainda não há dados suficientes. Pratica alguns tópicos e isto preenche-se sozinho.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {weak.map(({ t, wrong }) => (
                <Link key={t.id} href={`/grammar/${t.id}`} className="block">
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="text-aula-text">{t.titlePt}</span>
                    <span className="text-[11px] text-aula-text-3">{Math.round(wrong * 100)}% erradas</span>
                  </div>
                  <Track value={wrong} tone="learning" />
                </Link>
              ))}
            </div>
          )}
        </PanelCard>
      )}
      <div>
        <Label className="mb-2">Grupos</Label>
        <button
          onClick={() => setGroup(null)}
          className={`flex h-7 w-full items-center rounded-md px-2 text-[12.5px] ${!group ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
        >
          Todos <span className="flex-1" />
          <span className="text-[11px] text-aula-text-3">{topics.length}</span>
        </button>
        {grammarGroups.map((g) => (
          <button
            key={g.labelPt}
            onClick={() => setGroup(group === g.labelPt ? null : g.labelPt)}
            className={`flex h-7 w-full items-center rounded-md px-2 text-left text-[12.5px] ${group === g.labelPt ? "bg-aula-selected font-medium text-aula-text" : "text-aula-text-2 hover:bg-aula-sunken"}`}
          >
            <span className="truncate">{g.labelPt}</span>
            <span className="flex-1" />
            <span className="text-[11px] text-aula-text-3">{g.topics.length}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Gramática" }]} />} panel={panel}>
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle
          title="Gramática"
          subtitle={signedIn ? `${topics.length} tópicos · ${mastered} dominados · ${overdue} em atraso` : `${topics.length} tópicos, do A1 ao B1`}
        />
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <label className="flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-aula-line bg-aula-sunken px-2.5 focus-within:border-aula-border focus-within:bg-white">
            <Search size={14} strokeWidth={1.5} className="text-aula-text-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar uma regra…"
              className="w-full bg-transparent text-[12px] text-aula-text outline-none placeholder:text-aula-text-3"
            />
          </label>
          {signedIn && <SegmentedFilter options={STATE_FILTERS} value={filter} onChange={setFilter} />}
        </div>

        {LEVELS.map((lv) => {
          const list = visible.filter((t) => t.cefr === lv);
          if (list.length === 0) return null;
          const total = topics.filter((t) => t.cefr === lv).length;
          const done = topics.filter((t) => t.cefr === lv && stateOf(map.get(t.id)) === "mastered").length;
          return (
            <section key={lv} className="mb-8">
              <div className="mb-1.5 flex items-center gap-2.5 px-2">
                <LevelTag level={lv} />
                <span className="text-[11px] text-aula-text-3">
                  {total} tópicos{signedIn ? ` · ${done} dominados` : ""}
                </span>
              </div>
              {list.map((t) => {
                const r = map.get(t.id);
                const s = stateOf(r);
                return (
                  <Link
                    key={t.id}
                    href={`/grammar/${t.id}`}
                    className="flex min-h-[48px] items-center gap-4 rounded-[10px] px-3 py-2 transition-colors hover:bg-aula-sunken"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-aula-text">{t.titlePt}</div>
                      <div className="truncate text-[11px] text-aula-text-3">{t.title}</div>
                    </div>
                    {signedIn && (
                      <>
                        <Pips level={r?.mastery_level ?? 0} state={s} />
                        <span className={`w-[64px] text-right text-[11px] ${s === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{dueLabel(r)}</span>
                      </>
                    )}
                  </Link>
                );
              })}
            </section>
          );
        })}
        {visible.length === 0 && <p className="py-12 text-center text-[13px] text-aula-text-2">Nenhum tópico com estes filtros.</p>}
      </div>
    </PageShell>
  );
}
