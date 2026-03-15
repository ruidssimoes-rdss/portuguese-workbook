/**
 * Exercise Generator v3 — Template-based, 1 point per exercise, deterministic scoring.
 *
 * Round 1 (Learn): Display-only items (unchanged from v2).
 * Round 2 (Practice): Template-defined mix, shuffled order.
 * Round 3 (Apply): Template-defined mix, shuffled order.
 *
 * Every exercise = exactly 1 point. No multi-point exercises.
 * Content is never reused across exercises in the same lesson attempt.
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
import type { Exercise, ExerciseType, Difficulty } from "./exercise-types";
import { getDifficulty } from "./exercise-types";
import { getTemplate } from "./lesson-templates";

const grammarDB = grammarData as unknown as GrammarData;

/* ─── Re-exported types for Learn phase (unchanged) ─── */

export type { Exercise, ExerciseType, Difficulty } from "./exercise-types";
export type { ExerciseResult } from "./exercise-types";

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

export interface GeneratedLesson {
  learnItems: LearnItem[];
  practiceExercises: Exercise[];
  applyExercises: Exercise[];
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

/* ─── Round 1: Learn Items (unchanged) ─── */

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

/* ─── Used-content tracker ─── */

interface UsedContent {
  vocabIds: Set<string>;
  verbForms: Set<string>;
  practiceIds: Set<number>;
  grammarQIds: Set<string>;
  cultureIds: Set<string>;
  grammarTfIds: Set<string>;
}

function createUsedTracker(): UsedContent {
  return {
    vocabIds: new Set(),
    verbForms: new Set(),
    practiceIds: new Set(),
    grammarQIds: new Set(),
    cultureIds: new Set(),
    grammarTfIds: new Set(),
  };
}

/* ─── Slot fillers (1 exercise per call, 1 point each) ─── */

function fillMcPtToEn(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.vocabItems.filter((v) => !used.vocabIds.has(v.id));
  if (available.length === 0) return null;
  const word = available[Math.floor(Math.random() * available.length)];
  used.vocabIds.add(word.id);

  const distractors = getDistractors(word.translation, content.vocabItems.map((v) => v.translation));
  if (distractors.length < 2) return null;
  const { options, correctIndex } = buildMCOptions(word.translation, distractors.slice(0, 3));

  return {
    type: "mc-pt-to-en", id,
    instruction: `Qual é a tradução de "${word.word}"?`,
    englishInstruction: showEn ? `What is the translation of "${word.word}"?` : undefined,
    data: { options, correctIndex, correctAnswer: word.translation },
  };
}

function fillMcEnToPt(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.vocabItems.filter((v) => !used.vocabIds.has(v.id));
  if (available.length === 0) return null;
  const word = available[Math.floor(Math.random() * available.length)];
  used.vocabIds.add(word.id);

  const distractors = getDistractors(word.word, content.vocabItems.map((v) => v.word));
  if (distractors.length < 2) return null;
  const { options, correctIndex } = buildMCOptions(word.word, distractors.slice(0, 3));

  return {
    type: "mc-en-to-pt", id,
    instruction: `Como se diz "${word.translation}" em português?`,
    englishInstruction: showEn ? `How do you say "${word.translation}" in Portuguese?` : undefined,
    data: { options, correctIndex, correctAnswer: word.word },
  };
}

function fillMatchWord(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.vocabItems.filter((v) => !used.vocabIds.has(v.id));
  if (available.length === 0) return null;
  const word = available[Math.floor(Math.random() * available.length)];
  used.vocabIds.add(word.id);

  const distractors = getDistractors(word.translation, content.vocabItems.map((v) => v.translation));
  if (distractors.length < 2) return null;
  const { options, correctIndex } = buildMCOptions(word.translation, distractors.slice(0, 3));

  return {
    type: "match-word", id,
    instruction: `Qual é o significado de "${word.word}"?`,
    englishInstruction: showEn ? `What does "${word.word}" mean?` : undefined,
    data: { portugueseWord: word.word, options, correctIndex, correctAnswer: word.translation },
  };
}

function fillConjugation(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  for (const verb of shuffle([...content.verbItems])) {
    for (const conj of shuffle([...verb.conjugations])) {
      const key = `${verb.verb}-${conj.pronoun}-${verb.tense}`;
      if (used.verbForms.has(key)) continue;
      used.verbForms.add(key);

      const tenseLabel = TENSE_LABELS[verb.tense] ?? verb.tense;
      return {
        type: "conjugation", id,
        instruction: `Conjuga: ${verb.verb} (${conj.pronoun}) — ${tenseLabel}`,
        englishInstruction: showEn ? `Conjugate: ${verb.verb} (${conj.pronoun}) — ${tenseLabel}` : undefined,
        data: {
          verb: verb.verb,
          verbMeaning: showEn ? verb.verbTranslation : undefined,
          tense: tenseLabel,
          pronoun: conj.pronoun,
          correctForm: conj.form,
        },
      };
    }
  }
  return null;
}

function fillMcVerbForm(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  for (const verb of shuffle([...content.verbItems])) {
    for (const conj of shuffle([...verb.conjugations])) {
      const key = `mc-${verb.verb}-${conj.pronoun}-${verb.tense}`;
      if (used.verbForms.has(key)) continue;
      used.verbForms.add(key);

      const wrongForms = verb.conjugations.filter((c) => c.form !== conj.form).map((c) => c.form);
      const distractors = getDistractors(conj.form, wrongForms, 3);
      if (distractors.length < 2) continue;
      const { options, correctIndex } = buildMCOptions(conj.form, distractors);

      const tenseLabel = TENSE_LABELS[verb.tense] ?? verb.tense;
      return {
        type: "mc-verb-form", id,
        instruction: `${verb.verb}: qual é a forma para "${conj.pronoun}" no ${tenseLabel}?`,
        englishInstruction: showEn ? `${verb.verb}: what is the form for "${conj.pronoun}" in the ${tenseLabel}?` : undefined,
        data: { options, correctIndex, correctAnswer: conj.form },
      };
    }
  }
  return null;
}

function fillTrueFalse(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  for (const g of shuffle([...content.grammarItems])) {
    const topic = grammarDB.topics[g.topicSlug];
    if (!topic?.rules?.length) continue;

    for (const rule of shuffle([...topic.rules])) {
      if (!rule.rule) continue;
      const key = `tf-${rule.rule.slice(0, 40)}`;
      if (used.grammarTfIds.has(key)) continue;
      used.grammarTfIds.add(key);

      const makeFalse = Math.random() > 0.5;

      if (makeFalse) {
        const falsified = falsifyStatement(rule.rule);
        if (!falsified) continue;
        return {
          type: "true-false", id,
          instruction: "Verdadeiro ou falso?",
          englishInstruction: showEn ? "True or false?" : undefined,
          data: {
            statement: falsified,
            isTrue: false,
            explanation: `Falso. ${rule.rulePt || rule.rule}`,
          },
        };
      }

      return {
        type: "true-false", id,
        instruction: "Verdadeiro ou falso?",
        englishInstruction: showEn ? "True or false?" : undefined,
        data: {
          statement: rule.rule,
          isTrue: true,
          explanation: "Verdadeiro!",
        },
      };
    }
  }
  return null;
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

function fillMcGrammar(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  for (const g of shuffle([...content.grammarItems])) {
    const topic = grammarDB.topics[g.topicSlug];
    const questions: GrammarQuestion[] = topic?.questions ?? [];

    for (const q of shuffle([...questions])) {
      const key = `gq-${q.questionText.slice(0, 40)}`;
      if (used.grammarQIds.has(key)) continue;
      if (!q.options || q.correctIndex === undefined) continue;
      used.grammarQIds.add(key);

      return {
        type: "mc-grammar", id,
        instruction: q.questionTextPt || q.questionText,
        englishInstruction: showEn ? q.questionText : undefined,
        data: {
          options: [...q.options],
          correctIndex: q.correctIndex,
          correctAnswer: q.options[q.correctIndex],
        },
      };
    }
  }
  return null;
}

function fillMcCulture(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.cultureItems.filter((c) => !used.cultureIds.has(c.id));
  if (available.length === 0) return null;
  const culture = available[Math.floor(Math.random() * available.length)];
  used.cultureIds.add(culture.id);

  const otherMeanings = content.cultureItems.filter((c) => c.meaning !== culture.meaning).map((c) => c.meaning);
  if (culture.literal) otherMeanings.push(culture.literal);
  if (otherMeanings.length < 2) {
    otherMeanings.push("Uma expressão comum em Portugal");
    otherMeanings.push("Uma saudação formal");
  }
  const distractors = getDistractors(culture.meaning, otherMeanings, 3);
  const { options, correctIndex } = buildMCOptions(culture.meaning, distractors);

  return {
    type: "mc-culture", id,
    instruction: `O que significa "${culture.expression}"?`,
    englishInstruction: showEn ? `What does "${culture.expression}" mean?` : undefined,
    data: { options, correctIndex, correctAnswer: culture.meaning },
  };
}

function fillFillBlank(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.practiceItems.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.practiceIds.has(p.idx));
  if (available.length === 0) return null;
  const p = available[Math.floor(Math.random() * available.length)];
  used.practiceIds.add(p.idx);

  return {
    type: "fill-blank", id,
    instruction: "Completa a frase:",
    englishInstruction: showEn ? "Complete the sentence:" : undefined,
    data: {
      sentencePt: p.sentence,
      sentenceEn: p.translation,
      correctAnswer: p.answer,
      acceptedAnswers: p.acceptedAnswers,
    },
  };
}

function fillTranslation(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.practiceItems.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.practiceIds.has(p.idx));
  if (available.length === 0) return null;
  const p = available[Math.floor(Math.random() * available.length)];
  used.practiceIds.add(p.idx);

