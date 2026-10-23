/**
 * Book index. Phrases from vocab, verbs, grammar and culture become links,
 * and every link is inverted into a backlink ("Aparece em"). Nothing here is
 * hand-authored: the edges are the mentions already in the content.
 */

import vocabData from "@/data/vocab.json";
import verbsData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import etiquetteData from "@/data/etiquette.json";
import falseFriendsData from "@/data/false-friends.json";
import regionalData from "@/data/regional.json";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { CATEGORY_PT } from "@/components/aula";
import { encodeCard, type CardRef, type CultureType } from "./types";

export type { CardRef, CultureType } from "./types";
export { decodeCard, encodeCard, sameCard, FICHA_PARAM } from "./types";

export interface Segment {
  kind: "text" | "link";
  text: string;
  ref?: CardRef;
  start: number;
  end: number;
}

export interface Backlink {
  sourceKey: string;
  title: string;
  kicker: string;
  excerpt: string;
  needle: string;
  /** Open this chapter. The current card stays in the query string. */
  href?: string;
  /** Open this other card instead of navigating. */
  card?: CardRef;
  rank: number;
}

export interface VerbRow {
  person: string;
  form: string;
  example: string;
  english: string;
  note?: string;
}

export interface VerbEntry {
  id: string;
  english: string;
  group: string;
  cefr: string;
  pronunciation?: string;
  participle?: string;
  participleNote?: string;
  tenses: string[];
  rows: (tense: string) => VerbRow[];
}

export interface WordEntry {
  category: string;
  categoryLabel: string;
  portuguese: string;
  english: string;
  cefr?: string;
  gender?: string | null;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  relatedWords: { word: string; meaning: string }[];
  proTip?: string;
  ref: CardRef;
}

export interface GrammarEntry {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary?: string;
  intro: string;
  rules: { rule: string; rulePt?: string; examples: { pt: string; en: string }[]; exceptions?: string[] }[];
  tips: string[];
  questions: {
    questionText: string;
    questionTextPt?: string;
    options: string[];
    correctAnswer: string;
    correctIndex: number;
    explanation?: string;
  }[];
  chapter: number;
  ref: CardRef;
}

export interface CultureEntry {
  ref: CardRef;
  title: string;
  subtitle?: string;
  cefr?: string;
  kicker: string;
  pronunciation?: string;
  blocks: { label?: string; text: string }[];
  example?: { pt: string; en: string };
}

type Node = { next: Map<string, Node>; ref?: CardRef };

type Source = {
  key: string;
  title: string;
  kicker: string;
  href?: string;
  card?: CardRef;
  rank: number;
};

const STOP = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
  "em", "no", "na", "nos", "nas", "por", "para", "com", "sem", "e", "ou", "que",
  "se", "não", "nao", "sim", "eu", "tu", "ele", "ela", "você", "voce", "nós", "vos",
  "eles", "elas", "vocês", "voces", "ao", "à", "aos", "às", "pelo", "pela",
  "the", "and", "for", "with", "from", "this", "that",
]);

const LESSONS: CurriculumLesson[] = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS];

const TENSE_ORDER = [
  "Present",
  "Preterite",
  "Imperfect",
  "Future",
  "Conditional",
  "Present Subjunctive",
  "Imperfect Subjunctive",
  "Future Subjunctive",
  "Imperative",
];

interface VerbFileRow {
  Person: string;
  Tense: string;
  Conjugation: string;
  "Example Sentence": string;
  "English Translation": string;
  Notes?: string;
}
interface VerbFileEntry {
  meta: {
    english: string;
    group: string;
    cefr: string;
    pronunciation?: string;
    participle?: string;
    participleNote?: string;
  };
  conjugations: VerbFileRow[];
}

const verbFile = verbsData as unknown as { order: string[]; verbs: Record<string, VerbFileEntry> };

interface WordFile {
  portuguese: string;
  english: string;
  cefr?: string;
  gender?: string | null;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  relatedWords?: { word: string; meaning: string }[];
  proTip?: string;
}
interface CategoryFile {
  id: string;
  title: string;
  words: WordFile[];
}

