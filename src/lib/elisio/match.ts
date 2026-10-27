/**
 * Elísio's matcher. Deterministic and pure: the same question and context always give the same result.
 * Nothing below the cut-off is ever presented as an answer.
 */

import { chapterLabel } from "@/lib/chapter-nav";
import { detectIntent } from "@/lib/search";
import { buildIndex, core, courseLesson, norm, STOPWORDS, stem, tokens, type IndexItem } from "./index";
import type { ElisioAnswer, ElisioContext, ElisioResult, ElisioTag } from "./types";

/** The top item is an answer at this unboosted score or above. */
export const ANSWER_MIN = 60;
/** Items at or above this unboosted score can be offered as closest. */
export const CLOSEST_MIN = 20;
/** Queries with this many content tokens or more also need half of them in the item's keys. */
const LONG_QUERY = 5;
/** A multi-word alias found as a whole phrase in the question. */
const PHRASE_SCORE = 80;

const LATER_NOTE = "This comes later in the course. Here is the short version.";
const LEVEL_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4 };

/** 3: the question is one of the item's keys. 2: a key that loses a stopword, a translation prefix, an alias phrase. 1: token overlap. */
type Tier = 1 | 2 | 3;

interface Scored {
  item: IndexItem;
  score: number;
  keyCov: number;
  boosted: number;
  tier: Tier;
}

const KIND_ORDER: Record<IndexItem["kind"], number> = { section: 0, grammar: 1, word: 2, verb: 3, culture: 4 };
const LEAD_INS = ["how do i say ", "how can i say ", "how would i say ", "how do you say ", "how to say ", "whats the portuguese for ", "what is the portuguese for "];

function position(ctx: ElisioContext, id: string): number {
  const at = ctx.order.indexOf(id);
  return at < 0 ? Number.POSITIVE_INFINITY : at;
}

function aboutMatches(item: IndexItem, ctx: ElisioContext): boolean {
  const about = ctx.about;
  if (!about) return false;
  switch (about.about) {
    case "verb":
      return item.kind === "verb" && item.id === about.id.toLowerCase();
    case "word":
      return item.kind === "word" && item.id === `${about.category}:${about.word}`;
    case "grammar":
      return item.kind === "grammar" && item.id === about.id;
    case "lesson":
      return item.kind === "section" && item.source?.lessonId === about.id;
  }
}

function boost(item: IndexItem, ctx: ElisioContext): number {
  let extra = 0;
  const source = item.source?.lessonId;
  if (source && source === ctx.currentId) extra += 10;
  else if (source && position(ctx, source) <= position(ctx, ctx.frontierId)) extra += 5;
  if (aboutMatches(item, ctx)) extra += 15;
  return extra;
}

/** Best first: tier, boosted score, kind, items with a chapter, earlier in the course. Alphabetical only as a last resort. */
function rank(ctx: ElisioContext) {
  return (a: Scored, b: Scored) =>
    b.tier - a.tier ||
    b.boosted - a.boosted ||
    KIND_ORDER[a.item.kind] - KIND_ORDER[b.item.kind] ||
    Number(Boolean(b.item.source)) - Number(Boolean(a.item.source)) ||
    position(ctx, a.item.source?.lessonId ?? "") - position(ctx, b.item.source?.lessonId ?? "") ||
    a.item.id.localeCompare(b.item.id);
}

// ─── Tags and links ───

function tagAndLink(item: IndexItem, ctx: ElisioContext): { tag: ElisioTag; link: ElisioAnswer["link"] } {
  const source = item.source;
  const lesson = source ? courseLesson(source.lessonId) : undefined;
  if (source && lesson) {
    const label = chapterLabel(lesson);
    const section = source.section != null ? ` §${source.section}` : "";
    const chapterLink = {
      href: source.section != null ? `/lessons/${lesson.id}#section-${source.section}` : `/lessons/${lesson.id}`,
      label: `Abrir em ${label}${section}`,
    };
    if (lesson.id === ctx.currentId) return { tag: { text: `${label}${section} · this chapter`, tone: "in" }, link: chapterLink };
    if (position(ctx, lesson.id) <= position(ctx, ctx.frontierId)) return { tag: { text: `${label}${section}`, tone: "in" }, link: chapterLink };
    const link = item.kind === "section" ? { href: `/lessons/${lesson.id}`, label: `Abrir em ${label}` } : { href: item.library.href, label: `Abrir em ${item.library.label}` };
    return { tag: { text: `${label} · later in the course`, tone: "later", note: LATER_NOTE }, link };
  }
  const current = courseLesson(ctx.currentId);
  const above = (LEVEL_RANK[item.cefr ?? ""] ?? 0) > (LEVEL_RANK[current?.cefrLevel ?? "A1"] ?? 0);
  return {
    tag: { text: item.library.tag, tone: "library", ...(above ? { note: LATER_NOTE } : {}) },
    link: { href: item.library.href, label: `Abrir em ${item.library.label}` },
  };
}