  return {
    type: "translation", id,
    instruction: "Traduz para português:",
    englishInstruction: showEn ? "Translate to Portuguese:" : undefined,
    data: {
      sourceText: p.translation,
      correctAnswer: p.fullSentence,
      acceptedAnswers: p.acceptedAnswers?.map((a) => p.sentence.replace(/___/g, a)),
    },
  };
}

function fillSentenceBuild(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.practiceItems.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.practiceIds.has(p.idx));
  if (available.length === 0) return null;
  const p = available[Math.floor(Math.random() * available.length)];
  const fullSentence = p.fullSentence;
  const words = fullSentence.split(/\s+/);
  if (words.length < 3) return null;
  used.practiceIds.add(p.idx);

  return {
    type: "sentence-build", id,
    instruction: "Ordena as palavras:",
    englishInstruction: showEn ? "Put the words in order:" : undefined,
    data: {
      words: shuffle([...words]),
      correctSentence: fullSentence,
      hintEnglish: showEn ? p.translation : undefined,
    },
  };
}

function fillErrorCorrection(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string, difficulty: Difficulty,
): Exercise | null {
  const available = content.practiceItems.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.practiceIds.has(p.idx));
  if (available.length === 0) return null;
  const p = available[Math.floor(Math.random() * available.length)];
  const correctSentence = p.fullSentence;

  const incorrect = introduceError(correctSentence, p.answer, content.vocabItems, difficulty);
  if (!incorrect) return null;
  used.practiceIds.add(p.idx);

  return {
    type: "error-correction", id,
    instruction: "Corrige o erro:",
    englishInstruction: showEn ? "Correct the error:" : undefined,
    data: {
      incorrectSentence: incorrect,
      correctSentence,
      acceptedAnswers: [correctSentence],
      hintEnglish: showEn ? p.translation : undefined,
    },
  };
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

