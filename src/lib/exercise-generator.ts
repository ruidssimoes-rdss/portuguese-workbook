/**
 * Exercise Generator v4.1 — Section-based sheets.
 *
 * Each section is a full page of related exercises checked at once.
 * 8 possible sections: vocab, conjugation, grammar, fill-blank,
 * translation, sentence-build, word-bank, error-correction.
 *
 * Practice sentences can be reused across up to 2 different section types
 * (e.g. fill-blank AND sentence-build). Sections also supplement from
 * vocab, grammar examples, and conjugation data when practice is limited.
 */

import type {
  Lesson,
  VocabItem,
  VerbItem,
  GrammarItem,
  CultureItem,
  PracticeItem,
} from "@/data/lessons";
import type { GrammarData, GrammarQuestion } from "@/types/grammar";
import grammarData from "@/data/grammar.json";
import type {
  Difficulty,
  ContentRef,
  ExerciseOnlyContent,
  AttributedPracticeItem,
} from "./exercise-types";
import { getDifficulty } from "./exercise-types";

const grammarDB = grammarData as unknown as GrammarData;

/* ─── Re-exported types ─── */

export { getDifficulty } from "./exercise-types";
export type {
  Difficulty,
  SectionResult,
  SectionAnswer,
  ContentRef,
  ExerciseOnlyContent,
  AttributedPracticeItem,
} from "./exercise-types";

/* ─── Learn phase types (unchanged) ─── */

export type LearnItemType = "vocab" | "grammar" | "verb" | "culture";

export interface LearnItem {
  type: LearnItemType;
  data: VocabItem | GrammarLearnData | VerbLearnData | CultureLearnData;
}

export interface GrammarLearnData {
  topicSlug: string;
  topicTitle: string;
  topicTitlePt: string;
  rules: Array<{ rule: string; rulePt: string; examples: Array<{ pt: string; en: string }> }>;
  tips: string[];
  tipsPt: string[];
}

export interface VerbLearnData {
  verb: string;
  verbTranslation: string;
  tense: string;
  tenseLabel: string;
  conjugations: Array<{ pronoun: string; form: string }>;
  verbSlug: string;
}

export interface CultureLearnData {
  expression: string;
  meaning: string;
  literal: string;
  tip: string;
}

/* ─── Section types ─── */

export interface GeneratedSection {
  key: string;
  namePt: string;
  nameEn: string;
  data: Record<string, unknown>;
  totalQuestions: number;
  /** questionId → the pool item that question tests (used to record mastery) */
  attribution: Record<string, ContentRef>;
}

export interface GeneratedLesson {
  learnItems: LearnItem[];
  sections: GeneratedSection[];
  totalPoints: number;
  passPoints: number;
}

/* ─── Helpers ─── */

