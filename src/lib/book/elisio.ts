/**
 * What Professor Elísio is looking at, and the note he writes from it.
 * The passage is resolved from the chapter already in the app. Nothing here is
 * new course content, and nothing leaves the app.
 */

import type { CurriculumLesson } from "@/data/curriculum-types";
import {
  cultureOf,
  findWord,
  getBacklinks,
  getBookLesson,
  getGrammar,
  getVerb,
  getWord,
  pronounLabel,
  sameGroupVerbs,
  type CardRef,
  type CultureEntry,
  type GrammarEntry,
  type VerbEntry,
  type WordEntry,
} from "@/lib/book/catalog";
import type { ElisioAbout } from "@/lib/book/types";

export interface ElisioPassage {
  label: string;
  place: string;
  /** The lines Elísio has in front of him. */
  text: string;
  questions: [string, string];
  /** Short teaching lines, in order. The note picks from these. */
  lines: string[];
  examples: { pt: string; en?: string }[];
}

export interface LessonBundle {
  words: WordEntry[];
  verbs: VerbEntry[];
  topics: GrammarEntry[];
  notes: CultureEntry[];
}

const TENSE_PT: Record<string, string> = {
  Present: "presente",
  Preterite: "pretérito perfeito",
  Imperfect: "imperfeito",
  Future: "futuro",
  Conditional: "condicional",
  "Present Subjunctive": "presente do conjuntivo",
  "Imperfect Subjunctive": "imperfeito do conjuntivo",
  "Future Subjunctive": "futuro do conjuntivo",
  Imperative: "imperativo",
};

const CONTINUOUS = /present continuous|estar \+ a|a \+ infinitive|infinitivo/i;
const PAREN = /\(([^)]+)\)/g;

export function lessonBundle(lesson: CurriculumLesson): LessonBundle {
  const words = lesson.stages.vocabulary.words
    .map((ref) => findWord(ref.categoryId, ref.portuguese))
    .filter((word): word is WordEntry => Boolean(word));
  const verbs = lesson.stages.verbs.verbs
    .map((ref) => getVerb(ref.verbKey.toLowerCase()))
    .filter((verb): verb is VerbEntry => Boolean(verb));
  const topics = lesson.stages.grammar.topics
    .map((id) => getGrammar(id))
    .filter((topic): topic is GrammarEntry => Boolean(topic));
  const notes = lesson.stages.culture.items
    .map((item) => (item.type === "slang" ? null : cultureOf(item.type, item.id)))
    .filter((note): note is CultureEntry => Boolean(note));
  return { words, verbs, topics, notes };
}

export function grammarParagraphs(intro: string): string[] {
  return intro.split("\n").map((p) => p.trim()).filter(Boolean);
}

export function passageFor(about: ElisioAbout): ElisioPassage | null {
  switch (about.about) {
    case "verb":
      return verbPassage(about.id, "Verbo");
    case "word":
      return wordPassage(about.category, about.word, "Palavra");
    case "lesson":
      return lessonPassage(about.id, about.part);
    case "grammar":
      return grammarPassage(about.id, about.part);
  }
}

/** A margin note from the passage, the examples, and where else it shows up. */
export function composeNote(passage: ElisioPassage, question: string): string {
  const q = question.toLowerCase();
  const wantsParticiple = /particíp/.test(q);
  const wantsForm = wantsParticiple || /presente|conjug|como fica|\bforma/.test(q);
  const wantsExample = /frase|exemplo|guardo|guardar/.test(q);
  const wantsPlace = /portugal|brasil|lisboa|porto|europeu|gerúnd/.test(q);
  const formLine = wantsParticiple
    ? passage.lines.find((line) => line.startsWith("O particípio"))
    : passage.lines.find((line) => line.startsWith("No presente") || line.startsWith("No pretérito"));
  const placeLine = passage.lines.find((line) => /portugal|infinitivo|gerúndio|lisboa|porto|europeu/i.test(line));
  const related = passage.lines.find((line) => line.startsWith("Também aparece"));
  const teaching = passage.lines.filter((line) => line !== formLine && line !== related);
  const examples = passage.examples.map((example) => exampleLine(example)).filter(Boolean);
  const picked: string[] = [];

  const push = (line?: string) => {
    if (!line) return;
    const clean = line.replace(/\s+/g, " ").trim();
    if (!clean || picked.includes(clean)) return;
    const quotes = [...clean.matchAll(/«([^»]+)»/g)].map((match) => match[1]);
    if (quotes.length > 0 && quotes.every((quote) => picked.some((item) => item.includes(quote)))) return;
    picked.push(clean);
  };

  if (wantsForm) {
    push(formLine);
    push(examples[0]);
    push(teaching[0]);
  } else if (wantsExample) {
    push(examples[0]);
    push(examples[1]);
    push(teaching[0]);
  } else if (wantsPlace) {
    push(placeLine);
    push(teaching[0]);
    push(examples[0]);
  } else {
    push(teaching[0]);
    push(teaching[1]);
    push(examples[0]);
  }
  push(related);

  let note = picked.slice(0, 4).join(" ");
  if (note.length > 640) note = `${note.slice(0, 637).replace(/\s+\S*$/, "").trim()}…`;
  return note.trim();
}

