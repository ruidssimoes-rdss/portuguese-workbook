"use client";

/**
 * Gramática / capítulo. The reading column is the book; mentions of verbs,
 * words, other topics and culture notes open a ficha in the dock.
 * With no ficha open, the dock keeps mastery and related topics.
 */

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Label, PanelCard, Pips, KV } from "@/components/aula";
import { BookShell } from "@/components/book/book-shell";
import { GrammarChapter, grammarListenLines } from "@/components/book/grammar-chapter";
import { ListenButton } from "@/components/book/play-button";
import { getGrammar } from "@/lib/book/catalog";
import { useMastery, stateOf, dueLabel, STATE_LABEL } from "@/lib/use-mastery";
import { grammarGroups } from "@/data/grammar-groups";

export default function GrammarTopicPage() {
  return (
    <Suspense fallback={<PageShell header={<Crumbs items={[{ label: "Gramática", href: "/grammar" }]} />}><div className="py-16 text-[13px] text-[#5A5A57]">A abrir o capítulo…</div></PageShell>}>
      <GrammarTopic />
    </Suspense>
  );
}

function GrammarTopic() {
  const params = useParams();
  const slug = params.topic as string;
  const topic = getGrammar(slug);
  const { map, signedIn } = useMastery("grammar");

  const related = useMemo(() => {
    const group = grammarGroups.find((item) => item.topics.includes(slug));
    return (group?.topics ?? []).filter((id) => id !== slug && getGrammar(id)).slice(0, 5);
  }, [slug]);

  const crumbs = (
    <Crumbs
      items={[
        { label: "Gramática", href: "/grammar" },
        ...(topic ? [{ label: topic.cefr }, { label: topic.titlePt }] : []),
      ]}
    />
  );

  if (!topic) {
    return (
      <PageShell header={crumbs}>
        <div className="mx-auto max-w-[620px]">
          <h1 className="text-[22px] font-semibold text-aula-text">Tópico não encontrado</h1>
          <Link href="/grammar" className="mt-2 inline-block text-[13px] text-aula-accent">
            Voltar à gramática
          </Link>
        </div>
      </PageShell>
    );
  }

  const rec = map.get(slug);
  const state = stateOf(rec);
  const accuracy = rec && rec.times_seen > 0 ? Math.round((rec.times_correct / rec.times_seen) * 100) : null;

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn ? (
        <PanelCard title="O teu domínio" aside={<span className={`text-[11px] ${state === "overdue" ? "text-aula-overdue" : "text-[#5A5A57]"}`}>{STATE_LABEL[state].toLowerCase()}</span>}>
          <div className="mb-3">
            <Pips level={rec?.mastery_level ?? 0} state={state} />
          </div>
          <KV k="Próxima revisão" v={dueLabel(rec)} tone={state === "overdue" ? "overdue" : undefined} />
          <KV k="Precisão" v={accuracy === null ? "—" : `${accuracy}%`} />
          <KV k="Tentativas" v={rec?.times_seen ?? 0} />
          <Link href="/learn" className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
            Praticar
          </Link>
        </PanelCard>
      ) : (
        <PanelCard title="Guarda o teu progresso">
          <p className="text-[12.5px] leading-relaxed text-[#5A5A57]">Entra para acompanhar o teu domínio deste tópico.</p>
        </PanelCard>
      )}
      {related.length > 0 && (
        <div>
          <Label className="mb-2">Relacionado</Label>
          {related.map((id) => {
            const other = getGrammar(id);
            if (!other) return null;
            return (
              <Link key={id} href={`/grammar/${id}`} className="flex h-7 items-center rounded-md px-2 text-[12.5px] text-aula-accent hover:bg-aula-sunken">
                <span className="truncate">{other.titlePt}</span>
                <span className="flex-1" />
                <span className="text-[11px] text-[#5A5A57]">{other.cefr}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <BookShell
      key={slug}
      fallback={panel}
      header={
        <>
          {crumbs}
          <span className="flex-1" />
          <ListenButton lines={grammarListenLines(topic)} label="Ouvir capítulo" />
        </>
      }
    >
      <GrammarChapter id={slug} />
    </BookShell>
  );
}