const categories = vocabData.categories as CategoryFile[];

interface GrammarFile {
  id: string;
  title: string;
  titlePt?: string;
  cefr: string;
  summary?: string;
  intro?: string;
  rules?: { rule: string; rulePt?: string; examples?: { pt: string; en: string }[]; exceptions?: string[] }[];
  tips?: string[];
  questions?: GrammarEntry["questions"];
}
const topics = grammarData.topics as unknown as Record<string, GrammarFile>;
const topicIds = Object.keys(topics);

const root: Node = { next: new Map() };
const backlinks = new Map<string, { total: number; items: Backlink[] }>();
const outgoing = new Map<string, CardRef[]>();
const wordByKey = new Map<string, WordEntry>();
const cultureByKey = new Map<string, CultureEntry>();
let built = false;

function isWordChar(ch: string | undefined): boolean {
  if (!ch) return false;
  return /[\p{L}\p{N}]/u.test(ch);
}

function lowerMap(input: string): { text: string; starts: number[] } {
  let text = "";
  const starts: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const lower = input[i].toLowerCase();
    for (const c of lower) {
      starts.push(i);
      text += c;
    }
  }
  return { text, starts };
}

function addPhrase(raw: string, ref: CardRef, min = 3) {
  const phrase = raw.trim().toLowerCase();
  if (phrase.length < min) return;
  if (!/\p{L}/u.test(phrase)) return;
  let node = root;
  for (const ch of phrase) {
    let next = node.next.get(ch);
    if (!next) {
      next = { next: new Map() };
      node.next.set(ch, next);
    }
    node = next;
  }
  node.ref = ref;
}

function wordPhrases(portuguese: string): string[] {
  const out: string[] = [];
  const full = portuguese.trim();
  if (full) out.push(full);
  for (const part of full.split(/\s*\/\s*/)) {
    const bit = part.trim();
    if (bit && bit !== full) out.push(bit);
    const bare = bit.replace(/^(o|a|os|as|um|uma)\s+/i, "").trim();
    if (bare && bare !== bit) out.push(bare);
  }
  const bareFull = full.replace(/^(o|a|os|as|um|uma)\s+/i, "").trim();
  if (bareFull && bareFull !== full) out.push(bareFull);
  return out.filter((p) => {
    const token = p.toLowerCase();
    if (token.length < 3) return false;
    if (!p.includes(" ") && STOP.has(token)) return false;
    return true;
  });
}

function grammarAliases(title: string, titlePt: string): string[] {
  const set = new Set<string>();
  for (const raw of [title, titlePt]) {
    const t = raw.trim();
    if (t.length < 5) continue;
    set.add(t);
    set.add(t.replace(/infinitivo/gi, "infinitive"));
    set.add(t.replace(/infinitive/gi, "infinitivo"));
    set.add(t.replace(/\s+a\s+\+\s+/i, " + a + "));
    set.add(t.replace(/\s*\+\s*/g, " "));
  }
  return [...set].filter((s) => s.trim().length >= 5);
}

function linkText(input: string): Segment[] {
  if (!input) return [];
  ensure();
  const { text, starts } = lowerMap(input);
  const segments: Segment[] = [];
  let orig = 0;
  let i = 0;
  while (i < text.length) {
    if (i > 0 && isWordChar(text[i - 1])) {
      i++;
      continue;
    }
    let node = root;
    let best: { len: number; ref: CardRef } | null = null;
    for (let k = i; k < text.length; k++) {
      const next = node.next.get(text[k]);
      if (!next) break;
      node = next;
      if (node.ref && !isWordChar(text[k + 1])) best = { len: k - i + 1, ref: node.ref };
    }
    if (best) {
      const start = starts[i];
      const end = i + best.len < starts.length ? starts[i + best.len] : input.length;
      if (start > orig) segments.push({ kind: "text", text: input.slice(orig, start), start: orig, end: start });
      segments.push({ kind: "link", text: input.slice(start, end), ref: best.ref, start, end });
      orig = end;
      i += best.len;
    } else {
      i++;
    }
  }
  if (orig < input.length) segments.push({ kind: "text", text: input.slice(orig), start: orig, end: input.length });
  return segments;
}

