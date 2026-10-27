/**
 * Fail the build of the course if a chapter reference does not resolve.
 *
 * Run: npx --yes tsx scripts/audit-curriculum.ts
 * Do not add tsx to package.json.
 */
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "../src/data/curriculum";
import { vocabKey } from "../src/data/resolve-lessons";
import { getChapterContent } from "../src/data/chapters";
import { grammarTexts, testPools } from "../src/lib/chapter-test";
import type { CurriculumLesson } from "../src/data/curriculum-types";
import vocabData from "../src/data/vocab.json";
import grammarData from "../src/data/grammar.json";
import verbsData from "../src/data/verbs.json";
import sayingsData from "../src/data/sayings.json";
import falseFriendsData from "../src/data/false-friends.json";
import etiquetteData from "../src/data/etiquette.json";
import regionalData from "../src/data/regional.json";

const CEFR_RANK: Record<string, number> = { A1: 0, A2: 1, B1: 2 };

const BANDS = ["A1", "A2", "B1", "EXTRA"] as const;
type Band = (typeof BANDS)[number];

function emptyBands(): Record<Band, number> {
  return { A1: 0, A2: 0, B1: 0, EXTRA: 0 };
}

function bandOf(id: string): Band {
  if (id.startsWith("a1-")) return "A1";
  if (id.startsWith("a2-")) return "A2";
  if (id.startsWith("b1-")) return "B1";
  if (id.startsWith("extra-")) return "EXTRA";
  throw new Error(`unknown lesson id ${id}`);
}

function bandTotal(counts: Record<Band, number>): number {
  return BANDS.reduce((sum, band) => sum + counts[band], 0);
}

function formatBands(counts: Record<Band, number>): string {
  return BANDS.map((band) => `${band} ${counts[band]}`).join(", ");
}

/** Review chapters are exempt from repeat and budget checks. */
function isReview(lesson: CurriculumLesson): boolean {
  return lesson.id.endsWith("-18") || lesson.title.includes("Revisão") || lesson.titlePt.includes("Revisão");
}

const lessons: CurriculumLesson[] = [
  ...A1_LESSONS,
  ...A2_LESSONS,
  ...B1_LESSONS,
  ...EXTRA_LESSONS,
];

const vocab = vocabData as {
  categories: Array<{
    id: string;
    words: Array<{ portuguese: string; cefr?: string }>;
  }>;
};

const grammar = grammarData as { topics: Record<string, { id: string; cefr?: string }> };

const verbs = verbsData as {
  verbs: Record<string, { conjugations?: Array<{ Tense: string }> }>;
};

const sayingIds = new Set(sayingsData.sayings.map((item) => item.id));
const etiquetteIds = new Set(etiquetteData.tips.map((item) => item.id));
const falseFriendIds = new Set(falseFriendsData.falseFriends.map((item) => item.id));
const slangIds = new Set(regionalData.expressions.map((item) => item.id));

function findWord(categoryId: string, portuguese: string) {
  const cat = vocab.categories.find((item) => item.id === categoryId);
  if (!cat) return null;
  const key = vocabKey(portuguese);
  return cat.words.find((word) => vocabKey(word.portuguese) === key) ?? null;
}

const errors = { vocab: 0, verb: 0, grammar: 0, culture: 0 };
const aboveLevel = emptyBands();
const repeats = emptyBands();
const budget = emptyBands();
let totalRefs = 0;
let resolved = 0;
const introduced = new Map<string, string>();