function fillWordBankBlank(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  const available = content.practiceItems.map((p, i) => ({ ...p, idx: i })).filter((p) => !used.practiceIds.has(p.idx));
  if (available.length === 0) return null;
  const p = available[Math.floor(Math.random() * available.length)];
  used.practiceIds.add(p.idx);

  // Build word options: correct answer + distractors from vocab + other practice answers
  const otherAnswers = content.practiceItems.map((x) => x.answer).filter((a) => a !== p.answer);
  const vocabWords = content.vocabItems.map((v) => v.word).filter((w) => w !== p.answer);
  const distractorPool = [...otherAnswers, ...vocabWords];
  const distractors = getDistractors(p.answer, distractorPool, 3);
  const wordOptions = shuffle([p.answer, ...distractors]);

  return {
    type: "word-bank-blank", id,
    instruction: "Escolhe a palavra correta:",
    englishInstruction: showEn ? "Choose the correct word:" : undefined,
    data: {
      sentenceWithBlank: p.sentence,
      sentenceEnglish: showEn ? p.translation : undefined,
      wordOptions,
      correctWord: p.answer,
    },
  };
}

/* ─── Slot filling dispatcher ─── */

type SlotSource = "vocab" | "verbs" | "grammar" | "culture" | "practice";

function fillOneSlot(
  type: ExerciseType,
  source: SlotSource,
  content: LessonContent,
  used: UsedContent,
  showEn: boolean,
  id: string,
  difficulty: Difficulty,
): Exercise | null {
  switch (type) {
    case "mc-pt-to-en": return fillMcPtToEn(content, used, showEn, id);
    case "mc-en-to-pt": return fillMcEnToPt(content, used, showEn, id);
    case "match-word": return fillMatchWord(content, used, showEn, id);
    case "conjugation": return fillConjugation(content, used, showEn, id);
    case "mc-verb-form": return fillMcVerbForm(content, used, showEn, id);
    case "true-false": return fillTrueFalse(content, used, showEn, id);
    case "mc-grammar": return fillMcGrammar(content, used, showEn, id);
    case "mc-culture": return fillMcCulture(content, used, showEn, id);
    case "fill-blank": return fillFillBlank(content, used, showEn, id);
    case "translation": return fillTranslation(content, used, showEn, id);
    case "sentence-build": return fillSentenceBuild(content, used, showEn, id);
    case "error-correction": return fillErrorCorrection(content, used, showEn, id, difficulty);
    case "word-bank-blank": return fillWordBankBlank(content, used, showEn, id);
  }
}