function shortPronoun(person: string): string | null {
  const p = person.toLowerCase();
  if (p.startsWith("eu")) return "eu";
  if (p.startsWith("tu")) return "tu";
  if (p.startsWith("eles")) return "eles";
  if (p.startsWith("ele")) return "ele/ela";
  if (p.startsWith("nós") || p.startsWith("nos")) return "nós";
  return null;
}

function toAnswer(scored: Scored, ctx: ElisioContext, tense?: string): ElisioAnswer {
  const { item } = scored;
  let explanation = item.explanation;
  let example = item.example;
  if (item.kind === "verb" && item.verb) {
    const verb = item.verb;
    const use = tense && verb.rows(tense).length > 0 ? tense : "Present";
    const rows = verb.rows(use);
    const forms = rows
      .map((row) => {
        const pronoun = shortPronoun(row.person);
        return pronoun ? `${pronoun} ${row.form}` : null;
      })
      .filter(Boolean)
      .join(", ");
    explanation = `${verb.id} means "${verb.english}". ${use}: ${forms}.`;
    const row = rows.find((r) => r.example);
    example = row ? { pt: row.example, en: row.english } : null;
  }
  const { tag, link } = tagAndLink(item, ctx);
  return { kind: item.kind, id: item.id, title: item.title, explanation, example, tag, link, score: Math.round(scored.score) };
}

// ─── Passes ───

function best(pool: IndexItem[], score: number, tier: Tier, ctx: ElisioContext): Scored | null {
  const scored = pool.map((item) => ({ item, score, keyCov: 1, boosted: score + boost(item, ctx), tier }));
  return scored.sort(rank(ctx))[0] ?? null;
}

function questionText(question: string): string {
  return norm(question).replace(/ in portuguese$/, "").trim();
}

/** The whole question is one of an item's keys, before any stopword is removed ("how are you", "what time is it"). */
function wholeQuestionPass(question: string, items: IndexItem[], ctx: ElisioContext): Scored | null {
  const q = questionText(question);
  return q ? best(items.filter((item) => item.fullKeys.has(q)), 100, 3, ctx) : null;
}

/** "how do I say …", "what's the portuguese for …": the rest is an English term to find among the words. */
function leadInPass(question: string, items: IndexItem[], ctx: ElisioContext): Scored | null {
  const q = questionText(question);
  const lead = LEAD_INS.find((prefix) => q.startsWith(prefix));
  if (!lead) return null;
  const term = q.slice(lead.length).trim();
  if (!term) return null;
  const words = items.filter((item) => item.kind === "word");
  return best(words.filter((item) => item.fullKeys.has(term)), 100, 3, ctx) ?? best(words.filter((item) => [...item.fullKeys].some((key) => key.startsWith(`${term} `))), 90, 2, ctx);
}

/** Share of the item's best single key found in the question. */
function keyFit(item: IndexItem, question: Set<string>): number {
  let fit = 0;
  for (const list of item.keyLists) fit = Math.max(fit, list.filter((t) => question.has(t)).length / list.length);
  return fit;
}

function intentPass(question: string, items: IndexItem[], ctx: ElisioContext): { scored: Scored; tense?: string } | null {
  const intent = detectIntent(question);
  const term = norm(intent.extractedQuery).replace(/\s+in portuguese$/, "").trim();
  const hit = (pool: IndexItem[]): Scored | null => best(pool, 100, 3, ctx);
  switch (intent.type) {
    case "translation": {
      if (!term) return null;
      const words = items.filter((item) => item.kind === "word");
      const equal = words.filter((item) => item.enKeys.includes(term));
      const starts = equal.length > 0 ? [] : words.filter((item) => item.enKeys.some((key) => key.startsWith(`${term} `)));
      const best = hit(equal.length > 0 ? equal : starts);
      return best ? { scored: best } : null;
    }
    case "definition": {
      if (!term) return null;
      const best = hit(items.filter((item) => item.kind === "word" && item.ptKeys.includes(term)));
      return best ? { scored: best } : null;
    }
    case "conjugation":
    case "tense": {
      const verbTerm = term.replace(/^to /, "");
      const best = hit(items.filter((item) => item.kind === "verb" && norm(item.id) === verbTerm));
      return best ? { scored: best, tense: intent.type === "tense" ? intent.tense : undefined } : null;
    }
    case "comparison": {
      const want = new Set(core((intent.comparisonTerms ?? []).flatMap((t) => tokens(t))));
      if (want.size < 2) return null;
      const same = (keys: string[]) =>
        keys.some((key) => {
          const set = new Set(core(tokens(key)));
          return set.size === want.size && [...want].every((t) => set.has(t));
        });
      const best = hit(items.filter((item) => item.kind === "grammar" && same([item.title, ...item.aliases])));
      return best ? { scored: best } : null;
    }
    default:
      return null;
  }
}

