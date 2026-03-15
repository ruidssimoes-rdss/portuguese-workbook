/**
 * Exercise Generator v4 — Section-based sheets.
 *
 * Each section is a full page of related exercises checked at once.
 * 8 possible sections: vocab, conjugation, grammar, fill-blank,
 * translation, sentence-build, word-bank, error-correction.
 * Sections with no content are skipped.
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
import type { Difficulty } from "./exercise-types";
import { getDifficulty } from "./exercise-types";

const grammarDB = grammarData as unknown as GrammarData;

/* ─── Re-exported types ─── */

export { getDifficulty } from "./exercise-types";
export type { Difficulty, SectionResult, SectionAnswer } from "./exercise-types";

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

/* ─── Content extraction ─── */

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
    if (stage.type === "vocabulary" && stage.items) vocabItems.push(...stage.items);
    else if (stage.type === "verb" && stage.verbs) verbItems.push(...stage.verbs);
    else if (stage.type === "grammar" && stage.grammarItems) grammarItems.push(...stage.grammarItems);
    else if (stage.type === "culture" && stage.cultureItems) cultureItems.push(...stage.cultureItems);
    else if (stage.type === "practice" && stage.practiceItems) practiceItems.push(...stage.practiceItems);
  }

  return { vocabItems, verbItems, grammarItems, cultureItems, practiceItems };
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

function generateVocabSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const vocab = shuffle([...content.vocabItems]);
  const count = Math.min(vocab.length, 12);
  const selected = vocab.slice(0, count);
  const allPt = content.vocabItems.map((v) => v.word);

  const questions = selected.map((word, i) => {
    const isMC = i % 3 === 2;
    if (isMC) {
      const distractors = getDistractors(word.word, allPt, 3);
      if (distractors.length >= 2) {
        const { options, correctIndex } = buildMCOptions(word.word, distractors);
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
    };
  });

  return {
    key: "vocab",
    namePt: "Vocabulário",
    nameEn: "Vocabulary",
    data: { questions, showEnglish },
    totalQuestions: questions.length,
  };
}

function generateConjugationSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const verbs = content.verbItems.map((v) => ({
    verb: v.verb,
    verbMeaning: showEnglish ? v.verbTranslation : undefined,
    tense: TENSE_LABELS[v.tense] ?? v.tense,
    tenseEnglish: showEnglish ? v.tense : undefined,
    persons: v.conjugations.map((c) => ({ pronoun: c.pronoun, correctForm: c.form })),
  }));

  const totalQuestions = verbs.reduce((sum, v) => sum + v.persons.length, 0);

  return {
    key: "conjugation",
    namePt: "Conjugação",
    nameEn: "Conjugation",
    data: { verbs, showEnglish },
    totalQuestions,
  };
}

function generateGrammarSection(content: LessonContent, showEnglish: boolean): GeneratedSection {
  const questions: Array<Record<string, unknown>> = [];

  for (const g of content.grammarItems) {
    const topic = grammarDB.topics[g.topicSlug];

    // True/false from rules
    if (topic?.rules?.length) {
      const rule = topic.rules[0];
      if (rule.rule) {
        questions.push({
          id: `grammar-tf-true-${g.topicSlug}`,
          type: "true-false",
          statement: rule.rule,
          statementPt: rule.rulePt,
          isTrue: true,
          explanation: "Verdadeiro!",
        });

        // Try to generate a false statement
        const falsified = falsifyStatement(rule.rule);
        if (falsified) {
          questions.push({
            id: `grammar-tf-false-${g.topicSlug}`,
            type: "true-false",
            statement: falsified,
            isTrue: false,
            explanation: `Falso. ${rule.rulePt || rule.rule}`,
          });
        }
      }
    }

    // MC from grammar.json
    const topicQs: GrammarQuestion[] = topic?.questions ?? [];
    const picked = shuffle([...topicQs]).slice(0, 3);
    for (const q of picked) {
      if (q.options && q.correctIndex !== undefined) {
        questions.push({
          id: `grammar-mc-${q.questionText.slice(0, 20).replace(/\s/g, "-")}`,
          type: "mc",
          question: q.questionTextPt || q.questionText,
          questionEnglish: showEnglish ? q.questionText : undefined,
          options: [...q.options],
          correctIndex: q.correctIndex,
        });
      }
    }
  }

  // Also add culture MC if we have culture items
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

  return {
    key: "grammar",
    namePt: "Gramática",
    nameEn: "Grammar",
    data: { questions: shuffle(questions).slice(0, 8), showEnglish },
    totalQuestions: Math.min(questions.length, 8),
  };
}

function generateFillBlankSection(
  practice: PracticeItem[],
  used: Set<number>,
  showEnglish: boolean,
  difficulty: Difficulty,
): GeneratedSection {
  const available = practice.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.has(p.idx));
  const count = Math.min(available.length, 6);
  const selected = shuffle(available).slice(0, count);
  selected.forEach((s) => used.add(s.idx));

  const sentences = selected.map((s, i) => ({
    id: `fill-${i}`,
    sentencePt: s.sentence,
    sentenceEn: showEnglish ? s.translation : undefined,
    correctAnswer: s.answer,
    acceptedAnswers: s.acceptedAnswers,
    hint: difficulty === "foundation" ? s.answer.charAt(0) + "..." : undefined,
  }));

  return {
    key: "fill-blank",
    namePt: "Completa as frases",
    nameEn: "Complete the sentences",
    data: { sentences, showEnglish },
    totalQuestions: sentences.length,
  };
}

