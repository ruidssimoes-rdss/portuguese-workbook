/**
 * Generates exercises from resolved lesson data for the 3-round lesson flow:
 * Round 1 (Learn) → Round 2 (Practice) → Round 3 (Apply)
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

const grammarDB = grammarData as unknown as GrammarData;

/* ─── Shared types ─── */

export interface ExerciseResult {
  correct: boolean;
  exactMatch?: boolean;
  accentHint?: string;
  userAnswer: string;
  correctAnswer: string;
}

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

/* ─── Exercise types ─── */

export type ExerciseType =
  | "multiple-choice"
  | "fill-in-blank"
  | "conjugation-drill"
  | "true-false"
  | "translation-input"
  | "match-pairs"
  | "word-bank"
  | "sentence-build"
  | "error-correction";

export interface MCExercise {
  type: "multiple-choice";
  instruction: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
}

export interface FillInBlankExercise {
  type: "fill-in-blank";
  instruction: string;
  sentencePt: string;
  sentenceEn: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
}

export interface ConjugationDrillExercise {
  type: "conjugation-drill";
  instruction: string;
  verb: string;
  tense: string;
  persons: Array<{ pronoun: string; correctForm: string }>;
}

export interface TrueFalseExercise {
  type: "true-false";
  instruction: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface TranslationInputExercise {
  type: "translation-input";
  instruction: string;
  sourceText: string;
  correctAnswer: string;
  acceptedAnswers?: string[];
}

export interface MatchPairsExercise {
  type: "match-pairs";
  instruction: string;
  pairs: Array<{ left: string; right: string }>;
}

export interface WordBankExercise {
  type: "word-bank";
  instruction: string;
  textWithBlanks: string;
  blanks: Array<{ correctAnswer: string; acceptedAnswers?: string[] }>;
  wordBank: string[];
}

export interface SentenceBuildExercise {
  type: "sentence-build";
  instruction: string;
  words: string[];
  correctSentence: string;
  acceptedAnswers?: string[];
}

export interface ErrorCorrectionExercise {
  type: "error-correction";
  instruction: string;
  incorrectSentence: string;
  correctSentence: string;
  acceptedAnswers?: string[];
}

export type Exercise =
  | MCExercise
  | FillInBlankExercise
  | ConjugationDrillExercise
  | TrueFalseExercise
  | TranslationInputExercise
  | MatchPairsExercise
  | WordBankExercise
  | SentenceBuildExercise
  | ErrorCorrectionExercise;

export interface GeneratedLesson {
  learnItems: LearnItem[];
  practiceExercises: Exercise[];
  applyExercises: Exercise[];
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
  return {
    options,
    correctIndex: options.indexOf(correct),
  };
}

/* ─── Content extraction from resolved Lesson ─── */

interface LessonContent {
  vocabItems: VocabItem[];
  verbItems: VerbItem[];
  grammarItems: GrammarItem[];
  cultureItems: CultureItem[];
  practiceItems: PracticeItem[];
}

function extractContent(lesson: Lesson): LessonContent {
  const vocabItems: VocabItem[] = [];
  const verbItems: VerbItem[] = [];
  const grammarItems: GrammarItem[] = [];
  const cultureItems: CultureItem[] = [];
  const practiceItems: PracticeItem[] = [];

  for (const stage of lesson.stages) {
    if (stage.type === "vocabulary" && stage.items) {
      vocabItems.push(...stage.items);
    } else if (stage.type === "verb" && stage.verbs) {
      verbItems.push(...stage.verbs);
    } else if (stage.type === "grammar" && stage.grammarItems) {
      grammarItems.push(...stage.grammarItems);
    } else if (stage.type === "culture" && stage.cultureItems) {
      cultureItems.push(...stage.cultureItems);
    } else if (stage.type === "practice" && stage.practiceItems) {
      practiceItems.push(...stage.practiceItems);
    }
  }

  return { vocabItems, verbItems, grammarItems, cultureItems, practiceItems };
}

/* ─── Round 1: Learn Items ─── */

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

