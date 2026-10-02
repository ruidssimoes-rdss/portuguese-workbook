"use client";

/**
 * Palavra — the note for one word (Figma: Ecrãs / Palavra).
 * Main column: word, pronunciation, meaning, example, related words, tip.
 * Right panel: your relationship to it (state, mastery, reviews, accuracy).
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { AudioButton } from "@/components/primitives";
import { Pips, LevelTag, Label, PanelCard, KV, CATEGORY_PT, wordHref } from "@/components/aula";
import { useMastery, stateOf, dueLabel, STATE_LABEL } from "@/lib/use-mastery";
import vocabData from "@/data/vocab.json";

type Word = (typeof vocabData.categories)[number]["words"][number] & {
  relatedWords?: { word: string; meaning: string }[];
  proTip?: string;
};

const GENDER: Record<string, string> = { m: "nome masculino", f: "nome feminino", "m/f": "nome masculino e feminino" };

export default function WordPage() {
  const params = useParams();
  const slug = params.category as string;
  const portuguese = decodeURIComponent(params.word as string);
  const category = vocabData.categories.find((c) => c.id === slug);
  const words = (category?.words ?? []) as Word[];
  const idx = words.findIndex((w) => w.portuguese === portuguese);
  const word = idx >= 0 ? words[idx] : null;
  const { map, signedIn } = useMastery("vocab");

  const catTitle = category ? (CATEGORY_PT[category.id] ?? category.title) : "";
  const crumbs = (
    <Crumbs
      items={[
        { label: "Vocabulário", href: "/vocabulary" },
        ...(category ? [{ label: catTitle, href: `/vocabulary/${category.id}` }] : []),
        { label: word?.portuguese ?? "Palavra" },
      ]}
    />
  );

  if (!category || !word) {
    return (
      <PageShell header={crumbs}>
        <div className="mx-auto max-w-[620px]">
          <h1 className="text-[22px] font-semibold text-aula-text">Palavra não encontrada</h1>
          <p className="mt-1.5 text-[13px] text-aula-text-2">
            Esta palavra não existe nesta categoria.{" "}
            <Link href="/vocabulary" className="text-aula-accent underline-offset-2 hover:underline">
              Voltar ao vocabulário
            </Link>
          </p>
        </div>
      </PageShell>
    );
  }

  const rec = map.get(word.portuguese);
  const state = stateOf(rec);
  const prev = idx > 0 ? words[idx - 1] : null;
  const next = idx < words.length - 1 ? words[idx + 1] : null;
  const accuracy = rec && rec.times_seen > 0 ? Math.round((rec.times_correct / rec.times_seen) * 100) : null;
  const toneColor =
    state === "overdue" ? "text-aula-overdue" : state === "learning" ? "text-[#5B45B8]" : state === "mastered" ? "text-aula-accent" : "text-aula-text-3";

  const panel = signedIn ? (
    <div className="flex flex-col gap-6">
      <PanelCard title={STATE_LABEL[state]} aside={<span className="text-[11px] text-aula-text-3">nível {rec?.mastery_level ?? 0} de 5</span>}>
        <div className="mb-3">
          <Pips level={rec?.mastery_level ?? 0} state={state} />
        </div>
        <KV k="Próxima revisão" v={dueLabel(rec)} tone={state === "overdue" ? "overdue" : undefined} />
        <KV k="Precisão" v={accuracy === null ? "—" : `${accuracy}%`} />
        <KV k="Tentativas" v={rec?.times_seen ?? 0} />
        <KV k="Sequência de acertos" v={rec?.streak ?? 0} />
        <Link
          href="/learn?mode=review"
          className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Praticar agora
        </Link>
      </PanelCard>
      <div>
        <Label className="mb-2">Nesta categoria</Label>
        {words.slice(Math.max(0, idx - 3), idx + 4).map((w) => {
          const r = map.get(w.portuguese);
          const s = stateOf(r);
          const current = w.portuguese === word.portuguese;
          return (
            <Link
              key={w.portuguese}
              href={wordHref(category.id, w.portuguese)}
              className={`flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] ${current ? "bg-aula-selected font-medium text-aula-text" : "text-aula-accent hover:bg-aula-sunken"}`}
            >
              <span className="truncate">{w.portuguese}</span>
              <span className="flex-1" />
              <span className={`text-[11px] ${s === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{dueLabel(r)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  ) : (
    <PanelCard title="Guarda o teu progresso">
      <p className="text-[12px] leading-relaxed text-aula-text-2">Entra para ver quando esta palavra volta à revisão e quanto já a dominas.</p>
      <Link href="/auth/login" className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white">
        Entrar
      </Link>
    </PanelCard>
  );

  return (
    <PageShell header={crumbs} panel={panel}>
      <article className="mx-auto max-w-[620px]">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{word.portuguese}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-aula-text-3">
          {word.pronunciation && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-aula-border px-2 text-aula-accent">
              <AudioButton text={word.portuguese} />/{word.pronunciation}/
            </span>
          )}
          {word.gender && GENDER[word.gender] && <span>{GENDER[word.gender]}</span>}
          <LevelTag level={word.cefr} />
          {signedIn && <span className={toneColor}>· {STATE_LABEL[state].toLowerCase()}</span>}
        </div>

        <h2 className="mt-7 text-[15px] font-semibold text-aula-text">{word.english}</h2>

        <div className="my-7 h-px bg-aula-line" />

        {word.example && (
          <section>
            <Label className="mb-3">Exemplo</Label>
            <div className="flex gap-2.5">
              <AudioButton text={word.example} />
              <div>
                <p className="text-[13.5px] font-medium text-aula-text">{word.example}</p>
                {word.exampleTranslation && <p className="mt-0.5 text-[12px] text-aula-text-3">{word.exampleTranslation}</p>}
              </div>
            </div>
          </section>
        )}

        {word.relatedWords && word.relatedWords.length > 0 && (
          <section className="mt-8">
            <Label className="mb-2">Palavras relacionadas</Label>
            <div className="flex flex-col">
              {word.relatedWords.map((r) => (
                <div key={r.word} className="flex h-8 items-center gap-3 border-b border-aula-line text-[12.5px] last:border-0">
                  <span className="w-[200px] truncate font-medium text-aula-text">{r.word}</span>
                  <span className="truncate text-aula-text-2">{r.meaning}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {word.proTip && (
          <div className="mt-8 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span>
              <span className="text-[12px] font-medium text-aula-accent">Português europeu</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-aula-text">{word.proTip}</p>
          </div>
        )}

        <nav className="mt-12 flex items-center justify-between gap-3 text-[12px]">
          {prev ? (
            <Link href={wordHref(category.id, prev.portuguese)} className="flex items-center gap-1 text-aula-text-3 hover:text-aula-accent">
              <ChevronLeft size={14} strokeWidth={1.5} /> {prev.portuguese}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={wordHref(category.id, next.portuguese)} className="flex items-center gap-1 text-aula-text-3 hover:text-aula-accent">
              {next.portuguese} <ChevronRight size={14} strokeWidth={1.5} />
            </Link>
          )}
        </nav>
      </article>
    </PageShell>
  );
}