for (const lesson of lessons) {
  const lines: string[] = [];
  const review = isReview(lesson);

  for (const ref of lesson.stages.vocabulary.words) {
    if (!review) {
      const key = vocabKey(ref.portuguese);
      const first = introduced.get(key);
      if (!first) {
        introduced.set(key, lesson.id);
      } else if (first !== lesson.id) {
        repeats[bandOf(lesson.id)]++;
        lines.push(`  WARN repeat: ${ref.portuguese} also in ${first}`);
      }
    }

    totalRefs++;
    const word = findWord(ref.categoryId, ref.portuguese);
    if (!word) {
      errors.vocab++;
      lines.push(`  ERROR vocab unresolved: ${ref.portuguese} (${ref.categoryId})`);
      continue;
    }
    resolved++;
    const wordRank = CEFR_RANK[word.cefr ?? ""];
    const lessonRank = CEFR_RANK[lesson.cefrLevel];
    if (wordRank !== undefined && lessonRank !== undefined && wordRank > lessonRank) {
      aboveLevel[bandOf(lesson.id)]++;
      lines.push(`  WARN above-level: ${ref.portuguese} is ${word.cefr}, lesson is ${lesson.cefrLevel}`);
    }
  }

  for (const ref of lesson.stages.verbs.verbs) {
    const verb = verbs.verbs[ref.verbKey];
    if (!verb) {
      errors.verb++;
      lines.push(`  ERROR verb missing: ${ref.verbKey}`);
      continue;
    }
    const tenses = new Set((verb.conjugations ?? []).map((row) => row.Tense));
    for (const tense of ref.tenses) {
      if (!tenses.has(tense)) {
        errors.verb++;
        lines.push(`  ERROR verb tense missing: ${ref.verbKey} has no ${tense}`);
      }
    }
  }

  for (const topicId of lesson.stages.grammar.topics) {
    if (!grammar.topics[topicId]) {
      errors.grammar++;
      lines.push(`  ERROR grammar missing: ${topicId}`);
    }
  }

  for (const ref of lesson.stages.culture.items) {
    const set =
      ref.type === "saying"
        ? sayingIds
        : ref.type === "etiquette"
          ? etiquetteIds
          : ref.type === "false-friend"
            ? falseFriendIds
            : ref.type === "slang"
              ? slangIds
              : null;
    if (!set) {
      errors.culture++;
      lines.push(`  ERROR culture type unknown: ${ref.type} ${ref.id}`);
    } else if (!set.has(ref.id)) {
      errors.culture++;
      lines.push(`  ERROR culture missing: ${ref.type} ${ref.id}`);
    }
  }

  if (lesson.id.startsWith("a1-") && !review) {
    const wordCount = lesson.stages.vocabulary.words.length;
    const grammarCount = lesson.stages.grammar.topics.length;
    if (wordCount < 15 || wordCount > 25) {
      budget[bandOf(lesson.id)]++;
      lines.push(`  WARN budget: ${wordCount} words (expected 15 to 25)`);
    }
    if (grammarCount < 1 || grammarCount > 3) {
      budget[bandOf(lesson.id)]++;
      lines.push(`  WARN budget: ${grammarCount} grammar topics (expected 1 to 3)`);
    }
  }

  if (lines.length > 0) {
    console.log(lesson.id);
    for (const line of lines) console.log(line);
  }
}

// ─── Chapter files (src/data/chapters/<lesson-id>.ts) ───
const chapterErrors: string[] = [];
let chapterFiles = 0;

function dashStrings(value: unknown, path: string, out: string[]) {
  if (typeof value === "string") {
    if (/[—–]/.test(value)) out.push(`${path}: contains an em or en dash`);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => dashStrings(item, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) dashStrings(v, `${path}.${k}`, out);
  }
}

