/**
 * Elísio's index: one item per chapter section, grammar topic, library word,
 * verb and culture note. Pure (no React, no window, no storage) so the audit can import it.
 */

import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterSection } from "@/data/chapter-types";
import { getChapterContent } from "@/data/chapters";
import { vocabKey } from "@/data/resolve-lessons";
import { GRAMMAR_ALIASES } from "@/data/elisio-aliases";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import vocabData from "@/data/vocab.json";
import verbsData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import etiquetteData from "@/data/etiquette.json";
import falseFriendsData from "@/data/false-friends.json";
import regionalData from "@/data/regional.json";
import { cultureOf, findWord, getGrammar, getVerb, lessonBacklinks, type VerbEntry } from "@/lib/book/catalog";
import { lessonBundle } from "@/lib/book/elisio";
import { encodeCard, type CardRef, type CultureType } from "@/lib/book/types";
import { genericSections } from "@/lib/chapter-sections";
import { plainDashes } from "@/lib/chapter-test";
import { normalizeForSearch } from "@/lib/search";
import type { ElisioKind, ElisioSource } from "./types";

// ─── Text ───

const STOP_EN =
  "i me do does did how what whats when where why which who is are am be the a an to of in on for or and with say said saying mean means meaning use using word words phrase portuguese english please can could should would you it its this that there";
const STOP_PT = "o a os as um uma de do da dos das que como e em no na se quando uso usar diz dizer significa quer";
export const STOPWORDS = new Set([...STOP_EN.split(" "), ...STOP_PT.split(" ")]);