const TENSE_LABELS: Record<string, string> = {
  Present: "Presente",
  Preterite: "Pretérito Perfeito",
  Imperfect: "Pretérito Imperfeito",
  Future: "Futuro",
  Conditional: "Condicional",
  "Present Subjunctive": "Presente do Conjuntivo",
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDistractors(correct: string, pool: string[], count: number = 3): string[] {
  const seen = new Set<string>();
  seen.add(correct.toLowerCase());
  const deduped: string[] = [];
  for (const item of pool) {
    const lower = item.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    deduped.push(item);
  }
  return shuffle(deduped).slice(0, count);
}

function buildMCOptions(correct: string, distractors: string[]): { options: string[]; correctIndex: number } {
  const options = shuffle([correct, ...distractors]);
  return { options, correctIndex: options.indexOf(correct) };
}

/* ─── Practice usage tracker ─── */

class PracticeTracker {
  private usage = new Map<number, Set<string>>();

  /** Check if a practice sentence is available for a given section */
  isAvailable(index: number, sectionKey: string, maxUses: number = 2): boolean {
    const uses = this.usage.get(index);
    if (!uses) return true;
    if (uses.has(sectionKey)) return false;
    return uses.size < maxUses;
  }

  /** Mark a practice sentence as used by a section */
  mark(index: number, sectionKey: string): void {
    if (!this.usage.has(index)) this.usage.set(index, new Set());
    this.usage.get(index)!.add(sectionKey);
  }

  /** Get available practice items for a section */
  getAvailable(practice: PracticeItem[], sectionKey: string, maxUses: number = 2): Array<PracticeItem & { idx: number }> {
    return practice
      .map((p, i) => ({ ...p, idx: i }))
      .filter((p) => this.isAvailable(p.idx, sectionKey, maxUses));
  }
}

/* ─── Content extraction ─── */

interface LessonContent {
  vocabItems: VocabItem[];
  verbItems: VerbItem[];
  grammarItems: GrammarItem[];
  cultureItems: CultureItem[];
  practiceItems: PracticeItem[];
}

/**
 * Split lesson content into what is shown in the learn phase and what is
 * exercised. Exercise-only content (review / spot-check / carry-forward)
 * is never shown in the learn phase — it goes straight to the sections.
 */
function extractContent(
  lesson: Lesson,
  exerciseOnly?: ExerciseOnlyContent
): { learn: LessonContent; all: LessonContent } {
  const vocabItems: VocabItem[] = [];
  const verbItems: VerbItem[] = [];
  const grammarItems: GrammarItem[] = [];
  const cultureItems: CultureItem[] = [];
  const practiceItems: PracticeItem[] = [];

  for (const stage of lesson.stages) {
    if (stage.type === "vocabulary" && stage.items) vocabItems.push(...stage.items);
    else if (stage.type === "verb" && stage.verbs) verbItems.push(...stage.verbs);
    else if (stage.type === "grammar" && stage.grammarItems) grammarItems.push(...stage.grammarItems);
    else if (stage.type === "culture" && stage.cultureItems) cultureItems.push(...stage.cultureItems);
    else if (stage.type === "practice" && stage.practiceItems) practiceItems.push(...stage.practiceItems);
  }

  const learn: LessonContent = { vocabItems, verbItems, grammarItems, cultureItems, practiceItems };
  const all: LessonContent = {
    vocabItems: [...vocabItems, ...(exerciseOnly?.vocabItems ?? [])],
    verbItems: [...verbItems, ...(exerciseOnly?.verbItems ?? [])],
    grammarItems: [...grammarItems, ...(exerciseOnly?.grammarItems ?? [])],
    cultureItems,
    practiceItems: [...practiceItems, ...(exerciseOnly?.practiceItems ?? [])],
  };

  return { learn, all };
}

/* ─── Attribution helpers ─── */

function vocabRef(word: VocabItem): ContentRef {
  return { contentType: "vocab", contentId: word.word };
}

function verbRef(verb: VerbItem): ContentRef {
  return { contentType: "verb", contentId: verb.verbSlug.toUpperCase() };
}

function grammarRef(g: GrammarItem): ContentRef {
  return { contentType: "grammar", contentId: g.topicSlug };
}

function baseWord(word: string): string {
  return word.split(" / ")[0].split(" (")[0].trim();
}

/**
 * Which pool item a practice sentence tests. Adapter-built sentences carry
 * an explicit contentRef; curriculum sentences fall back to the vocab word
 * whose base form is the answer.
 */
function practiceRef(p: PracticeItem, content: LessonContent): ContentRef | null {
  const explicit = (p as AttributedPracticeItem).contentRef;
  if (explicit) return explicit;
  const answer = p.answer.trim().toLowerCase();
  const match = content.vocabItems.find((v) => baseWord(v.word).toLowerCase() === answer);
  return match ? vocabRef(match) : null;
}

function setRef(attribution: Record<string, ContentRef>, id: string, ref: ContentRef | null): void {
  if (ref) attribution[id] = ref;
}

/** Collect grammar examples that are full sentences (3+ words) */
function getGrammarExamples(content: LessonContent): Array<{ pt: string; en: string; topicSlug: string }> {
  const examples: Array<{ pt: string; en: string; topicSlug: string }> = [];
  for (const g of content.grammarItems) {
    const topic = grammarDB.topics[g.topicSlug];
    if (!topic?.rules) continue;
    for (const rule of topic.rules) {
      for (const ex of rule.examples ?? []) {
        if (ex.pt && ex.en && ex.pt.split(/\s+/).length >= 3 && !ex.pt.includes("/")) {
          examples.push({ pt: ex.pt, en: ex.en, topicSlug: g.topicSlug });
        }
      }
    }
  }
  return examples;
}

/* ─── Learn Items (unchanged) ─── */

function generateLearnItems(content: LessonContent): LearnItem[] {
  const items: LearnItem[] = [];

  for (const word of content.vocabItems) {
    items.push({ type: "vocab", data: word });
  }

  for (const g of content.grammarItems) {
    const topic = grammarDB.topics[g.topicSlug];
    items.push({
      type: "grammar",
      data: {
        topicSlug: g.topicSlug,
        topicTitle: g.topicTitle,
        topicTitlePt: topic?.titlePt ?? g.topicTitle,
        rules: topic?.rules ?? [{ rule: g.rule, rulePt: g.rulePt, examples: g.examples }],
        tips: topic?.tips ?? [],
        tipsPt: topic?.tipsPt ?? [],
      },
    });
  }

  const verbsByName = new Map<string, VerbItem[]>();
  for (const v of content.verbItems) {
    const list = verbsByName.get(v.verb) ?? [];
    list.push(v);
    verbsByName.set(v.verb, list);
  }
  for (const [, verbList] of verbsByName) {
    for (const v of verbList) {
      items.push({
        type: "verb",
        data: {
          verb: v.verb,
          verbTranslation: v.verbTranslation,
          tense: v.tense,
          tenseLabel: TENSE_LABELS[v.tense] ?? v.tense,
          conjugations: v.conjugations,
          verbSlug: v.verbSlug,
        },
      });
    }
  }

  for (const c of content.cultureItems) {
    items.push({
      type: "culture",
      data: { expression: c.expression, meaning: c.meaning, literal: c.literal, tip: c.tip },
    });
  }

  return items;
}

/* ─── Section generators ─── */

/** Common translation alternatives for A1 expressions */
const COMMON_ALTERNATIVES: Record<string, string[]> = {
  "okay / alright": ["okay", "alright", "ok", "it is good", "it's good", "it's okay", "that's fine", "all good"],
  "enjoy your meal": ["have a good meal", "bon appetit", "good appetite", "enjoy the meal", "enjoy"],
  "nice to meet you": ["pleased to meet you", "pleasure to meet you", "nice meeting you"],
  "you're welcome": ["you are welcome", "no problem", "don't mention it", "it's nothing"],
  "excuse me / sorry": ["excuse me", "sorry", "pardon", "i'm sorry"],
  "see you later": ["see you", "see you soon", "later", "catch you later"],
  "see you soon": ["see you", "see you later", "until soon"],
  "see you tomorrow": ["until tomorrow"],
  "thank you (m/f)": ["thank you", "thanks", "cheers"],
  "thank you very much": ["thanks a lot", "many thanks", "thank you so much"],
  "please": ["if you please"],
  "hello": ["hi", "hey"],
  "good morning": ["morning"],
  "good afternoon": ["afternoon"],
  "good evening / good night": ["good evening", "good night", "goodnight"],
  "goodbye": ["bye", "bye bye", "farewell"],
  "yes": ["yeah", "yep"],
  "no": ["nope"],
  "how are you?": ["how are you", "how do you do"],
  "i'm fine": ["i am fine", "i'm good", "i am good", "fine"],
  "what's your name?": ["what is your name", "what's your name"],
  "my name is": ["i am called", "i'm called"],
};

function getAcceptedAlternatives(english: string): string[] {
  const lower = english.toLowerCase().trim();
  const alts: string[] = [];
  for (const [key, alternatives] of Object.entries(COMMON_ALTERNATIVES)) {
    if (key.toLowerCase() === lower || alternatives.some((a) => a.toLowerCase() === lower)) {
      alts.push(key, ...alternatives);
    }
  }
  return [...new Set(alts)];
}

function generateVocabSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const shuffled = shuffle([...content.vocabItems]);
  const count = Math.min(shuffled.length, 12);
  const selected = shuffled.slice(0, count);
  const allEn = content.vocabItems.map((v) => v.translation);
  const attribution: Record<string, ContentRef> = {};

  const questions = selected.map((word, i) => {
    attribution[`vocab-${i}`] = vocabRef(word);
    const isMC = i % 3 === 2;
    if (isMC) {
      // PT→EN MC: show Portuguese word, pick English translation
      const distractors = getDistractors(word.translation, allEn, 3);
      if (distractors.length >= 2) {
        const { options, correctIndex } = buildMCOptions(word.translation, distractors);
        return {
          id: `vocab-${i}`,
          type: "mc" as const,
          portugueseWord: word.word,
          englishWord: word.translation,
          pronunciation: word.pronunciation,
          options,
          correctIndex,
        };
      }
    }
    return {
      id: `vocab-${i}`,
      type: "type-answer" as const,
      portugueseWord: word.word,
      englishWord: word.translation,
      pronunciation: word.pronunciation,
      acceptedAnswers: [word.translation, ...getAcceptedAlternatives(word.translation)],
    };
  });

  return {
    key: "vocab",
    namePt: "Vocabulário",
    nameEn: "Vocabulary",
    data: { questions, showEnglish },
    totalQuestions: questions.length,
    attribution,
  };
}

function generateConjugationSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const attribution: Record<string, ContentRef> = {};
  const verbs = content.verbItems.map((v) => {
    const tenseLabel = TENSE_LABELS[v.tense] ?? v.tense;
    const persons = (v.conjugations ?? []).map((c) => ({ pronoun: c.pronoun, correctForm: c.form }));
    // The section component keys each answer as `${verb}-${tense}-${pronoun}`
    for (const p of persons) attribution[`${v.verb}-${tenseLabel}-${p.pronoun}`] = verbRef(v);
    return {
      verb: v.verb,
      verbMeaning: showEnglish ? v.verbTranslation : undefined,
      tense: tenseLabel,
      tenseEnglish: showEnglish ? v.tense : undefined,
      persons,
    };
  });

  const totalQuestions = verbs.reduce((sum, v) => sum + v.persons.length, 0);

  return {
    key: "conjugation",
    namePt: "Conjugação",
    nameEn: "Conjugation",
    data: { verbs, showEnglish },
    totalQuestions,
    attribution,
  };
}

type GrammarQuestionData = Record<string, unknown> & { id: string; type: "true-false" | "mc"; isTrue?: boolean };

/**
 * Pick up to `max` grammar questions. A section must never consist of
 * true/false questions whose answers are all "Verdadeiro": if the picked
 * set has true/false questions but no false one, swap one in.
 */
