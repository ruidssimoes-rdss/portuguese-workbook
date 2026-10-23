/**
 * A card in the book: a verb, a word, a grammar topic, a culture note,
 * or a note from Professor Elísio about one of those, or about a passage.
 * Encoded in the `ficha` query param so a chapter can deep-link the open card.
 */

export type CultureType = "saying" | "etiquette" | "false-friend" | "regional";

/**
 * What Elísio is looking at. A missing `part` is the whole chapter.
 * Parts are stable ids (`p/0`, `rule/1`, `verb/estar`, `topic/ser-vs-estar`),
 * not the passage text, so the query string stays short.
 */
export type ElisioAbout =
  | { about: "lesson"; id: string; part?: string }
  | { about: "grammar"; id: string; part?: string }
  | { about: "verb"; id: string }
  | { about: "word"; category: string; word: string };

export type CardRef =
  | { kind: "verb"; id: string }
  | { kind: "word"; category: string; word: string }
  | { kind: "grammar"; id: string }
  | { kind: "culture"; cultureType: CultureType; id: string }
  | { kind: "elisio"; about: ElisioAbout };

export const FICHA_PARAM = "ficha";

/**
 * What is open in the dock instead of a card.
 * `1` is the lesson's own exercise flow. A card encoding is a short drill
 * for that word, verb or grammar topic. Culture notes have no exercise data.
 */
export type PracticeTarget =
  | { kind: "lesson" }
  | { kind: "verb"; id: string }
  | { kind: "word"; category: string; word: string }
  | { kind: "grammar"; id: string };

export const PRATICAR_PARAM = "praticar";

export function encodePractice(target: PracticeTarget): string {
  if (target.kind === "lesson") return "1";
  return encodeCard(target);
}

export function decodePractice(raw: string | null | undefined): PracticeTarget | null {
  if (!raw) return null;
  if (raw === "1") return { kind: "lesson" };
  const card = decodeCard(raw);
  if (!card || card.kind === "culture" || card.kind === "elisio") return null;
  return card;
}

const CULTURE_TYPES = new Set<CultureType>(["saying", "etiquette", "false-friend", "regional"]);

export function encodeCard(ref: CardRef): string {
  switch (ref.kind) {
    case "verb":
      return `verb:${ref.id}`;
    case "word":
      return `word:${ref.category}/${ref.word}`;
    case "grammar":
      return `grammar:${ref.id}`;
    case "culture":
      return `culture:${ref.cultureType}/${ref.id}`;
    case "elisio":
      return `elisio:${encodeAbout(ref.about)}`;
  }
}

function encodeAbout(about: ElisioAbout): string {
  switch (about.about) {
    case "verb":
      return `verb:${about.id}`;
    case "word":
      return `word:${about.category}/${about.word}`;
    case "lesson":
    case "grammar":
      return about.part ? `${about.about}:${about.id}:${about.part}` : `${about.about}:${about.id}`;
  }
}

function decodeAbout(rest: string): ElisioAbout | null {
  const i = rest.indexOf(":");
  if (i <= 0) return null;
  const scope = rest.slice(0, i);
  const body = rest.slice(i + 1);
  if (!body || body.length > 200) return null;
  if (scope === "verb") {
    if (body.includes(":") || body.includes("/")) return null;
    return { about: "verb", id: body.toLowerCase() };
  }
  if (scope === "word") {
    const slash = body.indexOf("/");
    if (slash <= 0 || slash === body.length - 1) return null;
    return { about: "word", category: body.slice(0, slash), word: body.slice(slash + 1) };
  }
  if (scope !== "lesson" && scope !== "grammar") return null;
  const j = body.indexOf(":");
  const id = j < 0 ? body : body.slice(0, j);
  const part = j < 0 ? undefined : body.slice(j + 1);
  if (!id || part === "") return null;
  if (part && part.length > 120) return null;
  return part ? { about: scope, id, part } : { about: scope, id };
}

export function decodeCard(raw: string | null | undefined): CardRef | null {
  if (!raw) return null;
  const i = raw.indexOf(":");
  if (i <= 0) return null;
  const kind = raw.slice(0, i);
  const rest = raw.slice(i + 1);
  if (!rest) return null;
  if (kind === "verb") return { kind: "verb", id: rest.toLowerCase() };
  if (kind === "grammar") return { kind: "grammar", id: rest };
  if (kind === "word") {
    const slash = rest.indexOf("/");
    if (slash <= 0 || slash === rest.length - 1) return null;
    return { kind: "word", category: rest.slice(0, slash), word: rest.slice(slash + 1) };
  }
  if (kind === "culture") {
    const slash = rest.indexOf("/");
    if (slash <= 0 || slash === rest.length - 1) return null;
    const cultureType = rest.slice(0, slash) as CultureType;
    if (!CULTURE_TYPES.has(cultureType)) return null;
    return { kind: "culture", cultureType, id: rest.slice(slash + 1) };
  }
  if (kind === "elisio") {
    const about = decodeAbout(rest);
    return about ? { kind: "elisio", about } : null;
  }
  return null;
}

export function sameCard(a: CardRef, b: CardRef): boolean {
  return encodeCard(a) === encodeCard(b);
}
