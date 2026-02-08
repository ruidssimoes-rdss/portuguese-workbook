/**
 * Placement test question generation and level resolution.
 * Uses levels.json, verbs.json, vocab.json (passed in or imported by caller).
 */

import { SUB_LEVEL_ORDER } from "@/types/levels";
import type { TestQuestion } from "@/types/levels";
import type { ConjugationSubLevel, VocabSubLevel } from "@/types/levels";
import type { VerbDataSet } from "@/types";
import type { VocabData, VocabWord } from "@/types/vocab";

const PERSONS = [
  "eu (I)",
  "tu (you singular)",
  "ele/ela/você (he/she/you formal)",
  "nós (we)",
  "eles/elas/vocês (they/you plural formal)",
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Seed for deterministic daily-ish variation; use question index + levelKey. */
function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function generateConjugationQuestion(
  levelKey: string,
  levelData: ConjugationSubLevel,
  verbs: VerbDataSet,
  questionIndex: number
): TestQuestion | null {
  const requiredVerbs =
    levelData.requiredVerbs === "all"
      ? verbs.order
      : levelData.requiredVerbs.filter((v) => verbs.verbs[v]);
  const requiredTenses = levelData.requiredTenses;
  if (requiredVerbs.length === 0 || requiredTenses.length === 0) return null;

  const verbKey = seededPick(requiredVerbs, questionIndex * 7 + levelKey.length);
  const tense = seededPick(requiredTenses, questionIndex * 11 + verbKey.length);
  const verbData = verbs.verbs[verbKey];
  if (!verbData) return null;

  const conjugationsForTense = verbData.conjugations.filter(
    (c) => c.Tense === tense
  );
  const personsForTense = conjugationsForTense.map((c) => c.Person);
  const person = seededPick(
    personsForTense.length ? personsForTense : PERSONS,
    questionIndex * 13
  );
  const correctRow = verbData.conjugations.find(
    (c) => c.Tense === tense && c.Person === person
  );
  if (!correctRow) return null;

  const correctAnswer = correctRow.Conjugation;
  const allOptions = verbData.conjugations
    .map((c) => c.Conjugation)
    .filter((x) => x !== correctAnswer);
  const uniqueOptions = [...new Set(allOptions)];
  const wrongs = shuffle(uniqueOptions).slice(0, 3);
  if (wrongs.length < 3) {
    // Pad with same verb different forms if needed
    const more = verbData.conjugations
      .map((c) => c.Conjugation)
      .filter((x) => !wrongs.includes(x) && x !== correctAnswer);
    while (wrongs.length < 3 && more.length) wrongs.push(more.shift()!);
  }
  const options = shuffle([correctAnswer, ...wrongs.slice(0, 3)]);
  const correctIndex = options.indexOf(correctAnswer);

  const personShort = person.split(" (")[0];
  return {
    questionText: `How do you conjugate **${verbKey}** for **${personShort}** in the **${tense}**?`,
    options,
    correctAnswer,
    correctIndex,
    explanation: correctRow.Notes,
    levelKey,
  };
}

/** Get words that match level's required categories/subcategories. */
function getWordsForLevel(
  levelData: VocabSubLevel,
  vocab: VocabData
): { word: VocabWord; categoryTitle: string }[] {
  const out: { word: VocabWord; categoryTitle: string }[] = [];
  const categories =
    levelData.requiredCategories === "all"
      ? vocab.categories
      : vocab.categories.filter((c) =>
          (levelData.requiredCategories as string[]).includes(c.id)
        );
  const subcats = levelData.requiredSubcategories;
  const filterBySubcat =
    Array.isArray(subcats) && subcats.length > 0;
  for (const cat of categories) {
    for (const word of cat.words) {
      if (!filterBySubcat || subcats.includes(word.subcategory)) {
        out.push({ word, categoryTitle: cat.title });
      }
    }
  }
  return out;
}

export function generateVocabularyQuestion(
  levelKey: string,
  levelData: VocabSubLevel,
  vocab: VocabData,
  questionIndex: number
): TestQuestion | null {
  const words = getWordsForLevel(levelData, vocab);
  if (words.length < 4) return null;

  const pick = seededPick(words, questionIndex * 17 + levelKey.length);
  const portuguese = pick.word.portuguese;
  const english = pick.word.english;
  const askInEnglish = questionIndex % 2 === 0;

  let questionText: string;
  let correctAnswer: string;
  let options: string[];

  if (askInEnglish) {
    questionText = `What does **${portuguese}** mean in English?`;
    correctAnswer = english;
    const others = words
      .filter((w) => w.word.english !== english)
      .map((w) => w.word.english);
    const wrongs = shuffle(others)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);
    options = shuffle([correctAnswer, ...wrongs]);
  } else {
    questionText = `How do you say **${english}** in Portuguese?`;
    correctAnswer = portuguese;
    const others = words
      .filter((w) => w.word.portuguese !== portuguese)
      .map((w) => w.word.portuguese);
    const wrongs = shuffle(others)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3);
    options = shuffle([correctAnswer, ...wrongs]);
  }

  const correctIndex = options.indexOf(correctAnswer);
  if (correctIndex < 0 || options.length < 4) return null;

  return {
    questionText,
    options: options.slice(0, 4),
    correctAnswer,
    correctIndex,
    levelKey,
  };
}

/**
 * Compute final placement level from adaptive answers.
 * Final level = highest sub-level where user maintained >= targetAccuracy.
 * Minimum 10 questions count.
 */
export function computePlacementLevel(
  answers: { correct: boolean; levelKey: string }[],
  sectionLevels: Record<string, { targetAccuracy: number }>,
  minQuestions: number = 10
): string {
  if (answers.length < minQuestions) return "A1.1";
  const used = answers.slice(0, Math.max(answers.length, 15));
  const byLevel: Record<string, { correct: number; total: number }> = {};
  for (const a of used) {
    if (!byLevel[a.levelKey]) byLevel[a.levelKey] = { correct: 0, total: 0 };
    byLevel[a.levelKey].total++;
    if (a.correct) byLevel[a.levelKey].correct++;
  }
  for (let i = SUB_LEVEL_ORDER.length - 1; i >= 0; i--) {
    const key = SUB_LEVEL_ORDER[i];
    const target = sectionLevels[key]?.targetAccuracy ?? 70;
    const stat = byLevel[key];
    if (!stat || stat.total < 2) continue;
    const acc = (stat.correct / stat.total) * 100;
    if (acc >= target) return key;
  }
  return "A1.1";
}

export function getOverallScore(answers: { correct: boolean }[]): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.correct).length;
  return Math.round((correct / answers.length) * 100);
}