for (const lesson of lessons) {
  const chapter = getChapterContent(lesson.id);
  if (!chapter) continue;
  chapterFiles++;
  const fail = (msg: string) => chapterErrors.push(`${lesson.id}: ${msg}`);

  const refs = lesson.stages.vocabulary.words;
  const used = new Map<string, number>();
  for (const section of chapter.sections) {
    if (section.grammarTopic && !(grammar.topics as Record<string, unknown>)[section.grammarTopic]) {
      fail(`grammarTopic missing from grammar.json: ${section.grammarTopic}`);
    }
    for (const block of section.blocks) {
      if (block.type === "vocab") {
        for (const row of block.rows) {
          if (row.kind === "word") {
            const key = `${row.categoryId}\n${vocabKey(row.portuguese)}`;
            used.set(key, (used.get(key) ?? 0) + 1);
            const libWord = findWord(row.categoryId, row.portuguese) as { pronunciation?: string } | null;
            if (libWord?.pronunciation?.includes("?")) fail(`word pronunciation contains "?": ${row.portuguese}`);
            if (!refs.some((ref) => ref.categoryId === row.categoryId && vocabKey(ref.portuguese) === vocabKey(row.portuguese))) {
              fail(`word row is not a lesson vocabulary ref: ${row.portuguese}`);
            }
          } else if (!row.phonetics.trim()) {
            fail(`row has empty phonetics: ${row.pt}`);
          }
        }
      } else if (block.type === "dialogue") {
        for (const line of block.lines) if (!line.phonetics.trim()) fail(`dialogue line ${line.n} has empty phonetics`);
      } else if (block.type === "conjugation") {
        for (const item of block.items) {
          const ref = lesson.stages.verbs.verbs.find((v) => v.verbKey === item.verbKey);
          if (!ref || !ref.tenses.includes(item.tense)) {
            fail(`conjugation ${item.verbKey} ${item.tense} is not in the lesson's verbs stage`);
            continue;
          }
          const rows = ((verbs.verbs as Record<string, { conjugations: { Tense: string; Pronunciation?: string }[] }>)[item.verbKey]?.conjugations ?? []).filter(
            (row) => row.Tense === item.tense,
          );
          if (rows.length === 0) fail(`conjugation ${item.verbKey} ${item.tense} has no rows`);
          if (rows.some((row) => !row.Pronunciation?.trim())) fail(`conjugation ${item.verbKey} ${item.tense} has rows without Pronunciation`);
        }
      }
    }
  }
  if (chapter.test.length !== 12) fail(`test has ${chapter.test.length} items (need exactly 12)`);
  chapter.test.forEach((item, i) => {
    const label = `test item ${i + 1}`;
    if (!item.prompt.trim()) fail(`${label} has an empty prompt`);
    if (!item.hint.trim()) fail(`${label} has an empty hint`);
    const keys = item.options.map((option) => option.trim().toLowerCase());
    if (item.options.length !== 4 || keys.some((key) => !key) || new Set(keys).size !== 4) fail(`${label} needs 4 distinct non-empty options`);
    if (!Number.isInteger(item.section) || item.section < 1 || item.section > chapter.sections.length) fail(`${label} section out of range: ${item.section}`);
  });

  const rail = chapter.rail;
  if (rail.canDo.length < 4 || rail.canDo.length > 5) fail(`rail.canDo has ${rail.canDo.length} items (need 4 or 5)`);
  for (const item of rail.canDo) {
    if (!item.text.trim()) fail("rail.canDo item has empty text");
    if (!Number.isInteger(item.section) || item.section < 1 || item.section > chapter.sections.length) fail(`rail.canDo section out of range: ${item.section}`);
  }
  if (rail.drills.length < 3 || rail.drills.length > 5) fail(`rail.drills has ${rail.drills.length} items (need 3 to 5)`);
  for (const drill of rail.drills) {
    if (!drill.prompt.trim() || !drill.answer.trim() || !drill.phonetics.trim()) fail(`rail.drills item has an empty field: ${drill.prompt}`);
    if (drill.phonetics.includes("/")) fail(`rail.drills phonetics contains "/": ${drill.answer}`);
  }
  if (rail.etiquette.length < 2 || rail.etiquette.length > 3) fail(`rail.etiquette has ${rail.etiquette.length} items (need 2 or 3)`);
  for (const row of rail.etiquette) if (!row.label.trim() || !row.text.trim()) fail("rail.etiquette item has an empty field");
  if (!rail.elisioTip.trim()) fail("rail.elisioTip is empty");

  for (const ref of refs) {
    const key = `${ref.categoryId}\n${vocabKey(ref.portuguese)}`;
    if (used.get(key) !== 1) fail(`vocabulary ref appears in ${used.get(key) ?? 0} word rows (need exactly 1): ${ref.portuguese}`);
  }
  const dashes: string[] = [];
  dashStrings(chapter, "chapter", dashes);
  dashes.forEach(fail);
}

let generatedChecked = 0;
for (const lesson of lessons) {
  if (getChapterContent(lesson.id)) continue;
  generatedChecked++;
  for (const text of grammarTexts(lesson)) {
    if (/[—–]/.test(text)) chapterErrors.push(`${lesson.id}: generated grammar text contains an em or en dash: ${text}`);
  }
  const pools = testPools(lesson);
  if (pools.vocab + pools.verbs + pools.grammar < 12) {
    chapterErrors.push(`${lesson.id}: cannot build a 12-question test (vocab ${pools.vocab}, verbs ${pools.verbs}, grammar ${pools.grammar})`);
  }
}

if (chapterErrors.length > 0) {
  console.log("");
  for (const line of chapterErrors) console.log(`  ERROR chapter ${line}`);
}

const errorTotal = errors.vocab + errors.verb + errors.grammar + errors.culture + chapterErrors.length;

console.log("");
console.log("SUMMARY");
console.log(`lessons: ${lessons.length}`);
console.log(`vocab refs: ${totalRefs}`);
console.log(`resolved: ${resolved}`);
console.log(
  `errors: ${errorTotal} (vocab ${errors.vocab}, verb ${errors.verb}, grammar ${errors.grammar}, culture ${errors.culture})`,
);
console.log(`chapter tests: ${chapterFiles} chapter files, ${generatedChecked} generated lessons checked, ${chapterErrors.length} errors`);
console.log(`chapter files: ${chapterFiles} checked, ${chapterErrors.length} errors`);
console.log(`warnings: ${bandTotal(aboveLevel)} above-level (${formatBands(aboveLevel)})`);
console.log(`repeats: ${bandTotal(repeats)} (${formatBands(repeats)})`);
console.log(`budget: ${bandTotal(budget)} (${formatBands(budget)})`);

if (errorTotal > 0) process.exit(1);