// Fallback: try vocab MC if a slot can't be filled
function fillFallback(
  content: LessonContent, used: UsedContent, showEn: boolean, id: string,
): Exercise | null {
  return fillMcPtToEn(content, used, showEn, id)
    ?? fillMcEnToPt(content, used, showEn, id)
    ?? fillFillBlank(content, used, showEn, id)
    ?? null;
}

/* ─── Main generator ─── */

export function generateLessonExercises(lesson: Lesson, showEnglish: boolean = false): GeneratedLesson {
  const content = extractContent(lesson);
  const template = getTemplate(lesson.cefr);
  const difficulty = getDifficulty(lesson.order, lesson.cefr);
  const showEn = showEnglish;
  const used = createUsedTracker();

  // Fill Round 2
  const r2: Exercise[] = [];
  let r2Count = 0;
  for (const slot of template.round2) {
    const id = `r2-${String(r2Count + 1).padStart(2, "0")}`;
    const exercise = fillOneSlot(slot.type, slot.source, content, used, showEn, id, difficulty)
      ?? fillFallback(content, used, showEn, id);
    if (exercise) {
      r2.push(exercise);
      r2Count++;
    }
  }

  // Fill Round 3
  const r3: Exercise[] = [];
  let r3Count = 0;
  for (const slot of template.round3) {
    const id = `r3-${String(r3Count + 1).padStart(2, "0")}`;
    const exercise = fillOneSlot(slot.type, slot.source, content, used, showEn, id, difficulty)
      ?? fillFallback(content, used, showEn, id);
    if (exercise) {
      r3.push(exercise);
      r3Count++;
    }
  }

  const totalPoints = r2.length + r3.length;
  const passPoints = Math.ceil(totalPoints * 0.8);

  return {
    learnItems: generateLearnItems(content),
    practiceExercises: shuffle(r2),
    applyExercises: shuffle(r3),
    totalPoints,
    passPoints,
  };
}
