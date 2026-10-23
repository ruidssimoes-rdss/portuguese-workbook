"use client";

import { useState } from "react";
import Link from "next/link";
import { wordHref, TENSE_PT } from "@/components/aula";
import {
  cultureOf,
  getBacklinks,
  getCulture,
  getGrammar,
  getVerb,
  getWord,
  linksFrom,
  lookupExact,
  pronounLabel,
  sameGroupVerbs,
  type CardRef,
  type VerbRow,
} from "@/lib/book/catalog";
import { encodeCard } from "@/lib/book/types";
import { useMastery, stateOf, dueLabel } from "@/lib/use-mastery";
import { cardDrill } from "@/lib/book/practice";
import { useBook } from "./book-context";
import { Backlinks, Callout, Examples, Kicker, LevelChip, PropList } from "./ui";
import { CardChip, LinkedText } from "./linked-text";
import { PlayButton } from "./play-button";

const GENDER: Record<string, string> = {
  m: "nome masculino",
  f: "nome feminino",
  "m/f": "nome masculino e feminino",
};

function ReviewValue({ contentId, type }: { contentId: string; type: "verb" | "vocab" | "grammar" }) {
  const { map, signedIn } = useMastery(type);
  if (!signedIn) {
    return (
      <Link href="/auth/login" className="font-medium text-aula-accent">
        entra para guardar
      </Link>
    );
  }
  const rec = map.get(contentId);
  const state = stateOf(rec);
  if (state === "unseen") return <span>nova · ainda não está no baralho</span>;
  const correct = rec?.times_correct ?? 0;
  const seen = rec?.times_seen ?? 0;
  const tone = state === "overdue" ? "text-aula-overdue" : "";
  return (
    <span className={tone}>
      {dueLabel(rec)}
      {seen > 0 ? ` · ${correct} de ${seen} certas` : ""}
    </span>
  );
}

function PracticeButton({ card }: { card: CardRef }) {
  const book = useBook();
  if (card.kind === "culture") return null;
  if (!cardDrill(card)) return null;
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => book.openPractice(card)}
        className="inline-flex h-8 items-center rounded-lg bg-aula-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
      >
        Praticar
      </button>
    </div>
  );
}

function Head({
  kicker,
  title,
  aside,
  meta,
  speak,
}: {
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  meta?: React.ReactNode;
  speak?: string;
}) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <div className="mt-2 flex items-center gap-3">
        {speak && <PlayButton text={speak} size="lg" />}
        <div className="min-w-0 flex-1">
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.03em] text-aula-text">{title}</h2>
          {meta && <div className="mt-1 text-[12.5px] leading-snug text-[#5A5A57]">{meta}</div>}
        </div>
        {aside}
      </div>
    </div>
  );
}

function splitStem(forms: string[]): string {
  if (forms.length === 0) return "";
  let stem = forms[0].toLowerCase();
  for (const form of forms) {
    const f = form.toLowerCase();
    let i = 0;
    const n = Math.min(stem.length, f.length);
    while (i < n && stem[i] === f[i]) i++;
    stem = stem.slice(0, i);
  }
  const shortest = Math.min(...forms.map((form) => form.length));
  if (stem.length >= shortest) stem = stem.slice(0, Math.max(0, shortest - 1));
  return stem;
}

function FormCell({ form, stem }: { form: string; stem: string }) {
  const lower = form.toLowerCase();
  if (!stem || !lower.startsWith(stem)) return <span>{form}</span>;
  return (
    <span>
      {form.slice(0, stem.length)}
      <i className="font-medium">{form.slice(stem.length)}</i>
    </span>
  );
}

function groupLabel(group: string): string {
  if (group === "Irregular") return "irregular";
  return group.replace("Regular ", "regular · ");
}

