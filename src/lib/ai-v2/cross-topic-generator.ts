/**
 * Cross-Topic Exercise Generator — mixes content from different categories.
 * Produces 3-5 exercises that combine vocab, verbs, and grammar across topics.
 */

import { getVocabItems, getVerbItems } from "./content-index";
import type {
  ExerciseData,
  FillGapExerciseData,
  TranslateExerciseData,
  ChooseCorrectExerciseData,
  MatchPairsExerciseData,
  ExerciseBlockType,
} from "@/types/blocks";

export interface CrossTopicConfig {
  vocabCategories: string[];
  verbSlugs: string[];
  grammarTopics: string[];
  difficulty: "foundation" | "developing" | "confident";
  count: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateCrossTopicExercises(
  config: CrossTopicConfig,
): Array<{ type: ExerciseBlockType; data: ExerciseData }> {
  const exercises: Array<{ type: ExerciseBlockType; data: ExerciseData }> = [];

  // Gather content from multiple categories
  const allVocab = getVocabItems(config.vocabCategories, undefined, 20);
  const allVerbs = getVerbItems(config.verbSlugs, ["Present"]);

  if (allVocab.length < 2 && allVerbs.length < 1) return exercises;

  // Strategy 1: Mixed category match-pairs
  if (allVocab.length >= 4) {
    const mixed = shuffle(allVocab).slice(0, Math.min(5, allVocab.length));
    const data: MatchPairsExerciseData = {
      exerciseType: "match-pairs",
      pairs: mixed.map((v) => ({ left: v.word, right: v.translation })),
    };
    exercises.push({ type: "exercise-match-pairs", data });
  }

  // Strategy 2: Verb + noun fill-gap
  if (allVerbs.length > 0 && allVocab.length > 0) {
    for (const verb of allVerbs.slice(0, 2)) {
      const noun = allVocab[Math.floor(Math.random() * allVocab.length)];
      if (!noun) continue;

      // Find the "eu" conjugation
      const euForm = verb.conjugations.find((c) => c.pronoun === "eu");
      if (!euForm) continue;

      const sentence = `Eu ${euForm.form} _____`;
      const data: FillGapExerciseData = {
        exerciseType: "fill-gap",
        sentence,
        correctAnswer: noun.word,
        acceptedAnswers: [noun.word],
        fullSentence: `Eu ${euForm.form} ${noun.word}`,
        translation: `I ${verb.verbTranslation.replace("to ", "")} ${noun.translation}`,
      };
      exercises.push({ type: "exercise-fill-gap", data });
    }
  }

  // Strategy 3: Cross-category choose-correct
  if (allVocab.length >= 4) {
    const target = allVocab[0];
    const distractors = shuffle(allVocab.slice(1)).slice(0, 3).map((v) => v.translation);
    const options = shuffle([target.translation, ...distractors]);

    const data: ChooseCorrectExerciseData = {
      exerciseType: "choose-correct",
      question: `What does "${target.word}" mean?`,
      options,
      correctIndex: options.indexOf(target.translation),
    };
    exercises.push({ type: "exercise-choose-correct", data });
  }

  // Strategy 4: Cross-category translate
  if (allVocab.length >= 2) {
    const item = allVocab[Math.floor(Math.random() * allVocab.length)];
    const data: TranslateExerciseData = {
      exerciseType: "translate",
      word: item.translation,
      correctAnswer: item.word,
      acceptedAnswers: [item.word],
      direction: "en-to-pt",
    };
    exercises.push({ type: "exercise-translate", data });
  }

  return shuffle(exercises).slice(0, config.count);
}