function tokenPass(question: string, items: IndexItem[], ctx: ElisioContext) {
  const raw = tokens(question);
  const padded = ` ${raw.join(" ")} `;
  // Aliases are checked on the raw question first, so words like "my" or "would" survive when an alias names them.
  const kept = new Set<string>();
  for (const item of items) {
    for (const alias of item.aliases) if (padded.includes(` ${alias} `)) for (const t of alias.split(" ")) kept.add(t);
  }
  const content = raw.filter((t) => !STOPWORDS.has(t) || kept.has(t));
  const coreTokens = raw.filter((t) => !STOPWORDS.has(t)).map(stem);
  const contentStr = content.join(" ");
  const coreStr = coreTokens.join(" ");
  const contentCoreStr = content.map(stem).join(" ");

  const scored: Scored[] = [];
  if (content.length === 0) return { scored, contentCount: 0, coreCount: 0 };
  const coreSet = new Set(coreTokens);
  const has = (set: Set<string>) => set.has(contentStr) || set.has(contentCoreStr) || (coreStr !== "" && set.has(coreStr));
  for (const item of items) {
    let keyHits = 0;
    let secHits = 0;
    for (const t of coreTokens) {
      if (item.keyTokens.has(t)) keyHits++;
      else if (item.secTokens.has(t)) secHits++;
    }
    const n = coreTokens.length;
    let keyCov = n > 0 ? keyHits / n : 0;
    let score: number;
    let tier: Tier;
    if (has(item.exact)) {
      score = 100;
      tier = 3;
      keyCov = 1;
    } else if (has(item.reducedKeys)) {
      score = 85;
      tier = 2;
      keyCov = 1;
    } else if (n < LONG_QUERY && item.phrases.some((phrase) => padded.includes(` ${phrase} `))) {
      score = PHRASE_SCORE;
      tier = 2;
      keyCov = Math.max(keyCov, 0.5);
    } else {
      score = n > 0 ? 70 * keyCov + 30 * (secHits / n) : 0;
      tier = 1;
      // Key fit: a partial hit answers only when it covers more than half of one of the item's own keys
      // (half is enough for a grammar topic name such as "Subjunctive Triggers").
      const fit = keyFit(item, coreSet);
      if (!(fit > 0.5 || (item.kind === "grammar" && fit >= 0.5))) score = Math.min(score, ANSWER_MIN - 1);
    }
    if (score <= 0) continue;
    scored.push({ item, score, keyCov, boosted: score + boost(item, ctx), tier });
  }
  scored.sort(rank(ctx));
  return { scored, contentCount: content.length, coreCount: coreTokens.length };
}

export function askElisio(question: string, ctx: ElisioContext): ElisioResult {
  const items = buildIndex();
  if (tokens(question).length === 0) return { type: "none", closest: [] };

  const { scored, contentCount, coreCount } = tokenPass(question, items, ctx);
  const passes = (s: Scored) => s.score >= ANSWER_MIN && (coreCount < LONG_QUERY || s.keyCov >= 0.5);
  // The learner's own chapter first, for every kind of answer: a section reached by now that fully covers the question wins.
  const chapterFirst = (pick: Scored): Scored => {
    if (pick.item.kind === "section") return pick;
    const section = scored.find(
      (s) => s.item.kind === "section" && s.keyCov === 1 && passes(s) && position(ctx, s.item.source?.lessonId ?? "") <= position(ctx, ctx.frontierId),
    );
    return section ?? pick;
  };

  const whole = wholeQuestionPass(question, items, ctx);
  if (whole) return { type: "answer", answer: toAnswer(chapterFirst(whole), ctx) };
  const lead = leadInPass(question, items, ctx);
  if (lead) return { type: "answer", answer: toAnswer(chapterFirst(lead), ctx) };
  const intent = intentPass(question, items, ctx);
  if (intent) {
    const pick = chapterFirst(intent.scored);
    return { type: "answer", answer: toAnswer(pick, ctx, pick === intent.scored ? intent.tense : undefined) };
  }

  if (contentCount === 0) return { type: "none", closest: [] };
  const top = scored[0];
  if (top && passes(top)) return { type: "answer", answer: toAnswer(chapterFirst(top), ctx) };

  const closest: ElisioAnswer[] = [];
  const titles = new Set<string>();
  for (const s of scored) {
    if (closest.length >= 3) break;
    if (s.score < CLOSEST_MIN) continue;
    const key = norm(s.item.title);
    if (titles.has(key)) continue;
    titles.add(key);
    closest.push(toAnswer(s, ctx));
  }
  return { type: "none", closest };
}
