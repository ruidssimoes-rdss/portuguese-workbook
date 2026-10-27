import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterContent } from "@/data/chapter-types";
import { lessonBundle } from "@/lib/book/elisio";
import { chapterSectionTitles } from "@/lib/chapter-sections";

export interface TestQuestion {
  id: string;
  prompt: string;
  promptPt?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  section: number;
}

export const TEST_LENGTH = 12;
export const PASS_MARK = 10;

type Candidate = Omit<TestQuestion, "id" | "options" | "correctIndex"> & { correct: string; wrong: string[] };

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function distinct(options: string[]): boolean {
  const keys = options.map((option) => option.trim().toLowerCase());
  return keys.every(Boolean) && new Set(keys).size === keys.length;
}

function ellipsis(text: string): string {
  return text.replace(/\.\.\./g, "…");
}

function firstPronoun(person: string): string {
  return person.replace(/\s*\([^)]*\)/g, "").split("/")[0].trim();
}

/** Every valid candidate, grouped so selection can round-robin. */
function candidates(lesson: CurriculumLesson, content: ChapterContent | null, rand: () => number) {
  const bundle = lessonBundle(lesson);
  const titles = chapterSectionTitles(lesson, content);
  const sectionOf = (title: string) => Math.max(1, titles.indexOf(title) + 1);

  const vocab: Candidate[] = [];
  const english = bundle.words.map((word) => word.english);
  bundle.words.forEach((word, i) => {
    if (!word.example) return;
    const others = shuffle(
      english.filter((value, j) => j !== i && value.trim().toLowerCase() !== word.english.trim().toLowerCase()),
      rand,
    );
    const wrong: string[] = [];
    for (const value of others) {
      if (wrong.length === 3) break;
      if (!wrong.some((item) => item.trim().toLowerCase() === value.trim().toLowerCase())) wrong.push(value);
    }
    if (wrong.length < 3 || !distinct([word.english, ...wrong])) return;
    vocab.push({
      prompt: `What does «${ellipsis(word.portuguese)}» mean?`,
      correct: word.english,
      wrong,
      hint: `Example: ${word.example}`,
      section: sectionOf("Vocabulário"),
    });
  });

  const verbs = new Map<string, Candidate[]>();
  const refs = lesson.stages.verbs.verbs;
  for (const verb of bundle.verbs) {
    const tense = refs.find((item) => item.verbKey.toLowerCase() === verb.id)?.tenses[0] ?? "Present";
    const rows = verb.rows(tense);
    const list: Candidate[] = [];
    for (const row of rows) {
      const pronoun = firstPronoun(row.person);
      const others: string[] = [];
      for (const other of rows) {
        if (other === row || other.form.trim().toLowerCase() === row.form.trim().toLowerCase()) continue;
        if (!others.some((item) => item.trim().toLowerCase() === other.form.trim().toLowerCase())) others.push(other.form);
      }
      const wrong = shuffle(others, rand).slice(0, 3);
      if (wrong.length < 3 || !distinct([row.form, ...wrong])) continue;
      list.push({
        prompt: `Choose the right form of ${verb.id}.`,
        promptPt: `${pronoun} ___.`,
        correct: row.form,
        wrong,
        hint: `${verb.id}: ${verb.english}. Look at the ending for ${pronoun}.`,
        section: sectionOf("Verbos (presente)"),
      });
    }
    if (list.length > 0) verbs.set(verb.id, list);
  }

  const grammar = new Map<string, Candidate[]>();
  for (const topic of bundle.topics) {
    const list: Candidate[] = [];
    for (const question of topic.questions) {
      const options = question.options;
      if (!question.correctAnswer || !options.includes(question.correctAnswer) || options.length < 4 || !distinct(options)) continue;
      list.push({
        prompt: question.questionText,
        correct: question.correctAnswer,
        wrong: options.filter((option) => option !== question.correctAnswer),
        hint: topic.summary || topic.titlePt,
        section: sectionOf(topic.titlePt),
      });
    }
    if (list.length > 0) grammar.set(topic.id, list);
  }

  return { vocab, verbs, grammar };
}

function roundRobin<T>(lists: T[][], count: number): T[] {
  const queues = lists.map((list) => [...list]);
  const out: T[] = [];
  while (out.length < count && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next === undefined) continue;
      out.push(next);
      if (out.length >= count) break;
    }
  }
  return out;
}

function toQuestion(candidate: Candidate, id: string, rand: () => number): TestQuestion {
  const options = shuffle([candidate.correct, ...candidate.wrong], rand);
  return {
    id,
    prompt: candidate.prompt,
    promptPt: candidate.promptPt,
    options,
    correctIndex: options.indexOf(candidate.correct),
    hint: candidate.hint,
    section: candidate.section,
  };
}

export function buildChapterTest(lesson: CurriculumLesson, content: ChapterContent | null, rand: () => number = Math.random): TestQuestion[] {
  if (content) {
    return content.test.map((item, i) =>
      toQuestion({ prompt: item.prompt, promptPt: item.promptPt, correct: item.options[0], wrong: item.options.slice(1), hint: item.hint, section: item.section }, `${lesson.id}-${i}`, rand),
    );
  }

  const pools = candidates(lesson, content, rand);
  const grammarLists = [...pools.grammar.values()].map((list) => shuffle(list, rand));
  const verbLists = shuffle([...pools.verbs.values()], rand).map((list) => shuffle(list, rand));
  const vocab = shuffle(pools.vocab, rand);

  const chosen: Candidate[] = [];
  const grammarPick = roundRobin(grammarLists, 4);
  const verbPick = roundRobin(verbLists, 4);
  chosen.push(...grammarPick, ...verbPick);
  const vocabPick = vocab.slice(0, TEST_LENGTH - chosen.length);
  chosen.push(...vocabPick);

  if (chosen.length < TEST_LENGTH) {
    const left = [
      ...vocab.slice(vocabPick.length),
      ...verbLists.flat().filter((item) => !chosen.includes(item)),
      ...grammarLists.flat().filter((item) => !chosen.includes(item)),
    ];
    chosen.push(...left.slice(0, TEST_LENGTH - chosen.length));
  }

  const ordered = chosen.map((candidate, seq) => ({ candidate, seq })).sort((a, b) => a.candidate.section - b.candidate.section || a.seq - b.seq);
  return ordered.map(({ candidate }, i) => toQuestion(candidate, `${lesson.id}-${i}`, rand));
}

/** Candidate counts per pool, for the audit. A generated test needs 12 in total. */
export function testPools(lesson: CurriculumLesson): { vocab: number; verbs: number; grammar: number } {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const pools = candidates(lesson, null, rand);
  return {
    vocab: pools.vocab.length,
    verbs: [...pools.verbs.values()].reduce((sum, list) => sum + list.length, 0),
    grammar: [...pools.grammar.values()].reduce((sum, list) => sum + list.length, 0),
  };
}
