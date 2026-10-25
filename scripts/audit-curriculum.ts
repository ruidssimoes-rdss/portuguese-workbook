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
let warnings = 0;
let totalRefs = 0;
let resolved = 0;

for (const lesson of lessons) {
  const lines: string[] = [];

  for (const ref of lesson.stages.vocabulary.words) {
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
      warnings++;
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
console.log(`warnings: ${warnings} above-level`);

if (errorTotal > 0) process.exit(1);