function sentenceAround(text: string, start: number, end: number): string {
  let a = start;
  while (a > 0 && !".!?\n".includes(text[a - 1])) a--;
  let b = end;
  while (b < text.length && !".!?\n".includes(text[b])) b++;
  let slice = text.slice(a, Math.min(text.length, b + (".!?".includes(text[b] ?? "") ? 1 : 0))).replace(/\s+/g, " ").trim();
  if (slice.length > 200) {
    const rel = Math.max(0, start - a);
    const from = Math.max(0, rel - 80);
    const to = Math.min(slice.length, rel + (end - start) + 80);
    slice = `${from > 0 ? "…" : ""}${slice.slice(from, to).trim()}${to < slice.length ? "…" : ""}`;
  }
  return slice;
}

const pending = new Map<string, Backlink[]>();

function addEdge(target: CardRef, source: Source, excerpt: string, needle: string) {
  const key = encodeCard(target);
  if (key === source.key) return;
  if (!excerpt.trim() || !needle.trim()) return;
  const list = pending.get(key) ?? [];
  if (list.some((item) => item.sourceKey === source.key)) return;
  list.push({
    sourceKey: source.key,
    title: source.title,
    kicker: source.kicker,
    excerpt,
    needle,
    href: source.href,
    card: source.card,
    rank: source.rank,
  });
  pending.set(key, list);
  const from = outgoing.get(source.key) ?? [];
  if (!from.some((ref) => encodeCard(ref) === key)) {
    from.push(target);
    outgoing.set(source.key, from);
  }
}

function scan(text: string | undefined, source: Source) {
  if (!text || !text.trim()) return;
  for (const part of linkText(text)) {
    if (part.kind !== "link" || !part.ref) continue;
    addEdge(part.ref, source, sentenceAround(text, part.start, part.end), part.text);
  }
}

function explicit(target: CardRef, source: Source, excerpt: string) {
  const list = pending.get(encodeCard(target));
  if (list?.some((item) => item.sourceKey === source.key)) return;
  const needle = excerpt.trim().slice(0, 48);
  addEdge(target, source, excerpt.trim(), needle || source.title);
}

function buildCulture(): CultureEntry[] {
  const notes: CultureEntry[] = [];
  for (const s of sayingsData.sayings) {
    const ref: CardRef = { kind: "culture", cultureType: "saying", id: s.id };
    notes.push({
      ref,
      title: s.portuguese.replace(/\.$/, ""),
      subtitle: s.meaning,
      cefr: s.cefr,
      kicker: "Cultura · Ditado",
      pronunciation: s.pronunciation,
      blocks: [
        { label: "À letra", text: s.literal },
        { label: "Uso", text: s.usage },
      ].filter((b) => b.text),
      example: s.example ? { pt: s.example, en: s.exampleTranslation } : undefined,
    });
  }
  for (const e of etiquetteData.tips) {
    const ref: CardRef = { kind: "culture", cultureType: "etiquette", id: e.id };
    notes.push({
      ref,
      title: e.titlePt,
      subtitle: e.title,
      kicker: "Cultura · Etiqueta",
      blocks: [
        { text: e.description },
        { label: "Faz", text: e.doThis },
        { label: "Evita", text: e.avoidThis },
      ].filter((b) => b.text),
    });
  }
  for (const f of falseFriendsData.falseFriends) {
    const ref: CardRef = { kind: "culture", cultureType: "false-friend", id: f.id };
    notes.push({
      ref,
      title: f.portuguese,
      subtitle: f.actualMeaning,
      cefr: f.cefr,
      kicker: "Cultura · Falso amigo",
      pronunciation: f.pronunciation,
      blocks: [
        { label: "Parece", text: `${f.looksLike} — na verdade: ${f.actualMeaning}` },
        { text: f.tip },
      ].filter((b) => b.text),
      example: f.example ? { pt: f.example, en: f.exampleTranslation } : undefined,
    });
  }
  for (const r of regionalData.expressions) {
    const ref: CardRef = { kind: "culture", cultureType: "regional", id: r.id };
    const region = r.region.charAt(0).toUpperCase() + r.region.slice(1);
    notes.push({
      ref,
      title: r.expression,
      subtitle: r.meaning,
      cefr: r.cefr,
      kicker: "Cultura · Regional",
      pronunciation: r.pronunciation,
      blocks: [
        { label: "Onde", text: region },
        { label: "No resto do país", text: r.standardAlternative },
      ].filter((b) => b.text),
      example: r.example ? { pt: r.example, en: r.exampleTranslation } : undefined,
    });
  }
  return notes;
}