function pickGrammarQuestions(pool: GrammarQuestionData[], max: number): GrammarQuestionData[] {
  const picked = shuffle(pool).slice(0, max);
  const tfPicked = picked.filter((q) => q.type === "true-false");
  const hasFalse = tfPicked.some((q) => q.isTrue === false);
  if (tfPicked.length > 0 && !hasFalse) {
    const spareFalse = pool.find((q) => q.type === "true-false" && q.isTrue === false && !picked.includes(q));
    const trueIdx = picked.findIndex((q) => q.type === "true-false" && q.isTrue === true);
    if (spareFalse && trueIdx !== -1) {
      picked[trueIdx] = spareFalse;
    } else {
      // No false statement available at all — drop the true/false questions
      return picked.filter((q) => q.type !== "true-false");
    }
  }
  return picked;
}

function generateGrammarSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const questions: GrammarQuestionData[] = [];
  const attribution: Record<string, ContentRef> = {};

  for (const g of content.grammarItems) {
    const topic = grammarDB.topics[g.topicSlug];
    const ref = grammarRef(g);
    let hasTrueFalse = false;

    if (topic?.rules?.length) {
      const rule = topic.rules[0];
      // Only emit a true/false pair when the statement can actually be falsified.
      // A topic that cannot be falsified falls back to multiple choice below.
      const falsified = rule.rule ? falsifyStatement(rule.rule) : null;
      if (rule.rule && falsified) {
        hasTrueFalse = true;
        const trueId = `grammar-tf-true-${g.topicSlug}`;
        const falseId = `grammar-tf-false-${g.topicSlug}`;
        questions.push({
          id: trueId,
          type: "true-false",
          statement: rule.rule,
          statementPt: rule.rulePt,
          isTrue: true,
          explanation: "Verdadeiro!",
        });
        questions.push({
          id: falseId,
          type: "true-false",
          statement: falsified,
          isTrue: false,
          explanation: `Falso. ${rule.rulePt || rule.rule}`,
        });
        attribution[trueId] = ref;
        attribution[falseId] = ref;
      }
    }

    const topicQs: GrammarQuestion[] = topic?.questions ?? [];
    const picked = shuffle([...topicQs]).slice(0, hasTrueFalse ? 3 : 4);
    for (const q of picked) {
      if (q.options && q.correctIndex !== undefined) {
        const id = `grammar-mc-${g.topicSlug}-${q.questionText.slice(0, 20).replace(/\s/g, "-")}`;
        questions.push({
          id,
          type: "mc",
          question: q.questionTextPt || q.questionText,
          questionEnglish: showEnglish ? q.questionText : undefined,
          options: [...q.options],
          correctIndex: q.correctIndex,
        });
        attribution[id] = ref;
      }
    }
  }

  for (const culture of content.cultureItems) {
    const otherMeanings = content.cultureItems.filter((c) => c.meaning !== culture.meaning).map((c) => c.meaning);
    if (culture.literal) otherMeanings.push(culture.literal);
    if (otherMeanings.length < 2) {
      otherMeanings.push("Uma expressão comum em Portugal");
      otherMeanings.push("Uma saudação formal");
    }
    const distractors = getDistractors(culture.meaning, otherMeanings, 3);
    const { options, correctIndex } = buildMCOptions(culture.meaning, distractors);
    questions.push({
      id: `grammar-culture-${culture.id}`,
      type: "mc",
      question: `O que significa "${culture.expression}"?`,
      questionEnglish: showEnglish ? `What does "${culture.expression}" mean?` : undefined,
      options,
      correctIndex,
    });
  }

  const picked = pickGrammarQuestions(questions, 8);
  const pickedIds = new Set(picked.map((q) => q.id));
  const pickedAttribution: Record<string, ContentRef> = {};
  for (const [id, ref] of Object.entries(attribution)) {
    if (pickedIds.has(id)) pickedAttribution[id] = ref;
  }

  return {
    key: "grammar",
    namePt: "Gramática",
    nameEn: "Grammar",
    data: { questions: picked, showEnglish },
    totalQuestions: picked.length,
    attribution: pickedAttribution,
  };
}