function relatedLine(ref: CardRef, skip: string): string {
  const titled = getBacklinks(ref).items
    .map((item) => ({
      title: item.title.replace(/^Lição \d+ · /, "").trim(),
      grammar: /gramática/i.test(item.kicker),
    }))
    .filter((item) => item.title && item.title.toLowerCase() !== skip.toLowerCase());
  const pool = titled.some((item) => item.grammar) ? titled.filter((item) => item.grammar) : titled;
  const titles: string[] = [];
  for (const item of pool) {
    if (titles.includes(item.title)) continue;
    titles.push(item.title);
    if (titles.length === 2) break;
  }
  if (titles.length === 0) return "";
  if (titles.length === 1) return `Também aparece em ${titles[0]}.`;
  return `Também aparece em ${titles[0]} e ${titles[1]}.`;
}

function exampleLine(example?: { pt: string; en?: string }): string {
  if (!example?.pt) return "";
  const pt = example.pt.replace(/\s+/g, " ").trim().replace(/[.?!]+$/, "");
  const en = example.en?.replace(/\s+/g, " ").trim().replace(/[.?!]+$/, "");
  return en ? `«${pt}» — ${en}.` : `«${pt}».`;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 40 ? cut.slice(0, space) : cut).trim()}…`;
}

function groupPt(group: string): string {
  if (/irregular/i.test(group)) return "irregular";
  const match = group.match(/regular\s+(-?[a-z]+)/i);
  if (!match) return group.toLowerCase();
  const ending = match[1].startsWith("-") ? match[1].toLowerCase() : `-${match[1].toLowerCase()}`;
  return `regular em ${ending}`;
}

function verbPassage(id: string, place: string): ElisioPassage | null {
  const verb = getVerb(id);
  if (!verb) return null;
  const tense = verb.tenses.includes("Present") ? "Present" : verb.tenses[0];
  const rows = tense ? verb.rows(tense) : [];
  const tenseName = (tense && TENSE_PT[tense]) || "neste tempo";
  const forms = rows
    .slice(0, 4)
    .map((row) => `${pronounLabel(row.person)} ${row.form}`)
    .join(", ");
  const siblings = verb.id === "ser" || verb.id === "estar" ? [] : sameGroupVerbs(verb.id).slice(0, 3);
  const lines = [
    `O verbo ${verb.id} significa «${verb.english}». É um verbo ${groupPt(verb.group)}.`,
    verb.id === "estar"
      ? "Estar marca um estado, um lugar ou uma condição. Ser marca o que a coisa é."
      : verb.id === "ser"
        ? "Ser marca identidade, profissão e origem. Para um estado ou um lugar, o verbo é estar."
        : "",
    forms ? `No ${tenseName}: ${forms}.` : "",
    verb.participle ? `O particípio é ${verb.participle}.` : "",
    siblings.length ? `No mesmo grupo: ${siblings.map((item) => item.id).join(", ")}.` : "",
    relatedLine({ kind: "verb", id: verb.id }, verb.id),
  ].filter(Boolean);
  const examples = rows.filter((row) => row.example).slice(0, 2).map((row) => ({ pt: row.example, en: row.english }));
  return {
    label: verb.id,
    place,
    text: [lines[0], lines[1], examples[0]?.pt].filter(Boolean).join(" "),
    questions: ["Quando uso este verbo?", forms ? "Como fica no presente?" : "Dá-me uma frase."],
    lines,
    examples,
  };
}

function wordPassage(category: string, word: string, place: string): ElisioPassage | null {
  const entry = getWord({ kind: "word", category, word });
  if (!entry) return null;
  const related = entry.relatedWords.slice(0, 2).map((item) => `${item.word} (${item.meaning})`).join(", ");
  const lines = [
    `«${entry.portuguese}» quer dizer ${entry.english}.`,
    entry.proTip ? clip(entry.proTip, 220) : "",
    related ? `Ao lado: ${related}.` : "",
    relatedLine(entry.ref, entry.portuguese),
  ].filter(Boolean);
  const examples = entry.example ? [{ pt: entry.example, en: entry.exampleTranslation }] : [];
  return {
    label: entry.portuguese,
    place: entry.categoryLabel ? `${place} · ${entry.categoryLabel}` : place,
    text: [lines[0], entry.example].filter(Boolean).join(" "),
    questions: ["O que significa, numa frase?", "Há um uso de Portugal que eu deva saber?"],
    lines,
    examples,
  };
}

function lessonPassage(id: string, part?: string): ElisioPassage | null {
  const lesson = getBookLesson(id);
  if (!lesson) return null;
  const bundle = lessonBundle(lesson);
  const place = `Lição ${lesson.number}`;
  if (!part) return lessonChapter(lesson, bundle, place);
  if (part === "intro") return lessonIntro(lesson, place);
  if (part === "vocab") return lessonVocab(lesson, bundle, place);
  if (part.startsWith("verb/")) return verbPassage(part.slice("verb/".length), `${place} · ${lesson.titlePt}`);
  if (part.startsWith("topic/")) {
    const topic = getGrammar(part.slice("topic/".length));
    return topic ? grammarTopic(topic, place, true) : null;
  }
  if (part.startsWith("culture/")) {
    const index = Number(part.slice("culture/".length));
    if (!Number.isInteger(index) || index < 0) return null;
    const note = bundle.notes[index];
    return note ? culturePassage(note, place) : null;
  }
  return null;
}

function lessonChapter(lesson: CurriculumLesson, bundle: LessonBundle, place: string): ElisioPassage {
  const words = bundle.words.slice(0, 6).map((word) => word.portuguese).join(", ");
  const verbs = bundle.verbs.map((verb) => verb.id).join(", ");
  const lines = [
    lesson.descriptionPt || lesson.description,
    words ? `Palavras: ${words}.` : "",
    verbs ? `Verbos: ${verbs}.` : "",
  ].filter(Boolean);
  const examples = bundle.words.filter((word) => word.example).slice(0, 2).map((word) => ({
    pt: word.example!,
    en: word.exampleTranslation,
  }));
  return {
    label: lesson.titlePt,
    place,
    text: clip([lesson.descriptionPt, lesson.description].filter(Boolean).join(" "), 500),
    questions: ["Por onde começo esta lição?", "O que não posso esquecer?"],
    lines,
    examples,
  };
}

function lessonIntro(lesson: CurriculumLesson, place: string): ElisioPassage {
  const text = [lesson.descriptionPt, lesson.description].filter(Boolean).join("\n\n");
  return {
    label: lesson.titlePt,
    place,
    text: clip(text, 500),
    questions: ["O que é que esta lição me pede?", "Por onde começo?"],
    lines: [lesson.descriptionPt || lesson.description].filter(Boolean),
    examples: [],
  };
}

function lessonVocab(lesson: CurriculumLesson, bundle: LessonBundle, place: string): ElisioPassage {
  const names = bundle.words.slice(0, 8).map((word) => word.portuguese).join(", ");
  const examples = bundle.words.filter((word) => word.example).slice(0, 2).map((word) => ({
    pt: word.example!,
    en: word.exampleTranslation,
  }));
  return {
    label: "Vocabulário",
    place: `${place} · ${lesson.titlePt}`,
    text: names ? `Palavras: ${names}.` : lesson.descriptionPt,
    questions: ["Como uso uma destas palavras?", "Que frase guardo daqui?"],
    lines: [names ? `Nesta lição entram: ${names}.` : lesson.descriptionPt].filter(Boolean),
    examples,
  };
}

function grammarPassage(id: string, part?: string): ElisioPassage | null {
  const topic = getGrammar(id);
  if (!topic) return null;
  const place = `Gramática · ${topic.cefr}`;
  if (!part) return grammarTopic(topic, place, false);
  if (part.startsWith("p/")) {
    const index = Number(part.slice(2));
    const paragraph = grammarParagraphs(topic.intro)[index];
    if (!Number.isInteger(index) || !paragraph) return null;
    return paragraphPassage(topic, paragraph, place);
  }
  if (part.startsWith("rule/")) {
    const index = Number(part.slice("rule/".length));
    const rule = topic.rules[index];
    if (!Number.isInteger(index) || !rule) return null;
    return rulePassage(topic, rule, place);
  }
  if (part === "ep") return epPassage(topic, place);
  if (part === "tips") return tipsPassage(topic, place);
  return null;
}

function grammarTopic(topic: GrammarEntry, place: string, fromLesson: boolean): ElisioPassage {
  const rules = topic.rules.slice(0, 2);
  const lines = [
    topic.summary ? clip(topic.summary, 240) : "",
    ...rules.map((rule) => rule.rulePt || rule.rule),
    continuousLine(topic),
    relatedLine(topic.ref, topic.titlePt),
  ].filter(Boolean);
  const examples = rules.flatMap((rule) => rule.examples).slice(0, 2);
  return {
    label: topic.titlePt,
    place,
    text: clip([topic.summary, topic.titlePt, rules.map((rule) => rule.rulePt || rule.rule).join(" ")].filter(Boolean).join(" "), 700),
    questions: fromLesson
      ? ["Qual é a regra, em duas frases?", "Dá-me um exemplo."]
      : ["Resume este capítulo em duas frases.", "O que muda no português europeu?"],
    lines,
    examples,
  };
}

function rulesForParagraph(topic: GrammarEntry, paragraph: string): GrammarEntry["rules"] {
  if (CONTINUOUS.test(paragraph)) {
    const hit = topic.rules.filter((rule) => CONTINUOUS.test(`${rule.rule} ${rule.rulePt ?? ""}`));
    if (hit.length > 0) return hit;
  }
  const lower = paragraph.toLowerCase();
  const estar = /\bestar\b/.test(lower);
  const ser = /\bser\b/.test(lower);
  return topic.rules.filter((rule) => {
    const blob = `${rule.rule} ${rule.rulePt ?? ""}`.toLowerCase();
    const ruleEstar = /\bestar\b/.test(blob);
    const ruleSer = /\bser\b/.test(blob);
    if (estar && !ser) return ruleEstar && !ruleSer;
    if (ser && !estar) return ruleSer && !ruleEstar;
    if (ser && estar) return ruleSer || ruleEstar;
    return false;
  });
}

function paragraphPassage(topic: GrammarEntry, paragraph: string, place: string): ElisioPassage {
  const rule = rulesForParagraph(topic, paragraph)[0];
  const snippets = parentheticals(paragraph);
  const steer = steerParagraph(paragraph);
  const ruleLine = rule?.rulePt || rule?.rule || "";
  const lines = [
    steer,
    ruleLine && ruleLine !== steer ? clip(ruleLine, 240) : "",
    snippets.length ? `Frases deste passo: ${snippets.slice(0, 3).map((s) => `«${s}»`).join(", ")}.` : "",
    relatedLine(topic.ref, topic.titlePt),
  ].filter(Boolean);
  const fromRule = (rule?.examples ?? []).slice(0, 2);
  return {
    label: topic.titlePt,
    place,
    text: clip(paragraph, 700),
    questions: ["O que é que este parágrafo está a dizer?", "Que frase guardo daqui?"],
    lines,
    examples: fromRule.length > 0 ? fromRule : snippets.slice(0, 2).map((pt) => ({ pt })),
  };
}

function rulePassage(topic: GrammarEntry, rule: GrammarEntry["rules"][number], place: string): ElisioPassage {
  const blob = `${rule.rule} ${rule.rulePt ?? ""}`;
  const lines = [
    rule.rulePt || rule.rule,
    CONTINUOUS.test(blob) ? PORTUGAL_CONTINUOUS : "",
    rule.exceptions?.[0] ? `Nota: ${clip(rule.exceptions[0], 180)}` : "",
    relatedLine(topic.ref, topic.titlePt),
  ].filter(Boolean);
  return {
    label: topic.titlePt,
    place,
    text: clip([rule.rulePt, rule.rule].filter(Boolean).join(" "), 500),
    questions: ["Podes explicar esta regra com um exemplo?", "Dá-me uma frase desta regra."],
    lines,
    examples: rule.examples.slice(0, 2),
  };
}

const PORTUGAL_CONTINUOUS =
  "Em Portugal o contínuo é estar a + infinitivo, como «Estou a falar». Não se usa o gerúndio (estou falando).";

function continuousLine(topic: GrammarEntry): string {
  const blob = `${topic.intro} ${topic.rules.map((rule) => `${rule.rule} ${rule.rulePt ?? ""}`).join(" ")} ${topic.tips.join(" ")}`;
  return CONTINUOUS.test(blob) ? PORTUGAL_CONTINUOUS : "";
}

function steerParagraph(paragraph: string): string {
  if (CONTINUOUS.test(paragraph)) return PORTUGAL_CONTINUOUS;
  const lower = paragraph.toLowerCase();
  const ser = /\bser\b/.test(lower);
  const estar = /\bestar\b/.test(lower);
  if (ser && estar) return "SER diz o que a coisa é. ESTAR diz onde está, como está, ou o que está a acontecer.";
  if (estar) return "ESTAR é o verbo do lugar, do estado e do que passa.";
  if (ser) return "SER é para identidade, profissão, origem e o que define.";
  if (/tricky|meaning/.test(lower)) return "O mesmo adjetivo muda de sentido conforme o verbo. Vale a pena guardar um par.";
  return "";
}

function parentheticals(paragraph: string): string[] {
  const out: string[] = [];
  for (const match of paragraph.matchAll(PAREN)) {
    const text = match[1].trim().replace(/\.$/, "");
    if (text.length < 3 || text.length > 80) continue;
    out.push(text);
    if (out.length >= 4) break;
  }
  return out;
}

function epPassage(topic: GrammarEntry, place: string): ElisioPassage | null {
  const rules = topic.rules.filter((rule) => isEp(`${rule.rule} ${rule.rulePt ?? ""}`));
  const tips = topic.tips.filter((tip) => isEp(tip));
  if (rules.length === 0 && tips.length === 0) return null;
  const lines = [PORTUGAL_CONTINUOUS, ...rules.map((rule) => rule.rulePt || rule.rule), ...tips].filter(Boolean).slice(0, 3);
  return {
    label: topic.titlePt,
    place: `${place} · português europeu`,
    text: clip(lines.join(" "), 500),
    questions: ["O que é diferente no Brasil?", "Dá-me a frase de Portugal."],
    lines,
    examples: rules.flatMap((rule) => rule.examples).slice(0, 2),
  };
}

function tipsPassage(topic: GrammarEntry, place: string): ElisioPassage | null {
  const tips = topic.tips.filter((tip) => !isEp(tip));
  if (tips.length === 0) return null;
  return {
    label: topic.titlePt,
    place,
    text: clip(tips.join(" "), 500),
    questions: ["Qual é a dica a guardar?", "Dá-me um exemplo."],
    lines: tips.slice(0, 3).map((tip) => clip(tip, 220)),
    examples: [],
  };
}

function culturePassage(note: CultureEntry, place: string): ElisioPassage {
  const blocks = note.blocks.map((block) => block.text).filter(Boolean);
  const lines = [note.subtitle, blocks[0], blocks[1]].filter((line): line is string => Boolean(line)).map((line) => clip(line, 220));
  return {
    label: note.title,
    place: note.kicker ? `${place} · ${note.kicker}` : place,
    text: clip(blocks.join(" "), 700),
    questions: ["O que convém saber aqui?", "Que frase posso usar?"],
    lines,
    examples: note.example ? [note.example] : [],
  };
}

function isEp(text: string): boolean {
  return /european|europeu|brazil|gerúndio|gerundio|\bEP\b|\bBR\b/i.test(text);
}