export function VerbCard({ id }: { id: string }) {
  const verb = getVerb(id);
  const [tense, setTense] = useState(verb?.tenses.includes("Present") ? "Present" : (verb?.tenses[0] ?? "Present"));
  if (!verb) return <Missing label="Verbo não encontrado" />;
  const rows = verb.rows(tense);
  const stem = splitStem(rows.map((row) => row.form));
  const note = rows.find((row) => row.note)?.note;
  const ref: CardRef = { kind: "verb", id: verb.id };
  const siblings = sameGroupVerbs(verb.id);

  return (
    <div>
      <Head
        kicker={`Verbo · ${groupLabel(verb.group)}`}
        title={verb.id}
        speak={verb.id}
        meta={
          <>
            {verb.pronunciation && <span>/{verb.pronunciation}/</span>}
            {verb.pronunciation && " · "}
            {verb.english}
          </>
        }
      />
      <PropList
        rows={[
          { k: "Nível", v: <LevelChip level={verb.cefr} /> },
          { k: "Grupo", v: verb.group },
          ...(verb.participle ? [{ k: "Particípio", v: <span className="font-medium">{verb.participle}</span> }] : []),
          { k: "Revisão", v: <ReviewValue type="verb" contentId={verb.id.toUpperCase()} /> },
        ]}
      />
      <PracticeButton card={ref} />

      <div className="mt-5 flex items-center gap-3">
        <h3 className="shrink-0 text-[13px] font-semibold text-aula-text">Conjugação</h3>
        <div className="ml-auto flex min-w-0 max-w-full gap-0.5 overflow-x-auto rounded-lg bg-aula-sunken p-[3px] [scrollbar-width:none]">
          {verb.tenses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTense(item)}
              className={`h-[26px] shrink-0 rounded-md border px-2 text-[12px] transition-colors ${
                tense === item
                  ? "border-aula-line bg-white font-medium text-aula-text"
                  : "border-transparent text-[#5A5A57] hover:text-aula-text"
              }`}
            >
              {TENSE_PT[item] ?? item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-[10px] border border-aula-line">
        {rows.map((row) => (
          <ConjugationRow key={row.person + row.form} row={row} stem={stem} />
        ))}
      </div>

      {note && (
        <div className="mt-3">
          <Callout tone="plain" label="Repara">
            <LinkedText text={note} skip={ref} />
          </Callout>
        </div>
      )}
      {verb.participleNote && <p className="mt-3 text-[12.5px] leading-relaxed text-[#5A5A57]">{verb.participleNote}</p>}

      {siblings.length > 0 && (
        <div className="mt-5">
          <Kicker>Mesmo padrão</Kicker>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px]">
            {siblings.map((item) => (
              <CardChip key={item.id} refCard={{ kind: "verb", id: item.id }}>
                {item.id}
              </CardChip>
            ))}
          </div>
        </div>
      )}

      <Backlinks target={ref} />
    </div>
  );
}

function ConjugationRow({ row, stem }: { row: VerbRow; stem: string }) {
  return (
    <div className="grid grid-cols-[88px_minmax(52px,auto)_minmax(0,1fr)_28px] items-center gap-x-3 px-3 py-2 odd:bg-[#F7F7F6]">
      <span className="text-[12px] text-[#5A5A57]">{pronounLabel(row.person)}</span>
      <span className="text-[13.5px] font-medium text-aula-accent">
        <FormCell form={row.form} stem={stem} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] leading-snug text-aula-text">{row.example}</span>
        <span className="block text-[11.5px] leading-snug text-[#5A5A57]">{row.english}</span>
      </span>
      <PlayButton text={row.example || row.form} />
    </div>
  );
}

function articleSplit(portuguese: string): { article?: string; rest: string } {
  const match = portuguese.match(/^(o|a|os|as|um|uma)\s+(.+)$/i);
  if (!match) return { rest: portuguese };
  return { article: match[1], rest: match[2] };
}