// Section 4: Fill-blank — exclusive first pick, up to 4
function generateFillBlankSection(
  content: LessonContent,
  tracker: PracticeTracker,
  showEnglish: boolean,
  difficulty: Difficulty,
): GeneratedSection {
  const key = "fill-blank";
  const available = tracker.getAvailable(content.practiceItems, key, 1); // exclusive use
  const count = Math.min(available.length, 4);
  const selected = shuffle(available).slice(0, count);
  selected.forEach((s) => tracker.mark(s.idx, key));

  const attribution: Record<string, ContentRef> = {};
  const sentences = selected.map((s, i) => {
    setRef(attribution, `fill-${i}`, practiceRef(s, content));
    return {
      id: `fill-${i}`,
      sentencePt: s.sentence,
      sentenceEn: showEnglish ? s.translation : undefined,
      correctAnswer: s.answer,
      acceptedAnswers: s.acceptedAnswers,
      hint: difficulty === "foundation" ? s.answer.charAt(0) + "..." : undefined,
    };
  });

  return {
    key,
    namePt: "Completa as frases",
    nameEn: "Complete the sentences",
    data: { sentences, showEnglish },
    totalQuestions: sentences.length,
    attribution,
  };
}

// Section 5: Translation — practice sentences + vocab word translations
function generateTranslationSection(
  content: LessonContent,
  tracker: PracticeTracker,
  showEnglish: boolean,
): GeneratedSection {
  const key = "translation";
  const sentences: Array<Record<string, unknown>> = [];
  const attribution: Record<string, ContentRef> = {};

  // Short vocab translations first (2-3)
  const vocabForTrans = shuffle([...content.vocabItems]).slice(0, 3);
  for (const word of vocabForTrans) {
    const id = `trans-v-${sentences.length}`;
    attribution[id] = vocabRef(word);
    sentences.push({
      id,
      sourceText: word.translation,
      correctAnswer: word.word,
      acceptedAnswers: [],
    });
  }

  // Then longer practice sentence translations (1-2)
  const available = tracker.getAvailable(content.practiceItems, key);
  const practicePick = shuffle(available).slice(0, 2);
  for (const s of practicePick) {
    tracker.mark(s.idx, key);
    const id = `trans-p-${sentences.length}`;
    setRef(attribution, id, practiceRef(s, content));
    sentences.push({
      id,
      sourceText: s.translation,
      correctAnswer: s.fullSentence,
      acceptedAnswers: s.acceptedAnswers?.map((a) => s.sentence.replace(/___/g, a)),
    });
  }

  const kept = sentences.slice(0, 4);
  return {
    key,
    namePt: "Tradução",
    nameEn: "Translation",
    data: { sentences: kept, showEnglish },
    totalQuestions: kept.length,
    attribution: keepAttribution(attribution, kept),
  };
}

