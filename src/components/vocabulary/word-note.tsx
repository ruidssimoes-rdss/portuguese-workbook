import Link from "next/link";
import { PlayButton } from "@/components/shell/play-button";
import { MasteryPips } from "@/components/shell/mastery-pips";
import { SectionLabel } from "@/components/shell/section-label";
import { STATE_LABEL, type ItemState } from "@/lib/learning-state";
import { daysLabel, formatShortDate } from "@/lib/format";
import type { LibraryWord } from "@/lib/library";

const STATE_TEXT = {
  overdue: "text-state-overdue",
  learning: "text-state-learning",
  mastered: "text-state-mastered",
  unseen: "text-text-quaternary",
} as const;

const LEVEL_TEXT: Record<string, string> = {
  A1: "text-state-fresh",
  A2: "text-accent",
  B1: "text-state-learning",
};

export function NextReview({ at, state }: { at: string; state: ItemState }) {
  if (state.overdueDays !== null && state.overdueDays >= 1) {
    return (
      <span className="text-state-overdue">
        {formatShortDate(at)} · em atraso {daysLabel(state.overdueDays)}
      </span>
    );
  }
  if (state.due) return <span>{formatShortDate(at)} · hoje</span>;
  return (
    <span>
      {formatShortDate(at)} · em {daysLabel(state.dueInDays ?? 0)}
    </span>
  );
}

export function WordNote({
  word,
  state,
  nextReviewAt,
  europeanNote,
}: {
  word: LibraryWord;
  state: ItemState;
  nextReviewAt: string | null;
  europeanNote: string | null;
}) {
  const gender = word.gender === "f" ? "nome feminino" : word.gender === "m" ? "nome masculino" : null;

  return (
    <article className="mx-auto w-full max-w-[620px] px-0 pt-[46px] pb-24">
      <h1 className="text-title font-semibold text-text-primary">{word.title}</h1>

      <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-small">
        <PlayButton variant="pill" text={word.portuguese} label={word.pronunciation ? `/${word.pronunciation}/` : undefined} />
        {gender && <span className="text-text-secondary">{gender}</span>}
        {gender && <span aria-hidden className="text-text-quaternary">·</span>}
        <span className={`font-medium ${LEVEL_TEXT[word.cefr] ?? "text-text-secondary"}`}>{word.cefr}</span>
      </div>

      <p className="mt-9 text-headline font-medium text-text-primary">{word.english}</p>

      <dl className="mt-7 grid grid-cols-[192px_1fr] gap-x-0 gap-y-4 text-ui">
        <div>
          <dt className="text-label font-medium uppercase text-text-quaternary">Categoria</dt>
          <dd className="mt-1">
            <Link href={`/vocabulary/${word.categoryId}`} className="rounded-xs text-accent transition-colors hover:text-accent-hover hover:underline">
              {word.categoryTitle}
            </Link>
          </dd>
        </div>
        {nextReviewAt && (
          <div>
            <dt className="text-label font-medium uppercase text-text-quaternary">Próxima revisão</dt>
            <dd className="mt-1 tabular-nums text-text-primary">
              <NextReview at={nextReviewAt} state={state} />
            </dd>
          </div>
        )}
        <div>
          <dt className="text-label font-medium uppercase text-text-quaternary">Domínio</dt>
          <dd className="mt-1 flex items-center gap-2.5">
            <MasteryPips level={state.level} state={state.state} />
            <span className={STATE_TEXT[state.state]}>{STATE_LABEL[state.state]}</span>
          </dd>
        </div>
      </dl>

      <hr className="mt-8 border-border-default" />

      <section aria-labelledby="exemplos" className="mt-8">
        <SectionLabel>
          <span id="exemplos">Exemplos</span>
        </SectionLabel>
        <ul className="mt-4 flex flex-col gap-5">
          <li className="flex gap-2.5">
            <PlayButton text={word.example} />
            <div>
              <p lang="pt-PT" className="text-body text-text-primary">{word.example}</p>
              <p lang="en" className="mt-0.5 text-small text-text-quaternary">{word.exampleTranslation}</p>
            </div>
          </li>
        </ul>
      </section>

      {europeanNote && (
        <aside className="mt-8 rounded-card border border-navy-200 bg-accent-faint px-4 py-3.5">
          <p className="flex items-center gap-2 text-ui font-semibold text-accent">
            <span className="inline-flex h-4 items-center rounded-xs bg-accent px-1 text-[9.5px] font-semibold text-text-on-accent">
              PT
            </span>
            Português europeu
          </p>
          <p className="mt-2 text-ui leading-5 text-text-primary">{europeanNote}</p>
        </aside>
      )}
    </article>
  );
}
