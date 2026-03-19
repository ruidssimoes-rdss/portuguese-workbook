/**
 * Resolves curriculum lessons into the full Lesson format used by the app,
 * by looking up vocab, verbs, grammar, and culture from JSON data files.
 */

import type { CurriculumLesson } from "./curriculum-types";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS } from "./curriculum";
import type {
  Lesson,
  LessonStage,
  VocabItem,
  VerbItem,
  GrammarItem,
  CultureItem,
  PracticeItem,
} from "./lessons";

import vocabData from "./vocab.json";
import verbsData from "./verbs.json";
import grammarData from "./grammar.json";
import sayingsData from "./sayings.json";
import etiquetteData from "./etiquette.json";
import falseFriendsData from "./false-friends.json";

const vocab = vocabData as {
  categories: Array<{
    id: string;
    words: Array<{
      portuguese: string;
      english: string;
      pronunciation: string;
      example: string;
      exampleTranslation: string;
    }>;
  }>;
};

const verbs = verbsData as {
  order: string[];
  verbs: Record<
    string,
    {
      meta: { english: string };
      conjugations: Array<{
        Person: string;
        Tense: string;
        Conjugation: string;
      }>;
    }
  >;
};

const grammar = grammarData as {
  topics: Record<
    string,
    {
      id: string;
      title: string;
      titlePt: string;
      intro: string;
      rules: Array<{
        rule: string;
        rulePt: string;
        examples: Array<{ pt: string; en: string }>;
      }>;
    }
  >;
};

const sayings = sayingsData as {
  sayings: Array<{
    id: string;
    portuguese: string;
    meaning: string;
    literal: string;
    usage: string;
  }>;
};

const etiquette = etiquetteData as {
  tips: Array<{
    id: string;
    title: string;
    titlePt: string;
    description: string;
    doThis: string;
    avoidThis: string;
  }>;
};

const falseFriends = falseFriendsData as {
  falseFriends: Array<{
    id: string;
    portuguese: string;
    actualMeaning: string;
    looksLike: string;
    tip: string;
  }>;
};

const PERSON_TO_PRONOUN: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

function findVocabWord(
  categoryId: string,
  portuguese: string
): VocabItem | null {
  const cat = vocab.categories.find((c) => c.id === categoryId);
  if (!cat) return null;
  const norm = (s: string) => s.toLowerCase().trim();
  const refNorm = norm(portuguese);
  const w = cat.words.find((word) => {
    const p = norm(word.portuguese);
    if (p === refNorm) return true;
    if (p.startsWith(refNorm) || refNorm.startsWith(p)) return true;
    const refFirst = refNorm.split(/\s*\/\s*/)[0];
    const wordFirst = p.split(/\s*\/\s*/)[0];
    return refFirst === wordFirst || p.includes(refFirst) || refNorm.includes(wordFirst);
  });
  if (!w) return null;
  return {
    id: `vocab-${categoryId}-${w.portuguese.replace(/\s/g, "-")}`,
    word: w.portuguese,
    translation: w.english,
    pronunciation: `/${w.pronunciation}/`,
    example: { pt: w.example, en: w.exampleTranslation },
  };
}

function getVerbConjugations(
  verbKey: string,
  tense: string
): VerbItem | null {
  const v = verbs.verbs[verbKey];
  if (!v) return null;
  const present = (v.conjugations ?? []).filter((c) => c.Tense === tense);
  if (present.length === 0) return null;
  const conjugations = present.map((c) => ({
    pronoun: PERSON_TO_PRONOUN[c.Person] ?? c.Person.split(" ")[0],
    form: c.Conjugation,
  }));
  const slug = verbKey.toLowerCase();
  return {
    id: `verb-${slug}`,
    verb: slug,
    verbTranslation: v.meta.english,
    tense,
    conjugations,
    verbSlug: slug,
  };
}

function getGrammarTopic(topicId: string): GrammarItem | null {
  const t = grammar.topics[topicId];
  if (!t) return null;
  const firstRule = t.rules?.[0];
  return {
    id: `grammar-${topicId}`,
    rule: firstRule?.rule ?? t.intro?.slice(0, 200) ?? "",
    rulePt: firstRule?.rulePt ?? "",
    examples: firstRule?.examples ?? [],
    topicSlug: t.id,
    topicTitle: t.title,
  };
}

function getCultureItem(
  type: "saying" | "etiquette" | "false-friend" | "slang",
  id: string
): CultureItem | null {
  if (type === "saying") {
    const s = sayings.sayings.find((x) => x.id === id);
    if (!s) return null;
    return {
      id: `culture-${id}`,
      expression: s.portuguese,
      meaning: s.meaning,
      literal: s.literal,
      tip: s.usage,
    };
  }
  if (type === "etiquette") {
    const e = etiquette.tips.find((x) => x.id === id);
    if (!e) return null;
    return {
      id: `culture-${id}`,
      expression: e.titlePt,
      meaning: e.description,
      literal: "",
      tip: `${e.doThis} ${e.avoidThis}`,
    };
  }
  if (type === "false-friend") {
    const f = falseFriends.falseFriends.find((x) => x.id === id);
    if (!f) return null;
    return {
      id: `culture-${id}`,
      expression: f.portuguese,
      meaning: f.actualMeaning,
      literal: `${f.looksLike} ≠ ${f.actualMeaning}`,
      tip: f.tip,
    };
  }
  if (type === "slang") {
    return null;
  }
  return null;
}