// Section 6: Sentence-build — practice sentences + grammar examples
function generateSentenceBuildSection(
  content: LessonContent,
  tracker: PracticeTracker,
  showEnglish: boolean,
): GeneratedSection {
  const key = "sentence-build";
  const sentences: Array<Record<string, unknown>> = [];
  const attribution: Record<string, ContentRef> = {};

  // Practice sentences (1-2)
  const available = tracker.getAvailable(content.practiceItems, key);
  const practicePick = shuffle(available).slice(0, 2);
  for (const s of practicePick) {
    const words = s.fullSentence.split(/\s+/);
    if (words.length >= 3) {
      tracker.mark(s.idx, key);
      const id = `build-p-${sentences.length}`;
      setRef(attribution, id, practiceRef(s, content));
      sentences.push({
        id,
        scrambledWords: shuffle([...words]),
        correctSentence: s.fullSentence,
        sentenceEnglish: showEnglish ? s.translation : undefined,
      });
    }
  }

  // Grammar examples (1-2 to reach 3 total)
  const grammarExamples = shuffle(getGrammarExamples(content));
  for (const ex of grammarExamples) {
    if (sentences.length >= 3) break;
    const words = ex.pt.split(/\s+/);
    if (words.length >= 3) {
      const id = `build-g-${sentences.length}`;
      attribution[id] = { contentType: "grammar", contentId: ex.topicSlug };
      sentences.push({
        id,
        scrambledWords: shuffle([...words]),
        correctSentence: ex.pt,
        sentenceEnglish: showEnglish ? ex.en : undefined,
      });
    }
  }

  // If still not enough, use more practice
  if (sentences.length < 2) {
    const morePractice = tracker.getAvailable(content.practiceItems, key);
    for (const s of shuffle(morePractice)) {
      if (sentences.length >= 3) break;
      const words = s.fullSentence.split(/\s+/);
      if (words.length >= 3) {
        tracker.mark(s.idx, key);
        const id = `build-f-${sentences.length}`;
        setRef(attribution, id, practiceRef(s, content));
        sentences.push({
          id,
          scrambledWords: shuffle([...words]),
          correctSentence: s.fullSentence,
          sentenceEnglish: showEnglish ? s.translation : undefined,
        });
      }
    }
  }

  const kept = sentences.slice(0, 3);
  return {
    key,
    namePt: "Constrói a frase",
    nameEn: "Build the sentence",
    data: { sentences: kept, showEnglish },
    totalQuestions: kept.length,
    attribution: keepAttribution(attribution, kept),
  };
}

// Section 7: Word-bank — practice sentences as paragraph with blanks
function generateWordBankSection(
  content: LessonContent,
  tracker: PracticeTracker,
  showEnglish: boolean,
): GeneratedSection {
  const key = "word-bank";
  const available = tracker.getAvailable(content.practiceItems, key);
  const count = Math.min(available.length, 5);
  const selected = available.slice(0, count);
  selected.forEach((s) => tracker.mark(s.idx, key));

  // If not enough from practice, we still generate with what we have (minimum 2)
  const attribution: Record<string, ContentRef> = {};
  const blanks = selected.map((s, i) => {
    setRef(attribution, `wb-${i}`, practiceRef(s, content));
    return {
      id: `wb-${i}`,
      correctAnswer: s.answer,
      acceptedAnswers: s.acceptedAnswers,
    };
  });

  const textWithBlanks = selected.map((s) => s.sentence).join(" ");
  const correctWords = blanks.map((b) => b.correctAnswer);
  const distractorWords = shuffle(content.vocabItems.map((v) => v.word))
    .filter((w) => !correctWords.includes(w))
    .slice(0, 3);
  const wordBank = shuffle([...correctWords, ...distractorWords]);

  const paragraphEnglish = showEnglish
    ? selected.map((s) => s.translation).join(" ")
    : undefined;

  return {
    key,
    namePt: "Texto com lacunas",
    nameEn: "Text with gaps",
    data: { paragraph: { textWithBlanks, blanks, wordBank, paragraphEnglish }, showEnglish },
    totalQuestions: blanks.length,
    attribution,
  };
}