function ensure() {
  if (built) return;
  built = true;

  const cultures = buildCulture();
  for (const note of cultures) {
    cultureByKey.set(encodeCard(note.ref), note);
    addPhrase(note.title, note.ref, 4);
  }

  for (const id of topicIds) {
    const topic = topics[id];
    const ref: CardRef = { kind: "grammar", id };
    for (const alias of grammarAliases(topic.title, topic.titlePt ?? topic.title)) addPhrase(alias, ref, 5);
  }

  for (const category of categories) {
    for (const word of category.words) {
      const ref: CardRef = { kind: "word", category: category.id, word: word.portuguese };
      const entry: WordEntry = {
        category: category.id,
        categoryLabel: CATEGORY_PT[category.id] ?? category.title,
        portuguese: word.portuguese,
        english: word.english,
        cefr: word.cefr,
        gender: word.gender,
        pronunciation: word.pronunciation,
        example: word.example,
        exampleTranslation: word.exampleTranslation,
        relatedWords: word.relatedWords ?? [],
        proTip: word.proTip,
        ref,
      };
      wordByKey.set(`${category.id}\n${word.portuguese}`, entry);
      for (const phrase of wordPhrases(word.portuguese)) addPhrase(phrase, ref, 3);
    }
  }

  for (const key of verbFile.order) {
    const verb = verbFile.verbs[key];
    if (!verb) continue;
    addPhrase(key.toLowerCase(), { kind: "verb", id: key.toLowerCase() }, 2);
  }

  for (const note of cultures) {
    const source: Source = { key: encodeCard(note.ref), title: note.title, kicker: note.kicker, card: note.ref, rank: 2 };
    for (const block of note.blocks) scan(block.text, source);
    scan(note.example?.pt, source);
    scan(note.subtitle, source);
  }

  for (const id of topicIds) {
    const topic = topics[id];
    const ref: CardRef = { kind: "grammar", id };
    const source: Source = {
      key: encodeCard(ref),
      title: topic.titlePt ?? topic.title,
      kicker: `Gramática · ${topic.cefr}`,
      href: `/grammar/${id}`,
      rank: 1,
    };
    scan(topic.summary, source);
    scan(topic.intro, source);
    for (const rule of topic.rules ?? []) {
      scan(rule.rule, source);
      scan(rule.rulePt, source);
      for (const ex of rule.examples ?? []) scan(ex.pt, source);
    }
    for (const tip of topic.tips ?? []) scan(tip, source);
  }

  for (const category of categories) {
    for (const word of category.words) {
      const ref: CardRef = { kind: "word", category: category.id, word: word.portuguese };
      const source: Source = {
        key: encodeCard(ref),
        title: word.portuguese,
        kicker: CATEGORY_PT[category.id] ?? category.title,
        card: ref,
        rank: 4,
      };
      scan(word.example, source);
      scan(word.proTip, source);
    }
  }

  for (const key of verbFile.order) {
    const verb = verbFile.verbs[key];
    if (!verb) continue;
    const id = key.toLowerCase();
    const ref: CardRef = { kind: "verb", id };
    const source: Source = { key: encodeCard(ref), title: id, kicker: "Verbos", card: ref, rank: 3 };
    const seen = new Set<string>();
    for (const row of verb.conjugations) {
      if (row.Tense === "Present" && row.Notes && !seen.has(row.Notes)) {
        seen.add(row.Notes);
        scan(row.Notes, source);
      }
      scan(row["Example Sentence"], source);
    }
  }

  for (const lesson of LESSONS) {
    const source: Source = {
      key: `lesson:${lesson.id}`,
      title: `Lição ${lesson.number} · ${lesson.titlePt}`,
      kicker: `Lições · ${lesson.cefrLevel}`,
      href: `/lessons/${lesson.id}`,
      rank: 0,
    };
    scan(lesson.descriptionPt, source);
    scan(lesson.description, source);
    for (const ref of lesson.stages.vocabulary.words) {
      const word = findWord(ref.categoryId, ref.portuguese);
      if (!word) continue;
      explicit(word.ref, source, word.example || word.english);
      scan(word.example, source);
    }
    for (const ref of lesson.stages.verbs.verbs) {
      const id = ref.verbKey.toLowerCase();
      const entry = getVerb(id);
      const sample = entry?.rows("Present")[0];
      explicit({ kind: "verb", id }, source, sample ? `${sample.form} — ${sample.example}` : entry?.english ?? id);
      for (const row of (entry?.rows("Present") ?? []).slice(0, 3)) scan(row.example, source);
    }
    for (const topicId of lesson.stages.grammar.topics) {
      const topic = topics[topicId];
      if (!topic) continue;
      explicit({ kind: "grammar", id: topicId }, source, topic.summary || topic.intro?.split("\n")[0] || topic.title);
      scan(topic.summary, source);
    }
    for (const item of lesson.stages.culture.items) {
      if (item.type === "slang") continue;
      const cultureType = item.type as CultureType;
      const note = cultureByKey.get(encodeCard({ kind: "culture", cultureType, id: item.id }));
      if (!note) continue;
      const blurb = note.blocks.find((block) => (block.text?.length ?? 0) > 40)?.text || note.subtitle || note.title;
      explicit(note.ref, source, blurb);
      for (const block of note.blocks) scan(block.text, source);
    }
  }

  for (const [key, items] of pending) {
    items.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title, "pt"));
    backlinks.set(key, { total: items.length, items: items.slice(0, 24) });
  }
  pending.clear();
}