/** Lowercase, accents off, punctuation to spaces, single spaces. */
export function norm(text: string): string {
  return normalizeForSearch(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(text: string): string[] {
  const n = norm(text);
  return n ? n.split(" ") : [];
}

/** Light stem used on both sides: -es off past 4 letters, else -s off past 3. */
export function stem(token: string): string {
  if (token.length > 4 && token.endsWith("es")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

/** Content tokens, stemmed. */
export function core(list: string[]): string[] {
  return list.filter((t) => !STOPWORDS.has(t)).map(stem);
}

export function cut(text: string, max = 240): string {
  const clean = plainDashes(text.replace(/\s+/g, " ").trim());
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[\s,;:.]+$/, "")}…`;
}

// ─── Course ───

const COURSE: CurriculumLesson[] = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS].sort(
  (a, b) => a.number - b.number || a.id.localeCompare(b.id),
);
const COURSE_INDEX = new Map(COURSE.map((lesson, i) => [lesson.id, i]));

export function courseLesson(id: string): CurriculumLesson | undefined {
  return COURSE.find((lesson) => lesson.id === id);
}

function sectionsOf(lesson: CurriculumLesson): ChapterSection[] {
  return getChapterContent(lesson.id)?.sections ?? genericSections(lesson, lessonBundle(lesson));
}

function earliest(ids: string[]): CurriculumLesson | undefined {
  return ids
    .map((id) => courseLesson(id))
    .filter((lesson): lesson is CurriculumLesson => Boolean(lesson))
    .sort((a, b) => (COURSE_INDEX.get(a.id) ?? 0) - (COURSE_INDEX.get(b.id) ?? 0))[0];
}

function backlinkSource(ref: CardRef, sectionFor: (sections: ChapterSection[]) => number): ElisioSource | null {
  const ids = lessonBacklinks(ref)
    .map((item) => item.href?.slice("/lessons/".length) ?? "")
    .filter(Boolean);
  const lesson = earliest(ids);
  if (!lesson) return null;
  const at = sectionFor(sectionsOf(lesson));
  return { lessonId: lesson.id, section: at >= 0 ? at + 1 : null };
}

// ─── Items ───

export interface IndexItem {
  kind: ElisioKind;
  id: string;
  title: string;
  /** Normalised key strings: whole-string matches score 100. Both the raw form and the content-token form. */
  exact: Set<string>;
  /** Stemmed content tokens of the keys and aliases. */
  keyTokens: Set<string>;
  /** Stemmed content tokens of the secondary text. */
  secTokens: Set<string>;
  /** Normalised multi-word aliases, matched as whole phrases in the question. */
  phrases: string[];
  /** Normalised aliases of any length (their words are kept even when they are stopwords). */
  aliases: string[];
  /** Word items: normalised Portuguese and English keys, for the intent pass. */
  ptKeys: string[];
  enKeys: string[];
  source: ElisioSource | null;
  cefr?: string;
  library: { href: string; label: string; tag: string };
  explanation: string;
  example: { pt: string; en?: string } | null;
  verb?: VerbEntry;
}

function keySets(keys: string[]) {
  const exact = new Set<string>();
  const keyTokens = new Set<string>();
  for (const key of keys) {
    const raw = tokens(key);
    if (raw.length === 0) continue;
    exact.add(raw.join(" "));
    const c = core(raw);
    if (c.length > 0) exact.add(c.join(" "));
    for (const t of c) keyTokens.add(t);
  }
  return { exact, keyTokens };
}

function secSet(texts: (string | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const text of texts) if (text) for (const t of core(tokens(text))) out.add(t);
  return out;
}

function item(
  base: Omit<IndexItem, "exact" | "keyTokens" | "secTokens" | "phrases" | "aliases" | "ptKeys" | "enKeys"> & {
    keys: string[];
    secondary: (string | undefined)[];
    aliases?: string[];
    ptKeys?: string[];
    enKeys?: string[];
  },
): IndexItem {
  const { keys, secondary, aliases = [], ptKeys = [], enKeys = [], ...rest } = base;
  const { exact, keyTokens } = keySets([...keys, ...aliases]);
  const normAliases = aliases.map(norm).filter(Boolean);
  return {
    ...rest,
    exact,
    keyTokens,
    secTokens: secSet(secondary),
    phrases: normAliases.filter((alias) => alias.includes(" ")),
    aliases: normAliases,
    ptKeys: ptKeys.map(norm).filter(Boolean),
    enKeys: enKeys.map(norm).filter(Boolean),
  };
}

function sectionItems(): IndexItem[] {
  const out: IndexItem[] = [];
  for (const lesson of COURSE) {
    const content = getChapterContent(lesson.id);
    if (!content) continue;
    content.sections.forEach((section, i) => {
      const keys = [section.title];
      const secondary: string[] = [];
      const notes: string[] = [];
      const texts: string[] = [];
      const labels: string[] = [];
      let example: { pt: string; en?: string } | null = null;
      let verbExample: { pt: string; en?: string } | null = null;
      let dialogueExample: { pt: string; en?: string } | null = null;
      for (const block of section.blocks) {
        if (block.type === "conjugation") {
          for (const conj of block.items) {
            keys.push(conj.label);
            labels.push(conj.label);
            if (!verbExample) {
              const row = getVerb(conj.verbKey.toLowerCase())?.rows("Present").find((r) => r.example);
              if (row) verbExample = { pt: row.example, en: row.english };
            }
          }
        } else if (block.type === "note") {
          keys.push(block.title);
          notes.push(block.body);
          secondary.push(block.body);
        } else if (block.type === "text") {
          texts.push(block.body);
          secondary.push(block.body);
        } else if (block.type === "vocab") {
          for (const row of block.rows) {
            if (row.kind === "word") {
              const word = findWord(row.categoryId, row.portuguese);
              secondary.push(row.portuguese, word?.english ?? "");
              if (!example && word?.example) example = { pt: word.example, en: word.exampleTranslation };
            } else {
              secondary.push(row.pt, row.en);
            }
          }
        } else if (block.type === "dialogue") {
          const line = block.lines[0];
          if (line && !dialogueExample) dialogueExample = { pt: line.pt, en: line.en };
        }
      }
      out.push(
        item({
          kind: "section",
          id: `${lesson.id}:${i + 1}`,
          title: section.title,
          keys,
          secondary,
          source: { lessonId: lesson.id, section: i + 1 },
          cefr: lesson.cefrLevel,
          library: { href: `/lessons/${lesson.id}`, label: "", tag: "" },
          explanation: cut(notes[0] ?? texts[0] ?? labels.join(". ")),
          example: example ?? verbExample ?? dialogueExample,
        }),
      );
    });
  }
  return out;
}

function grammarItems(): IndexItem[] {
  const out: IndexItem[] = [];
  for (const id of Object.keys((grammarData as { topics: Record<string, unknown> }).topics)) {
    const topic = getGrammar(id);
    if (!topic) continue;
    const lesson = earliest(COURSE.filter((l) => l.stages.grammar.topics.includes(id)).map((l) => l.id));
    let source: ElisioSource | null = null;
    if (lesson) {
      const at = sectionsOf(lesson).findIndex((section) => section.grammarTopic === id);
      source = { lessonId: lesson.id, section: at >= 0 ? at + 1 : null };
    }
    const first = topic.rules[0]?.examples[0];
    out.push(
      item({
        kind: "grammar",
        id,
        title: topic.title,
        keys: [topic.title, topic.titlePt],
        aliases: GRAMMAR_ALIASES[id] ?? [],
        secondary: [topic.summary],
        source,
        cefr: topic.cefr,
        library: { href: `/grammar/${id}?ficha=${encodeURIComponent(encodeCard({ kind: "grammar", id }))}`, label: "Gramática", tag: `Gramática · ${topic.cefr}` },
        explanation: cut(topic.summary || topic.intro.split("\n")[0] || topic.titlePt),
        example: first ? { pt: first.pt, en: first.en } : null,
      }),
    );
  }
  return out;
}

function splitPt(portuguese: string): string[] {
  const halves = portuguese.split(/\s*\/\s*/).filter(Boolean);
  const out = new Set<string>(halves);
  for (const half of halves) {
    const m = half.match(/^(o|a|os|as|um|uma)\s+(.+)$/i);
    if (m) out.add(m[2]);
  }
  return [...out];
}

function splitEn(english: string): string[] {
  return english
    .split(/\s*\/\s*|,/)
    .map((part) => part.replace(/\([^)]*\)/g, "").trim())
    .filter(Boolean);
}

type VocabFile = { categories: { id: string; words: { portuguese: string; english: string; cefr?: string; example?: string; exampleTranslation?: string }[] }[] };

function wordItems(): IndexItem[] {
  const out: IndexItem[] = [];
  for (const cat of (vocabData as VocabFile).categories) {
    for (const w of cat.words) {
      const ptKeys = splitPt(w.portuguese);
      const enKeys = splitEn(w.english);
      const key = vocabKey(w.portuguese);
      const source = backlinkSource({ kind: "word", category: cat.id, word: w.portuguese }, (sections) => {
        const at = sections.findIndex((section) =>
          section.blocks.some((block) => block.type === "vocab" && block.rows.some((row) => row.kind === "word" && row.categoryId === cat.id && vocabKey(row.portuguese) === key)),
        );
        return at >= 0 ? at : sections.findIndex((section) => section.title === "Vocabulário");
      });
      out.push(
        item({
          kind: "word",
          id: `${cat.id}:${w.portuguese}`,
          title: w.portuguese,
          keys: [...ptKeys, ...enKeys],
          ptKeys,
          enKeys,
          secondary: [w.example, w.exampleTranslation],
          source,
          cefr: w.cefr,
          library: { href: `/vocabulary/${cat.id}?highlight=${encodeURIComponent(w.portuguese)}`, label: "Vocabulário", tag: `Vocabulário · ${w.cefr ?? "A1"}` },
          explanation: cut(`«${w.portuguese}» means ${w.english}.`),
          example: w.example ? { pt: w.example, en: w.exampleTranslation } : null,
        }),
      );
    }
  }
  return out;
}

function verbItems(): IndexItem[] {
  const out: IndexItem[] = [];
  for (const key of (verbsData as { order: string[] }).order) {
    const verb = getVerb(key.toLowerCase());
    if (!verb) continue;
    const source = backlinkSource({ kind: "verb", id: verb.id }, (sections) => {
      const at = sections.findIndex((section) =>
        section.blocks.some((block) => block.type === "conjugation" && block.items.some((conj) => conj.verbKey.toUpperCase() === key.toUpperCase())),
      );
      return at >= 0 ? at : sections.findIndex((section) => section.title === "Verbos (presente)");
    });
    out.push(
      item({
        kind: "verb",
        id: verb.id,
        title: verb.id,
        keys: [verb.id, ...splitEn(verb.english)],
        secondary: verb.rows("Present").map((row) => row.example),
        source,
        cefr: verb.cefr,
        library: { href: `/conjugations/${verb.id}`, label: "Conjugações", tag: "Conjugações" },
        explanation: "",
        example: null,
        verb,
      }),
    );
  }
  return out;
}

const CULTURE_TAB: Record<CultureType, string> = { saying: "sayings", etiquette: "etiquette", "false-friend": "false-friends", regional: "regional" };

function cultureItems(): IndexItem[] {
  const refs: { type: CultureType; id: string }[] = [
    ...(etiquetteData as { tips: { id: string }[] }).tips.map((x) => ({ type: "etiquette" as const, id: x.id })),
    ...(sayingsData as { sayings: { id: string }[] }).sayings.map((x) => ({ type: "saying" as const, id: x.id })),
    ...(falseFriendsData as { falseFriends: { id: string }[] }).falseFriends.map((x) => ({ type: "false-friend" as const, id: x.id })),
    ...(regionalData as { expressions: { id: string }[] }).expressions.map((x) => ({ type: "regional" as const, id: x.id })),
  ];
  const out: IndexItem[] = [];
  for (const ref of refs) {
    const entry = cultureOf(ref.type, ref.id);
    if (!entry) continue;
    out.push(
      item({
        kind: "culture",
        id: `${ref.type}:${ref.id}`,
        title: entry.title,
        keys: [entry.title],
        secondary: [entry.subtitle, entry.blocks[0]?.text],
        source: null,
        cefr: entry.cefr,
        library: { href: `/culture?tab=${CULTURE_TAB[ref.type]}&highlight=${encodeURIComponent(ref.id)}`, label: "Cultura", tag: "Cultura" },
        explanation: cut(entry.subtitle || entry.blocks[0]?.text || entry.title),
        example: entry.example ? { pt: entry.example.pt, en: entry.example.en } : null,
      }),
    );
  }
  return out;
}

let built: IndexItem[] | null = null;

export function buildIndex(): IndexItem[] {
  if (!built) built = [...sectionItems(), ...grammarItems(), ...wordItems(), ...verbItems(), ...cultureItems()];
  return built;
}