export function WordCard({ category, word }: { category: string; word: string }) {
  const entry = getWord({ kind: "word", category, word });
  const book = useBook();
  if (!entry) return <Missing label="Palavra não encontrada" />;
  const { article, rest } = articleSplit(entry.portuguese);
  const gender = entry.gender ? GENDER[entry.gender] : undefined;
  const related = entry.relatedWords
    .map((item) => ({ ...item, ref: lookupExact(item.word) ?? lookupExact(item.word.replace(/^(o|a|os|as|um|uma)\s+/i, "")) }))
    .slice(0, 4);
  const culture = getBacklinks(entry.ref).items.find((item) => item.card?.kind === "culture");
  const cultureNote = culture?.card?.kind === "culture" ? getCulture(culture.card) : null;

  return (
    <div>
      <Head
        kicker={`Palavra · ${entry.categoryLabel.toLowerCase()}`}
        speak={entry.portuguese}
        title={
          <>
            {article && <span className="font-medium text-[#5A5A57]">{article} </span>}
            {rest}
          </>
        }
        meta={
          <>
            {entry.pronunciation && <span>/{entry.pronunciation}/</span>}
            {gender && <span>{entry.pronunciation ? " · " : ""}{gender}</span>}
            <span className="mt-0.5 block text-[13px] text-aula-text">{entry.english}</span>
          </>
        }
      />
      <PropList
        rows={[
          ...(entry.cefr ? [{ k: "Nível", v: <LevelChip level={entry.cefr} /> }] : []),
          ...(related[0]
            ? [{
                k: "Parecido",
                v: related[0].ref ? (
                  <span>
                    <CardChip refCard={related[0].ref}>{related[0].word}</CardChip>
                    <span className="text-[#5A5A57]"> {related[0].meaning}</span>
                  </span>
                ) : (
                  <span>
                    {related[0].word} <span className="text-[#5A5A57]">{related[0].meaning}</span>
                  </span>
                ),
              }]
            : []),
          { k: "Revisão", v: <ReviewValue type="vocab" contentId={entry.portuguese} /> },
        ]}
      />
      <PracticeButton card={entry.ref} />

      {entry.example && <Examples rows={[{ pt: entry.example, en: entry.exampleTranslation }]} skip={entry.ref} />}

      {entry.proTip && (
        <div className="mt-3">
          <Callout label={<><span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span> Português europeu</>}>
            <LinkedText text={entry.proTip} skip={entry.ref} />
          </Callout>
        </div>
      )}

      {cultureNote && (
        <div className="mt-3 rounded-[10px] border border-aula-line px-3 py-2.5">
          <div className="mb-1 text-[12px] text-[#5A5A57]">
            Da nota <span className="font-medium text-aula-text">{cultureNote.title}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-aula-text">
            <LinkedText text={cultureNote.blocks[0]?.text ?? culture?.excerpt ?? ""} skip={entry.ref} />
          </p>
          <button
            type="button"
            onClick={() => book.openCard(cultureNote.ref)}
            className="mt-2 text-[12px] font-medium text-aula-accent"
          >
            Abrir {cultureNote.title}
          </button>
        </div>
      )}

      <Backlinks target={entry.ref} />

      <div className="mt-4">
        <Link
          href={wordHref(entry.category, entry.portuguese)}
          className="inline-flex h-8 items-center rounded-lg border border-aula-border px-3 text-[12.5px] font-medium text-aula-text transition-colors hover:bg-aula-sunken"
        >
          Abrir no vocabulário
        </Link>
      </div>
    </div>
  );
}

