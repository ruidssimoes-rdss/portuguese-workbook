/**
 * Linear level test — generate 10 questions for a single level from levels.json content only.
 */

import type { TestQuestion } from "@/types/levels";
import type { ConjugationSubLevel, VocabSubLevel, GrammarSubLevel } from "@/types/levels";
import type { VerbDataSet } from "@/types";
import type { VocabData, VocabWord } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";

function getVerbsByFilter(filter: string[] | string, verbs: VerbDataSet): string[] {
  if (Array.isArray(filter)) {
    return filter.filter((v) => verbs.verbs[v]);
  }
  if (filter === "all") {
    return verbs.order.filter((v) => verbs.verbs[v]);
  }
  if (filter === "all_A1") {
    return verbs.order.filter(
      (v) => verbs.verbs[v]?.meta?.cefr === "A1"
    );
  }
  if (filter === "all_A2") {
    return verbs.order.filter(
      (v) => {
        const cefr = verbs.verbs[v]?.meta?.cefr;
        return cefr === "A2";
      }
    );
  }
  if (filter === "all_A1_A2") {
    return verbs.order.filter(
      (v) => {
        const cefr = verbs.verbs[v]?.meta?.cefr;
        return cefr === "A1" || cefr === "A2";
      }
    );
  }
  if (filter === "all_B1") {
    return verbs.order.filter(
      (v) => verbs.verbs[v]?.meta?.cefr === "B1"
    );
  }
  if (filter === "essential_A1") {
    return verbs.order.filter(
      (v) => verbs.verbs[v]?.meta?.cefr === "A1" && verbs.verbs[v]?.meta?.priority === "Essential"
    );
  }
  if (filter === "essential_A1_A2") {
    return verbs.order.filter(
      (v) => {
        const meta = verbs.verbs[v]?.meta;
        return (meta?.cefr === "A1" || meta?.cefr === "A2") && meta?.priority === "Essential";
      }
    );
  }
  return [];
}

const PERSONS = [
  "eu (I)",
  "tu (you singular)",
  "ele/ela/você (he/she/you formal)",
  "nós (we)",
  "eles/elas/vocês (they/you plural formal)",
];

const DEFAULT_QUESTIONS = 15;

const TENSE_PT: Record<string, string> = {
  Present: "Presente",
  Preterite: "Pretérito Perfeito",
  Imperfect: "Pretérito Imperfeito",
  Future: "Futuro",
  Conditional: "Condicional",
  "Present Subjunctive": "Presente do Conjuntivo",
};

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

  let categories: typeof vocab.categories;
  const req = levelData.requiredCategories;

  if (req === "all") {
    categories = vocab.categories;
  } else if (Array.isArray(req)) {
    categories = vocab.categories.filter((c) => req.includes(c.id));
  } else {
    categories = vocab.categories;
  }

  for (const cat of categories) {
    for (const word of cat.words) {
      if (levelData.cefrFilter) {
        const allowedCefrs = Array.isArray(levelData.cefrFilter)
          ? levelData.cefrFilter
          : levelData.cefrFilter === "A1"
            ? ["A1"]
            : levelData.cefrFilter === "A1_A2"
              ? ["A1", "A2"]
              : levelData.cefrFilter === "B1"
                ? ["B1"]
                : ["A1", "A2", "B1"];
        if (!allowedCefrs.includes(word.cefr ?? "A1")) continue;
      }
      out.push({ word, categoryTitle: cat.title });
    }
  }
  return out;
}

export function generateConjugationQuestions(
  levelKey: string,
  levelData: ConjugationSubLevel,
  verbs: VerbDataSet,
  count: number = DEFAULT_QUESTIONS
): TestQuestion[] {
  const requiredVerbs = getVerbsByFilter(levelData.requiredVerbs, verbs);
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
  const selected = shuffle(uniqueCombos).slice(0, count);
  if (selected.length < count) return [];

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
    const tensePt = TENSE_PT[tense] ?? tense;

    questions.push({
      questionText: `How do you conjugate **${verbKey}** for **${personShort}** in the **${tense}**?`,
      questionTextPt: `Como se conjuga **${verbKey}** para **${personShort}** no **${tensePt}**?`,
      options,
      correctAnswer,
      correctIndex,
      explanation: correctRow.Notes || undefined,
      exampleSentence: correctRow["Example Sentence"] || undefined,
      exampleTranslation: correctRow["English Translation"] || undefined,
      levelKey,
    });
  }

  return questions;
}

export function generateVocabularyQuestions(
  levelKey: string,
  levelData: VocabSubLevel,
  vocab: VocabData,
  count: number = DEFAULT_QUESTIONS
): TestQuestion[] {
  const words = getWordsForLevel(levelData, vocab);
  if (words.length < 4) return [];

  const shuffled = shuffle(words);
  const selected = shuffled.slice(0, count);
  if (selected.length < count) return [];

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

    let questionTextPt: string;
    if (askInEnglish) {
      questionText = `What does **${portuguese}** mean in English?`;
      questionTextPt = `O que significa **${portuguese}** em inglês?`;
      correctAnswer = english;
    } else {
      questionText = `How do you say **${english}** in Portuguese?`;
      questionTextPt = `Como se diz **${english}** em português?`;
      correctAnswer = portuguese;
    }

    const options = shuffle([correctAnswer, ...wrongs]);
    const correctIndex = options.indexOf(correctAnswer);
    if (correctIndex < 0 || options.length < 4) continue;

    questions.push({
      questionText,
      questionTextPt,
      options: options.slice(0, 4),
      correctAnswer,
      correctIndex,
      explanation: word.example ? `${word.example} — ${word.exampleTranslation}` : undefined,
      exampleSentence: word.example,
      exampleTranslation: word.exampleTranslation,
      levelKey,
    });
  }

  return questions;
}

function getTopicIdsForLevel(levelData: GrammarSubLevel, grammarData: GrammarData): string[] {
  const raw = levelData.topics;
  if (Array.isArray(raw)) return raw.filter((id) => grammarData.topics[id]);
  if (raw === "all") return Object.keys(grammarData.topics);
  if (raw === "all_A1_A2") {
    return Object.values(grammarData.topics)
      .filter((t) => t.cefr === "A1" || t.cefr === "A2")
      .map((t) => t.id);
  }
  if (raw === "all_A1" || raw === "all_B1") {
    const cefr = raw === "all_A1" ? "A1" : "B1";
    return Object.values(grammarData.topics)
      .filter((t) => t.cefr === cefr)
      .map((t) => t.id);
  }
  return [];
}

export function generateGrammarQuestions(
  levelKey: string,
  levelData: GrammarSubLevel,
  grammarData: GrammarData,
  count: number = DEFAULT_QUESTIONS
): TestQuestion[] {
  const topicIds = getTopicIdsForLevel(levelData, grammarData);
  if (topicIds.length === 0) return [];

  const allQuestions: TestQuestion[] = [];
  for (const topicId of topicIds) {
    const topic = grammarData.topics[topicId];
    if (!topic?.questions?.length) continue;
    for (const q of topic.questions) {
      allQuestions.push({
        questionText: q.questionText,
        questionTextPt: q.questionTextPt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        exampleSentence: q.exampleSentence,
        exampleTranslation: q.exampleTranslation,
        levelKey,
      });
    }
  }

  const shuffled = shuffle(allQuestions);
  const selected = shuffled.slice(0, count);
  if (selected.length < count) return [];

  return selected;
}

export { DEFAULT_QUESTIONS, DEFAULT_QUESTIONS as QUESTIONS_PER_TEST };