/** Link mentions in running text. `skip` is rendered as plain text (a card does not link to itself). */
export function linkPlain(text: string, skip?: CardRef): Segment[] {
  const skipKey = skip ? encodeCard(skip) : null;
  const out: Segment[] = [];
  for (const part of linkText(text)) {
    const skipped = Boolean(skipKey && part.ref && encodeCard(part.ref) === skipKey);
    if (part.kind === "link" && part.ref && !skipped) {
      out.push(part);
      continue;
    }
    const prev = out[out.length - 1];
    if (prev && prev.kind === "text") {
      prev.text += part.text;
      prev.end = part.end;
    } else {
      out.push({ kind: "text", text: part.text, start: part.start, end: part.end });
    }
  }
  return out;
}

export function getBacklinks(ref: CardRef): { total: number; items: Backlink[] } {
  ensure();
  return backlinks.get(encodeCard(ref)) ?? { total: 0, items: [] };
}

export function linksFrom(sourceKey: string, kind?: CardRef["kind"]): CardRef[] {
  ensure();
  const refs = outgoing.get(sourceKey) ?? [];
  return kind ? refs.filter((ref) => ref.kind === kind) : refs;
}

export function lookupExact(phrase: string): CardRef | null {
  ensure();
  const text = phrase.trim().toLowerCase();
  if (!text) return null;
  let node = root;
  for (const ch of text) {
    const next = node.next.get(ch);
    if (!next) return null;
    node = next;
  }
  return node.ref ?? null;
}