export function GrammarCard({ id }: { id: string }) {
  const topic = getGrammar(id);
  if (!topic) return <Missing label="Tópico não encontrado" />;
  const uses = linksFrom(encodeCard(topic.ref), "verb").slice(0, 5);
  const rule = topic.rules[0];
  const epTip = topic.tips.find((tip) => /european|europeu|brazil|gerúndio|gerundio|\bEP\b/i.test(tip));

  return (
    <div>
      <Head kicker={`Gramática · ${topic.cefr}`} title={topic.titlePt} meta={topic.title !== topic.titlePt ? topic.title : undefined} />
      {topic.summary && <p className="mt-3 text-[13px] leading-relaxed text-[#5A5A57]">{topic.summary}</p>}
      <PropList
        rows={[
          { k: "Nível", v: <LevelChip level={topic.cefr} /> },
          ...(uses.length
            ? [{
                k: "Usa",
                v: (
                  <span className="inline-flex flex-wrap gap-x-2">
                    {uses.map((ref) =>
                      ref.kind === "verb" ? (
                        <CardChip key={ref.id} refCard={ref}>
                          {ref.id}
                        </CardChip>
                      ) : null,
                    )}
                  </span>
                ),
              }]
            : []),
          { k: "Revisão", v: <ReviewValue type="grammar" contentId={topic.id} /> },
        ]}
      />
      <PracticeButton card={topic.ref} />
      {rule && (
        <>
          <h3 className="mt-5 text-[13px] font-semibold text-aula-text">{rule.rulePt || "Formação"}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-aula-text">
            <LinkedText text={rule.rule} skip={topic.ref} />
          </p>
          <Examples rows={rule.examples.slice(0, 3)} skip={topic.ref} />
        </>
      )}
      {epTip && (
        <div className="mt-3">
          <Callout label={<><span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span> Português europeu</>}>
            <LinkedText text={epTip} skip={topic.ref} />
          </Callout>
        </div>
      )}
      <div className="mt-4">
        <Link href={`/grammar/${topic.id}`} className="text-[12.5px] font-medium text-aula-accent">
          Abrir o capítulo
        </Link>
      </div>
      <Backlinks target={topic.ref} />
    </div>
  );
}

export function CultureCard({ cultureType, id }: { cultureType: "saying" | "etiquette" | "false-friend" | "regional"; id: string }) {
  const note = cultureOf(cultureType, id);
  if (!note) return <Missing label="Nota não encontrada" />;
  return (
    <div>
      <Head
        kicker={note.kicker}
        title={note.title}
        speak={note.example?.pt || note.title}
        meta={
          <>
            {note.pronunciation && <span>/{note.pronunciation}/</span>}
            {note.cefr && (
              <span className="ml-2 inline-flex align-middle">
                <LevelChip level={note.cefr} />
              </span>
            )}
            {note.subtitle && <span className="mt-0.5 block text-[13px] text-aula-text">{note.subtitle}</span>}
          </>
        }
      />
      <div className="mt-4 flex flex-col gap-3">
        {note.blocks.map((block, i) => (
          <div key={i}>
            {block.label && <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">{block.label}</div>}
            <p className="text-[13px] leading-relaxed text-aula-text">
              <LinkedText text={block.text} skip={note.ref} />
            </p>
          </div>
        ))}
      </div>
      {note.example && <Examples rows={[note.example]} skip={note.ref} />}
      <Backlinks target={note.ref} />
    </div>
  );
}

export function CardBody({ card }: { card: CardRef }) {
  switch (card.kind) {
    case "verb":
      return <VerbCard id={card.id} />;
    case "word":
      return <WordCard category={card.category} word={card.word} />;
    case "grammar":
      return <GrammarCard id={card.id} />;
    case "culture":
      return <CultureCard cultureType={card.cultureType} id={card.id} />;
  }
}

export function cardTabLabel(card: CardRef): string {
  switch (card.kind) {
    case "verb":
      return card.id;
    case "word":
      return card.word;
    case "grammar":
      return getGrammar(card.id)?.titlePt ?? card.id;
    case "culture":
      return cultureOf(card.cultureType, card.id)?.title ?? card.id;
  }
}

export function cardCrumb(card: CardRef): { group: string; name: string } {
  switch (card.kind) {
    case "verb":
      return { group: "Verbos", name: card.id };
    case "word": {
      const entry = getWord(card);
      return { group: entry ? `Vocabulário / ${entry.categoryLabel}` : "Vocabulário", name: card.word };
    }
    case "grammar": {
      const topic = getGrammar(card.id);
      return { group: topic ? `Gramática / ${topic.cefr}` : "Gramática", name: topic?.titlePt ?? card.id };
    }
    case "culture": {
      const note = cultureOf(card.cultureType, card.id);
      return { group: note?.kicker ?? "Cultura", name: note?.title ?? card.id };
    }
  }
}

function Missing({ label }: { label: string }) {
  return <p className="text-[13px] text-[#5A5A57]">{label}</p>;
}