  // Group verbs by verb name for multi-tense display
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
      data: {
        expression: c.expression,
        meaning: c.meaning,
        literal: c.literal,
        tip: c.tip,
      },
    });
  }

  return items;
}

/* ─── Round 2: Practice Exercises ─── */

function generatePracticeExercises(content: LessonContent): Exercise[] {
  const exercises: Exercise[] = [];
  const allPtWords = content.vocabItems.map((v) => v.word);
  const allEnWords = content.vocabItems.map((v) => v.translation);

  // --- FROM VOCAB ---

  // MC: Portuguese → English (half)
  const vocabPTEN = shuffle([...content.vocabItems]).slice(0, Math.ceil(content.vocabItems.length / 2));
  for (const word of vocabPTEN) {
    const distractors = getDistractors(word.translation, allEnWords);
    if (distractors.length < 2) continue;
    const { options, correctIndex } = buildMCOptions(word.translation, distractors.slice(0, 3));
    exercises.push({
      type: "multiple-choice",
      instruction: `Qual é a tradução de "${word.word}"?`,
      options,
      correctIndex,
      correctAnswer: word.translation,
    });
  }

  // MC: English → Portuguese (other half)
  const vocabENPT = shuffle([...content.vocabItems]).slice(0, Math.ceil(content.vocabItems.length / 2));
  for (const word of vocabENPT) {
    const distractors = getDistractors(word.word, allPtWords);
    if (distractors.length < 2) continue;
    const { options, correctIndex } = buildMCOptions(word.word, distractors.slice(0, 3));
    exercises.push({
      type: "multiple-choice",
      instruction: `Como se diz "${word.translation}" em português?`,
      options,
      correctIndex,
      correctAnswer: word.word,
    });
  }

  // Match pairs (1 exercise, 4-6 pairs)
  if (content.vocabItems.length >= 4) {
    const pairsVocab = shuffle([...content.vocabItems]).slice(0, Math.min(6, content.vocabItems.length));
    exercises.push({
      type: "match-pairs",
      instruction: "Liga os pares:",
      pairs: pairsVocab.map((v) => ({ left: v.word, right: v.translation })),
    });
  }

  // --- FROM VERBS ---

  // Conjugation drill (1 per verb/tense)
  for (const verb of content.verbItems) {
    exercises.push({
      type: "conjugation-drill",
      instruction: `Conjuga o verbo ${verb.verb} no ${TENSE_LABELS[verb.tense] ?? verb.tense}:`,
      verb: verb.verb,
      tense: TENSE_LABELS[verb.tense] ?? verb.tense,
      persons: verb.conjugations.map((c) => ({
        pronoun: c.pronoun,
        correctForm: c.form,
      })),
    });
  }

  // MC on specific verb forms
  for (const verb of content.verbItems) {
    const randomPerson = verb.conjugations[Math.floor(Math.random() * verb.conjugations.length)];
    const wrongForms = verb.conjugations
      .filter((c) => c.form !== randomPerson.form)
      .map((c) => c.form);
    const distractors = getDistractors(randomPerson.form, wrongForms, 3);
    if (distractors.length >= 2) {
      const { options, correctIndex } = buildMCOptions(randomPerson.form, distractors);
      exercises.push({
        type: "multiple-choice",
        instruction: `${verb.verb}: qual é a forma para "${randomPerson.pronoun}" no ${TENSE_LABELS[verb.tense] ?? verb.tense}?`,
        options,
        correctIndex,
        correctAnswer: randomPerson.form,
      });
    }
  }

  // --- FROM GRAMMAR ---

  for (const g of content.grammarItems) {
    const topic = grammarDB.topics[g.topicSlug];

    // True/False from grammar rules
    if (g.rule) {
      exercises.push({
        type: "true-false",
        instruction: "Verdadeiro ou falso?",
        statement: g.rule,
        isTrue: true,
        explanation: "Esta regra está correta.",
      });
    }

    // MC from grammar.json questions
    const questions: GrammarQuestion[] = topic?.questions ?? [];
    const qs = shuffle([...questions]).slice(0, 2);
    for (const q of qs) {
      if (q.options && q.correctIndex !== undefined) {
        exercises.push({
          type: "multiple-choice",
          instruction: q.questionTextPt || q.questionText,
          options: [...q.options],
          correctIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
        });
      }
    }
  }

  // --- FROM CULTURE ---

  for (const culture of content.cultureItems) {
    const otherMeanings = content.cultureItems
      .filter((c) => c.meaning !== culture.meaning)
      .map((c) => c.meaning);
    if (culture.literal) otherMeanings.push(culture.literal);
    if (otherMeanings.length < 2) {
      otherMeanings.push("Uma expressão comum em Portugal");
      otherMeanings.push("Uma saudação formal");
    }
    const distractors = getDistractors(culture.meaning, otherMeanings, 3);
    const { options, correctIndex } = buildMCOptions(culture.meaning, distractors);
    exercises.push({
      type: "multiple-choice",
      instruction: `O que significa "${culture.expression}"?`,
      options,
      correctIndex,
      correctAnswer: culture.meaning,
    });
  }

  return shuffle(exercises).slice(0, 18);
}