export function resolveCurriculumLesson(cl: CurriculumLesson): Lesson {
  const stages: LessonStage[] = [];

  // Vocabulary stage
  const vocabItems: VocabItem[] = [];
  for (const ref of cl.stages.vocabulary.words) {
    const item = findVocabWord(ref.categoryId, ref.portuguese);
    if (item) vocabItems.push(item);
  }
  if (vocabItems.length > 0) {
    stages.push({
      id: `${cl.id}-vocab`,
      type: "vocabulary",
      title: "Vocabulary",
      ptTitle: "Vocabulário",
      description:
        "Tap each card to reveal the English meaning. How many did you already know?",
      items: vocabItems,
    });
  }

  // Verb stages: one stage per verb, with one VerbItem per requested tense (A2: Present+Preterite, B1: +Imperfect+Future)
  const TENSE_LABELS: Record<string, string> = {
    Present: "Presente",
    Preterite: "Pretérito Perfeito",
    Imperfect: "Pretérito Imperfeito",
    Future: "Futuro",
    Conditional: "Condicional",
    "Present Subjunctive": "Presente do Conjuntivo",
  };
  for (let i = 0; i < cl.stages.verbs.verbs.length; i++) {
    const vRef = cl.stages.verbs.verbs[i];
    const tensesToUse = vRef.tenses?.length ? vRef.tenses : ["Present"];
    const verbItems: import("./lessons").VerbItem[] = [];
    for (const tense of tensesToUse) {
      const item = getVerbConjugations(vRef.verbKey, tense);
      if (item) {
        verbItems.push({ ...item, id: `${item.id}-${tense}` });
      }
    }
    if (verbItems.length > 0) {
      const first = verbItems[0];
      const tenseList = verbItems.map((it) => TENSE_LABELS[it.tense] ?? it.tense).join(", ");
      stages.push({
        id: `${cl.id}-verb-${i}`,
        type: "verb",
        title: `Verb: ${first.verb}`,
        ptTitle: `Verbo: ${first.verb}`,
        description: `Fill in the correct conjugation of '${first.verb}' (${first.verbTranslation}). Tenses: ${tenseList}.`,
        verbs: verbItems,
      });
    }
  }

  // Grammar stage(s)
  for (const topicId of cl.stages.grammar.topics) {
    const g = getGrammarTopic(topicId);
    if (g) {
      stages.push({
        id: `${cl.id}-grammar-${topicId}`,
        type: "grammar",
        title: g.topicTitle,
        ptTitle: grammar.topics[topicId]?.titlePt ?? g.topicTitle,
        description: "Review the rule and examples, then test yourself.",
        grammarItems: [g],
      });
    }
  }

  // Culture stage
  const cultureItems: CultureItem[] = [];
  for (const ref of cl.stages.culture.items) {
    const item = getCultureItem(ref.type, ref.id);
    if (item) cultureItems.push(item);
  }
  if (cultureItems.length > 0) {
    stages.push({
      id: `${cl.id}-culture`,
      type: "culture",
      title: "Culture",
      ptTitle: "Cultura",
      description:
        "Read the Portuguese expression or tip and try to guess the meaning before revealing it.",
      cultureItems,
    });
  }

  // Practice stage
  const practiceItems: PracticeItem[] = cl.stages.practice.sentences.map(
    (s, i) => ({
      id: `${cl.id}-practice-${i}`,
      sentence: s.sentencePt,
      answer: s.correctAnswer,
      fullSentence: s.sentencePt.replace(/___/g, s.correctAnswer),
      translation: s.sentenceEn,
      acceptedAnswers: s.acceptedAnswers ?? [s.correctAnswer],
    })
  );
  stages.push({
    id: `${cl.id}-practice`,
    type: "practice",
    title: "Quick Practice",
    ptTitle: "Prática Rápida",
    description:
      "Fill in the missing word. Use what you've learned in this lesson.",
    practiceItems,
  });

  return {
    id: cl.id,
    title: cl.title,
    ptTitle: cl.titlePt,
    description: cl.description,
    cefr: cl.cefrLevel,
    estimatedMinutes: 20,
    order: cl.number,
    stages,
  };
}

const ALL_CURRICULUM_LESSONS: CurriculumLesson[] = [
  ...A1_LESSONS,
  ...A2_LESSONS,
  ...B1_LESSONS,
];

let cachedLessons: Lesson[] | null = null;

export function getResolvedLessons(): Lesson[] {
  if (cachedLessons) return cachedLessons;
  cachedLessons = ALL_CURRICULUM_LESSONS.map(resolveCurriculumLesson);
  return cachedLessons;
}

export function getResolvedLesson(id: string): Lesson | undefined {
  return getResolvedLessons().find((l) => l.id === id);
}

export function getCurriculumLesson(id: string): CurriculumLesson | undefined {
  return ALL_CURRICULUM_LESSONS.find((l) => l.id === id);
}