// Section 8: Error-correction — practice sentences + conjugation-based errors
function generateErrorCorrectionSection(
  content: LessonContent,
  tracker: PracticeTracker,
  difficulty: Difficulty,
  showEnglish: boolean,
): GeneratedSection {
  const key = "error-correction";
  const sentences: Array<Record<string, unknown>> = [];
  const attribution: Record<string, ContentRef> = {};

  // From practice sentences (1-2)
  const available = tracker.getAvailable(content.practiceItems, key);
  for (const s of shuffle(available)) {
    if (sentences.length >= 2) break;
    const correctSentence = s.fullSentence;
    const incorrect = introduceError(correctSentence, s.answer, content.vocabItems, difficulty);
    if (incorrect) {
      tracker.mark(s.idx, key);
      setRef(attribution, `ec-p-${sentences.length}`, practiceRef(s, content));
      sentences.push({
        id: `ec-p-${sentences.length}`,
        incorrectSentence: incorrect,
        correctSentence,
        acceptedAnswers: [correctSentence],
        hintEnglish: showEnglish ? s.translation : undefined,
      });
    }
  }

  // From conjugation data — create wrong conjugation sentences (1)
  if (sentences.length < 3 && content.verbItems.length > 0) {
    const verb = content.verbItems[Math.floor(Math.random() * content.verbItems.length)];
    const verbConj = verb.conjugations ?? [];
    if (verbConj.length >= 2) {
      const person = verbConj[0];
      const wrongForm = verbConj[1].form; // use a different person's form
      const correctSentence = `${person.pronoun.charAt(0).toUpperCase() + person.pronoun.slice(1)} ${person.form}.`;
      const incorrectSentence = `${person.pronoun.charAt(0).toUpperCase() + person.pronoun.slice(1)} ${wrongForm}.`;
      if (correctSentence !== incorrectSentence) {
        attribution[`ec-v-${sentences.length}`] = verbRef(verb);
        sentences.push({
          id: `ec-v-${sentences.length}`,
          incorrectSentence,
          correctSentence,
          acceptedAnswers: [correctSentence],
          hintEnglish: showEnglish ? `${verb.verbTranslation} (${person.pronoun})` : undefined,
        });
      }
    }
  }

  // From grammar examples — introduce an article error (1)
  if (sentences.length < 3) {
    const grammarExamples = getGrammarExamples(content);
    for (const ex of shuffle(grammarExamples)) {
      if (sentences.length >= 3) break;
      const articleSwaps: [string, string][] = [["O ", "A "], ["A ", "O "], ["o ", "a "], ["a ", "o "]];
      for (const [from, to] of articleSwaps) {
        if (ex.pt.includes(from)) {
          attribution[`ec-g-${sentences.length}`] = { contentType: "grammar", contentId: ex.topicSlug };
          sentences.push({
            id: `ec-g-${sentences.length}`,
            incorrectSentence: ex.pt.replace(from, to),
            correctSentence: ex.pt,
            acceptedAnswers: [ex.pt],
            hintEnglish: showEnglish ? ex.en : undefined,
          });
          break;
        }
      }
    }
  }

  const kept = sentences.slice(0, 3);
  return {
    key,
    namePt: "Corrige os erros",
    nameEn: "Correct the errors",
    data: { sentences: kept, showEnglish },
    totalQuestions: kept.length,
    attribution: keepAttribution(attribution, kept),
  };
}

/** Keep only the attribution entries for questions that survived a slice */
function keepAttribution(
  attribution: Record<string, ContentRef>,
  kept: Array<Record<string, unknown>>
): Record<string, ContentRef> {
  const ids = new Set(kept.map((q) => q.id as string));
  const out: Record<string, ContentRef> = {};
  for (const [id, ref] of Object.entries(attribution)) if (ids.has(id)) out[id] = ref;
  return out;
}

