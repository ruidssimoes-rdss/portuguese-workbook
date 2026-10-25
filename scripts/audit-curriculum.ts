/**
 * Fail the build of the course if a chapter reference does not resolve.
 *
 * Run: npx --yes tsx scripts/audit-curriculum.ts
 * Do not add tsx to package.json.
 */
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "../src/data/curriculum";
import { vocabKey } from "../src/data/resolve-lessons";
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

const errorTotal = errors.vocab + errors.verb + errors.grammar + errors.culture;

console.log("");
console.log("SUMMARY");
console.log(`lessons: ${lessons.length}`);
console.log(`vocab refs: ${totalRefs}`);
console.log(`resolved: ${resolved}`);
console.log(
  `errors: ${errorTotal} (vocab ${errors.vocab}, verb ${errors.verb}, grammar ${errors.grammar}, culture ${errors.culture})`,
);
console.log(`warnings: ${bandTotal(aboveLevel)} above-level (${formatBands(aboveLevel)})`);
console.log(`repeats: ${bandTotal(repeats)} (${formatBands(repeats)})`);
console.log(`budget: ${bandTotal(budget)} (${formatBands(budget)})`);

if (errorTotal > 0) process.exit(1);
