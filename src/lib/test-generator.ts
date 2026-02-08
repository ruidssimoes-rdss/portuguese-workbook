/**
 * Linear level test — generate 10 questions for a single level from levels.json content only.
 */

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

const QUESTIONS_PER_TEST = 10;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getWordsForLevel(levelData: VocabSubLevel, vocab: VocabData): { word: VocabWord; categoryTitle: string }[] {
  const out: { word: VocabWord; categoryTitle: string }[] = [];
  const categories =
    levelData.requiredCategories === "all"
      ? vocab.categories
      : vocab.categories.filter((c) =>
          (levelData.requiredCategories as string[]).includes(c.id)
        );
  const subcats = levelData.requiredSubcategories;
  const filterBySubcat = Array.isArray(subcats) && subcats.length > 0;
  for (const cat of categories) {
    for (const word of cat.words) {
      if (!filterBySubcat || subcats.includes(word.subcategory)) {
        out.push({ word, categoryTitle: cat.title });
      }
    }
  }
  return out;
}

export function generateConjugationQuestions(
  levelKey: string,
  levelData: ConjugationSubLevel,
  verbs: VerbDataSet
): TestQuestion[] {
  const requiredVerbs =
    levelData.requiredVerbs === "all"
      ? verbs.order.filter((v) => verbs.verbs[v])
      : levelData.requiredVerbs.filter((v) => verbs.verbs[v]);
  const requiredTenses = levelData.requiredTenses;
  if (requiredVerbs.length === 0 || requiredTenses.length === 0) return [];

  const combos: { verbKey: string; tense: string; person: string }[] = [];
  for (const verbKey of requiredVerbs) {
    const verbData = verbs.verbs[verbKey];
    if (!verbData) continue;
    for (const tense of requiredTenses) {
      const rows = verbData.conjugations.filter((c) => c.Tense === tense);
      for (const row of rows) {
        combos.push({ verbKey, tense, person: row.Person });
      }
    }
  }

  const uniqueCombos = Array.from(
    new Map(combos.map((c) => [`${c.verbKey}|${c.tense}|${c.person}`, c])).values()
  );
  const selected = shuffle(uniqueCombos).slice(0, QUESTIONS_PER_TEST);
  if (selected.length < QUESTIONS_PER_TEST) return [];

  const questions: TestQuestion[] = [];
  for (const { verbKey, tense, person } of selected) {
    const verbData = verbs.verbs[verbKey];
    if (!verbData) continue;
    const correctRow = verbData.conjugations.find(
      (c) => c.Tense === tense && c.Person === person
    );
    if (!correctRow) continue;

    const correctAnswer = correctRow.Conjugation;
    const allOptions = verbData.conjugations
      .map((c) => c.Conjugation)
      .filter((x) => x !== correctAnswer);
    const wrongs = shuffle([...new Set(allOptions)]).slice(0, 3);
    const options = shuffle([correctAnswer, ...wrongs]);
    const correctIndex = options.indexOf(correctAnswer);
    const personShort = person.split(" (")[0];

    questions.push({
      questionText: `How do you conjugate **${verbKey}** for **${personShort}** in the **${tense}**?`,
      options,
      correctAnswer,
      correctIndex,
      explanation: correctRow.Notes || undefined,
      levelKey,
    });
  }

  return questions;
}

export function generateVocabularyQuestions(
  levelKey: string,
  levelData: VocabSubLevel,
  vocab: VocabData
): TestQuestion[] {
  const words = getWordsForLevel(levelData, vocab);
  if (words.length < 4) return [];

  const shuffled = shuffle(words);
  const selected = shuffled.slice(0, QUESTIONS_PER_TEST);
  if (selected.length < QUESTIONS_PER_TEST) return [];

  const questions: TestQuestion[] = [];
  for (let i = 0; i < selected.length; i++) {
    const { word } = selected[i];
    const askInEnglish = i % 2 === 0;
    const portuguese = word.portuguese;
    const english = word.english;

    let questionText: string;
    let correctAnswer: string;
    const others = words
      .filter((w) =>
        askInEnglish
          ? w.word.english !== english
          : w.word.portuguese !== portuguese
      )
      .map((w) => (askInEnglish ? w.word.english : w.word.portuguese));
    const wrongs = shuffle([...new Set(others)]).slice(0, 3);

    if (askInEnglish) {
      questionText = `What does **${portuguese}** mean in English?`;
      correctAnswer = english;
    } else {
      questionText = `How do you say **${english}** in Portuguese?`;
      correctAnswer = portuguese;
    }

    const options = shuffle([correctAnswer, ...wrongs]);
    const correctIndex = options.indexOf(correctAnswer);
    if (correctIndex < 0 || options.length < 4) continue;

    questions.push({
      questionText,
      options: options.slice(0, 4),
      correctAnswer,
      correctIndex,
      explanation: word.example ? `${word.example} — ${word.exampleTranslation}` : undefined,
      levelKey,
    });
  }

  return questions;
}

export { QUESTIONS_PER_TEST };