function falsifyStatement(statement: string): string | null {
  const swaps: [string, string][] = [
    ["masculine", "feminine"], ["feminine", "masculine"],
    ["singular", "plural"], ["plural", "singular"],
    ["definite", "indefinite"], ["indefinite", "definite"],
    ["masculino", "feminino"], ["feminino", "masculino"],
  ];
  for (const [from, to] of swaps) {
    if (statement.toLowerCase().includes(from)) {
      return statement.replace(new RegExp(from, "i"), to);
    }
  }
  return null;
}

function introduceError(sentence: string, correctWord: string, vocab: VocabItem[], difficulty: Difficulty): string | null {
  if (difficulty === "foundation") {
    const wrongWord = vocab[Math.floor(Math.random() * vocab.length)]?.word;
    if (!wrongWord || wrongWord === correctWord) return null;
    const result = sentence.replace(correctWord, wrongWord);
    return result !== sentence ? result : null;
  }
  const articleSwaps: [string, string][] = [["o ", "a "], ["a ", "o "], ["os ", "as "], ["as ", "os "]];
  for (const [from, to] of articleSwaps) {
    if (sentence.includes(from)) return sentence.replace(from, to);
  }
  if (correctWord.length > 3) {
    return sentence.replace(correctWord, correctWord.slice(0, -1) + "x");
  }
  return null;
}

/* ─── Main generator ─── */

/**
 * Build the learn items and exercise sections for a lesson.
 *
 * @param lesson        Learn-phase content (shown, then exercised).
 * @param exerciseOnly  Review / spot-check / carry-forward content — exercised
 *                      but never shown in the learn phase.
 */
export function generateLessonExercises(lesson: Lesson, exerciseOnly?: ExerciseOnlyContent): GeneratedLesson {
  const { learn, all: content } = extractContent(lesson, exerciseOnly);
  const difficulty = getDifficulty(lesson.order, lesson.cefr);
  const showEnglish = lesson.cefr === "A1" || lesson.cefr === "A2";
  const sections: GeneratedSection[] = [];
  const tracker = new PracticeTracker();

  // Section 1: Vocab (always — every lesson has vocab)
  if (content.vocabItems.length > 0) {
    sections.push(generateVocabSection(content, showEnglish));
  }

  // Section 2: Conjugation (always — every lesson has verbs)
  if (content.verbItems.length > 0) {
    sections.push(generateConjugationSection(content, showEnglish));
  }

  // Section 3: Grammar + Culture (skipped if 0 grammar AND 0 culture)
  if (content.grammarItems.length > 0 || content.cultureItems.length > 0) {
    sections.push(generateGrammarSection(content, showEnglish));
  }

  // Section 4: Fill-blank (exclusive first pick, up to 4 sentences)
  if (content.practiceItems.length > 0) {
    const s = generateFillBlankSection(content, tracker, showEnglish, difficulty);
    if (s.totalQuestions >= 2) sections.push(s);
  }

  // Section 5: Translation (vocab words + practice sentences)
  if (content.vocabItems.length >= 2 || content.practiceItems.length > 0) {
    const s = generateTranslationSection(content, tracker, showEnglish);
    if (s.totalQuestions >= 2) sections.push(s);
  }

  // Section 6: Sentence-build (practice + grammar examples)
  if (content.practiceItems.length > 0 || getGrammarExamples(content).length > 0) {
    const s = generateSentenceBuildSection(content, tracker, showEnglish);
    if (s.totalQuestions >= 2) sections.push(s);
  }

  // Section 7: Word-bank (can reuse practice sentences)
  if (content.practiceItems.length > 0 && content.vocabItems.length > 0) {
    const s = generateWordBankSection(content, tracker, showEnglish);
    if (s.totalQuestions >= 2) sections.push(s);
  }

  // Section 8: Error-correction (practice + conjugation + grammar errors)
  if (content.practiceItems.length > 0 || content.verbItems.length > 0) {
    const s = generateErrorCorrectionSection(content, tracker, difficulty, showEnglish);
    if (s.totalQuestions >= 2) sections.push(s);
  }

  const totalPoints = sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  const passPoints = Math.ceil(totalPoints * 0.8);

  return {
    learnItems: generateLearnItems(learn),
    sections,
    totalPoints,
    passPoints,
  };
}