export function findWord(categoryId: string, portuguese: string): WordEntry | null {
  ensure();
  const exact = wordByKey.get(`${categoryId}\n${portuguese}`);
  if (exact) return exact;
  const norm = (s: string) => s.toLowerCase().trim();
  const want = norm(portuguese).split(/\s*\/\s*/)[0];
  for (const [key, entry] of wordByKey) {
    if (!key.startsWith(`${categoryId}\n`)) continue;
    const head = norm(entry.portuguese).split(/\s*\/\s*/)[0];
    if (head === want) return entry;
  }
  return null;
}

export function getWord(ref: CardRef & { kind: "word" }): WordEntry | null {
  ensure();
  return wordByKey.get(`${ref.category}\n${ref.word}`) ?? null;
}

export function wordsInCategory(category: string): WordEntry[] {
  ensure();
  const out: WordEntry[] = [];
  for (const entry of wordByKey.values()) {
    if (entry.category === category) out.push(entry);
  }
  return out;
}

export function getVerb(id: string): VerbEntry | null {
  const key = id.toUpperCase();
  const verb = verbFile.verbs[key];
  if (!verb) return null;
  const tenses = [...new Set(verb.conjugations.map((row) => row.Tense))].sort((a, b) => {
    const ia = TENSE_ORDER.indexOf(a);
    const ib = TENSE_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return {
    id: id.toLowerCase(),
    english: verb.meta.english,
    group: verb.meta.group,
    cefr: verb.meta.cefr,
    pronunciation: verb.meta.pronunciation,
    participle: verb.meta.participle,
    participleNote: verb.meta.participleNote,
    tenses,
    rows: (tense: string) =>
      verb.conjugations
        .filter((row) => row.Tense === tense)
        .map((row) => ({
          person: row.Person,
          form: row.Conjugation,
          example: row["Example Sentence"],
          english: row["English Translation"],
          note: row.Notes,
        })),
  };
}

export function sameGroupVerbs(id: string): { id: string; english: string }[] {
  const verb = getVerb(id);
  if (!verb) return [];
  const key = id.toUpperCase();
  return verbFile.order
    .filter((k) => k !== key && verbFile.verbs[k]?.meta.group === verb.group)
    .slice(0, 6)
    .map((k) => ({ id: k.toLowerCase(), english: verbFile.verbs[k].meta.english }));
}

export function getGrammar(id: string): GrammarEntry | null {
  const topic = topics[id];
  if (!topic) return null;
  const chapter = topicIds.indexOf(id);
  return {
    id,
    title: topic.title,
    titlePt: topic.titlePt ?? topic.title,
    cefr: topic.cefr,
    summary: topic.summary,
    intro: topic.intro ?? "",
    rules: (topic.rules ?? []).map((rule) => ({
      rule: rule.rule,
      rulePt: rule.rulePt,
      examples: rule.examples ?? [],
      exceptions: rule.exceptions,
    })),
    tips: topic.tips ?? [],
    questions: topic.questions ?? [],
    chapter: chapter < 0 ? 0 : chapter + 1,
    ref: { kind: "grammar", id },
  };
}

export function getCulture(ref: CardRef & { kind: "culture" }): CultureEntry | null {
  ensure();
  return cultureByKey.get(encodeCard(ref)) ?? null;
}

export function cultureOf(type: string, id: string): CultureEntry | null {
  if (type !== "saying" && type !== "etiquette" && type !== "false-friend" && type !== "regional") return null;
  return getCulture({ kind: "culture", cultureType: type, id });
}

export function pronounLabel(person: string): string {
  const known: Record<string, string> = {
    "eu (I)": "eu",
    "tu (you singular)": "tu",
    "ele/ela/você (he/she/you formal)": "ele / ela / você",
    "nós (we)": "nós",
    "eles/elas/vocês (they/you plural formal)": "eles / elas / vocês",
  };
  return known[person] ?? person.split(" (")[0].replaceAll("/", " / ");
}
