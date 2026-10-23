/**
 * A card in the book: a verb, a word, a grammar topic, or a culture note.
 * Encoded in the `ficha` query param so a chapter can deep-link the open card.
 */

export type CultureType = "saying" | "etiquette" | "false-friend" | "regional";

export type CardRef =
  | { kind: "verb"; id: string }
  | { kind: "word"; category: string; word: string }
  | { kind: "grammar"; id: string }
  | { kind: "culture"; cultureType: CultureType; id: string };

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
  if (!card || card.kind === "culture") return null;
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
  }
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
  return null;
}

export function sameCard(a: CardRef, b: CardRef): boolean {
  return encodeCard(a) === encodeCard(b);
}