function generateTranslationSection(
  practice: PracticeItem[],
  used: Set<number>,
  showEnglish: boolean,
): GeneratedSection {
  const available = practice.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.has(p.idx));
  const count = Math.min(available.length, 4);
  const selected = shuffle(available).slice(0, count);
  selected.forEach((s) => used.add(s.idx));

  const sentences = selected.map((s, i) => ({
    id: `trans-${i}`,
    sourceText: s.translation,
    correctAnswer: s.fullSentence,
    acceptedAnswers: s.acceptedAnswers?.map((a) => s.sentence.replace(/___/g, a)),
  }));

  return {
    key: "translation",
    namePt: "Tradução",
    nameEn: "Translation",
    data: { sentences, showEnglish },
    totalQuestions: sentences.length,
  };
}

function generateSentenceBuildSection(
  practice: PracticeItem[],
  used: Set<number>,
  showEnglish: boolean,
): GeneratedSection {
  const available = practice.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.has(p.idx));
  const count = Math.min(available.length, 3);
  const selected = shuffle(available).slice(0, count);
  selected.forEach((s) => used.add(s.idx));

  const sentences = selected.map((s, i) => ({
    id: `build-${i}`,
    scrambledWords: shuffle(s.fullSentence.split(/\s+/)),
    correctSentence: s.fullSentence,
    sentenceEnglish: showEnglish ? s.translation : undefined,
  }));

  return {
    key: "sentence-build",
    namePt: "Constrói a frase",
    nameEn: "Build the sentence",
    data: { sentences, showEnglish },
    totalQuestions: sentences.length,
  };
}

function generateWordBankSection(
  practice: PracticeItem[],
  vocab: VocabItem[],
  used: Set<number>,
  showEnglish: boolean,
): GeneratedSection {
  const available = practice.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.has(p.idx));
  const count = Math.min(available.length, 5);
  const selected = available.slice(0, count);
  selected.forEach((s) => used.add(s.idx));

  const blanks = selected.map((s, i) => ({
    id: `wb-${i}`,
    correctAnswer: s.answer,
    acceptedAnswers: s.acceptedAnswers,
  }));

  const textWithBlanks = selected.map((s) => s.sentence).join(" ");
  const correctWords = blanks.map((b) => b.correctAnswer);
  const distractorWords = shuffle(vocab.map((v) => v.word))
    .filter((w) => !correctWords.includes(w))
    .slice(0, 3);
  const wordBank = shuffle([...correctWords, ...distractorWords]);

  const paragraphEnglish = showEnglish
    ? selected.map((s) => s.translation).join(" ")
    : undefined;

  return {
    key: "word-bank",
    namePt: "Texto com lacunas",
    nameEn: "Text with gaps",
    data: { paragraph: { textWithBlanks, blanks, wordBank, paragraphEnglish }, showEnglish },
    totalQuestions: blanks.length,
  };
}

function generateErrorCorrectionSection(
  practice: PracticeItem[],
  vocab: VocabItem[],
  used: Set<number>,
  difficulty: Difficulty,
  showEnglish: boolean,
): GeneratedSection {
  const available = practice.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.has(p.idx));
  const count = Math.min(available.length, 3);
  const selected = shuffle(available).slice(0, count);

  const sentences: Array<Record<string, unknown>> = [];
  for (const s of selected) {
    const correctSentence = s.fullSentence;
    const incorrect = introduceError(correctSentence, s.answer, vocab, difficulty);
    if (incorrect) {
      used.add(s.idx);
      sentences.push({
        id: `ec-${sentences.length}`,
        incorrectSentence: incorrect,
        correctSentence,
        acceptedAnswers: [correctSentence],
        hintEnglish: showEnglish ? s.translation : undefined,
      });
    }
  }

  return {
    key: "error-correction",
    namePt: "Corrige os erros",
    nameEn: "Correct the errors",
    data: { sentences, showEnglish },
    totalQuestions: sentences.length,
  };
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

export function generateLessonExercises(lesson: Lesson, _showEnglish: boolean = false): GeneratedLesson {
  const content = extractContent(lesson);
  const difficulty = getDifficulty(lesson.order, lesson.cefr);
  const showEnglish = lesson.cefr === "A1" || lesson.cefr === "A2";
  const sections: GeneratedSection[] = [];
  const usedPractice = new Set<number>();

  if (content.vocabItems.length > 0) {
    sections.push(generateVocabSection(content, showEnglish));
  }

  if (content.verbItems.length > 0) {
    sections.push(generateConjugationSection(content, showEnglish));
  }

  if (content.grammarItems.length > 0 || content.cultureItems.length > 0) {
    sections.push(generateGrammarSection(content, showEnglish));
  }

  if (content.practiceItems.length > 0) {
    sections.push(generateFillBlankSection(content.practiceItems, usedPractice, showEnglish, difficulty));
  }

  if (content.practiceItems.length > usedPractice.size) {
    sections.push(generateTranslationSection(content.practiceItems, usedPractice, showEnglish));
  }

  if (content.practiceItems.length > usedPractice.size) {
    sections.push(generateSentenceBuildSection(content.practiceItems, usedPractice, showEnglish));
  }

  if (content.practiceItems.length > usedPractice.size && content.vocabItems.length > 0) {
    sections.push(generateWordBankSection(content.practiceItems, content.vocabItems, usedPractice, showEnglish));
  }

  if (content.practiceItems.length > usedPractice.size && content.vocabItems.length > 0) {
    sections.push(generateErrorCorrectionSection(content.practiceItems, content.vocabItems, usedPractice, difficulty, showEnglish));
  }

  const totalPoints = sections.reduce((sum, s) => sum + s.totalQuestions, 0);
  const passPoints = Math.ceil(totalPoints * 0.8);

  return {
    learnItems: generateLearnItems(content),
    sections,
    totalPoints,
    passPoints,
  };
}