/* ─── Round 3: Apply Exercises ─── */

function generateApplyExercises(content: LessonContent): Exercise[] {
  const exercises: Exercise[] = [];
  const practice = content.practiceItems;

  // Fill-in-the-blank from practice sentences (primary apply exercise)
  for (const p of practice.slice(0, 4)) {
    exercises.push({
      type: "fill-in-blank",
      instruction: "Completa a frase:",
      sentencePt: p.sentence,
      sentenceEn: p.translation,
      correctAnswer: p.answer,
      acceptedAnswers: p.acceptedAnswers,
    });
  }

  // Sentence build (1-2 exercises)
  if (practice.length >= 1) {
    const p = practice[0];
    const fullSentence = p.fullSentence;
    const words = fullSentence.split(/\s+/);
    if (words.length >= 3) {
      exercises.push({
        type: "sentence-build",
        instruction: "Ordena as palavras:",
        words: shuffle([...words]),
        correctSentence: fullSentence,
      });
    }
  }

  // Translation exercises
  for (const p of practice.slice(1, 3)) {
    exercises.push({
      type: "translation-input",
      instruction: "Traduz para português:",
      sourceText: p.translation,
      correctAnswer: p.fullSentence,
      acceptedAnswers: p.acceptedAnswers?.map((a) => p.sentence.replace(/___/g, a)),
    });
  }

  // Error correction (1 exercise)
  if (practice.length >= 2 && content.vocabItems.length > 0) {
    const p = practice[practice.length - 1];
    const correctSentence = p.fullSentence;
    // Pick a distractor word to create the error
    const wrongWord = content.vocabItems[0].word;
    const incorrectSentence = p.sentence.replace(/___/g, wrongWord);
    if (incorrectSentence !== correctSentence && !incorrectSentence.includes("___")) {
      exercises.push({
        type: "error-correction",
        instruction: "Corrige o erro:",
        incorrectSentence,
        correctSentence,
      });
    }
  }

  // Remaining practice as fill-in-blank
  for (const p of practice.slice(4)) {
    exercises.push({
      type: "fill-in-blank",
      instruction: "Completa a frase:",
      sentencePt: p.sentence,
      sentenceEn: p.translation,
      correctAnswer: p.answer,
      acceptedAnswers: p.acceptedAnswers,
    });
  }

  return exercises.slice(0, 7);
}

/* ─── Main generator ─── */

export function generateLessonExercises(lesson: Lesson): GeneratedLesson {
  const content = extractContent(lesson);
  return {
    learnItems: generateLearnItems(content),
    practiceExercises: generatePracticeExercises(content),
    applyExercises: generateApplyExercises(content),
  };
}
