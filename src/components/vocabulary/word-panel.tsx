import Link from "next/link";
import { Play } from "lucide-react";
import { Panel } from "@/components/shell/panel";
import { MasteryPips } from "@/components/shell/mastery-pips";
import { SectionLabel } from "@/components/shell/section-label";
import { NextReview } from "@/components/vocabulary/word-note";
import { STATE_LABEL, type ItemState } from "@/lib/learning-state";
import { formatCount, formatShortDate } from "@/lib/format";
import type { MasteryRecord } from "@/lib/learning-engine/mastery-tracker";
import type { LibraryWord, WordLesson } from "@/lib/library";
import type { Attempt, Confusion } from "@/lib/shell/attempts";

const STATE_TEXT = {
  overdue: "text-state-overdue",
  learning: "text-state-learning",
  mastered: "text-state-mastered",
  unseen: "text-text-quaternary",
} as const;

export function WordPanel({
  word,
  state,
  record,
  practiceHref,
  attempts,
  confusions,
  lessons,
  categoryCount,
}: {
  word: LibraryWord;
  state: ItemState;
  record: MasteryRecord | null;
  practiceHref: string;
  attempts: Attempt[];
  confusions: Confusion[];
  lessons: WordLesson[];
  categoryCount: number;
}) {
  const accuracy = record && record.times_seen > 0 ? Math.round((record.times_correct / record.times_seen) * 100) : null;

  return (
    <Panel label={`Painel de ${word.title}`}>
      <section aria-label="Domínio" className="rounded-card border border-border-default bg-surface-raised p-4">
        <div className="flex items-baseline justify-between">
          <h2 className={`text-[13px] font-medium ${STATE_TEXT[state.state]}`}>{STATE_LABEL[state.state]}</h2>
          <span className="text-caption tabular-nums text-text-quaternary">nível {state.level} de 5</span>
        </div>
        <div className="mt-2.5">
          <MasteryPips level={state.level} state={state.state} size="lg" />
        </div>

        {record && (
          <dl className="mt-4 flex flex-col gap-2 text-small">
            {record.next_review_at && (
              <Stat label="Revisão">
                <NextReview at={record.next_review_at} state={state} />
              </Stat>
            )}
            {accuracy !== null && <Stat label="Precisão">{accuracy}%</Stat>}
            <Stat label="Tentativas">{formatCount(record.times_seen)}</Stat>
          </dl>
        )}

        <Link
          href={practiceHref}
          className="mt-4 flex h-8 items-center justify-center gap-2 rounded-control bg-accent text-ui font-medium text-text-on-accent transition-colors hover:bg-accent-hover"
        >
          <Play aria-hidden className="size-3" strokeWidth={2} />
          Praticar agora
        </Link>
      </section>

      {attempts.length > 0 && (
        <section className="mt-7" aria-labelledby="escreveste">
          <SectionLabel>
            <span id="escreveste">O que escreveste</span>
          </SectionLabel>
          <ul className="mt-3 flex flex-col">
            {attempts.map((a, i) => (
              <li key={`${a.at}-${i}`} className="flex h-[26px] items-center gap-3 text-ui">
                <span className="w-[54px] shrink-0 text-caption tabular-nums text-text-quaternary">{formatShortDate(a.at)}</span>
                <span lang="pt-PT" className="min-w-0 flex-1 truncate text-state-overdue">
                  {a.typed.trim() ? `«${a.typed}»` : "(em branco)"}
                </span>
                <span className="shrink-0 text-caption text-state-overdue">errada</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {confusions.length > 0 && (
        <section className="mt-7" aria-labelledby="confundes">
          <SectionLabel>
            <span id="confundes">Confundes com</span>
          </SectionLabel>
          <ul className="mt-3 flex flex-col">
            {confusions.map((c) => (
              <li key={c.word.href} className="flex h-[26px] items-center gap-2.5 text-ui">
                <Link href={c.word.href} className="rounded-xs text-accent transition-colors hover:text-accent-hover hover:underline">
                  {c.word.title}
                </Link>
                <span className="min-w-0 flex-1 truncate text-caption text-text-quaternary">{c.word.english}</span>
                <span className="shrink-0 text-caption tabular-nums text-text-quaternary">{c.times}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-7" aria-labelledby="aparece">
        <SectionLabel>
          <span id="aparece">Aparece em</span>
        </SectionLabel>
        <ul className="mt-3 flex flex-col">
          {lessons.map((l) => (
            <AppearsRow key={l.id} href={`/learn?lesson=${l.id}`} label={l.title} meta={`Lição ${l.number} · ${l.cefr}`} />
          ))}
          <AppearsRow
            href={`/vocabulary/${word.categoryId}`}
            label={word.categoryTitle}
            meta={`Categoria · ${formatCount(categoryCount)} palavras`}
          />
        </ul>
      </section>
    </Panel>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="tabular-nums text-text-primary">{children}</dd>
    </div>
  );
}

function AppearsRow({ href, label, meta }: { href: string; label: string; meta: string }) {
  return (
    <li className="flex h-[26px] items-center justify-between gap-3 text-ui">
      <Link href={href} className="min-w-0 truncate rounded-xs text-accent transition-colors hover:text-accent-hover hover:underline">
        {label}
      </Link>
      <span className="shrink-0 text-caption tabular-nums text-text-quaternary">{meta}</span>
    </li>
  );
}
